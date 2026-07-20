import { world, system } from "@minecraft/server";
import { EventBus } from "./EventBus.js";

let _defaults = {};
let _key = "config";
let _config = {};

function _load() {
    try {
        const raw = world.getDynamicProperty(_key);
        if (typeof raw === "string") {
            _config = { ..._defaults, ...JSON.parse(raw) };
            return;
        }
    } catch (e) {
        console.warn("[lsan:Config] Error loading config, using defaults:", e);
    }
    _config = { ..._defaults };
}

function _save() {
    try {
        world.setDynamicProperty(_key, JSON.stringify(_config));
    } catch (e) {
        console.warn("[lsan:Config] Error saving config:", e);
    }
}

export const Config = {
    /**
     * Configura el gestor con los valores por defecto y la clave de persistencia.
     * Debe llamarse una vez antes de load().
     */
    init(defaults, key) {
        _defaults = { ...defaults };
        if (key) _key = key;
        _config = { ..._defaults };
    },

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
        _config = { ..._defaults };
        _save();
        EventBus.emit("config:changed", _config);
    },
};
