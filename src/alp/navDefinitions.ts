/**
 * Sidebar entries for VRCX-0-alp features.
 *
 * Upstream files only spread this list in, so merging upstream changes
 * touches one line and removing a feature means deleting its entry here.
 */
export const INSTANCE_HOPPER_PATH = '/alp/instance-hopper';

export const alpNavDefinitions = [
    {
        key: 'alp-instance-hopper',
        icon: 'lucide:Compass',
        tooltip: 'Instance Hopper',
        labelKey: 'Instance Hopper',
        titleIsCustom: true,
        routeName: null,
        path: INSTANCE_HOPPER_PATH
    }
];
