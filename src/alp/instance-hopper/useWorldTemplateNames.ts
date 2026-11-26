import { useEffect, useState } from 'react';

import worldProfileRepository from '@/repositories/worldProfileRepository';

/** Resolves template world names from the local world cache when possible. */
export function useWorldTemplateNames(
    worldIds: string[]
): ReadonlyMap<string, string> {
    const [names, setNames] = useState<ReadonlyMap<string, string>>(new Map());
    const worldIdsKey = worldIds.join(',');

    useEffect(() => {
        let cancelled = false;
        void Promise.all(
            worldIdsKey.split(',').map(async (worldId) => {
                try {
                    const world = await worldProfileRepository.getWorldProfile({
                        worldId
                    });
                    return [worldId, world.name] as const;
                } catch {
                    return [worldId, ''] as const;
                }
            })
        ).then((entries) => {
            if (!cancelled) {
                setNames(new Map(entries.filter(([, name]) => name)));
            }
        });
        return () => {
            cancelled = true;
        };
    }, [worldIdsKey]);

    return names;
}
