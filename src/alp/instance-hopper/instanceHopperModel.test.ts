import { describe, expect, it } from 'vitest';

import {
    buildLastJoinedByInstance,
    extractWorldId,
    isSameInstance,
    parseWorldInstances,
    selectCandidates,
    type HopperCandidate
} from './instanceHopperModel';

const WORLD_ID = 'wrld_976e67bf-403a-4ead-8005-0c5ccba26caa';

function candidate(instanceName: string, userCount: number): HopperCandidate {
    return {
        location: `${WORLD_ID}:${instanceName}~region(jp)`,
        instanceName,
        region: 'jp',
        userCount
    };
}

describe('extractWorldId', () => {
    it('finds a world id inside a URL or location', () => {
        expect(
            extractWorldId(`https://vrchat.com/home/world/${WORLD_ID}/info`)
        ).toBe(WORLD_ID);
        expect(extractWorldId(`${WORLD_ID}:12345~region(jp)`)).toBe(WORLD_ID);
        expect(extractWorldId('not a world')).toBe('');
    });
});

describe('parseWorldInstances', () => {
    it('reads public instance pairs and skips malformed entries', () => {
        const result = parseWorldInstances(WORLD_ID, {
            instances: [['12345~region(jp)', 31], ['67890', 'x'], 'bad', [1, 2]]
        });
        expect(result).toEqual([
            {
                location: `${WORLD_ID}:12345~region(jp)`,
                instanceName: '12345',
                region: 'jp',
                userCount: 31
            },
            {
                location: `${WORLD_ID}:67890`,
                instanceName: '67890',
                region: expect.any(String),
                userCount: 0
            }
        ]);
    });

    it('returns nothing when the world has no instance list', () => {
        expect(parseWorldInstances(WORLD_ID, { id: WORLD_ID })).toEqual([]);
        expect(parseWorldInstances(WORLD_ID, null)).toEqual([]);
    });
});

describe('selectCandidates', () => {
    it('keeps instances at or above the threshold, busiest first', () => {
        const result = selectCandidates(
            [candidate('1', 5), candidate('2', 40), candidate('3', 12)],
            12
        );
        expect(result.map((entry) => entry.instanceName)).toEqual(['2', '3']);
    });
});

describe('isSameInstance', () => {
    it('matches on world and instance number regardless of tags', () => {
        expect(
            isSameInstance(
                `${WORLD_ID}:12345~region(jp)`,
                `${WORLD_ID}:12345~region(jp)~hidden(usr_x)`
            )
        ).toBe(true);
        expect(isSameInstance(`${WORLD_ID}:12345`, `${WORLD_ID}:54321`)).toBe(
            false
        );
        expect(isSameInstance('', `${WORLD_ID}:12345`)).toBe(false);
    });
});

describe('buildLastJoinedByInstance', () => {
    it('keeps the latest join per instance number', () => {
        const result = buildLastJoinedByInstance([
            {
                location: `${WORLD_ID}:12345~region(jp)`,
                created_at: '2026-11-01T10:00:00.000Z'
            },
            {
                location: `${WORLD_ID}:12345~region(jp)`,
                created_at: '2026-11-20T10:00:00.000Z'
            },
            {
                location: `${WORLD_ID}:67890`,
                created_at: '2026-11-05T10:00:00.000Z'
            },
            { location: `${WORLD_ID}:11111`, created_at: '' }
        ]);
        expect(Object.fromEntries(result)).toEqual({
            '12345': '2026-11-20T10:00:00.000Z',
            '67890': '2026-11-05T10:00:00.000Z'
        });
    });
});
