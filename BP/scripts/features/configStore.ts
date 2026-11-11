import { world, type Player } from "@minecraft/server";
import {
    CONFIG_KEY,
    DEFAULT_PLAYER_CONFIG,
    DEFAULT_WORLD_CONFIG,
    SCHEMA_VERSION,
    sanitizePlayer,
    sanitizeWorld,
    type PlayerConfig,
    type Stored,
    type WorldConfig,
} from "../core/config.js";
import type { PlayerScheduler } from "../platform/scheduler.js";
import { readJson, writeJson } from "../platform/storage.js";

export type ConfigScope = "world" | Player;
type Listener = (scope: ConfigScope) => void;

function parseValues(raw: string | undefined): unknown {
    if (raw === undefined) return undefined;
    try {
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null && "values" in parsed) {
            return (parsed as { values: unknown }).values;
        }
        return parsed;
    } catch {
        return undefined;
    }
}

export class ConfigStore {
    private worldValues: WorldConfig = { ...DEFAULT_WORLD_CONFIG };
    private legacyPlayerDefaults: Partial<PlayerConfig> = {};
    private readonly listeners: Listener[] = [];

    /** Called by the migration feature once the world config has been read. */
    loadWorld(values: WorldConfig, legacyPlayerDefaults: Partial<PlayerConfig>): void {
        this.worldValues = { ...values };
        this.legacyPlayerDefaults = { ...legacyPlayerDefaults };
        this.emit("world");
    }

    /** DEFAULT_PLAYER_CONFIG with session-only legacy (v1 world-level) player defaults merged over it. */
    playerFallback(): PlayerConfig {
        return { ...DEFAULT_PLAYER_CONFIG, ...this.legacyPlayerDefaults };
    }

    world(): WorldConfig {
        return { ...this.worldValues };
    }

    player(p: Player): PlayerConfig {
        try {
            return sanitizePlayer(parseValues(readJson(p, CONFIG_KEY)), this.playerFallback());
        } catch (error) {
            console.warn("[lsan:config] Error loading player config, using defaults:", error);
            return this.playerFallback();
        }
    }

    setWorld(patch: Partial<WorldConfig>): void {
        this.worldValues = sanitizeWorld({ ...this.worldValues, ...patch });
        try {
            const stored: Stored<WorldConfig> = { version: SCHEMA_VERSION, values: this.worldValues };
            writeJson(world, CONFIG_KEY, stored);
        } catch (error) {
            console.warn("[lsan:config] Error saving config:", error);
        }
        this.emit("world");
    }

    resetWorld(): void {
        this.worldValues = { ...DEFAULT_WORLD_CONFIG };
        this.setWorld({});
    }

    setPlayer(p: Player, patch: Partial<PlayerConfig>): void {
        const values = sanitizePlayer({ ...this.player(p), ...patch }, this.playerFallback());
        try {
            const stored: Stored<PlayerConfig> = { version: SCHEMA_VERSION, values };
            writeJson(p, CONFIG_KEY, stored);
        } catch (error) {
            console.warn("[lsan:config] Error saving player config:", error);
        }
        this.emit(p);
    }

    onChange(cb: Listener): void {
        this.listeners.push(cb);
    }

    private emit(scope: ConfigScope): void {
        for (const cb of this.listeners) {
            try {
                cb(scope);
            } catch (error) {
                console.warn("[lsan:config] onChange listener error:", error);
            }
        }
    }
}

export type Context = { config: ConfigStore; scheduler: PlayerScheduler<Player> };

export interface Feature {
    name: string;
    init(ctx: Context): void;
}
