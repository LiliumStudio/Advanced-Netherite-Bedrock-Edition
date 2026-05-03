import { world, ItemStack } from "@minecraft/server";
import { EntityUtils } from "./api/EntityUtils";
import HMath from "./api/HMath";
import { getConfig } from "./configManager.js";

const SPEAR_BONUSES = {
    "advancednetherite:iron": [
        { family: "phantom", loot: "minecraft:phantom_membrane", chanceKey: "additionalPhantomDropChance", min: 1, max: 2 }
    ],
    "advancednetherite:gold": [
        { family: "piglin", loot: "minecraft:gold_ingot", chanceKey: "additionalPiglinDropChance", min: 1, max: 2 },
        { family: "zombifiedpiglin", loot: "minecraft:gold_nugget", chanceKey: "additionalZombifiedPiglinDropChance", min: 1, max: 4 }
    ],
    "advancednetherite:emerald": [
        { family: "enderman", loot: "minecraft:ender_pearl", chanceKey: "additionalEndermanDropChance", min: 1, max: 2 }
    ],
    "advancednetherite:diamond": [
        { family: "phantom", loot: "minecraft:phantom_membrane", chanceKey: "additionalPhantomDropChance", min: 1, max: 2 },
        { family: "piglin", loot: "minecraft:gold_ingot", chanceKey: "additionalPiglinDropChance", min: 1, max: 2 },
        { family: "zombifiedpiglin", loot: "minecraft:gold_nugget", chanceKey: "additionalZombifiedPiglinDropChance", min: 1, max: 4 },
        { family: "enderman", loot: "minecraft:ender_pearl", chanceKey: "additionalEndermanDropChance", min: 1, max: 2 }
    ]
};

export function registerSpearSystem() {
    world.afterEvents.entityDie.subscribe((event) => {
        const cfg = getConfig();
        if (!cfg.enableAdditionalMobDrops) return;

        const dead = event.deadEntity;
        const killer = event.damageSource?.damagingEntity;

        if (!killer || killer.typeId !== "minecraft:player") return;

        const spear = EntityUtils.getHandItem(killer);
        if (!spear || spear.typeId === "minecraft:air") return;
        if (!spear.hasTag("minecraft:is_spear")) return;

        for (const [itemTag, drops] of Object.entries(SPEAR_BONUSES)) {
            if (!spear.hasTag(itemTag)) continue;

            for (const drop of drops) {
                if (!EntityUtils.hasFamily(dead, drop.family)) continue;

                if (Math.random() < cfg[drop.chanceKey]) {
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