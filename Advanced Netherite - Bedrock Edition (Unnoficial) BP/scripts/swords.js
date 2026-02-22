import { world, ItemStack } from "@minecraft/server";
import { EntityUtils } from "./api/EntityUtils";
import HMath from "./api/HMath";

const SWORD_BONUSES = {
    "advancednetherite:iron": [
        { family: "phantom", loot: "minecraft:phantom_membrane", chance: 0.6, min: 1, max: 2 }
    ],
    "advancednetherite:gold": [
        { family: "piglin", loot: "minecraft:gold_ingot", chance: 0.5, min: 1, max: 2 },
        { family: "zombifiedpiglin", loot: "minecraft:gold_nugget", chance: 0.6, min: 1, max: 4 }
    ],
    "advancednetherite:emerald": [
        { family: "enderman", loot: "minecraft:ender_pearl", chance: 0.6, min: 1, max: 2 }
    ],
    "advancednetherite:diamond": [
        { family: "phantom", loot: "minecraft:phantom_membrane", chance: 0.6, min: 1, max: 2 },
        { family: "piglin", loot: "minecraft:gold_ingot", chance: 0.5, min: 1, max: 2 },
        { family: "zombifiedpiglin", loot: "minecraft:gold_nugget", chance: 0.6, min: 1, max: 4 },
        { family: "enderman", loot: "minecraft:ender_pearl", chance: 0.6, min: 1, max: 2 }
    ]
};

export function registerSwordSystem() {
    world.afterEvents.entityDie.subscribe((event) => {
        const dead = event.deadEntity;
        const killer = event.damageSource?.damagingEntity;

        if (!killer || killer.typeId !== "minecraft:player") return;

        const sword = EntityUtils.getHandItem(killer);
        if (!sword || sword.typeId === "minecraft:air") return;
        if (!sword.hasTag("minecraft:is_sword")) return;

        for (const [itemTag, drops] of Object.entries(SWORD_BONUSES)) {
            if (!sword.hasTag(itemTag)) continue;

            for (const drop of drops) {
                if (!EntityUtils.hasFamily(dead, drop.family)) continue;

                if (Math.random() < drop.chance) {
                    dead.dimension.spawnItem(
                        new ItemStack(drop.loot, HMath.getRandomInt(drop.min, drop.max)),
                        dead.location
                    );
                }
            }
            break;
        }
    });
}