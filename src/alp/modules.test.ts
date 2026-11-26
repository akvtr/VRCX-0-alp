import { describe, expect, it } from 'vitest';

import { alpModules } from './modules';
import { ALP_MODULES_PATH } from './navDefinitions';
import { alpRoutes } from './routes';

describe('alp modules', () => {
    it('gives every module a unique path under the hub', () => {
        const paths = alpModules.map((module) => module.path);
        expect(new Set(paths).size).toBe(paths.length);
        for (const path of paths) {
            expect(path.startsWith(`${ALP_MODULES_PATH}/`)).toBe(true);
        }
    });

    it('registers the hub and one route per module', () => {
        expect(alpRoutes.map((route) => route.path)).toEqual([
            ALP_MODULES_PATH,
            ...alpModules.map((module) => module.path)
        ]);
    });
});
