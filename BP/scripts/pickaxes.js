import { world, ItemStack } from "@minecraft/server";
import { EntityUtils } from "./api/EntityUtils";
import HMath from "./api/HMath";

const PICKAXE_BONUSES = {
    "advancednetherite:iron": {
        "minecraft:iron_ore": { loot: "minecraft:raw_iron", chance: 0.5, min: 1, max: 2 },
        "minecraft:deepslate_iron_ore": { loot: "minecraft:raw_iron", chance: 0.5, min: 1, max: 2 }
    },
    "advancednetherite:gold": {
        "minecraft:gold_ore": { loot: "minecraft:raw_gold", chance: 0.5, min: 1, max: 2 },
        "minecraft:deepslate_gold_ore": { loot: "minecraft:raw_gold", chance: 0.5, min: 1, max: 2 },
        "minecraft:nether_gold_ore": { loot: "minecraft:raw_gold", chance: 0.5, min: 1, max: 2 }
    },
    "advancednetherite:emerald": {
        "minecraft:emerald_ore": { loot: "minecraft:emerald", chance: 0.5, min: 1, max: 2 },
        "minecraft:deepslate_emerald_ore": { loot: "minecraft:emerald", chance: 0.5, min: 1, max: 2 }
    },
    "advancednetherite:diamond": {
        "minecraft:diamond_ore": { loot: "minecraft:diamond", chance: 0.5, min: 1, max: 2 },
        "minecraft:deepslate_diamond_ore": { loot: "minecraft:diamond", chance: 0.5, min: 1, max: 2 }
    }
};

export function registerPickaxeSystem() {
    world.afterEvents.playerBreakBlock.subscribe((event) => {
        const player = event.player;
        const blockId = event.brokenBlockPermutation.type.id;

        const pickaxe = EntityUtils.getHandItem(player);
        if (!pickaxe || pickaxe.typeId === "minecraft:air") return;
        if (!pickaxe.hasTag("minecraft:is_pickaxe")) return;

        for (const [itemTag, blocks] of Object.entries(PICKAXE_BONUSES)) {
            if (!pickaxe.hasTag(itemTag)) continue;

            const bonus = blocks[blockId];
            if (!bonus) continue;

            if (Math.random() < bonus.chance) {
                player.dimension.spawnItem(
                    new ItemStack(bonus.loot, HMath.getRandomInt(bonus.min, bonus.max)),
                    event.block.location
                );
            }
            break;
        }
    });
}
