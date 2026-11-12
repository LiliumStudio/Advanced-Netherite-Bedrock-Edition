import { EquipmentSlot, ItemComponentTypes, system, world, type Player, type Vector3 } from "@minecraft/server";
import { blockBreakWear, interactionWear, rollWear } from "../core/durability.js";
import type { Rng } from "../core/random.js";
import { enchantLevel, getEquippable, itemTags } from "../platform/items.js";
import type { Feature } from "./configStore.js";

type PendingInteraction = { key: string; blockTypeId: string; itemTypeId: string };

const rng: Rng = { next: Math.random };
const pending = new Map<string, PendingInteraction>();

function locationKey({ x, y, z }: Vector3): string {
    return `${x},${y},${z}`;
}

function damageMainhand(player: Player, expectedTypeId: string, amount: number): void {
    system.run(() => {
        if (!player.isValid) return;
        const equippable = getEquippable(player);
        const item = equippable?.getEquipment(EquipmentSlot.Mainhand);
        if (!equippable || !item || item.typeId !== expectedTypeId) return;
        const durability = item.getComponent(ItemComponentTypes.Durability);
        if (!durability || durability.unbreakable) return;
        const { min, max } = durability.getDamageChanceRange();
        if (!rollWear(rng, min, max, enchantLevel(item, "unbreaking"))) return;
        if (durability.damage + amount < durability.maxDurability) {
            durability.damage += amount;
            equippable.setEquipment(EquipmentSlot.Mainhand, item);
            return;
        }
        equippable.setEquipment(EquipmentSlot.Mainhand, undefined);
        player.playSound("random.break");
    });
}

export const durability: Feature = {
    name: "durability",
    init() {
        world.afterEvents.playerBreakBlock.subscribe(({ player, itemStackBeforeBreak }) => {
            if (!itemStackBeforeBreak) return;
            const wear = blockBreakWear(itemStackBeforeBreak.typeId, itemTags(itemStackBeforeBreak));
            if (wear > 0) damageMainhand(player, itemStackBeforeBreak.typeId, wear);
        });

        world.beforeEvents.playerInteractWithBlock.subscribe(({ player, block, itemStack, isFirstEvent }) => {
            if (!isFirstEvent || !itemStack) return;
            if (interactionWear(itemStack.typeId, itemTags(itemStack)) === 0) return;
            pending.set(player.id, {
                key: locationKey(block.location),
                blockTypeId: block.typeId,
                itemTypeId: itemStack.typeId,
            });
        });

        world.afterEvents.playerInteractWithBlock.subscribe(({ player, block }) => {
            const entry = pending.get(player.id);
            pending.delete(player.id);
            if (!entry || entry.key !== locationKey(block.location)) return;
            if (block.typeId === entry.blockTypeId) return;
            damageMainhand(player, entry.itemTypeId, 1);
        });

        world.afterEvents.playerLeave.subscribe(({ playerId }) => pending.delete(playerId));
    },
};
