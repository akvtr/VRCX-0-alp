// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import worldProfileRepository from '@/repositories/worldProfileRepository';
import { selfInviteToInstance } from '@/services/launchService';

import {
    INVITE_INTERVAL_MILLISECONDS,
    useInstanceHopper
} from './useInstanceHopper';

vi.mock('@/repositories/worldProfileRepository', () => ({
    default: { getWorldProfile: vi.fn() }
}));
vi.mock('@/repositories/gameLogRepository', () => ({
    default: { getPreviousInstancesByWorldId: vi.fn().mockResolvedValue([]) }
}));
vi.mock('@/services/launchService', () => ({
    selfInviteToInstance: vi.fn()
}));
vi.mock('@/services/toastService', () => ({
    toast: { add: vi.fn() }
}));

const WORLD_ID = 'wrld_976e67bf-403a-4ead-8005-0c5ccba26caa';
const SETTINGS = { worldInput: WORLD_ID, minUsers: 10 };

function mockWorld(instances: Array<[string, number]>) {
    vi.mocked(worldProfileRepository.getWorldProfile).mockResolvedValue({
        name: 'World',
        capacity: 50,
        instances
    } as never);
}

describe('useInstanceHopper', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.mocked(selfInviteToInstance).mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('invites to every matching instance, one per interval, busiest first', async () => {
        mockWorld([
            ['111~region(jp)', 12],
            ['222~region(jp)', 3],
            ['333~region(jp)', 40]
        ]);
        const { result } = renderHook(() => useInstanceHopper(SETTINGS));

        await act(async () => {
            void result.current.sendAll();
            await vi.advanceTimersByTimeAsync(0);
        });
        expect(vi.mocked(selfInviteToInstance).mock.calls).toEqual([
            [`${WORLD_ID}:333~region(jp)`]
        ]);

        await act(async () => {
            await vi.advanceTimersByTimeAsync(INVITE_INTERVAL_MILLISECONDS);
        });
        expect(vi.mocked(selfInviteToInstance).mock.calls).toEqual([
            [`${WORLD_ID}:333~region(jp)`],
            [`${WORLD_ID}:111~region(jp)`]
        ]);
        expect(result.current.sending).toBe(false);
        expect(result.current.sentCount).toBe(2);
    });

    it('stops sending when stop is pressed', async () => {
        mockWorld([
            ['111', 30],
            ['222', 20],
            ['333', 10]
        ]);
        const { result } = renderHook(() => useInstanceHopper(SETTINGS));

        await act(async () => {
            void result.current.sendAll();
            await vi.advanceTimersByTimeAsync(0);
        });
        act(() => result.current.stop());
        await act(async () => {
            await vi.advanceTimersByTimeAsync(INVITE_INTERVAL_MILLISECONDS * 3);
        });

        expect(selfInviteToInstance).toHaveBeenCalledTimes(1);
        expect(result.current.sending).toBe(false);
    });
});
