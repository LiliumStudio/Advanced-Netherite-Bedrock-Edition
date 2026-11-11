import { world, type Player } from "@minecraft/server";
import {
    CONFIG_KEY,
    DEFAULT_PLAYER_CONFIG,
    DEFAULT_WORLD_CONFIG,
    SCHEMA_VERSION,
    sanitizePlayer,
    sanitizeWorld,
    type LegacyDefaults,
    type PlayerConfig,
    type Stored,
    type StoredWorld,
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
    private legacyPlayerDefaults: LegacyDefaults = {};
    private readonly playerCache = new Map<string, PlayerConfig>();
    private worldLoaded = false;
    private readonly listeners: Listener[] = [];

    /** Called by the migration feature once the world config has been read. */
    loadWorld(values: WorldConfig, legacyPlayerDefaults: Partial<PlayerConfig>): void {
        this.worldValues = { ...values };
        this.legacyPlayerDefaults = { ...legacyPlayerDefaults };
        this.worldLoaded = true;
        this.playerCache.clear();
        this.emit("world");
    }

    isWorldLoaded(): boolean {
        return this.worldLoaded;
    }

    /** Drops the cached config of a player (e.g. when they leave). */
    forgetPlayer(playerId: string): void {
        this.playerCache.delete(playerId);
    }

    /** DEFAULT_PLAYER_CONFIG with the persisted legacy (v1 world-level) player defaults merged over it. */
    playerFallback(): PlayerConfig {
        return { ...DEFAULT_PLAYER_CONFIG, ...this.legacyPlayerDefaults };
    }

    world(): WorldConfig {
        return { ...this.worldValues };
    }

    player(p: Player): PlayerConfig {
        const cached = this.playerCache.get(p.id);
        if (cached) return { ...cached };
        try {
            const config = sanitizePlayer(parseValues(readJson(p, CONFIG_KEY)), this.playerFallback());
            this.playerCache.set(p.id, config);
            return { ...config };
        } catch (error) {
            console.warn("[lsan:config] Error loading player config, using defaults:", error);
            return this.playerFallback();
        }
    }

    setWorld(patch: Partial<WorldConfig>): void {
        this.worldValues = sanitizeWorld({ ...this.worldValues, ...patch });
        try {
            const stored: StoredWorld = { version: SCHEMA_VERSION, values: this.worldValues };
            if (Object.keys(this.legacyPlayerDefaults).length > 0) stored.legacy = { ...this.legacyPlayerDefaults };
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
        this.playerCache.delete(p.id);
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
