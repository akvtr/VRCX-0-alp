/**
 * Routes for VRCX-0-alp, spread into the upstream route table.
 */
import { lazy, Suspense, type ReactNode } from 'react';

import type { AppRouteDefinition } from '@/app/routes';
import { Spinner } from '@/ui/shadcn/spinner';

import { alpModules } from './modules';
import { ALP_MODULES_PATH } from './navDefinitions';

const AlpModulesPage = lazy(async () => {
    const module = await import('./AlpModulesPage');
    return { default: module.AlpModulesPage };
});

function withFallback(children: ReactNode) {
    return (
        <Suspense
            fallback={
                <div className="flex h-full items-center justify-center">
                    <Spinner className="size-4" />
                </div>
            }
        >
            {children}
        </Suspense>
    );
}

export const alpRoutes: AppRouteDefinition[] = [
    { path: ALP_MODULES_PATH, element: withFallback(<AlpModulesPage />) },
    ...alpModules.map(({ path, Page }) => ({
        path,
        element: withFallback(<Page />)
    }))
];
