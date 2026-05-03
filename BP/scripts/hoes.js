import { world, ItemStack } from "@minecraft/server";
import { EntityUtils } from "./api/EntityUtils";
import HMath from "./api/HMath";
import { getConfig } from "./configManager.js";

const CROP_CONFIG = {
    "minecraft:wheat": { loot: "minecraft:wheat", ageState: "growth", maxAge: 7, chanceKey: "additionalWheatDropChance" },
    "minecraft:carrots": { loot: "minecraft:carrot", ageState: "growth", maxAge: 7, chanceKey: "additionalCarrotsDropChance" },
    "minecraft:potatoes": { loot: "minecraft:potato", ageState: "growth", maxAge: 7, chanceKey: "additionalPotatoesDropChance" },
    "minecraft:beetroots": { loot: "minecraft:beetroot", ageState: "growth", maxAge: 3, chanceKey: "additionalBeetrootsDropChance" }
};

const HOE_TAGS = [
    "advancednetherite:iron",
    "advancednetherite:gold",
    "advancednetherite:emerald",
    "advancednetherite:diamond"
];

const BONUS = { min: 1, max: 3 };

function isMature(permutation, config) {
    const age = permutation.getState(config.ageState) ?? permutation.getState("age");
    return age !== undefined && age >= config.maxAge;
}

export function registerHoeSystem() {
    world.afterEvents.playerBreakBlock.subscribe((event) => {
        const cfg = getConfig();
        if (!cfg.enableAdditionalCropDrops) return;

        const player = event.player;
        const blockId = event.brokenBlockPermutation.type.id;

        const crop = CROP_CONFIG[blockId];
        if (!crop || !isMature(event.brokenBlockPermutation, crop)) return;

        const hoe = EntityUtils.getHandItem(player);
        if (!hoe || hoe.typeId === "minecraft:air") return;
        if (!HOE_TAGS.some(tag => hoe.hasTag(tag))) return;
        if (!hoe.hasTag("minecraft:is_hoe")) return;

        if (Math.random() < cfg[crop.chanceKey]) {
            player.dimension.spawnItem(
                new ItemStack(crop.loot, HMath.getRandomInt(BONUS.min, BONUS.max)),
                event.block.location
            );
        }
    });
}