/**
 * Routes for VRCX-0-alp features, spread into the upstream route table.
 */
import { lazy, Suspense } from 'react';

import type { AppRouteDefinition } from '@/app/routes';
import { Spinner } from '@/ui/shadcn/spinner';

import { INSTANCE_HOPPER_PATH } from './navDefinitions';

const InstanceHopperPage = lazy(async () => {
    const module = await import('./instance-hopper/InstanceHopperPage');
    return { default: module.InstanceHopperPage };
});

function AlpRouteFallback() {
    return (
        <div className="flex h-full items-center justify-center">
            <Spinner className="size-4" />
        </div>
    );
}

export const alpRoutes: AppRouteDefinition[] = [
    {
        path: INSTANCE_HOPPER_PATH,
        element: (
            <Suspense fallback={<AlpRouteFallback />}>
                <InstanceHopperPage />
            </Suspense>
        )
    }
];
