import { world, system, EquipmentSlot, HudVisibility, HudElement, EntityTypes } from "@minecraft/server";


system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    try {
        itemComponentRegistry.registerCustomComponent("lsan:armor_bar", {});
    } catch (e) {
        console.warn("[lsan:ArmorBarSystem] Failed to register lsan:armor_bar component:", e);
    }
});

const PACK_ID = "LSAN-AN";

const VANILLA_ARMOR_DB = {
    'minecraft:leather_helmet': { texture: "armor", armor_protection: 1 },
    'minecraft:leather_chestplate': { texture: "armor", armor_protection: 3 },
    'minecraft:leather_leggings': { texture: "armor", armor_protection: 2 },
    'minecraft:leather_boots': { texture: "armor", armor_protection: 1 },

    'minecraft:chainmail_helmet': { texture: "armor", armor_protection: 2 },
    'minecraft:chainmail_chestplate': { texture: "armor", armor_protection: 5 },
    'minecraft:chainmail_leggings': { texture: "armor", armor_protection: 4 },
    'minecraft:chainmail_boots': { texture: "armor", armor_protection: 1 },

    'minecraft:iron_helmet': { texture: "armor", armor_protection: 2 },
    'minecraft:iron_chestplate': { texture: "armor", armor_protection: 6 },
    'minecraft:iron_leggings': { texture: "armor", armor_protection: 5 },
    'minecraft:iron_boots': { texture: "armor", armor_protection: 2 },

    'minecraft:golden_helmet': { texture: "armor", armor_protection: 2 },
    'minecraft:golden_chestplate': { texture: "armor", armor_protection: 5 },
    'minecraft:golden_leggings': { texture: "armor", armor_protection: 3 },
    'minecraft:golden_boots': { texture: "armor", armor_protection: 1 },

    'minecraft:diamond_helmet': { texture: "armor", armor_protection: 3 },
    'minecraft:diamond_chestplate': { texture: "armor", armor_protection: 8 },
    'minecraft:diamond_leggings': { texture: "armor", armor_protection: 6 },
    'minecraft:diamond_boots': { texture: "armor", armor_protection: 3 },

    'minecraft:netherite_helmet': { texture: "armor", armor_protection: 3 },
    'minecraft:netherite_chestplate': { texture: "armor", armor_protection: 8 },
    'minecraft:netherite_leggings': { texture: "armor", armor_protection: 6 },
    'minecraft:netherite_boots': { texture: "armor", armor_protection: 3 },

    'minecraft:elytra': { texture: "armor", armor_protection: 0 },
    'minecraft:turtle_helmet': { texture: "armor", armor_protection: 2 },

    'minecraft:copper_helmet': { texture: "armor", armor_protection: 2 },
    'minecraft:copper_chestplate': { texture: "armor", armor_protection: 4 },
    'minecraft:copper_leggings': { texture: "armor", armor_protection: 3 },
    'minecraft:copper_boots': { texture: "armor", armor_protection: 1 },
};
const ARMOR_SLOTS = [
    EquipmentSlot.Head,
    EquipmentSlot.Chest,
    EquipmentSlot.Legs,
    EquipmentSlot.Feet
];

const _playerCache = new Map();

function _playerHealth(player) {
    const health = player.getComponent("minecraft:health");
    if (!health) return 0;
    const effect = player.getEffect("absorption");

    let absorptionValue = 0;
    if (effect) {
        absorptionValue = effect.amplifier > 0 ? 16 : 4;
    }
    return Math.ceil((health.effectiveMax + absorptionValue) / 20 - 1) ?? 0;
}

function _updateArmorBar(player, forceUpdate = false) {
    const gamemode = player.getGameMode();
    if (gamemode === "creative" || gamemode === "spectator" || gamemode === "Creative" || gamemode === "Spectator") {
        return;
    }

    let DATA = {
        armor: {
            [EquipmentSlot.Head]: "",
            [EquipmentSlot.Chest]: "",
            [EquipmentSlot.Legs]: "",
            [EquipmentSlot.Feet]: ""
        },
        healthBar: "0"
    };

    const equippable = player.getComponent("equippable");
    if (!equippable) return;

    for (const slot of ARMOR_SLOTS) {
        const item = equippable.getEquipment(slot);
        if (!item) {
            DATA.armor[slot] = "".padEnd(52, "^");
            continue;
        }

        let armor = "";
        let armor_protection = "0";

        if (item.hasComponent("lsan:armor_bar")) {
            const comp = item.getComponent("lsan:armor_bar");
            const params = comp.customComponentParameters?.params || comp.customComponentParameters;
            if (params) {
                armor = params.texture || "";
                armor_protection = (params.armor_protection ?? 0).toString();
            }
        } else if (VANILLA_ARMOR_DB[item.typeId]) {
            armor = VANILLA_ARMOR_DB[item.typeId].texture;
            armor_protection = VANILLA_ARMOR_DB[item.typeId].armor_protection.toString();
        } else {
            armor = "armor";
            if (slot === EquipmentSlot.Head) armor_protection = "3";
            else if (slot === EquipmentSlot.Chest) armor_protection = "8";
            else if (slot === EquipmentSlot.Legs) armor_protection = "6";
            else if (slot === EquipmentSlot.Feet) armor_protection = "3";
        }

        DATA.armor[slot] = armor.padEnd(50, "^") + armor_protection.padStart(2, "^");
    }

    DATA.healthBar = _playerHealth(player).toString().padStart(2, "^");

    const resuld = `${DATA.armor[EquipmentSlot.Head]}${DATA.armor[EquipmentSlot.Chest]}${DATA.armor[EquipmentSlot.Legs]}${DATA.armor[EquipmentSlot.Feet]}${DATA.healthBar}`;

    const cacheKey = player.id;
    const oldRes = _playerCache.get(cacheKey);

    if (resuld !== oldRes || forceUpdate) {
        _playerCache.set(cacheKey, resuld);

        let error = false;
        for (const slot of ARMOR_SLOTS) {
            if (DATA.armor[slot].endsWith("gaktawu^0")) {
                error = true;
                break;
            }
        }

        let useArmorBar = "1";
        if (error) {
            player.onScreenDisplay.setHudVisibility(HudVisibility.Reset, [HudElement.Armor]);
            useArmorBar = "0";
        } else {
            player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [HudElement.Armor]);
            useArmorBar = "1";
        }

        const payload = `${resuld}${useArmorBar}`;
        const hasNetheriteUi = EntityTypes.get("lsan:netherite_ui") !== undefined;

        if (hasNetheriteUi) {
            player.runCommand(`scriptevent lsan_title:armor { "text": "${PACK_ID}:${payload}" }`);
        } else {
            player.runCommand(`titleraw @s title { "rawtext": [ { "text": "${PACK_ID}:${payload}" } ] }`);
        }
    }
}

export const ArmorBarSystem = {
    name: "ArmorBarSystem",

    onInit() {
        system.runInterval(() => {
            for (const player of world.getAllPlayers()) {
                try {
                    _updateArmorBar(player);
                } catch (e) {

                }
            }
        }, 1);

        world.afterEvents.playerSpawn.subscribe((event) => {
            const { player } = event;
            system.runTimeout(() => {
                if (player.isValid) {
                    _updateArmorBar(player, true);
                }
            }, 20);
        });

        world.afterEvents.playerLeave.subscribe((event) => {
            _playerCache.delete(event.playerId);
        });
    }
};
