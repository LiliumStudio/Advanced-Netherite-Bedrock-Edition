import { world, system } from "@minecraft/server";
import { EventBus } from "./EventBus.js";

let defaults = {};
let storageKey = "config";
let values = {};

function read() {
    try {
        const raw = world.getDynamicProperty(storageKey);
        if (typeof raw === "string") {
            values = { ...defaults, ...JSON.parse(raw) };
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

export const Config = {
    init(defaultValues, key) {
        defaults = { ...defaultValues };
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
};
