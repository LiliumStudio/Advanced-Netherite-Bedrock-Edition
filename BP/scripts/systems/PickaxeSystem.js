import { world, ItemStack } from "@minecraft/server";
import { PICKAXE_DROP_RULES } from "../data/drops.js";
import { getHandItem, rollChance, randomInt } from "../core/Utils.js";
import { Config } from "../core/Config.js";

export const PickaxeSystem = {
    name: "PickaxeSystem",

    onInit() {
        world.afterEvents.playerBreakBlock.subscribe((event) => {
            const cfg = Config.get();
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
        });
    },
};
