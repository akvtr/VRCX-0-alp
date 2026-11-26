import { CompassIcon, MailIcon, RouteIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';

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
import { useWorldTemplateNames } from './useWorldTemplateNames';
import { WORLD_TEMPLATE_IDS } from './worldTemplates';

const DEFAULT_MIN_USERS = 10;
const MIN_USERS_LOWER_BOUND = 1;
const WORLD_ID_PREVIEW_LENGTH = 13;

function parseBoundedInteger(value: string, lowerBound: number): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(lowerBound, parsed) : lowerBound;
}

export function InstanceHopperPage() {
    const strings = useInstanceHopperStrings();
    const [worldInput, setWorldInput] = useState('');
    const [minUsers, setMinUsers] = useState(DEFAULT_MIN_USERS);
    const hopper = useInstanceHopper({ worldInput, minUsers });
    const templateNames = useWorldTemplateNames(WORLD_TEMPLATE_IDS);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!hopper.sending) {
            void hopper.scan();
        }
    }

    function selectTemplate(worldId: string) {
        setWorldInput(worldId);
        void hopper.scan(worldId);
    }

    return (
        <PageScaffold className="gap-4 overflow-y-auto">
            <AlpModuleHeader
                icon={CompassIcon}
                title={strings.title}
                description={strings.description}
            />

            <form
                className="grid gap-3 sm:grid-cols-[1fr_auto]"
                onSubmit={handleSubmit}
            >
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
            </form>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-xs">
                    {strings.templates}
                </span>
                {WORLD_TEMPLATE_IDS.map((worldId) => (
                    <Button
                        key={worldId}
                        size="xs"
                        variant="outline"
                        disabled={hopper.scanning || hopper.sending}
                        onClick={() => selectTemplate(worldId)}
                    >
                        {templateNames.get(worldId) ??
                            `${worldId.slice(0, WORLD_ID_PREVIEW_LENGTH)}…`}
                    </Button>
                ))}
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
            ) : hopper.candidates.length ? (
                <ul className="bg-card/40 overflow-hidden rounded-md border">
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
                            lastJoinedAt={hopper.lastJoinedByInstance.get(
                                candidate.instanceName
                            )}
                            onInvite={() => void hopper.inviteTo(candidate)}
                        />
                    ))}
                </ul>
            ) : null}
        </PageScaffold>
    );
}

function CandidateRow({
    candidate,
    capacity,
    isCurrent,
    inviteState,
    lastJoinedAt,
    onInvite
}: {
    candidate: HopperCandidate;
    capacity: number;
    isCurrent: boolean;
    inviteState: InviteState | undefined;
    lastJoinedAt: string | undefined;
    onInvite: () => void;
}) {
    const strings = useInstanceHopperStrings();
    return (
        <li className="group/row border-border/40 hover:bg-muted/25 flex items-start gap-3 border-b px-3 py-2 transition-colors last:border-b-0">
            <span className="text-muted-foreground w-5 shrink-0 pt-0.5 text-[10px] font-medium uppercase">
                {candidate.region}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-semibold">
                    Public #{candidate.instanceName}
                    {isCurrent ? (
                        <Badge className="h-4 px-1 text-[10px]">
                            {strings.current}
                        </Badge>
                    ) : null}
                </span>
                <span className="text-muted-foreground text-xs">
                    {lastJoinedAt
                        ? `${strings.lastJoined} ${formatCompactDateTime(lastJoinedAt)}`
                        : strings.neverJoined}
                    {inviteState ? (
                        <span
                            className={cn(
                                'ml-2',
                                inviteState === 'failed'
                                    ? 'text-destructive'
                                    : 'text-primary'
                            )}
                        >
                            {inviteState === 'failed'
                                ? strings.inviteFailedBadge
                                : strings.inviteSent}
                        </span>
                    ) : null}
                </span>
            </div>
            <span className="text-muted-foreground pt-0.5 text-xs tabular-nums">
                {candidate.userCount}
                {capacity ? `/${capacity}` : ''}
            </span>
            <Button
                size="icon-xs"
                variant="ghost"
                title={strings.invite}
                aria-label={strings.invite}
                className="text-muted-foreground group-hover/row:text-foreground"
                onClick={onInvite}
            >
                <MailIcon />
            </Button>
        </li>
    );
}
