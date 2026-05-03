<<<<<<< HEAD
import { world, system, ItemStack } from "@minecraft/server";

const NETHERITE_REPLACEMENTS = {
    "minecraft:netherite_sword": "advancednetherite:netherite_sword",
    "minecraft:netherite_pickaxe": "advancednetherite:netherite_pickaxe",
    "minecraft:netherite_axe": "advancednetherite:netherite_axe",
    "minecraft:netherite_shovel": "advancednetherite:netherite_shovel",
    "minecraft:netherite_hoe": "advancednetherite:netherite_hoe"
};

function replaceNetheriteTools(player) {
    const container = player.getComponent("minecraft:inventory")?.container;
    if (!container) return;

    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) continue;

        const replacement = NETHERITE_REPLACEMENTS[item.typeId];
        if (!replacement) continue;

        const newItem = new ItemStack(replacement, 1);

        const oldEnchantable = item.getComponent("minecraft:enchantable");
        const newEnchantable = newItem.getComponent("minecraft:enchantable");
        if (oldEnchantable && newEnchantable) {
            for (const enchant of oldEnchantable.getEnchantments()) {
                try {
                    newEnchantable.addEnchantment(enchant);
                } catch { }
            }
        }

        const oldDurability = item.getComponent("minecraft:durability");
        const newDurability = newItem.getComponent("minecraft:durability");
        if (oldDurability && newDurability) {
            newDurability.damage = oldDurability.damage;
        }

        container.setItem(i, newItem);
    }
}

export function registerNetheriteConverterSystem() {
    system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            replaceNetheriteTools(player);
        }
    }, 20);
=======
import { world, system, ItemStack } from "@minecraft/server";

const NETHERITE_REPLACEMENTS = {
    "minecraft:netherite_sword": "advancednetherite:netherite_sword",
    "minecraft:netherite_pickaxe": "advancednetherite:netherite_pickaxe",
    "minecraft:netherite_axe": "advancednetherite:netherite_axe",
    "minecraft:netherite_shovel": "advancednetherite:netherite_shovel",
    "minecraft:netherite_hoe": "advancednetherite:netherite_hoe"
};

function replaceNetheriteTools(player) {
    const container = player.getComponent("minecraft:inventory")?.container;
    if (!container) return;

    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) continue;

        const replacement = NETHERITE_REPLACEMENTS[item.typeId];
        if (!replacement) continue;

        const newItem = new ItemStack(replacement, 1);

        const oldEnchantable = item.getComponent("minecraft:enchantable");
        const newEnchantable = newItem.getComponent("minecraft:enchantable");
        if (oldEnchantable && newEnchantable) {
            const enchantments = oldEnchantable.getEnchantments();
            try {
                newEnchantable.addEnchantments(enchantments);
            } catch {
                for (const enchant of enchantments) {
                    try {
                        newEnchantable.addEnchantment(enchant);
                    } catch {
                        console.warn(`[AdvancedNetherite] Could not transfer enchantment '${enchant.type.id}' (level ${enchant.level}) to ${replacement}`);
                    }
                }
            }
        }

        const oldDurability = item.getComponent("minecraft:durability");
        const newDurability = newItem.getComponent("minecraft:durability");
        if (oldDurability && newDurability) {
            newDurability.damage = oldDurability.damage;
        }

        if (item.nameTag) {
            newItem.nameTag = item.nameTag;
        }

        container.setItem(i, newItem);
    }
}

export function registerNetheriteConverterSystem() {
    system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            replaceNetheriteTools(player);
        }
    }, 60);
>>>>>>> 97914f8 (Update: Spearsand lang)
}