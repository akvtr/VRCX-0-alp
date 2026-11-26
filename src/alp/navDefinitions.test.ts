import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    getPathForNavEntry,
    loadNavMenuModel
} from '@/components/layout/navMenuModel';
import configRepository from '@/repositories/configRepository';

import { ALP_MODULES_PATH } from './navDefinitions';

vi.mock('@/repositories/configRepository', () => ({
    default: { getString: vi.fn() }
}));

const ALP_MODULES_KEY = 'alp-modules';

function translate(key: string) {
    return key;
}

describe('alp sidebar entries', () => {
    beforeEach(() => {
        vi.mocked(configRepository.getString).mockReset();
    });

    it('appends ALP Modules to a layout saved before it existed', async () => {
        vi.mocked(configRepository.getString).mockResolvedValue(
            JSON.stringify({
                layout: [{ type: 'item', key: 'feed' }],
                hiddenKeys: []
            })
        );

        const model = await loadNavMenuModel({ t: translate });
        const entry = model.menuItems.find(
            (item) => item.key === ALP_MODULES_KEY
        );

        expect(entry).toBeDefined();
        expect(getPathForNavEntry(entry ?? null)).toBe(ALP_MODULES_PATH);
    });

    it('shows ALP Modules for a fresh profile', async () => {
        vi.mocked(configRepository.getString).mockResolvedValue('');

        const model = await loadNavMenuModel({ t: translate });

        expect(
            model.menuItems.some((item) => item.key === ALP_MODULES_KEY)
        ).toBe(true);
    });
});
