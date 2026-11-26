import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    getPathForNavEntry,
    loadNavMenuModel
} from '@/components/layout/navMenuModel';
import configRepository from '@/repositories/configRepository';

import { INSTANCE_HOPPER_PATH } from './navDefinitions';

vi.mock('@/repositories/configRepository', () => ({
    default: { getString: vi.fn() }
}));

const INSTANCE_HOPPER_KEY = 'alp-instance-hopper';

function translate(key: string) {
    return key;
}

describe('alp sidebar entries', () => {
    beforeEach(() => {
        vi.mocked(configRepository.getString).mockReset();
    });

    it('appends the instance hopper to a layout saved before it existed', async () => {
        vi.mocked(configRepository.getString).mockResolvedValue(
            JSON.stringify({
                layout: [{ type: 'item', key: 'feed' }],
                hiddenKeys: []
            })
        );

        const model = await loadNavMenuModel({ t: translate });
        const entry = model.menuItems.find(
            (item) => item.key === INSTANCE_HOPPER_KEY
        );

        expect(entry).toBeDefined();
        expect(getPathForNavEntry(entry ?? null)).toBe(INSTANCE_HOPPER_PATH);
    });

    it('shows the instance hopper for a fresh profile', async () => {
        vi.mocked(configRepository.getString).mockResolvedValue('');

        const model = await loadNavMenuModel({ t: translate });

        expect(
            model.menuItems.some((item) => item.key === INSTANCE_HOPPER_KEY)
        ).toBe(true);
    });
});
