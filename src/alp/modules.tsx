/**
 * Registry of VRCX-0-alp modules. Adding a module means adding an entry
 * here; the hub page and routes are generated from this list.
 */
import { CompassIcon, type LucideIcon } from 'lucide-react';
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

import { ALP_MODULES_PATH } from './navDefinitions';
import type { LocalizedText } from './shared/useAlpLocale';

export type AlpModule = {
    id: string;
    path: string;
    icon: LucideIcon;
    title: LocalizedText;
    description: LocalizedText;
    Page: LazyExoticComponent<ComponentType>;
};

export const alpModules: AlpModule[] = [
    {
        id: 'instance-hopper',
        path: `${ALP_MODULES_PATH}/instance-hopper`,
        icon: CompassIcon,
        title: { en: 'Instance Hopper', ja: 'インスタンス巡回' },
        description: {
            en: 'Send yourself invites to the busy public instances of a world.',
            ja: 'ワールドの人が多い Public インスタンスへ、自分宛ての invite を順番に送ります。'
        },
        Page: lazy(async () => {
            const module = await import('./instance-hopper/InstanceHopperPage');
            return { default: module.InstanceHopperPage };
        })
    }
];
