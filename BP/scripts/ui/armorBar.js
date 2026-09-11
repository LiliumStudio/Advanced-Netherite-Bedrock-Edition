import { world, system, EquipmentSlot, HudElement, HudVisibility, GameMode } from "@minecraft/server";
import { getEquippable } from "../api/index.js";
import { ARMOR_SLOTS } from "../modules/armor.js";

const PACK_ID = "LSAN-AN";
const ARMOR_BAR_COMPONENT = "lsan:armor_bar";
const REFRESH_TICKS = 2;
const RESPAWN_DELAY_TICKS = 20;
const PADDING = "^";
const TEXTURE_WIDTH = 50;
const VALUE_WIDTH = 2;
const UNSUPPORTED_SUFFIX = "gaktawu^0";
const DEFAULT_TEXTURE = "armor";

const HIDDEN_GAME_MODES = new Set([GameMode.Creative, GameMode.Spectator, "creative", "spectator"]);

const DEFAULT_PROTECTION = {
    [EquipmentSlot.Head]: 3,
    [EquipmentSlot.Chest]: 8,
    [EquipmentSlot.Legs]: 6,
    [EquipmentSlot.Feet]: 3,
};

const VANILLA_ARMOR = {
    "minecraft:leather_helmet": 1,
    "minecraft:leather_chestplate": 3,
    "minecraft:leather_leggings": 2,
    "minecraft:leather_boots": 1,

    "minecraft:chainmail_helmet": 2,
    "minecraft:chainmail_chestplate": 5,
    "minecraft:chainmail_leggings": 4,
    "minecraft:chainmail_boots": 1,

    "minecraft:iron_helmet": 2,
    "minecraft:iron_chestplate": 6,
    "minecraft:iron_leggings": 5,
    "minecraft:iron_boots": 2,

    "minecraft:golden_helmet": 2,
    "minecraft:golden_chestplate": 5,
    "minecraft:golden_leggings": 3,
    "minecraft:golden_boots": 1,

    "minecraft:diamond_helmet": 3,
    "minecraft:diamond_chestplate": 8,
    "minecraft:diamond_leggings": 6,
    "minecraft:diamond_boots": 3,

    "minecraft:netherite_helmet": 3,
    "minecraft:netherite_chestplate": 8,
    "minecraft:netherite_leggings": 6,
    "minecraft:netherite_boots": 3,

    "minecraft:copper_helmet": 2,
    "minecraft:copper_chestplate": 4,
    "minecraft:copper_leggings": 3,
    "minecraft:copper_boots": 1,

    "minecraft:elytra": 0,
    "minecraft:turtle_helmet": 2,
};

const payloadCache = new Map();
const titleTimesApplied = new Set();

function registerComponent() {
    system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
        try {
            itemComponentRegistry.registerCustomComponent(ARMOR_BAR_COMPONENT, {});
        } catch (error) {
            console.warn(`[lsan:ArmorBarSystem] Failed to register ${ARMOR_BAR_COMPONENT}:`, error);
        }
    });
}

function sanitize(texture) {
    return texture.replace(/[^a-zA-Z0-9_]/g, "");
}

function absorptionPoints(player) {
    const effect = player.getEffect("absorption");
    if (!effect) return 0;
    return effect.amplifier > 0 ? 16 : 4;
}

function healthRows(player) {
    const health = player.getComponent("minecraft:health");
    if (!health) return 0;
    return Math.ceil((health.effectiveMax + absorptionPoints(player)) / 20 - 1);
}

function readSlot(equippable, slot) {
    const item = equippable.getEquipment(slot);
    if (!item) return { texture: "", protection: 0 };

    if (item.hasComponent(ARMOR_BAR_COMPONENT)) {
        const component = item.getComponent(ARMOR_BAR_COMPONENT);
        const params = component.customComponentParameters?.params ?? component.customComponentParameters;
        if (params) return { texture: params.texture ?? "", protection: params.armor_protection ?? 0 };
    }

    if (item.typeId in VANILLA_ARMOR) {
        return { texture: DEFAULT_TEXTURE, protection: VANILLA_ARMOR[item.typeId] };
    }

    return { texture: DEFAULT_TEXTURE, protection: DEFAULT_PROTECTION[slot] ?? 0 };
}

function encodeSlot({ texture, protection }) {
    return sanitize(texture).padEnd(TEXTURE_WIDTH, PADDING) + String(protection).padStart(VALUE_WIDTH, PADDING);
}

function buildPayload(player) {
    const equippable = getEquippable(player);
    if (!equippable) return null;

    const slots = ARMOR_SLOTS.map(slot => encodeSlot(readSlot(equippable, slot)));
    const health = String(healthRows(player)).padStart(VALUE_WIDTH, PADDING);
    const unsupported = slots.some(slot => slot.endsWith(UNSUPPORTED_SUFFIX));

    return { text: slots.join("") + health, unsupported };
}

function applyHudVisibility(player, unsupported) {
    player.onScreenDisplay.setHudVisibility(
        unsupported ? HudVisibility.Reset : HudVisibility.Hide,
        [HudElement.Armor]
    );
}

function sendPayload(player, text) {
    if (!titleTimesApplied.has(player.id)) {
        player.runCommand("titleraw @s times 0 0 0");
        titleTimesApplied.add(player.id);
    }

    const rawtext = JSON.stringify({ rawtext: [{ text }] });
    player.runCommand(`titleraw @s title ${rawtext}`);
}

function updateArmorBar(player, force = false) {
    if (HIDDEN_GAME_MODES.has(player.getGameMode())) return;

    const payload = buildPayload(player);
    if (!payload) return;

    const encoded = `${PACK_ID}:${payload.text}${payload.unsupported ? "0" : "1"}`;
    if (!force && payloadCache.get(player.id) === encoded) return;
    payloadCache.set(player.id, encoded);

    applyHudVisibility(player, payload.unsupported);
    sendPayload(player, encoded);
}

export const ArmorBarSystem = {
    name: "ArmorBarSystem",

    onInit() {
        registerComponent();

        system.runInterval(() => {
            for (const player of world.getAllPlayers()) {
                try {
                    updateArmorBar(player);
                } catch (error) {
                    console.warn("[lsan:ArmorBarSystem] Error updating armor bar:", error);
                }
            }
        }, REFRESH_TICKS);

        world.afterEvents.playerSpawn.subscribe(event => {
            titleTimesApplied.delete(event.player.id);
            system.runTimeout(() => {
                if (event.player.isValid) updateArmorBar(event.player, true);
            }, RESPAWN_DELAY_TICKS);
        });

        world.afterEvents.playerLeave.subscribe(event => {
            payloadCache.delete(event.playerId);
            titleTimesApplied.delete(event.playerId);
        });
    },
};
