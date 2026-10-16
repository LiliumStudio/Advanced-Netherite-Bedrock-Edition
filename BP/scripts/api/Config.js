import { world, system } from "@minecraft/server";
import { EventBus } from "./EventBus.js";

let defaults = {};
let playerDefaults = {};
let storageKey = "config";
let values = {};

function parse(raw) {
    return typeof raw === "string" ? JSON.parse(raw) : null;
}

function read() {
    try {
        const stored = parse(world.getDynamicProperty(storageKey));
        if (stored) {
            values = { ...defaults, ...stored };
            return;
        }
    } catch (error) {
        console.warn("[lsan:Config] Error loading config, using defaults:", error);
    }
    values = { ...defaults };
}

function write() {
    try {
        world.setDynamicProperty(storageKey, JSON.stringify(values));
    } catch (error) {
        console.warn("[lsan:Config] Error saving config:", error);
    }
}

function playerBase() {
    const base = {};
    for (const [key, fallback] of Object.entries(playerDefaults)) {
        base[key] = key in values ? values[key] : fallback;
    }
    return base;
}

export const Config = {
    init(defaultValues, key, defaultPlayerValues = {}) {
        defaults = { ...defaultValues };
        playerDefaults = { ...defaultPlayerValues };
        if (key) storageKey = key;
        values = { ...defaults };
    },

    load() {
        system.run(() => {
            read();
            EventBus.emit("config:loaded", { ...values });
        });
    },

    get() {
        return { ...values };
    },

    getKey(key) {
        return values[key];
    },

    set(updates) {
        values = { ...values, ...updates };
        write();
        EventBus.emit("config:changed", { ...values });
    },

    reset() {
        values = { ...defaults };
        write();
        EventBus.emit("config:changed", { ...values });
    },

    getPlayer(player) {
        try {
            return { ...playerBase(), ...parse(player.getDynamicProperty(storageKey)) };
        } catch (error) {
            console.warn("[lsan:Config] Error loading player config, using defaults:", error);
            return playerBase();
        }
    },

    setPlayer(player, updates) {
        const playerValues = { ...Config.getPlayer(player), ...updates };
        try {
            player.setDynamicProperty(storageKey, JSON.stringify(playerValues));
        } catch (error) {
            console.warn("[lsan:Config] Error saving player config:", error);
        }
        EventBus.emit("config:player_changed", { player, values: { ...playerValues } });
    },
};
