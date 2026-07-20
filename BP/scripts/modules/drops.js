import { world, ItemStack } from "@minecraft/server";
import { getHandItem, hasFamily, rollChance, randomInt, Config } from "../api/index.js";

// ─────────────────────────────────────────────────────────────
//  Reglas de drops
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
//  Sistema: drops adicionales (mobs, minerales y cultivos)
// ─────────────────────────────────────────────────────────────
function _isMature(permutation, cropCfg) {
    const age = permutation.getState(cropCfg.ageState) ?? permutation.getState("age");
    return age !== undefined && age >= cropCfg.maxAge;
}

function _handleMobDrops(event, cfg) {
    if (!cfg.enableAdditionalMobDrops) return;

    const dead   = event.deadEntity;
    const killer = event.damageSource?.damagingEntity;
    if (!killer || killer.typeId !== "minecraft:player") return;

    const weapon = getHandItem(killer);
    if (!weapon) return;

    for (const rule of WEAPON_DROP_RULES) {
        if (!weapon.hasTag(rule.materialTag))    continue;
        if (!weapon.hasTag(rule.weaponTypeTag))  continue;
        if (!hasFamily(dead, rule.family))       continue;
        if (!rollChance(cfg[rule.chanceKey]))    continue;

        dead.dimension.spawnItem(
            new ItemStack(rule.loot, randomInt(rule.min, rule.max)),
            dead.location
        );
    }
}

function _handleOreDrops(event, cfg) {
    if (!cfg.enableAdditionalOreDrops) return;

    const player  = event.player;
    const blockId = event.brokenBlockPermutation.type.id;

    const pickaxe = getHandItem(player);
    if (!pickaxe) return;
    if (!pickaxe.hasTag("minecraft:is_pickaxe")) return;

    for (const rule of PICKAXE_DROP_RULES) {
        if (rule.blockId !== blockId)           continue;
        if (!pickaxe.hasTag(rule.materialTag))  continue;
        if (!rollChance(cfg[rule.chanceKey]))   continue;

        player.dimension.spawnItem(
            new ItemStack(rule.loot, randomInt(rule.min, rule.max)),
            event.block.location
        );
    }
}

function _handleCropDrops(event, cfg) {
    if (!cfg.enableAdditionalCropDrops) return;

    const blockId = event.brokenBlockPermutation.type.id;
    const crop    = CROP_DROP_RULES[blockId];
    if (!crop || !_isMature(event.brokenBlockPermutation, crop)) return;

    const hoe = getHandItem(event.player);
    if (!hoe) return;
    if (!hoe.hasTag("minecraft:is_hoe")) return;
    if (!HOE_MATERIAL_TAGS.some(tag => hoe.hasTag(tag))) return;

    if (!rollChance(cfg[crop.chanceKey])) return;

    event.player.dimension.spawnItem(
        new ItemStack(crop.loot, randomInt(crop.bonusMin, crop.bonusMax)),
        event.block.location
    );
}

export const DropsSystem = {
    name: "DropsSystem",

    onInit() {
        world.afterEvents.entityDie.subscribe((event) => {
            _handleMobDrops(event, Config.get());
        });

        world.afterEvents.playerBreakBlock.subscribe((event) => {
            const cfg = Config.get();
            _handleOreDrops(event, cfg);
            _handleCropDrops(event, cfg);
        });
    },
};
