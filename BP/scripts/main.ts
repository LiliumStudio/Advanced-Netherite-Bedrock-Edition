import { system, world, type Player } from "@minecraft/server";
import { PlayerScheduler } from "./platform/scheduler.js";
import { armorBar } from "./features/armorBar.js";
import { config } from "./features/config.js";
import { ConfigStore, type Context, type Feature } from "./features/configStore.js";
import { conversion } from "./features/conversion.js";
import { drops } from "./features/drops.js";
import { durability } from "./features/durability.js";
import { lore } from "./features/lore.js";
import { migration } from "./features/migration.js";
import { protections } from "./features/protections.js";

const ctx: Context = {
    config: new ConfigStore(),
    scheduler: new PlayerScheduler<Player>(
        () => world.getAllPlayers(),
        (fn, ticks) => system.runInterval(fn, ticks),
    ),
};

const FEATURES: Feature[] = [migration, config, protections, drops, lore, conversion, durability, armorBar];

for (const feature of FEATURES) {
    try {
        feature.init(ctx);
        console.log(`[lsan] ok ${feature.name}`);
    } catch (error) {
        console.warn(`[lsan] Failed to init "${feature.name}":`, error);
    }
}
