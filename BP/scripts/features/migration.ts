import { world } from "@minecraft/server";
import { CONFIG_KEY } from "../core/config.js";
import { migratePlayer, migrateWorld } from "../core/migration.js";
import { readJson, writeJson } from "../platform/storage.js";
import type { Feature } from "./configStore.js";

export const RECEIVED_CONFIG_ITEM = "lsan:received_config_item";

export const migration: Feature = {
    name: "migration",
    init({ config }) {
        const loadWorld = (): void => {
            if (config.isWorldLoaded()) return;
            const { stored, legacyPlayerDefaults, changed } = migrateWorld(readJson(world, CONFIG_KEY));
            if (changed) {
                try {
                    writeJson(world, CONFIG_KEY, stored);
                } catch (error) {
                    console.warn("[lsan:migration] Could not write world config:", error);
                }
            }
            config.loadWorld(stored.values, legacyPlayerDefaults);
        };

        world.afterEvents.worldLoad.subscribe(loadWorld);

        world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
            if (!initialSpawn) return;
            try {
                // Player migration needs the legacy defaults, so the world must be loaded first.
                loadWorld();
                const { stored, changed } = migratePlayer(readJson(player, CONFIG_KEY), config.playerFallback());
                if (changed) writeJson(player, CONFIG_KEY, stored);
                if (player.hasTag(RECEIVED_CONFIG_ITEM)) {
                    player.setDynamicProperty(RECEIVED_CONFIG_ITEM, true);
                    player.removeTag(RECEIVED_CONFIG_ITEM);
                }
            } catch (error) {
                console.warn("[lsan:migration] Player migration failed:", error);
            }
        });
    },
};
