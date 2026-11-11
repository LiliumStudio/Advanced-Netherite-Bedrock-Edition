export const NETHERITE_REPLACEMENTS: Readonly<Record<string, string>> = {
    "minecraft:netherite_sword": "lsan:netherite_sword",
    "minecraft:netherite_spear": "lsan:netherite_spear",
    "minecraft:netherite_pickaxe": "lsan:netherite_pickaxe",
    "minecraft:netherite_axe": "lsan:netherite_axe",
    "minecraft:netherite_shovel": "lsan:netherite_shovel",
    "minecraft:netherite_hoe": "lsan:netherite_hoe",
};

export type ItemSnapshot = {
    typeId: string;
    nameTag?: string;
    lore: string[];
    damage?: number;
    enchantments: { id: string; level: number }[];
    dynamicProperties: Record<string, string | number | boolean>;
};

export function planConversion(item: ItemSnapshot): ItemSnapshot | null {
    const replacement = Object.hasOwn(NETHERITE_REPLACEMENTS, item.typeId)
        ? NETHERITE_REPLACEMENTS[item.typeId]
        : undefined;
    if (!replacement) return null;
    return {
        ...item,
        typeId: replacement,
        lore: [...item.lore],
        enchantments: item.enchantments.map(e => ({ ...e })),
        dynamicProperties: { ...item.dynamicProperties },
    };
}
