import { CompassIcon, RouteIcon } from 'lucide-react';
import { useState } from 'react';

import { EmptyState, PageScaffold } from '@/components/layout/PageScaffold';
import { formatCompactDateTime } from '@/lib/dateTime';
import { cn } from '@/lib/utils';
import { Badge } from '@/ui/shadcn/badge';
import { Button } from '@/ui/shadcn/button';
import { Input } from '@/ui/shadcn/input';
import { Label } from '@/ui/shadcn/label';

import { AlpModuleHeader } from '../shared/AlpModuleHeader';
import { isSameInstance, type HopperCandidate } from './instanceHopperModel';
import { useInstanceHopperStrings } from './instanceHopperStrings';
import { useInstanceHopper, type InviteState } from './useInstanceHopper';

const DEFAULT_MIN_USERS = 10;
const MIN_USERS_LOWER_BOUND = 1;

function parseBoundedInteger(value: string, lowerBound: number): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(lowerBound, parsed) : lowerBound;
}

export function InstanceHopperPage() {
    const strings = useInstanceHopperStrings();
    const [worldInput, setWorldInput] = useState('');
    const [minUsers, setMinUsers] = useState(DEFAULT_MIN_USERS);
    const hopper = useInstanceHopper({ worldInput, minUsers });

    return (
        <PageScaffold className="gap-4 overflow-y-auto">
            <AlpModuleHeader
                icon={CompassIcon}
                title={strings.title}
                description={strings.description}
            />

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="instance-hopper-world">
                        {strings.worldLabel}
                    </Label>
                    <Input
                        id="instance-hopper-world"
                        value={worldInput}
                        placeholder={strings.worldPlaceholder}
                        disabled={hopper.sending}
                        onChange={(event) => setWorldInput(event.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="instance-hopper-min-users">
                        {strings.minUsersLabel}
                    </Label>
                    <Input
                        id="instance-hopper-min-users"
                        type="number"
                        min={MIN_USERS_LOWER_BOUND}
                        className="w-28"
                        value={minUsers}
                        disabled={hopper.sending}
                        onChange={(event) =>
                            setMinUsers(
                                parseBoundedInteger(
                                    event.target.value,
                                    MIN_USERS_LOWER_BOUND
                                )
                            )
                        }
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    disabled={hopper.scanning || hopper.sending}
                    onClick={() => void hopper.scan()}
                >
                    {strings.scan}
                </Button>
                {hopper.sending ? (
                    <Button variant="destructive" onClick={hopper.stop}>
                        {strings.stop}
                    </Button>
                ) : (
                    <Button
                        disabled={hopper.scanning}
                        onClick={() => void hopper.sendAll()}
                    >
                        {strings.sendAll}
                    </Button>
                )}
                {hopper.sending ? (
                    <span className="text-muted-foreground text-sm">
                        {strings.sentProgress} {hopper.sentCount} /{' '}
                        {hopper.candidates.length}
                        {hopper.secondsUntilNextSend !== null
                            ? ` · ${strings.nextInviteIn} ${hopper.secondsUntilNextSend}s`
                            : ''}
                    </span>
                ) : null}
            </div>

            {hopper.lastScannedAt ? (
                <div className="text-muted-foreground text-sm">
                    {hopper.worldName}
                    {' · '}
                    {strings.lastScanned}{' '}
                    {formatCompactDateTime(new Date(hopper.lastScannedAt))}
                </div>
            ) : null}

            {hopper.lastScannedAt && !hopper.candidates.length ? (
                <EmptyState
                    icon={RouteIcon}
                    title={strings.noCandidates}
                    variant="panel"
                />
            ) : (
                <ul className="flex flex-col gap-2">
                    {hopper.candidates.map((candidate) => (
                        <CandidateRow
                            key={candidate.location}
                            candidate={candidate}
                            capacity={hopper.capacity}
                            isCurrent={isSameInstance(
                                candidate.location,
                                hopper.currentLocation
                            )}
                            inviteState={hopper.inviteStates.get(
                                candidate.location
                            )}
                            onInvite={() => void hopper.inviteTo(candidate)}
                        />
                    ))}
                </ul>
            )}
        </PageScaffold>
    );
}

function CandidateRow({
    candidate,
    capacity,
    isCurrent,
    inviteState,
    onInvite
}: {
    candidate: HopperCandidate;
    capacity: number;
    isCurrent: boolean;
    inviteState: InviteState | undefined;
    onInvite: () => void;
}) {
    const strings = useInstanceHopperStrings();
    return (
        <li
            className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2',
                isCurrent && 'border-primary'
            )}
        >
            <span className="w-24 font-mono text-sm">
                #{candidate.instanceName}
            </span>
            <span className="text-muted-foreground w-12 text-xs uppercase">
                {candidate.region}
            </span>
            <span className="flex-1 text-sm">
                {candidate.userCount}
                {capacity ? ` / ${capacity}` : ''} {strings.players}
            </span>
            {isCurrent ? <Badge>{strings.current}</Badge> : null}
            {inviteState === 'sent' ? (
                <Badge variant="secondary">{strings.inviteSent}</Badge>
            ) : null}
            {inviteState === 'failed' ? (
                <Badge variant="destructive">{strings.inviteFailedBadge}</Badge>
            ) : null}
            <Button size="sm" variant="ghost" onClick={onInvite}>
                {strings.invite}
            </Button>
        </li>
    );
}
