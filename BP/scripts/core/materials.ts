import type { WorldConfig } from "./config.js";

export type MaterialTag = "lsan:iron" | "lsan:gold" | "lsan:emerald" | "lsan:diamond";

export const MATERIAL_TAGS: readonly MaterialTag[] = ["lsan:iron", "lsan:gold", "lsan:emerald", "lsan:diamond"];

export type PerkDef = { key: string; color: string; fallback: string };

const WHITE = "§f";
const GRAY = "§7";
const GOLD = "§6";
const DARK_GREEN = "§2";
const AQUA = "§b";

function perk(key: string, color: string, fallback: string): PerkDef {
    return { key: `tooltip.lsan:${key}`, color, fallback };
}

const PACIFY_PHANTOMS = perk("armor.phantom_passive", GRAY, "Pacifies Phantoms when worn");
const PACIFY_PIGLINS = perk("armor.piglin_passive", GOLD, "Pacifies Piglins when worn");
const PACIFY_ENDERMEN = perk("armor.enderman_passive", DARK_GREEN, "Pacifies Endermen when worn");
const DROP_MEMBRANE = perk("sword.additional_phantom_mob_drop", GRAY, "Phantom Membrane on phantom kill");
const DROP_GOLD_INGOT = perk("sword.additional_piglin_mob_drop", GOLD, "Gold Ingot on piglin kill");
const DROP_GOLD_NUGGETS = perk("sword.additional_zombified_piglin_mob_drop", GOLD, "Gold Nuggets on zombified piglin kill");
const DROP_ENDER_PEARL = perk("sword.additional_enderman_mob_drop", DARK_GREEN, "Ender Pearl on enderman kill");
const EXTRA_CROPS = perk("hoe.additional_crop_drops", WHITE, "Extra crops from harvesting");

export type ItemKind = "armor" | "spear" | "sword" | "pickaxe" | "hoe";

export type MaterialDef = {
    protections: readonly string[];
    mobFamilies: readonly string[];
    oreBlocks: readonly string[];
    lore: Readonly<Record<ItemKind, readonly PerkDef[]>>;
};

export const MATERIALS: Readonly<Record<MaterialTag, MaterialDef>> = {
    "lsan:iron": {
        protections: ["lsan:phantom_immune"],
        mobFamilies: ["phantom"],
        oreBlocks: ["minecraft:iron_ore", "minecraft:deepslate_iron_ore"],
        lore: {
            armor: [PACIFY_PHANTOMS],
            spear: [],
            sword: [DROP_MEMBRANE],
            pickaxe: [perk("pickaxe.additional_iron_drop", GRAY, "Raw iron from iron ore")],
            hoe: [EXTRA_CROPS],
        },
    },
    "lsan:gold": {
        protections: ["lsan:piglin_immune"],
        mobFamilies: ["piglin", "zombie_pigman"],
        oreBlocks: ["minecraft:gold_ore", "minecraft:deepslate_gold_ore", "minecraft:nether_gold_ore"],
        lore: {
            armor: [PACIFY_PIGLINS],
            spear: [],
            sword: [DROP_GOLD_INGOT, DROP_GOLD_NUGGETS],
            pickaxe: [perk("pickaxe.additional_gold_drop", GOLD, "Raw gold from gold ore")],
            hoe: [EXTRA_CROPS],
        },
    },
    "lsan:emerald": {
        protections: ["lsan:enderman_immune"],
        mobFamilies: ["enderman"],
        oreBlocks: ["minecraft:emerald_ore", "minecraft:deepslate_emerald_ore"],
        lore: {
            armor: [PACIFY_ENDERMEN],
            spear: [],
            sword: [DROP_ENDER_PEARL],
            pickaxe: [perk("pickaxe.additional_emerald_drop", DARK_GREEN, "Emerald from emerald ore")],
            hoe: [EXTRA_CROPS],
        },
    },
    "lsan:diamond": {
        protections: ["lsan:phantom_immune", "lsan:piglin_immune", "lsan:enderman_immune"],
        mobFamilies: ["phantom", "piglin", "zombie_pigman", "enderman"],
        oreBlocks: ["minecraft:diamond_ore", "minecraft:deepslate_diamond_ore"],
        lore: {
            armor: [PACIFY_ENDERMEN, PACIFY_PIGLINS, PACIFY_PHANTOMS],
            spear: [],
            sword: [DROP_MEMBRANE, DROP_GOLD_INGOT, DROP_GOLD_NUGGETS, DROP_ENDER_PEARL],
            pickaxe: [perk("pickaxe.additional_diamond_drop", AQUA, "Diamond from diamond ore")],
            hoe: [EXTRA_CROPS],
        },
    },
};

