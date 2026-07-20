import { world, system } from "@minecraft/server";
import { Config } from "../api/index.js";

const MOD_PREFIX       = "lsan:";
const INTERVAL_TICKS   = 100;

const LORE_RULES = [

    { typeTag: "minecraft:is_armor", materialTag: "lsan:iron",
      loreLines: ["§a+ §7Pacifies Phantoms when worn"] },

    { typeTag: "minecraft:is_armor", materialTag: "lsan:gold",
      loreLines: ["§a+ §6Pacifies Piglins when worn"] },

    { typeTag: "minecraft:is_armor", materialTag: "lsan:emerald",
      loreLines: ["§a+ Pacifies Endermen when worn"] },

    { typeTag: "minecraft:is_armor", materialTag: "lsan:diamond",
      loreLines: [
          "§a+ §7Pacifies Phantoms when worn",
          "§a+ §6Pacifies Piglins when worn",
          "§a+ Pacifies Endermen when worn",
      ] },

    { typeTag: "minecraft:is_sword", materialTag: "lsan:iron",
      loreLines: ["§a+ §7Phantom Membrane on phantom kill"] },

    { typeTag: "minecraft:is_sword", materialTag: "lsan:gold",
      loreLines: [
          "§a+ §6Gold Ingot on piglin kill",
          "§a+ §6Gold Nuggets on zombified piglin kill",
      ] },

    { typeTag: "minecraft:is_sword", materialTag: "lsan:emerald",
      loreLines: ["§a+ Ender Pearl on enderman kill"] },

    { typeTag: "minecraft:is_sword", materialTag: "lsan:diamond",
      loreLines: [
          "§a+ §7Phantom Membrane on phantom kill",
          "§a+ §6Gold Ingot on piglin kill",
          "§a+ §6Gold Nuggets on zombified piglin kill",
          "§a+ Ender Pearl on enderman kill",
      ] },

    { typeTag: "minecraft:is_spear", materialTag: "lsan:iron",
      loreLines: ["§a+ §7Phantom Membrane on phantom kill"] },

    { typeTag: "minecraft:is_spear", materialTag: "lsan:gold",
      loreLines: [
          "§a+ §6Gold Ingot on piglin kill",
          "§a+ §6Gold Nuggets on zombified piglin kill",
      ] },

    { typeTag: "minecraft:is_spear", materialTag: "lsan:emerald",
      loreLines: ["§a+ Ender Pearl on enderman kill"] },

    { typeTag: "minecraft:is_spear", materialTag: "lsan:diamond",
      loreLines: [
          "§a+ §7Phantom Membrane on phantom kill",
          "§a+ §6Gold Ingot on piglin kill",
          "§a+ §6Gold Nuggets on zombified piglin kill",
          "§a+ Ender Pearl on enderman kill",
      ] },

    { typeTag: "minecraft:is_pickaxe", materialTag: "lsan:iron",
      loreLines: ["§a+ §7Raw iron from iron ore"] },

    { typeTag: "minecraft:is_pickaxe", materialTag: "lsan:gold",
      loreLines: ["§a+ §6Raw gold from gold ore"] },

    { typeTag: "minecraft:is_pickaxe", materialTag: "lsan:emerald",
      loreLines: ["§a+ Emerald from emerald ore"] },

    { typeTag: "minecraft:is_pickaxe", materialTag: "lsan:diamond",
      loreLines: ["§a+ Diamond from diamond ore"] },

    { typeTag: "minecraft:is_hoe", materialTag: "lsan:iron",
      loreLines: ["§a+ Extra crops from harvesting"] },

    { typeTag: "minecraft:is_hoe", materialTag: "lsan:gold",
      loreLines: ["§a+ Extra crops from harvesting"] },

    { typeTag: "minecraft:is_hoe", materialTag: "lsan:emerald",
      loreLines: ["§a+ Extra crops from harvesting"] },

    { typeTag: "minecraft:is_hoe", materialTag: "lsan:diamond",
      loreLines: ["§a+ Extra crops from harvesting"] },
];

const MOD_LABEL = "§r§o§9Advanced Netherite";

function _buildLore(item) {
    if (!item?.typeId.startsWith(MOD_PREFIX)) return null;

    for (const rule of LORE_RULES) {
        if (!item.hasTag(rule.typeTag))     continue;
        if (!item.hasTag(rule.materialTag)) continue;
        return [...rule.loreLines, "", MOD_LABEL];
    }
    return null;
}

function _processSlot(container, slot, showTooltips) {
    const item = container.getItem(slot);
    if (!item || !item.typeId.startsWith(MOD_PREFIX)) return false;

    if (showTooltips) {
        const newLore = _buildLore(item);
        if (!newLore) return false;
        const current = item.getLore();
        if (JSON.stringify(current) === JSON.stringify(newLore)) return false;
        item.setLore(newLore);
    } else {
        if (item.getLore().length === 0) return false;
        item.setLore([]);
    }
    container.setItem(slot, item);
    return true;
}

function _scanInventory(player) {
    const showTooltips = Config.getKey("showTooltips");
    const container = player.getComponent("minecraft:inventory")?.container;
    if (!container) return;
    for (let i = 0; i < container.size; i++) {
        _processSlot(container, i, showTooltips);
    }
}

const _invCache = new Map();

function _invHash(player) {
    const container = player.getComponent("minecraft:inventory")?.container;
    if (!container) return "";
    let h = "";
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (item?.typeId.startsWith(MOD_PREFIX)) h += `${i}:${item.typeId};`;
    }
    return h;
}

export const LoreSystem = {
    name: "LoreSystem",

    onInit() {
        try {
            world.afterEvents.playerEquipmentChange.subscribe((event) => {
                system.run(() => _scanInventory(event.player));
            });
        } catch {
        }

        system.runInterval(() => {
            const showTooltips = Config.getKey("showTooltips");
            for (const player of world.getAllPlayers()) {
                const hash = _invHash(player);
                const cached = _invCache.get(player.id);
                if (cached === hash && showTooltips === Config.getKey("showTooltips")) continue;
                _invCache.set(player.id, hash);
                _scanInventory(player);
            }
        }, INTERVAL_TICKS);

        world.afterEvents.playerLeave.subscribe((event) => {
            _invCache.delete(event.playerId);
        });
    },
};
