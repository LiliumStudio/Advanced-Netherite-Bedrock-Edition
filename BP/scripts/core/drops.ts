import type { WorldConfig } from "./config.js";
import { CROP_LOOT, MATERIALS, MOB_LOOT, ORE_LOOT, materialTagsOf, type LootEntry } from "./materials.js";
import { randomInt, rollChance, type Rng } from "./random.js";

export type Drop = { item: string; amount: number };

const MATURE_CROP_GROWTH = 7;

function roll(entry: LootEntry, cfg: WorldConfig, rng: Rng): Drop | null {
    if (!rollChance(rng, cfg[entry.chance] as number)) return null;
    const amount = randomInt(rng, entry.min, entry.max);
    return amount > 0 ? { item: entry.item, amount } : null;
}

export function resolveMobDrops(
    weaponTags: ReadonlySet<string>,
    mobFamilies: ReadonlySet<string>,
    cfg: WorldConfig,
    rng: Rng,
): Drop[] {
    if (!cfg.enableAdditionalMobDrops) return [];
    if (!weaponTags.has("minecraft:is_sword") || weaponTags.has("minecraft:is_spear")) return [];

    const families = new Set(materialTagsOf(weaponTags).flatMap(tag => MATERIALS[tag].mobFamilies));
    const drops: Drop[] = [];
    for (const family of families) {
        if (!mobFamilies.has(family)) continue;
        const entry = MOB_LOOT[family];
        const drop = entry ? roll(entry, cfg, rng) : null;
        if (drop) drops.push(drop);
    }
    return drops;
}

export function resolveOreDrop(
    toolTags: ReadonlySet<string>,
    blockId: string,
    silkTouch: boolean,
    cfg: WorldConfig,
    rng: Rng,
): Drop | null {
    if (!cfg.enableAdditionalOreDrops) return null;
    if (!toolTags.has("minecraft:is_pickaxe") || silkTouch) return null;

    const matches = materialTagsOf(toolTags).some(tag => MATERIALS[tag].oreBlocks.includes(blockId));
    const entry = ORE_LOOT[blockId];
    if (!matches || !entry) return null;
    return roll(entry, cfg, rng);
}

export function resolveCropDrop(
    toolTags: ReadonlySet<string>,
    blockId: string,
    growth: number | undefined,
    cfg: WorldConfig,
    rng: Rng,
): Drop | null {
    if (!cfg.enableAdditionalCropDrops) return null;
    const entry = CROP_LOOT[blockId];
    if (!entry || typeof growth !== "number" || growth < MATURE_CROP_GROWTH) return null;
    if (!toolTags.has("minecraft:is_hoe") || materialTagsOf(toolTags).length === 0) return null;
    return roll(entry, cfg, rng);
}
