import { world, system, EquipmentSlot } from "@minecraft/server";
import { getEnchantmentLevel, getEquippable, getHandItem, isPlayer, randomInt } from "../api/index.js";

const MOD_PREFIX = "lsan:";
const TOOL_TAGS = ["minecraft:is_pickaxe", "minecraft:is_axe", "minecraft:is_shovel", "minecraft:is_hoe"];
const WEAPON_TAGS = ["minecraft:is_sword", "minecraft:is_spear"];
const INTERACTION_TAGS = ["minecraft:is_axe", "minecraft:is_shovel", "minecraft:is_hoe"];

const pendingInteractions = new Map();

function isModItem(item) {
    return item?.typeId.startsWith(MOD_PREFIX) ?? false;
}

function isModTool(item) {
    return isModItem(item) && TOOL_TAGS.some(tag => item.hasTag(tag));
}

function isModWeapon(item) {
    return isModItem(item) && WEAPON_TAGS.some(tag => item.hasTag(tag));
}

function isInteractionTool(item) {
    return isModItem(item) && INTERACTION_TAGS.some(tag => item.hasTag(tag));
}

function locationKey({ x, y, z }) {
    return `${x},${y},${z}`;
}

function rollWear(durability, item) {
    const { min, max } = durability.getDamageChanceRange();
    const chance = randomInt(min, max) / (getEnchantmentLevel(item, "unbreaking") + 1);
    return Math.random() * 100 < chance;
}

function damageHandItem(player, expectedTypeId, amount) {
    system.run(() => {
        try {
            const equippable = getEquippable(player);
            const item = equippable?.getEquipment(EquipmentSlot.Mainhand);
            if (!item || item.typeId !== expectedTypeId) return;

            const durability = item.getComponent("minecraft:durability");
            if (!durability || durability.unbreakable) return;
            if (!rollWear(durability, item)) return;

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
            if (!isModTool(item) && !isModWeapon(item)) return;

            damageHandItem(event.player, item.typeId, isModWeapon(item) ? 2 : 1);
        });

        world.beforeEvents.playerInteractWithBlock.subscribe(event => {
            const item = event.itemStack;
            if (!item || !isInteractionTool(item)) return;

            pendingInteractions.set(event.player.id, {
                location: locationKey(event.block.location),
                blockTypeId: event.block.typeId,
                itemTypeId: item.typeId,
            });
        });

        world.afterEvents.playerInteractWithBlock.subscribe(event => {
            const pending = pendingInteractions.get(event.player.id);
            pendingInteractions.delete(event.player.id);
            if (!pending || pending.location !== locationKey(event.block.location)) return;
            if (event.block.typeId === pending.blockTypeId) return;

            damageHandItem(event.player, pending.itemTypeId, 1);
        });

        world.afterEvents.entityHitEntity.subscribe(event => {
            const player = event.damagingEntity;
            if (!isPlayer(player)) return;

            const item = getHandItem(player);
            if (!isModWeapon(item) && !isModTool(item)) return;

            damageHandItem(player, item.typeId, isModWeapon(item) ? 1 : 2);
        });

        world.afterEvents.playerLeave.subscribe(event => {
            pendingInteractions.delete(event.playerId);
        });
    },
};
