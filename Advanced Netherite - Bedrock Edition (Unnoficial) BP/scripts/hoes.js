import { world, ItemStack } from "@minecraft/server";
import { EntityUtils } from "./api/EntityUtils";
import HMath from "./api/HMath";

const CROP_CONFIG = {
    "minecraft:wheat": { loot: "minecraft:wheat", ageState: "growth", maxAge: 7 },
    "minecraft:carrots": { loot: "minecraft:carrot", ageState: "growth", maxAge: 7 },
    "minecraft:potatoes": { loot: "minecraft:potato", ageState: "growth", maxAge: 7 },
    "minecraft:beetroots": { loot: "minecraft:beetroot", ageState: "growth", maxAge: 3 }
};

const HOE_TAGS = [
    "advancednetherite:iron",
    "advancednetherite:gold",
    "advancednetherite:emerald",
    "advancednetherite:diamond"
];

const BONUS = { chance: 0.6, min: 1, max: 3 };

function isMature(permutation, config) {
    const age = permutation.getState(config.ageState) ?? permutation.getState("age");
    return age !== undefined && age >= config.maxAge;
}

export function registerHoeSystem() {
    world.afterEvents.playerBreakBlock.subscribe((event) => {
        const player = event.player;
        const blockId = event.brokenBlockPermutation.type.id;

        const crop = CROP_CONFIG[blockId];
        if (!crop || !isMature(event.brokenBlockPermutation, crop)) return;

        const hoe = EntityUtils.getHandItem(player);
        if (!hoe || hoe.typeId === "minecraft:air") return;
        if (!HOE_TAGS.some(tag => hoe.hasTag(tag))) return;
        if (!hoe.hasTag("minecraft:is_hoe")) return;

        if (Math.random() < BONUS.chance) {
            player.dimension.spawnItem(
                new ItemStack(crop.loot, HMath.getRandomInt(BONUS.min, BONUS.max)),
                event.block.location
            );
        }
    });
}