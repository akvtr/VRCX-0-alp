/**
 * Sidebar entry for VRCX-0-alp modules.
 *
 * Upstream files only spread this list in, so merging upstream changes
 * touches one line. Individual modules are listed on the hub page instead
 * of the sidebar; see modules.tsx.
 */
export const ALP_MODULES_PATH = '/alp';

export const alpNavDefinitions = [
    {
        key: 'alp-modules',
        icon: 'lucide:Boxes',
        tooltip: 'ALP Modules',
        labelKey: 'ALP Modules',
        titleIsCustom: true,
        routeName: null,
        path: ALP_MODULES_PATH
    }
];
