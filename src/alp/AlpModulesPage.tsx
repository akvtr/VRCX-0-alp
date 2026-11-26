import { BoxesIcon } from 'lucide-react';
import { Link } from 'react-router';

import { PageScaffold } from '@/components/layout/PageScaffold';

import { alpModules } from './modules';
import { useAlpLocale } from './shared/useAlpLocale';

const PAGE_DESCRIPTION = {
    en: 'Optional features of VRCX-0-alp.',
    ja: 'VRCX-0-alp の追加機能です。'
};

export function AlpModulesPage() {
    const locale = useAlpLocale();
    return (
        <PageScaffold className="gap-4 overflow-y-auto">
            <div className="flex flex-col gap-1">
                <h1 className="flex items-center gap-2 text-lg font-semibold">
                    <BoxesIcon className="size-5" />
                    ALP Modules
                </h1>
                <p className="text-muted-foreground text-sm">
                    {PAGE_DESCRIPTION[locale]}
                </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {alpModules.map((module) => (
                    <li key={module.id}>
                        <Link
                            to={module.path}
                            className="hover:bg-muted flex h-full flex-col gap-2 rounded-lg border p-4 transition-colors"
                        >
                            <span className="flex items-center gap-2 font-medium">
                                <module.icon className="size-4" />
                                {module.title[locale]}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                {module.description[locale]}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </PageScaffold>
    );
}
