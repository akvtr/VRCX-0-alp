import { useCallback, useEffect, useRef, useState } from 'react';

import gameLogRepository from '@/repositories/gameLogRepository';
import worldProfileRepository from '@/repositories/worldProfileRepository';
import { selfInviteToInstance } from '@/services/launchService';
import { toast } from '@/services/toastService';
import { useRuntimeStore } from '@/state/runtimeStore';

import {
    buildLastJoinedByInstance,
    extractWorldId,
    parseWorldInstances,
    selectCandidates,
    type HopperCandidate
} from './instanceHopperModel';
import { useInstanceHopperStrings } from './instanceHopperStrings';

// Spacing between self-invites keeps a full pass well under VRChat's rate
// limits while still covering a dozen instances in about a minute.
export const INVITE_INTERVAL_MILLISECONDS = 5_000;
const MILLISECONDS_PER_SECOND = 1_000;
const COUNTDOWN_TICK_MILLISECONDS = MILLISECONDS_PER_SECOND;

export type HopperSettings = {
    worldInput: string;
    minUsers: number;
};

export type InviteState = 'sent' | 'failed';

export function useInstanceHopper(settings: HopperSettings) {
    const strings = useInstanceHopperStrings();
    const currentLocation = useRuntimeStore(
        (state) => state.gameState.currentLocation
    );
    const [worldId, setWorldId] = useState('');
    const [worldName, setWorldName] = useState('');
    const [capacity, setCapacity] = useState(0);
    const [candidates, setCandidates] = useState<HopperCandidate[]>([]);
    const [lastScannedAt, setLastScannedAt] = useState<number | null>(null);
    const [scanning, setScanning] = useState(false);
    const [sending, setSending] = useState(false);
    const [inviteStates, setInviteStates] = useState<
        ReadonlyMap<string, InviteState>
    >(new Map());
    const [lastJoinedByInstance, setLastJoinedByInstance] = useState<
        ReadonlyMap<string, string>
    >(new Map());
    const [nextSendAt, setNextSendAt] = useState<number | null>(null);
    const [now, setNow] = useState(() => Date.now());

    const settingsRef = useRef(settings);
    // Bumped on stop so a running send loop notices and exits.
    const runIdRef = useRef(0);
    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    // Callers that just changed the input (templates) pass it directly,
    // because the settings ref only catches up after the next render.
    const scan = useCallback(
        async (
            worldInput: string = settingsRef.current.worldInput
        ): Promise<HopperCandidate[] | null> => {
            const nextWorldId = extractWorldId(worldInput);
            if (!nextWorldId) {
                toast.add({ type: 'error', title: strings.invalidWorld });
                return null;
            }
            setScanning(true);
            try {
                const [world, previousVisits] = await Promise.all([
                    // force bypasses the summary cache, which drops the instance list.
                    worldProfileRepository.getWorldProfile({
                        worldId: nextWorldId,
                        force: true
                    }),
                    // Join history is a nice-to-have; a Game Log failure must not
                    // block the scan.
                    gameLogRepository
                        .getPreviousInstancesByWorldId({ worldId: nextWorldId })
                        .catch(() => [])
                ]);
                setLastJoinedByInstance(
                    buildLastJoinedByInstance(previousVisits)
                );
                const selected = selectCandidates(
                    parseWorldInstances(nextWorldId, world),
                    settingsRef.current.minUsers
                );
                setWorldId(nextWorldId);
                setWorldName(world.name);
                setCapacity(world.capacity);
                setCandidates(selected);
                setLastScannedAt(Date.now());
                return selected;
            } catch {
                toast.add({ type: 'error', title: strings.scanFailed });
                return null;
            } finally {
                setScanning(false);
            }
        },
        [strings]
    );

    const recordInviteState = useCallback(
        (location: string, state: InviteState) => {
            setInviteStates((current) => new Map(current).set(location, state));
        },
        []
    );

    const inviteTo = useCallback(
        async (candidate: HopperCandidate): Promise<boolean> => {
            try {
                await selfInviteToInstance(candidate.location);
                recordInviteState(candidate.location, 'sent');
                return true;
            } catch {
                recordInviteState(candidate.location, 'failed');
                toast.add({ type: 'error', title: strings.inviteFailed });
                return false;
            }
        },
        [recordInviteState, strings]
    );

    const stop = useCallback(() => {
        runIdRef.current += 1;
        setSending(false);
        setNextSendAt(null);
    }, []);

    const waitForNextSend = useCallback(
        (runId: number) =>
            new Promise<boolean>((resolve) => {
                setNextSendAt(Date.now() + INVITE_INTERVAL_MILLISECONDS);
                setTimeout(
                    () => resolve(runIdRef.current === runId),
                    INVITE_INTERVAL_MILLISECONDS
                );
            }),
        []
    );

    const sendAll = useCallback(async () => {
        const runId = runIdRef.current + 1;
        runIdRef.current = runId;
        const targets = await scan();
        if (!targets?.length || runIdRef.current !== runId) {
            return;
        }
        setInviteStates(new Map());
        setSending(true);
        for (const [index, target] of targets.entries()) {
            if (index > 0 && !(await waitForNextSend(runId))) {
                return;
            }
            setNextSendAt(null);
            await inviteTo(target);
        }
        if (runIdRef.current === runId) {
            toast.add({ type: 'success', title: strings.finished });
            stop();
        }
    }, [inviteTo, scan, stop, strings, waitForNextSend]);

    // Stop the loop when the page unmounts so invites don't keep going.
    useEffect(() => stop, [stop]);

    useEffect(() => {
        if (!nextSendAt) {
            return;
        }
        const ticker = setInterval(
            () => setNow(Date.now()),
            COUNTDOWN_TICK_MILLISECONDS
        );
        return () => clearInterval(ticker);
    }, [nextSendAt]);

    const sentCount = [...inviteStates.values()].filter(
        (state) => state === 'sent'
    ).length;

    return {
        worldId,
        worldName,
        capacity,
        candidates,
        lastJoinedByInstance,
        lastScannedAt,
        scanning,
        sending,
        inviteStates,
        sentCount,
        currentLocation,
        secondsUntilNextSend: nextSendAt
            ? Math.max(
                  0,
                  Math.ceil((nextSendAt - now) / MILLISECONDS_PER_SECOND)
              )
            : null,
        scan,
        sendAll,
        stop,
        inviteTo
    };
}
