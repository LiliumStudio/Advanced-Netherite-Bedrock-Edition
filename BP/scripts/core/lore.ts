import type { WorldConfig } from "./config.js";
import { MATERIALS, MATERIAL_TAGS, type ItemKind } from "./materials.js";

export type Perk = { key: string; color: string; fallback: string };

export type RawMessage = {
    text?: string;
    translate?: string;
    with?: string[];
    rawtext?: RawMessage[];
};

export type LoreLine = RawMessage | string;

const MOD_LABEL = "§r§o§9Advanced Netherite";

const KINDS: readonly { tag: string; kind: ItemKind; enabledKey?: keyof WorldConfig }[] = [
    { tag: "minecraft:is_armor", kind: "armor" },
    { tag: "minecraft:is_spear", kind: "spear" },
    { tag: "minecraft:is_sword", kind: "sword", enabledKey: "enableAdditionalMobDrops" },
    { tag: "minecraft:is_pickaxe", kind: "pickaxe", enabledKey: "enableAdditionalOreDrops" },
    { tag: "minecraft:is_hoe", kind: "hoe", enabledKey: "enableAdditionalCropDrops" },
];

export function perksFor(itemTags: ReadonlySet<string>, cfg: WorldConfig, showTooltips: boolean): Perk[] {
    if (!showTooltips) return [];
    const entry = KINDS.find(k => itemTags.has(k.tag));
    if (!entry || (entry.enabledKey && !cfg[entry.enabledKey])) return [];

    for (const material of MATERIAL_TAGS) {
        if (itemTags.has(material)) return [...MATERIALS[material].lore[entry.kind]];
    }
    return [];
}

export function loreSignature(perks: Perk[]): string {
    return perks.length === 0 ? "v2:none" : "v2:" + perks.map(p => p.key).join("|");
}

export function buildLoreLines(perks: Perk[]): { translated: LoreLine[]; fallback: string[] } {
    if (perks.length === 0) return { translated: [], fallback: [] };
    return {
        translated: [
            ...perks.map(({ key, color }): RawMessage => ({
                rawtext: [{ text: `§r${color}` }, { translate: key, with: [`§a§l+§r${color}`] }],
            })),
            "",
            MOD_LABEL,
        ],
        fallback: [...perks.map(({ color, fallback }) => `§r§a+ ${color}${fallback}`), "", MOD_LABEL],
    };
}
