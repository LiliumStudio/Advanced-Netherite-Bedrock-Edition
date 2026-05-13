import { world, ItemStack } from "@minecraft/server";
import { WEAPON_DROP_RULES } from "../data/drops.js";
import { getHandItem, hasFamily, rollChance, randomInt } from "../core/Utils.js";
import { Config } from "../core/Config.js";

export const WeaponDropSystem = {
    name: "WeaponDropSystem",

    onInit() {
        world.afterEvents.entityDie.subscribe((event) => {
            const cfg = Config.get();
            if (!cfg.enableAdditionalMobDrops) return;

            const dead   = event.deadEntity;
            const killer = event.damageSource?.damagingEntity;
            if (!killer || killer.typeId !== "minecraft:player") return;

            const weapon = getHandItem(killer);
            if (!weapon) return;

            for (const rule of WEAPON_DROP_RULES) {
                if (!weapon.hasTag(rule.materialTag))   continue;
                if (!weapon.hasTag(rule.weaponTypeTag))  continue;

                if (!hasFamily(dead, rule.family))       continue;

                if (!rollChance(cfg[rule.chanceKey]))    continue;

                dead.dimension.spawnItem(
                    new ItemStack(rule.loot, randomInt(rule.min, rule.max)),
                    dead.location
                );
            }
        });
    },
};
