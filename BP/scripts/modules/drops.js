import { world, ItemStack } from "@minecraft/server";
import { Config, getHandItem, hasFamily, isPlayer, randomInt, rollChance } from "../api/index.js";

const WEAPON_TAGS = ["minecraft:is_sword", "minecraft:is_spear"];

const MOB_LOOT = {
    phantom: { loot: "minecraft:phantom_membrane", chanceKey: "additionalPhantomDropChance", min: 1, max: 2 },
    piglin: { loot: "minecraft:gold_ingot", chanceKey: "additionalPiglinDropChance", min: 1, max: 2 },
    zombifiedpiglin: { loot: "minecraft:gold_nugget", chanceKey: "additionalZombifiedPiglinDropChance", min: 1, max: 4 },
    enderman: { loot: "minecraft:ender_pearl", chanceKey: "additionalEndermanDropChance", min: 1, max: 2 },
};

const ORE_LOOT = {
    "minecraft:iron_ore": { loot: "minecraft:raw_iron", chanceKey: "additionalRawIronDropChance", min: 1, max: 2 },
    "minecraft:deepslate_iron_ore": { loot: "minecraft:raw_iron", chanceKey: "additionalRawIronDropChance", min: 1, max: 2 },
    "minecraft:gold_ore": { loot: "minecraft:raw_gold", chanceKey: "additionalRawGoldDropChance", min: 1, max: 2 },
    "minecraft:deepslate_gold_ore": { loot: "minecraft:raw_gold", chanceKey: "additionalRawGoldDropChance", min: 1, max: 2 },
    "minecraft:nether_gold_ore": { loot: "minecraft:gold_nugget", chanceKey: "additionalGoldNuggetDropChance", min: 1, max: 2 },
    "minecraft:emerald_ore": { loot: "minecraft:emerald", chanceKey: "additionalEmeraldDropChance", min: 1, max: 2 },
    "minecraft:deepslate_emerald_ore": { loot: "minecraft:emerald", chanceKey: "additionalEmeraldDropChance", min: 1, max: 2 },
    "minecraft:diamond_ore": { loot: "minecraft:diamond", chanceKey: "additionalDiamondDropChance", min: 1, max: 2 },
    "minecraft:deepslate_diamond_ore": { loot: "minecraft:diamond", chanceKey: "additionalDiamondDropChance", min: 1, max: 2 },
};

export const MOB_FAMILIES_BY_MATERIAL = {
    "lsan:iron": ["phantom"],
    "lsan:gold": ["piglin", "zombifiedpiglin"],
    "lsan:emerald": ["enderman"],
    "lsan:diamond": ["phantom", "piglin", "zombifiedpiglin", "enderman"],
};

export const ORE_BLOCKS_BY_MATERIAL = {
    "lsan:iron": ["minecraft:iron_ore", "minecraft:deepslate_iron_ore"],
    "lsan:gold": ["minecraft:gold_ore", "minecraft:deepslate_gold_ore", "minecraft:nether_gold_ore"],
    "lsan:emerald": ["minecraft:emerald_ore", "minecraft:deepslate_emerald_ore"],
    "lsan:diamond": [
        "minecraft:diamond_ore",
        "minecraft:deepslate_diamond_ore",
        "minecraft:iron_ore",
        "minecraft:deepslate_iron_ore",
    ],
};

export const CROP_DROPS = {
    "minecraft:wheat": { loot: "minecraft:wheat", maxAge: 7, chanceKey: "additionalWheatDropChance", min: 1, max: 3 },
    "minecraft:carrots": { loot: "minecraft:carrot", maxAge: 7, chanceKey: "additionalCarrotsDropChance", min: 1, max: 3 },
    "minecraft:potatoes": { loot: "minecraft:potato", maxAge: 7, chanceKey: "additionalPotatoesDropChance", min: 1, max: 3 },
    "minecraft:beetroots": { loot: "minecraft:beetroot", maxAge: 3, chanceKey: "additionalBeetrootsDropChance", min: 1, max: 3 },
};

const MATERIAL_TAGS = Object.keys(MOB_FAMILIES_BY_MATERIAL);

function materialTagsOf(item) {
    return MATERIAL_TAGS.filter(tag => item.hasTag(tag));
}

function spawnLoot(dimension, location, entry, config) {
    if (!rollChance(config[entry.chanceKey])) return;
    dimension.spawnItem(new ItemStack(entry.loot, randomInt(entry.min, entry.max)), location);
}

function handleMobDrops(event, config) {
    if (!config.enableAdditionalMobDrops) return;

    const killer = event.damageSource?.damagingEntity;
    if (!isPlayer(killer)) return;

    const weapon = getHandItem(killer);
    if (!weapon || !WEAPON_TAGS.some(tag => weapon.hasTag(tag))) return;

    const dead = event.deadEntity;
    const families = new Set(materialTagsOf(weapon).flatMap(tag => MOB_FAMILIES_BY_MATERIAL[tag]));

    for (const family of families) {
        if (!hasFamily(dead, family)) continue;
        spawnLoot(dead.dimension, dead.location, MOB_LOOT[family], config);
    }
}

function handleOreDrops(event, config) {
    if (!config.enableAdditionalOreDrops) return;

    const pickaxe = getHandItem(event.player);
    if (!pickaxe || !pickaxe.hasTag("minecraft:is_pickaxe")) return;

    const blockId = event.brokenBlockPermutation.type.id;
    const matches = materialTagsOf(pickaxe).some(tag => ORE_BLOCKS_BY_MATERIAL[tag].includes(blockId));
    if (!matches) return;

    spawnLoot(event.player.dimension, event.block.location, ORE_LOOT[blockId], config);
}

function isMature(permutation, crop) {
    const age = permutation.getState("growth") ?? permutation.getState("age");
    return age !== undefined && age >= crop.maxAge;
}

function handleCropDrops(event, config) {
    if (!config.enableAdditionalCropDrops) return;

    const crop = CROP_DROPS[event.brokenBlockPermutation.type.id];
    if (!crop || !isMature(event.brokenBlockPermutation, crop)) return;

    const hoe = getHandItem(event.player);
    if (!hoe || !hoe.hasTag("minecraft:is_hoe")) return;
    if (materialTagsOf(hoe).length === 0) return;

    spawnLoot(event.player.dimension, event.block.location, crop, config);
}

export const DropsSystem = {
    name: "DropsSystem",

    onInit() {
        world.afterEvents.entityDie.subscribe(event => {
            handleMobDrops(event, Config.get());
        });

        world.afterEvents.playerBreakBlock.subscribe(event => {
            const config = Config.get();
            handleOreDrops(event, config);
            handleCropDrops(event, config);
        });
    },
};
