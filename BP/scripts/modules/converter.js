import { world, system, ItemStack } from "@minecraft/server";
import { getContainer } from "../api/index.js";

export const NETHERITE_REPLACEMENTS = {
    "minecraft:netherite_sword": "lsan:netherite_sword",
    "minecraft:netherite_spear": "lsan:netherite_spear",
    "minecraft:netherite_pickaxe": "lsan:netherite_pickaxe",
    "minecraft:netherite_axe": "lsan:netherite_axe",
    "minecraft:netherite_shovel": "lsan:netherite_shovel",
    "minecraft:netherite_hoe": "lsan:netherite_hoe",
};

const SCAN_TICKS = 40;

function transferEnchantments(source, target) {
    const from = source.getComponent("minecraft:enchantable");
    const to = target.getComponent("minecraft:enchantable");
    if (!from || !to) return;

    const enchantments = from.getEnchantments();
    if (enchantments.length === 0) return;

    try {
        to.addEnchantments(enchantments);
        return;
    } catch {
        for (const enchantment of enchantments) {
            try {
                to.addEnchantment(enchantment);
            } catch {
                console.warn(
                    `[lsan:ConverterSystem] Skipped incompatible enchantment '${enchantment.type.id}'` +
                    ` (level ${enchantment.level}) on ${target.typeId}`
                );
            }
        }
    }
}

function convert(item, replacementId) {
    const replacement = new ItemStack(replacementId, 1);

    transferEnchantments(item, replacement);

    const sourceDurability = item.getComponent("minecraft:durability");
    const targetDurability = replacement.getComponent("minecraft:durability");
    if (sourceDurability && targetDurability) targetDurability.damage = sourceDurability.damage;

    if (item.nameTag) replacement.nameTag = item.nameTag;

    return replacement;
}

function convertInventory(player) {
    const container = getContainer(player);
    if (!container) return;

    for (let slot = 0; slot < container.size; slot++) {
        const item = container.getItem(slot);
        if (!item) continue;

        const replacementId = NETHERITE_REPLACEMENTS[item.typeId];
        if (!replacementId) continue;

        container.setItem(slot, convert(item, replacementId));
    }
}

export const ConverterSystem = {
    name: "ConverterSystem",

    onInit() {
        system.runInterval(() => {
            for (const player of world.getAllPlayers()) convertInventory(player);
        }, SCAN_TICKS);
    },
};
