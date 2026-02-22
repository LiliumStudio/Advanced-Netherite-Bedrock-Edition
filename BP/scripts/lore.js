import { world, system } from "@minecraft/server";

const MOD_LABEL = "§o§9Advanced Netherite";
const MOD_PREFIX = "advancednetherite:";

const LORE_BY_TYPE = {
    "minecraft:is_armor": {
        "advancednetherite:iron": ["§a+ §7Pacifies Phantoms"],
        "advancednetherite:gold": ["§a+ §6Pacifies Piglins"],
        "advancednetherite:emerald": ["§a+ Pacifies Endermen"],
        "advancednetherite:diamond": ["§a+ §7Pacifies Phantoms", "§a+ §6Pacifies Piglins", "§a+ Pacifies Endermen"]
    },
    "minecraft:is_sword": {
        "advancednetherite:iron": ["§a+ §7Phantom Membrane on phantom kill"],
        "advancednetherite:gold": ["§a+ §6Gold Ingot on piglin kill", "§a+ §6Gold Nuggets on zombified piglin kill"],
        "advancednetherite:emerald": ["§a+ Ender Pearl on enderman kill"],
        "advancednetherite:diamond": ["§a+ §7Phantom Membrane on phantom kill", "§a+ §6Gold Ingot on piglin kill", "§a+ §6Gold Nuggets on zombified piglin kill", "§a+ Ender Pearl on enderman kill"]
    },
    "minecraft:is_pickaxe": {
        "advancednetherite:iron": ["§a+ §7Extra Raw Iron from iron ore"],
        "advancednetherite:gold": ["§a+ §6Extra Raw Gold from gold ore"],
        "advancednetherite:emerald": ["§a+ Extra Emerald from emerald ore"],
        "advancednetherite:diamond": ["§a+ §bExtra Diamond from diamond ore"]
    },
    "minecraft:is_hoe": {
        "advancednetherite:iron": ["§a+ §fExtra crops on harvest"],
        "advancednetherite:gold": ["§a+ §fExtra crops on harvest"],
        "advancednetherite:emerald": ["§a+ §fExtra crops on harvest"],
        "advancednetherite:diamond": ["§a+ §fExtra crops on harvest"]
    }
};

const MATERIAL_TAGS = [
    "advancednetherite:iron",
    "advancednetherite:gold",
    "advancednetherite:emerald",
    "advancednetherite:diamond"
];

function buildLore(item) {
    if (!item || !item.typeId.startsWith(MOD_PREFIX)) return null;

    const material = MATERIAL_TAGS.find(tag => item.hasTag(tag));
    if (!material) return null;

    const typeEntry = Object.entries(LORE_BY_TYPE)
        .find(([typeTag]) => item.hasTag(typeTag));

    if (!typeEntry) return null;

    const abilityLines = typeEntry[1][material] ?? [];
    if (abilityLines.length === 0) return null;

    return [...abilityLines, "", MOD_LABEL];
}

function applyLore(item) {
    const newLore = buildLore(item);
    if (!newLore) return null;

    const currentLore = item.getLore();
    if (JSON.stringify(currentLore) === JSON.stringify(newLore)) return null;

    item.setLore(newLore);
    return item;
}

export function registerLoreSystem() {
    system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            const container = player.getComponent("minecraft:inventory")?.container;
            if (!container) continue;

            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (!item) continue;

                const updated = applyLore(item);
                if (updated) container.setItem(i, updated);
            }
        }
    }, 40);
}