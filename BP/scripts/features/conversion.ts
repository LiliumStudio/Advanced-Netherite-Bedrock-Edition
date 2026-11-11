import { EquipmentSlot, world, type ItemStack, type Player } from "@minecraft/server";
import { NETHERITE_REPLACEMENTS, planConversion } from "../core/conversion.js";
import { applySnapshot, getContainer, getEquippable, snapshotItem } from "../platform/items.js";
import type { Feature } from "./configStore.js";

const OFFHAND_CHECK_TICKS = 40;

function converted(item: ItemStack | undefined): ItemStack | null {
    if (!item) return null;
    const plan = planConversion(snapshotItem(item));
    return plan ? applySnapshot(plan) : null;
}

function convertInventory(player: Player): void {
    const container = getContainer(player);
    if (!container) return;
    for (let slot = 0; slot < container.size; slot++) {
        const replacement = converted(container.getItem(slot));
        if (replacement) container.setItem(slot, replacement);
    }
}

export const conversion: Feature = {
    name: "conversion",
    init({ config, scheduler }) {
        world.afterEvents.playerInventoryItemChange.subscribe(
            ({ player }) => {
                if (!config.world().enableNetheriteConversion) return;
                try {
                    convertInventory(player);
                } catch (error) {
                    console.warn("[lsan:conversion] Error converting inventory:", error);
                }
            },
            { includeItems: Object.keys(NETHERITE_REPLACEMENTS) },
        );
        scheduler.every(OFFHAND_CHECK_TICKS, function convertOffhand(player: Player) {
            if (!config.world().enableNetheriteConversion) return;
            const equippable = getEquippable(player);
            const replacement = converted(equippable?.getEquipment(EquipmentSlot.Offhand));
            if (replacement) equippable?.setEquipment(EquipmentSlot.Offhand, replacement);
        });
    },
};
