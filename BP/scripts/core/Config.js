import { world, system } from "@minecraft/server";
import { EventBus } from "./EventBus.js";
import { DEFAULT_CONFIG, CONFIG_KEY } from "../data/defaults.js";

let _config = { ...DEFAULT_CONFIG };

function _load() {
    try {
        const raw = world.getDynamicProperty(CONFIG_KEY);
        if (typeof raw === "string") {
            _config = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
            return;
        }
    } catch (e) {
        console.warn("[lsan:Config] Error loading config, using defaults:", e);
    }
    _config = { ...DEFAULT_CONFIG };
}

function _save() {
    try {
        world.setDynamicProperty(CONFIG_KEY, JSON.stringify(_config));
    } catch (e) {
        console.warn("[lsan:Config] Error saving config:", e);
    }
}

export const Config = {
    load() {
        system.run(() => {
            _load();
            EventBus.emit("config:loaded", _config);
            console.log("[lsan:Config] Loaded.");
        });
    },

    get() {
        return { ..._config };
    },

    getKey(key) {
        return _config[key];
    },

    set(updates) {
        _config = { ..._config, ...updates };
        _save();
        EventBus.emit("config:changed", _config);
    },

    reset() {
        _config = { ...DEFAULT_CONFIG };
        _save();
        EventBus.emit("config:changed", _config);
    },
};
