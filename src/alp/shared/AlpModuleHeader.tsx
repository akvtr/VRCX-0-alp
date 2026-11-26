import { ChevronLeftIcon, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';

import { ALP_MODULES_PATH } from '../navDefinitions';

export function AlpModuleHeader({
    icon: Icon,
    title,
    description
}: {
    icon: LucideIcon;
    title: string;
    description: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <Link
                to={ALP_MODULES_PATH}
                className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-xs"
            >
                <ChevronLeftIcon className="size-3" />
                ALP Modules
            </Link>
            <h1 className="flex items-center gap-2 text-lg font-semibold">
                <Icon className="size-5" />
                {title}
            </h1>
            <p className="text-muted-foreground text-sm">{description}</p>
        </div>
    );
}
