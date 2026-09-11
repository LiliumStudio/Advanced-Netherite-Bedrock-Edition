import { world, system, EquipmentSlot } from "@minecraft/server";
import { getEquippable, getHandItem, isPlayer } from "../api/index.js";

const MOD_PREFIX = "lsan:";
const TOOL_TAGS = ["minecraft:is_pickaxe", "minecraft:is_axe", "minecraft:is_shovel", "minecraft:is_hoe"];
const WEAPON_TAGS = ["minecraft:is_sword", "minecraft:is_spear"];
const USE_ON_TAGS = ["minecraft:is_axe", "minecraft:is_hoe"];

function isModItem(item) {
    return item?.typeId.startsWith(MOD_PREFIX) ?? false;
}

function isModTool(item) {
    return isModItem(item) && TOOL_TAGS.some(tag => item.hasTag(tag));
}

function isModWeapon(item) {
    return isModItem(item) && WEAPON_TAGS.some(tag => item.hasTag(tag));
}

function isUseOnItem(item) {
    return USE_ON_TAGS.some(tag => item.hasTag(tag));
}

function unbreakingLevel(item) {
    const enchantable = item.getComponent("minecraft:enchantable");
    if (!enchantable) return 0;
    for (const enchantment of enchantable.getEnchantments()) {
        if (enchantment.type.id === "unbreaking") return enchantment.level;
    }
    return 0;
}

function damageHandItem(player, expectedTypeId, amount) {
    system.run(() => {
        try {
            const equippable = getEquippable(player);
            const item = equippable?.getEquipment(EquipmentSlot.Mainhand);
            if (!item || item.typeId !== expectedTypeId) return;

            const durability = item.getComponent("minecraft:durability");
            if (!durability) return;

            const unbreaking = unbreakingLevel(item);
            if (unbreaking > 0 && Math.random() >= 1 / (unbreaking + 1)) return;

            if (durability.damage + amount < durability.maxDurability) {
                durability.damage += amount;
                equippable.setEquipment(EquipmentSlot.Mainhand, item);
                return;
            }

            equippable.setEquipment(EquipmentSlot.Mainhand, undefined);
            player.playSound("random.break");
        } catch (error) {
            console.warn("[lsan:DurabilitySystem] Error applying durability:", error);
        }
    });
}

export const DurabilitySystem = {
    name: "DurabilitySystem",

    onInit() {
        world.afterEvents.playerBreakBlock.subscribe(event => {
            const item = getHandItem(event.player);
            if (!item || !isModItem(item) || isUseOnItem(item)) return;
            if (!isModTool(item) && !isModWeapon(item)) return;

            damageHandItem(event.player, item.typeId, isModWeapon(item) ? 2 : 1);
        });

        world.afterEvents.itemUse.subscribe(event => {
            const { source: player, itemStack } = event;
            if (!isPlayer(player) || !isModItem(itemStack) || !isUseOnItem(itemStack)) return;

            damageHandItem(player, itemStack.typeId, 1);
        });

        world.afterEvents.entityHitEntity.subscribe(event => {
            const player = event.damagingEntity;
            if (!isPlayer(player)) return;

            const item = getHandItem(player);
            if (!item || !isModItem(item)) return;
            if (!isModWeapon(item) && !isModTool(item)) return;

            damageHandItem(player, item.typeId, isModWeapon(item) ? 1 : 2);
        });
    },
};
