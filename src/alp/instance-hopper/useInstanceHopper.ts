import { useCallback, useEffect, useRef, useState } from 'react';

import worldProfileRepository from '@/repositories/worldProfileRepository';
import { selfInviteToInstance } from '@/services/launchService';
import { toast } from '@/services/toastService';
import { useRuntimeStore } from '@/state/runtimeStore';

import {
    extractWorldId,
    findNextCandidate,
    isSameInstance,
    parseWorldInstances,
    selectCandidates,
    type HopperCandidate
} from './instanceHopperModel';
import { useInstanceHopperStrings } from './instanceHopperStrings';

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_SECOND = 1_000;
const COUNTDOWN_TICK_MILLISECONDS = MILLISECONDS_PER_SECOND;

export type HopperSettings = {
    worldInput: string;
    minUsers: number;
    dwellMinutes: number;
};

export type HopperStatus = 'idle' | 'invited' | 'arrived';

export function useInstanceHopper(settings: HopperSettings) {
    const strings = useInstanceHopperStrings();
    const currentLocation = useRuntimeStore(
        (state) => state.gameState.currentLocation
    );
    const [worldName, setWorldName] = useState('');
    const [capacity, setCapacity] = useState(0);
    const [candidates, setCandidates] = useState<HopperCandidate[]>([]);
    const [lastScannedAt, setLastScannedAt] = useState<number | null>(null);
    const [scanning, setScanning] = useState(false);
    const [hopping, setHopping] = useState(false);
    const [target, setTarget] = useState<HopperCandidate | null>(null);
    const [arrivedAt, setArrivedAt] = useState<number | null>(null);
    const [visited, setVisited] = useState<ReadonlySet<string>>(new Set());
    const [now, setNow] = useState(() => Date.now());

    // The auto-advance timer fires outside React's render cycle, so it reads
    // the latest values through refs instead of stale closures.
    const settingsRef = useRef(settings);
    const visitedRef = useRef(visited);
    const currentLocationRef = useRef(currentLocation);
    useEffect(() => {
        settingsRef.current = settings;
        currentLocationRef.current = currentLocation;
    }, [currentLocation, settings]);

    const scan = useCallback(async (): Promise<HopperCandidate[] | null> => {
        const worldId = extractWorldId(settingsRef.current.worldInput);
        if (!worldId) {
            toast.add({ type: 'error', title: strings.invalidWorld });
            return null;
        }
        setScanning(true);
        try {
            // force bypasses the summary cache, which drops the instance list.
            const world = await worldProfileRepository.getWorldProfile({
                worldId,
                force: true
            });
            const selected = selectCandidates(
                parseWorldInstances(worldId, world),
                settingsRef.current.minUsers
            );
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
    }, [strings]);

    const stop = useCallback(() => {
        setHopping(false);
        setTarget(null);
        setArrivedAt(null);
    }, []);

    const inviteTo = useCallback(
        async (candidate: HopperCandidate): Promise<boolean> => {
            try {
                await selfInviteToInstance(candidate.location);
            } catch {
                toast.add({ type: 'error', title: strings.inviteFailed });
                return false;
            }
            const nextVisited = new Set(visitedRef.current);
            nextVisited.add(candidate.location);
            visitedRef.current = nextVisited;
            setVisited(nextVisited);
            setTarget(candidate);
            setArrivedAt(null);
            return true;
        },
        [strings]
    );

    const advance = useCallback(async () => {
        // Rescan every hop so player counts are fresh, not from the first scan.
        const fresh = await scan();
        if (!fresh) {
            stop();
            return;
        }
        const next = findNextCandidate(
            fresh,
            visitedRef.current,
            currentLocationRef.current
        );
        if (!next) {
            toast.add({ type: 'success', title: strings.finished });
            stop();
            return;
        }
        if (!(await inviteTo(next))) {
            stop();
        }
    }, [inviteTo, scan, stop, strings]);

    const start = useCallback(async () => {
        setVisited(new Set());
        visitedRef.current = new Set();
        setHopping(true);
        await advance();
    }, [advance]);

    useEffect(() => {
        if (
            target &&
            !arrivedAt &&
            isSameInstance(currentLocation, target.location)
        ) {
            setArrivedAt(Date.now());
        }
    }, [arrivedAt, currentLocation, target]);

    const dwellMilliseconds = settings.dwellMinutes * MILLISECONDS_PER_MINUTE;
    const autoAdvanceAt =
        hopping && arrivedAt && dwellMilliseconds > 0
            ? arrivedAt + dwellMilliseconds
            : null;

    useEffect(() => {
        if (!autoAdvanceAt) {
            return;
        }
        const timer = setTimeout(
            () => {
                void advance();
            },
            Math.max(0, autoAdvanceAt - Date.now())
        );
        const ticker = setInterval(
            () => setNow(Date.now()),
            COUNTDOWN_TICK_MILLISECONDS
        );
        return () => {
            clearTimeout(timer);
            clearInterval(ticker);
        };
    }, [advance, autoAdvanceAt]);

    const status: HopperStatus = !target
        ? 'idle'
        : arrivedAt
          ? 'arrived'
          : 'invited';

    return {
        worldName,
        capacity,
        candidates,
        lastScannedAt,
        scanning,
        hopping,
        target,
        status,
        visited,
        currentLocation,
        secondsUntilAdvance: autoAdvanceAt
            ? Math.max(
                  0,
                  Math.ceil((autoAdvanceAt - now) / MILLISECONDS_PER_SECOND)
              )
            : null,
        scan,
        start,
        next: advance,
        stop,
        inviteTo
    };
}
