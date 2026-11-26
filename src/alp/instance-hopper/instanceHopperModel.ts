import { parseLocation } from '@/shared/utils/location';
import { isRecord } from '@/shared/utils/record';

const WORLD_ID_PATTERN = /wrld_[0-9a-f-]{36}/i;

export type HopperCandidate = {
    location: string;
    instanceName: string;
    region: string;
    userCount: number;
};

/** Accepts a bare world id, a location, or any URL that contains a world id. */
export function extractWorldId(input: string): string {
    return input.match(WORLD_ID_PATTERN)?.[0] ?? '';
}

/**
 * VRChat returns public instances of a world as `[instanceTag, userCount]`
 * pairs; private instances are never listed there.
 */
export function parseWorldInstances(
    worldId: string,
    world: unknown
): HopperCandidate[] {
    const rawInstances = isRecord(world) ? world.instances : null;
    if (!Array.isArray(rawInstances)) {
        return [];
    }
    const candidates: HopperCandidate[] = [];
    for (const entry of rawInstances) {
        if (!Array.isArray(entry) || typeof entry[0] !== 'string') {
            continue;
        }
        const location = `${worldId}:${entry[0]}`;
        const parsed = parseLocation(location);
        candidates.push({
            location,
            instanceName: parsed.instanceName,
            region: parsed.region,
            userCount: typeof entry[1] === 'number' ? entry[1] : 0
        });
    }
    return candidates;
}

export function selectCandidates(
    candidates: HopperCandidate[],
    minUsers: number
): HopperCandidate[] {
    return candidates
        .filter((candidate) => candidate.userCount >= minUsers)
        .sort((left, right) => right.userCount - left.userCount);
}

/** Compares by world and instance number so tag order differences are ignored. */
export function isSameInstance(left: string, right: string): boolean {
    if (!left || !right) {
        return false;
    }
    const leftParsed = parseLocation(left);
    const rightParsed = parseLocation(right);
    return (
        Boolean(leftParsed.worldId && leftParsed.instanceName) &&
        leftParsed.worldId === rightParsed.worldId &&
        leftParsed.instanceName === rightParsed.instanceName
    );
}
