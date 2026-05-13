export const WEAPON_DROP_RULES = [

    { materialTag: "lsan:iron", weaponTypeTag: "minecraft:is_sword",  family: "phantom",         loot: "minecraft:phantom_membrane", chanceKey: "additionalPhantomDropChance",         min: 1, max: 2 },
    { materialTag: "lsan:iron", weaponTypeTag: "minecraft:is_spear",  family: "phantom",         loot: "minecraft:phantom_membrane", chanceKey: "additionalPhantomDropChance",         min: 1, max: 2 },

    { materialTag: "lsan:gold", weaponTypeTag: "minecraft:is_sword",  family: "piglin",          loot: "minecraft:gold_ingot",        chanceKey: "additionalPiglinDropChance",          min: 1, max: 2 },
    { materialTag: "lsan:gold", weaponTypeTag: "minecraft:is_sword",  family: "zombifiedpiglin", loot: "minecraft:gold_nugget",       chanceKey: "additionalZombifiedPiglinDropChance", min: 1, max: 4 },
    { materialTag: "lsan:gold", weaponTypeTag: "minecraft:is_spear",  family: "piglin",          loot: "minecraft:gold_ingot",        chanceKey: "additionalPiglinDropChance",          min: 1, max: 2 },
    { materialTag: "lsan:gold", weaponTypeTag: "minecraft:is_spear",  family: "zombifiedpiglin", loot: "minecraft:gold_nugget",       chanceKey: "additionalZombifiedPiglinDropChance", min: 1, max: 4 },

    { materialTag: "lsan:emerald", weaponTypeTag: "minecraft:is_sword", family: "enderman", loot: "minecraft:ender_pearl", chanceKey: "additionalEndermanDropChance", min: 1, max: 2 },
    { materialTag: "lsan:emerald", weaponTypeTag: "minecraft:is_spear", family: "enderman", loot: "minecraft:ender_pearl", chanceKey: "additionalEndermanDropChance", min: 1, max: 2 },

    { materialTag: "lsan:diamond", weaponTypeTag: "minecraft:is_sword", family: "phantom",         loot: "minecraft:phantom_membrane", chanceKey: "additionalPhantomDropChance",         min: 1, max: 2 },
    { materialTag: "lsan:diamond", weaponTypeTag: "minecraft:is_sword", family: "piglin",          loot: "minecraft:gold_ingot",        chanceKey: "additionalPiglinDropChance",          min: 1, max: 2 },
    { materialTag: "lsan:diamond", weaponTypeTag: "minecraft:is_sword", family: "zombifiedpiglin", loot: "minecraft:gold_nugget",       chanceKey: "additionalZombifiedPiglinDropChance", min: 1, max: 4 },
    { materialTag: "lsan:diamond", weaponTypeTag: "minecraft:is_sword", family: "enderman",        loot: "minecraft:ender_pearl",       chanceKey: "additionalEndermanDropChance",        min: 1, max: 2 },
    { materialTag: "lsan:diamond", weaponTypeTag: "minecraft:is_spear", family: "phantom",         loot: "minecraft:phantom_membrane", chanceKey: "additionalPhantomDropChance",         min: 1, max: 2 },
    { materialTag: "lsan:diamond", weaponTypeTag: "minecraft:is_spear", family: "piglin",          loot: "minecraft:gold_ingot",        chanceKey: "additionalPiglinDropChance",          min: 1, max: 2 },
    { materialTag: "lsan:diamond", weaponTypeTag: "minecraft:is_spear", family: "zombifiedpiglin", loot: "minecraft:gold_nugget",       chanceKey: "additionalZombifiedPiglinDropChance", min: 1, max: 4 },
    { materialTag: "lsan:diamond", weaponTypeTag: "minecraft:is_spear", family: "enderman",        loot: "minecraft:ender_pearl",       chanceKey: "additionalEndermanDropChance",        min: 1, max: 2 },
];

