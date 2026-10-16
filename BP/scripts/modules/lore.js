import { world, system } from "@minecraft/server";
import { Config, EventBus, getContainer } from "../api/index.js";

const MOD_PREFIX = "lsan:";
const SCAN_TICKS = 100;
const LORE_PROPERTY = "lsan:lore";
const NO_LORE = "none";
const MOD_LABEL = "§r§o§9Advanced Netherite";
const MATERIAL_TAGS = ["lsan:iron", "lsan:gold", "lsan:emerald", "lsan:diamond"];

const WHITE = "§f";
const GRAY = "§7";
const GOLD = "§6";
const DARK_GREEN = "§2";
const AQUA = "§b";

function perk(key, color, fallback) {
    return { key: `tooltip.lsan:${key}`, color, fallback };
}

const PACIFY_PHANTOMS = perk("armor.phantom_passive", GRAY, "Pacifies Phantoms when worn");
const PACIFY_PIGLINS = perk("armor.piglin_passive", GOLD, "Pacifies Piglins when worn");
const PACIFY_ENDERMEN = perk("armor.enderman_passive", DARK_GREEN, "Pacifies Endermen when worn");
const DROP_MEMBRANE = perk("sword.additional_phantom_mob_drop", GRAY, "Phantom Membrane on phantom kill");
const DROP_GOLD_INGOT = perk("sword.additional_piglin_mob_drop", GOLD, "Gold Ingot on piglin kill");
const DROP_GOLD_NUGGETS = perk("sword.additional_zombified_piglin_mob_drop", GOLD, "Gold Nuggets on zombified piglin kill");
const DROP_ENDER_PEARL = perk("sword.additional_enderman_mob_drop", DARK_GREEN, "Ender Pearl on enderman kill");
const EXTRA_CROPS = perk("hoe.additional_crop_drops", WHITE, "Extra crops from harvesting");

const ARMOR_LORE = {
    "lsan:iron": [PACIFY_PHANTOMS],
    "lsan:gold": [PACIFY_PIGLINS],
    "lsan:emerald": [PACIFY_ENDERMEN],
    "lsan:diamond": [PACIFY_ENDERMEN, PACIFY_PIGLINS, PACIFY_PHANTOMS],
};

const WEAPON_LORE = {
    "lsan:iron": [DROP_MEMBRANE],
    "lsan:gold": [DROP_GOLD_INGOT, DROP_GOLD_NUGGETS],
    "lsan:emerald": [DROP_ENDER_PEARL],
    "lsan:diamond": [DROP_MEMBRANE, DROP_GOLD_INGOT, DROP_GOLD_NUGGETS, DROP_ENDER_PEARL],
};

const PICKAXE_LORE = {
    "lsan:iron": [perk("pickaxe.additional_iron_drop", GRAY, "Raw iron from iron ore")],
    "lsan:gold": [perk("pickaxe.additional_gold_drop", GOLD, "Raw gold from gold ore")],
    "lsan:emerald": [perk("pickaxe.additional_emerald_drop", DARK_GREEN, "Emerald from emerald ore")],
    "lsan:diamond": [perk("pickaxe.additional_diamond_drop", AQUA, "Diamond from diamond ore")],
};

const HOE_LORE = {
    "lsan:iron": [EXTRA_CROPS],
    "lsan:gold": [EXTRA_CROPS],
    "lsan:emerald": [EXTRA_CROPS],
    "lsan:diamond": [EXTRA_CROPS],
};

const LORE_TABLES = [
    { typeTag: "minecraft:is_armor", lore: ARMOR_LORE },
    { typeTag: "minecraft:is_spear", lore: {} },
    { typeTag: "minecraft:is_sword", lore: WEAPON_LORE, enabledKey: "enableAdditionalMobDrops" },
    { typeTag: "minecraft:is_pickaxe", lore: PICKAXE_LORE, enabledKey: "enableAdditionalOreDrops" },
    { typeTag: "minecraft:is_hoe", lore: HOE_LORE, enabledKey: "enableAdditionalCropDrops" },
];

function isModItem(item) {
    return item?.typeId.startsWith(MOD_PREFIX) ?? false;
}

function perksOf(item, config) {
    const table = LORE_TABLES.find(({ typeTag }) => item.hasTag(typeTag));
    if (!table || (table.enabledKey && !config[table.enabledKey])) return [];

    for (const [materialTag, perks] of Object.entries(table.lore)) {
        if (item.hasTag(materialTag)) return perks;
    }
    return [];
}

function translatedLine({ key, color }) {
    return { rawtext: [{ text: `§r${color}` }, { translate: key, with: [`§a§l+§r${color}`] }] };
}

function fallbackLine({ color, fallback }) {
    return `§r§a+ ${color}${fallback}`;
}

function writeLore(item, perks) {
    if (perks.length === 0) {
        item.setLore([]);
        return;
    }

    try {
        item.setLore([...perks.map(translatedLine), "", MOD_LABEL]);
    } catch {
        item.setLore([...perks.map(fallbackLine), "", MOD_LABEL]);
    }
}

function applyLore(container, slot, context) {
    const item = container.getItem(slot);
    if (!isModItem(item) || item.isStackable) return;

    const perks = context.showTooltips ? perksOf(item, context.config) : [];
    const signature = perks.length > 0 ? perks.map(({ key }) => key).join("|") : NO_LORE;
    if (item.getDynamicProperty(LORE_PROPERTY) === signature) return;

    writeLore(item, perks);
    item.setDynamicProperty(LORE_PROPERTY, signature);
    container.setItem(slot, item);
}

function refreshInventory(player) {
    const container = getContainer(player);
    if (!container) return;

    const context = { showTooltips: Config.getPlayer(player).showTooltips, config: Config.get() };
    for (let slot = 0; slot < container.size; slot++) {
        try {
            applyLore(container, slot, context);
        } catch (error) {
            console.warn("[lsan:LoreSystem] Error applying lore:", error);
        }
    }
}

function refreshAllPlayers() {
    for (const player of world.getAllPlayers()) refreshInventory(player);
}

export const LoreSystem = {
    name: "LoreSystem",

    onInit() {
        world.afterEvents.playerInventoryItemChange.subscribe(
            event => refreshInventory(event.player),
            { includeTags: MATERIAL_TAGS, ignoreQuantityChange: true }
        );

        EventBus.on("config:loaded", () => system.run(refreshAllPlayers));
        EventBus.on("config:changed", () => system.run(refreshAllPlayers));
        EventBus.on("config:player_changed", ({ player }) => {
            system.run(() => {
                if (player.isValid) refreshInventory(player);
            });
        });

        system.runInterval(refreshAllPlayers, SCAN_TICKS);
    },
};
