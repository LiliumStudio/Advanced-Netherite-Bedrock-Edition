import { world, system, ItemStack } from "@minecraft/server";
import { NETHERITE_REPLACEMENTS } from "../data/drops.js";

const INTERVAL_TICKS = 40;
const VANILLA_IDS = new Set(Object.keys(NETHERITE_REPLACEMENTS));

const _hadNetheriteCache = new Map();

function _hasVanillaNetherite(player) {
    const container = player.getComponent("minecraft:inventory")?.container;
    if (!container) return false;
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (item && VANILLA_IDS.has(item.typeId)) return true;
    }
    return false;
}

function _transferEnchantments(source, target) {
    const oldEnchantable = source.getComponent("minecraft:enchantable");
    const newEnchantable = target.getComponent("minecraft:enchantable");
    if (!oldEnchantable || !newEnchantable) return;

    const enchantments = oldEnchantable.getEnchantments();
    if (enchantments.length === 0) return;

    try {
        newEnchantable.addEnchantments(enchantments);
        return;
    } catch {
    }

    for (const enchant of enchantments) {
        try {
            newEnchantable.addEnchantment(enchant);
        } catch {
            console.warn(
                `[lsan:ConverterSystem] Skipped incompatible enchantment` +
                ` '${enchant.type.id}' (level ${enchant.level})` +
                ` on ${target.typeId}`
            );
        }
    }
}

function _replaceNetheriteTools(player) {
    const container = player.getComponent("minecraft:inventory")?.container;
    if (!container) return;

    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) continue;

        const replacementId = NETHERITE_REPLACEMENTS[item.typeId];
        if (!replacementId) continue;

        const newItem = new ItemStack(replacementId, 1);

        _transferEnchantments(item, newItem);

        const oldDurability = item.getComponent("minecraft:durability");
        const newDurability = newItem.getComponent("minecraft:durability");
        if (oldDurability && newDurability) {
            newDurability.damage = oldDurability.damage;
        }

        if (item.nameTag) newItem.nameTag = item.nameTag;

        container.setItem(i, newItem);
    }
}

export const ConverterSystem = {
    name: "ConverterSystem",

    onInit() {
        system.runInterval(() => {
            for (const player of world.getAllPlayers()) {
                const hasNow = _hasVanillaNetherite(player);
                if (!hasNow) {
                    _hadNetheriteCache.set(player.id, false);
                    continue;
                }
                _hadNetheriteCache.set(player.id, true);
                _replaceNetheriteTools(player);
            }
        }, INTERVAL_TICKS);

        world.afterEvents.playerLeave.subscribe((event) => {
            _hadNetheriteCache.delete(event.playerId);
        });
    },
};
