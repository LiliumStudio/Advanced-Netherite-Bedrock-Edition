import { world, system } from "@minecraft/server";
import { Config, getContainer, subscribeIfAvailable } from "../api/index.js";

const MOD_PREFIX = "lsan:";
const SCAN_TICKS = 100;
const MOD_LABEL = "§r§o§9Advanced Netherite";

const PACIFY_PHANTOMS = "§a+ §7Pacifies Phantoms when worn";
const PACIFY_PIGLINS = "§a+ §6Pacifies Piglins when worn";
const PACIFY_ENDERMEN = "§a+ Pacifies Endermen when worn";
const DROP_MEMBRANE = "§a+ §7Phantom Membrane on phantom kill";
const DROP_GOLD_INGOT = "§a+ §6Gold Ingot on piglin kill";
const DROP_GOLD_NUGGETS = "§a+ §6Gold Nuggets on zombified piglin kill";
const DROP_ENDER_PEARL = "§a+ Ender Pearl on enderman kill";
const EXTRA_CROPS = "§a+ Extra crops from harvesting";

const ARMOR_LORE = {
    "lsan:iron": [PACIFY_PHANTOMS],
    "lsan:gold": [PACIFY_PIGLINS],
    "lsan:emerald": [PACIFY_ENDERMEN],
    "lsan:diamond": [PACIFY_PHANTOMS, PACIFY_PIGLINS, PACIFY_ENDERMEN],
};

const WEAPON_LORE = {
    "lsan:iron": [DROP_MEMBRANE],
    "lsan:gold": [DROP_GOLD_INGOT, DROP_GOLD_NUGGETS],
    "lsan:emerald": [DROP_ENDER_PEARL],
    "lsan:diamond": [DROP_MEMBRANE, DROP_GOLD_INGOT, DROP_GOLD_NUGGETS, DROP_ENDER_PEARL],
};

const PICKAXE_LORE = {
    "lsan:iron": ["§a+ §7Raw iron from iron ore"],
    "lsan:gold": ["§a+ §6Raw gold from gold ore"],
    "lsan:emerald": ["§a+ Emerald from emerald ore"],
    "lsan:diamond": ["§a+ Diamond from diamond ore"],
};

const HOE_LORE = {
    "lsan:iron": [EXTRA_CROPS],
    "lsan:gold": [EXTRA_CROPS],
    "lsan:emerald": [EXTRA_CROPS],
    "lsan:diamond": [EXTRA_CROPS],
};

const LORE_TABLES = [
    { typeTag: "minecraft:is_armor", lore: ARMOR_LORE },
    { typeTag: "minecraft:is_sword", lore: WEAPON_LORE },
    { typeTag: "minecraft:is_spear", lore: WEAPON_LORE },
    { typeTag: "minecraft:is_pickaxe", lore: PICKAXE_LORE },
    { typeTag: "minecraft:is_hoe", lore: HOE_LORE },
];

const inventoryCache = new Map();

function isModItem(item) {
    return item?.typeId.startsWith(MOD_PREFIX) ?? false;
}

function buildLore(item) {
    for (const { typeTag, lore } of LORE_TABLES) {
        if (!item.hasTag(typeTag)) continue;
        for (const [materialTag, lines] of Object.entries(lore)) {
            if (item.hasTag(materialTag)) return [...lines, "", MOD_LABEL];
        }
    }
    return null;
}

function applyLore(container, slot, showTooltips) {
    const item = container.getItem(slot);
    if (!isModItem(item)) return;

    if (!showTooltips) {
        if (item.getLore().length === 0) return;
        item.setLore([]);
        container.setItem(slot, item);
        return;
    }

    const lore = buildLore(item);
    if (!lore) return;
    if (JSON.stringify(item.getLore()) === JSON.stringify(lore)) return;

    item.setLore(lore);
    container.setItem(slot, item);
}

function refreshInventory(player, showTooltips) {
    const container = getContainer(player);
    if (!container) return;
    for (let slot = 0; slot < container.size; slot++) {
        applyLore(container, slot, showTooltips);
    }
}

function inventorySignature(player, showTooltips) {
    const container = getContainer(player);
    if (!container) return "";

    let signature = showTooltips ? "on" : "off";
    for (let slot = 0; slot < container.size; slot++) {
        const item = container.getItem(slot);
        if (isModItem(item)) signature += `|${slot}:${item.typeId}`;
    }
    return signature;
}

export const LoreSystem = {
    name: "LoreSystem",

    onInit() {
        subscribeIfAvailable(world.afterEvents.playerEquipmentChange, event => {
            system.run(() => refreshInventory(event.player, Config.getKey("showTooltips")));
        });

        system.runInterval(() => {
            const showTooltips = Config.getKey("showTooltips");
            for (const player of world.getAllPlayers()) {
                const signature = inventorySignature(player, showTooltips);
                if (inventoryCache.get(player.id) === signature) continue;
                inventoryCache.set(player.id, signature);
                refreshInventory(player, showTooltips);
            }
        }, SCAN_TICKS);

        world.afterEvents.playerLeave.subscribe(event => {
            inventoryCache.delete(event.playerId);
        });
    },
};
