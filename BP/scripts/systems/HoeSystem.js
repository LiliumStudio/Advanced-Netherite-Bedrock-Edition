import { world, ItemStack } from "@minecraft/server";
import { CROP_DROP_RULES, HOE_MATERIAL_TAGS } from "../data/drops.js";
import { getHandItem, rollChance, randomInt } from "../core/Utils.js";
import { Config } from "../core/Config.js";

function _isMature(permutation, cropCfg) {
    const age = permutation.getState(cropCfg.ageState) ?? permutation.getState("age");
    return age !== undefined && age >= cropCfg.maxAge;
}

export const HoeSystem = {
    name: "HoeSystem",

    onInit() {
        world.afterEvents.playerBreakBlock.subscribe((event) => {
            const cfg = Config.get();
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
        });
    },
};
