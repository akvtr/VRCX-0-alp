import { RouteIcon } from 'lucide-react';
import { useState } from 'react';

import { EmptyState, PageScaffold } from '@/components/layout/PageScaffold';
import { formatCompactDateTime } from '@/lib/dateTime';
import { cn } from '@/lib/utils';
import { Badge } from '@/ui/shadcn/badge';
import { Button } from '@/ui/shadcn/button';
import { Input } from '@/ui/shadcn/input';
import { Label } from '@/ui/shadcn/label';

import { isSameInstance, type HopperCandidate } from './instanceHopperModel';
import { useInstanceHopperStrings } from './instanceHopperStrings';
import { useInstanceHopper, type HopperStatus } from './useInstanceHopper';

const DEFAULT_MIN_USERS = 10;
const DEFAULT_DWELL_MINUTES = 0;
const MIN_USERS_LOWER_BOUND = 1;
const DWELL_MINUTES_LOWER_BOUND = 0;

function parseBoundedInteger(value: string, lowerBound: number): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(lowerBound, parsed) : lowerBound;
}

export function InstanceHopperPage() {
    const strings = useInstanceHopperStrings();
    const [worldInput, setWorldInput] = useState('');
    const [minUsers, setMinUsers] = useState(DEFAULT_MIN_USERS);
    const [dwellMinutes, setDwellMinutes] = useState(DEFAULT_DWELL_MINUTES);
    const hopper = useInstanceHopper({ worldInput, minUsers, dwellMinutes });

    const statusLabels: Record<HopperStatus, string> = {
        idle: strings.statusIdle,
        invited: strings.statusInvited,
        arrived: strings.statusArrived
    };

    return (
        <PageScaffold className="gap-4 overflow-y-auto">
            <div className="flex flex-col gap-1">
                <h1 className="flex items-center gap-2 text-lg font-semibold">
                    <RouteIcon className="size-5" />
                    {strings.title}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {strings.description}
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="instance-hopper-world">
                        {strings.worldLabel}
                    </Label>
                    <Input
                        id="instance-hopper-world"
                        value={worldInput}
                        placeholder={strings.worldPlaceholder}
                        disabled={hopper.hopping}
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
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="instance-hopper-dwell">
                        {strings.dwellLabel}
                    </Label>
                    <Input
                        id="instance-hopper-dwell"
                        type="number"
                        min={DWELL_MINUTES_LOWER_BOUND}
                        className="w-28"
                        value={dwellMinutes}
                        onChange={(event) =>
                            setDwellMinutes(
                                parseBoundedInteger(
                                    event.target.value,
                                    DWELL_MINUTES_LOWER_BOUND
                                )
                            )
                        }
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    disabled={hopper.scanning || hopper.hopping}
                    onClick={() => void hopper.scan()}
                >
                    {strings.scan}
                </Button>
                {hopper.hopping ? (
                    <>
                        <Button
                            disabled={hopper.scanning}
                            onClick={() => void hopper.next()}
                        >
                            {strings.next}
                        </Button>
                        <Button variant="destructive" onClick={hopper.stop}>
                            {strings.stop}
                        </Button>
                    </>
                ) : (
                    <Button
                        disabled={hopper.scanning}
                        onClick={() => void hopper.start()}
                    >
                        {strings.start}
                    </Button>
                )}
                <Badge
                    variant={hopper.status === 'idle' ? 'outline' : 'default'}
                >
                    {statusLabels[hopper.status]}
                </Badge>
                {hopper.secondsUntilAdvance !== null ? (
                    <span className="text-muted-foreground text-sm">
                        {strings.statusAdvanceIn} {hopper.secondsUntilAdvance}s
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
                            isTarget={
                                hopper.target?.location === candidate.location
                            }
                            isCurrent={isSameInstance(
                                candidate.location,
                                hopper.currentLocation
                            )}
                            isVisited={hopper.visited.has(candidate.location)}
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
    isTarget,
    isCurrent,
    isVisited,
    onInvite
}: {
    candidate: HopperCandidate;
    capacity: number;
    isTarget: boolean;
    isCurrent: boolean;
    isVisited: boolean;
    onInvite: () => void;
}) {
    const strings = useInstanceHopperStrings();
    return (
        <li
            className={cn(
                'flex items-center gap-3 rounded-lg border px-3 py-2',
                isTarget && 'border-primary',
                isVisited && !isTarget && 'opacity-60'
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
            {isTarget && !isCurrent ? (
                <Badge variant="secondary">{strings.target}</Badge>
            ) : null}
            {isVisited && !isTarget ? (
                <Badge variant="outline">{strings.visited}</Badge>
            ) : null}
            <Button size="sm" variant="ghost" onClick={onInvite}>
                {strings.invite}
            </Button>
        </li>
    );
}