export const PROTECTION_TAGS: readonly string[] = [
    ...new Set(MATERIAL_TAGS.flatMap(tag => MATERIALS[tag].protections)),
];

export function protectionsFor(tags: Iterable<MaterialTag>): Set<string> {
    const active = new Set<string>();
    for (const tag of tags) for (const p of MATERIALS[tag].protections) active.add(p);
    return active;
}

export function materialTagsOf(itemTags: ReadonlySet<string>): MaterialTag[] {
    return MATERIAL_TAGS.filter(tag => itemTags.has(tag));
}

export type LootEntry = { item: string; chance: keyof WorldConfig; min: number; max: number };

export const MOB_LOOT: Readonly<Record<string, LootEntry>> = {
    phantom: { item: "minecraft:phantom_membrane", chance: "additionalPhantomDropChance", min: 0, max: 2 },
    piglin: { item: "minecraft:gold_ingot", chance: "additionalPiglinDropChance", min: 1, max: 1 },
    zombie_pigman: { item: "minecraft:gold_nugget", chance: "additionalZombifiedPiglinDropChance", min: 0, max: 3 },
    enderman: { item: "minecraft:ender_pearl", chance: "additionalEndermanDropChance", min: 0, max: 1 },
};

export const ORE_LOOT: Readonly<Record<string, LootEntry>> = {
    "minecraft:iron_ore": { item: "minecraft:raw_iron", chance: "additionalRawIronDropChance", min: 1, max: 2 },
    "minecraft:deepslate_iron_ore": { item: "minecraft:raw_iron", chance: "additionalRawIronDropChance", min: 1, max: 2 },
    "minecraft:gold_ore": { item: "minecraft:raw_gold", chance: "additionalRawGoldDropChance", min: 1, max: 1 },
    "minecraft:deepslate_gold_ore": { item: "minecraft:raw_gold", chance: "additionalRawGoldDropChance", min: 1, max: 1 },
    "minecraft:nether_gold_ore": { item: "minecraft:gold_nugget", chance: "additionalGoldNuggetDropChance", min: 1, max: 3 },
    "minecraft:emerald_ore": { item: "minecraft:emerald", chance: "additionalEmeraldDropChance", min: 1, max: 1 },
    "minecraft:deepslate_emerald_ore": { item: "minecraft:emerald", chance: "additionalEmeraldDropChance", min: 1, max: 1 },
    "minecraft:diamond_ore": { item: "minecraft:diamond", chance: "additionalDiamondDropChance", min: 1, max: 1 },
    "minecraft:deepslate_diamond_ore": { item: "minecraft:diamond", chance: "additionalDiamondDropChance", min: 1, max: 1 },
};

export const CROP_LOOT: Readonly<Record<string, LootEntry>> = {
    "minecraft:wheat": { item: "minecraft:wheat", chance: "additionalWheatDropChance", min: 0, max: 2 },
    "minecraft:carrots": { item: "minecraft:carrot", chance: "additionalCarrotsDropChance", min: 0, max: 2 },
    "minecraft:potatoes": { item: "minecraft:potato", chance: "additionalPotatoesDropChance", min: 0, max: 1 },
    "minecraft:beetroot": { item: "minecraft:beetroot", chance: "additionalBeetrootsDropChance", min: 1, max: 2 },
};