export const PICKAXE_DROP_RULES = [

    { materialTag: "lsan:iron", blockId: "minecraft:iron_ore",          loot: "minecraft:raw_iron",  chanceKey: "additionalRawIronDropChance",  min: 1, max: 2 },
    { materialTag: "lsan:iron", blockId: "minecraft:deepslate_iron_ore", loot: "minecraft:raw_iron", chanceKey: "additionalRawIronDropChance",  min: 1, max: 2 },

    { materialTag: "lsan:gold", blockId: "minecraft:gold_ore",           loot: "minecraft:raw_gold",    chanceKey: "additionalRawGoldDropChance",     min: 1, max: 2 },
    { materialTag: "lsan:gold", blockId: "minecraft:deepslate_gold_ore", loot: "minecraft:raw_gold",    chanceKey: "additionalRawGoldDropChance",     min: 1, max: 2 },
    { materialTag: "lsan:gold", blockId: "minecraft:nether_gold_ore",    loot: "minecraft:gold_nugget", chanceKey: "additionalGoldNuggetDropChance",  min: 1, max: 2 },

    { materialTag: "lsan:emerald", blockId: "minecraft:emerald_ore",           loot: "minecraft:emerald", chanceKey: "additionalEmeraldDropChance", min: 1, max: 2 },
    { materialTag: "lsan:emerald", blockId: "minecraft:deepslate_emerald_ore", loot: "minecraft:emerald", chanceKey: "additionalEmeraldDropChance", min: 1, max: 2 },

    { materialTag: "lsan:diamond", blockId: "minecraft:diamond_ore",           loot: "minecraft:diamond", chanceKey: "additionalDiamondDropChance", min: 1, max: 2 },
    { materialTag: "lsan:diamond", blockId: "minecraft:deepslate_diamond_ore", loot: "minecraft:diamond", chanceKey: "additionalDiamondDropChance", min: 1, max: 2 },

    { materialTag: "lsan:diamond", blockId: "minecraft:iron_ore",              loot: "minecraft:raw_iron", chanceKey: "additionalRawIronDropChance", min: 1, max: 2 },
    { materialTag: "lsan:diamond", blockId: "minecraft:deepslate_iron_ore",    loot: "minecraft:raw_iron", chanceKey: "additionalRawIronDropChance", min: 1, max: 2 },
];

export const HOE_MATERIAL_TAGS = ["lsan:iron", "lsan:gold", "lsan:emerald", "lsan:diamond"];

export const CROP_DROP_RULES = {
    "minecraft:wheat":     { loot: "minecraft:wheat",    ageState: "growth", maxAge: 7, chanceKey: "additionalWheatDropChance",    bonusMin: 1, bonusMax: 3 },
    "minecraft:carrots":   { loot: "minecraft:carrot",   ageState: "growth", maxAge: 7, chanceKey: "additionalCarrotsDropChance",   bonusMin: 1, bonusMax: 3 },
    "minecraft:potatoes":  { loot: "minecraft:potato",   ageState: "growth", maxAge: 7, chanceKey: "additionalPotatoesDropChance",  bonusMin: 1, bonusMax: 3 },
    "minecraft:beetroots": { loot: "minecraft:beetroot", ageState: "growth", maxAge: 3, chanceKey: "additionalBeetrootsDropChance", bonusMin: 1, bonusMax: 3 },
};

export const NETHERITE_REPLACEMENTS = {
    "minecraft:netherite_sword":   "lsan:netherite_sword",
    "minecraft:netherite_spear":   "lsan:netherite_spear",
    "minecraft:netherite_pickaxe": "lsan:netherite_pickaxe",
    "minecraft:netherite_axe":     "lsan:netherite_axe",
    "minecraft:netherite_shovel":  "lsan:netherite_shovel",
    "minecraft:netherite_hoe":     "lsan:netherite_hoe",
};
