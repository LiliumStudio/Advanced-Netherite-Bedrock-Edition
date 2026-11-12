import { randomInt, type Rng } from "./random.js";

const TOOL_TAGS = ["minecraft:is_pickaxe", "minecraft:is_axe", "minecraft:is_shovel", "minecraft:is_hoe"];
const WEAPON_TAGS = ["minecraft:is_sword", "minecraft:is_spear"];
const SCRIPTED_INTERACTION_TAGS = ["minecraft:is_axe", "minecraft:is_hoe"];

export function blockBreakWear(typeId: string, tags: ReadonlySet<string>): number {
    if (!typeId.startsWith("lsan:")) return 0;
    if (WEAPON_TAGS.some(t => tags.has(t))) return 2;
    if (TOOL_TAGS.some(t => tags.has(t))) return 1;
    return 0;
}

export function interactionWear(typeId: string, tags: ReadonlySet<string>): number {
    if (!typeId.startsWith("lsan:")) return 0;
    return SCRIPTED_INTERACTION_TAGS.some(t => tags.has(t)) ? 1 : 0;
}

export function rollWear(rng: Rng, chanceMin: number, chanceMax: number, unbreaking: number): boolean {
    const chance = randomInt(rng, chanceMin, chanceMax) / (Math.max(0, unbreaking) + 1);
    return rng.next() * 100 < chance;
}
