export const CONFIG_KEY = "lsan:config";
export const SCHEMA_VERSION = 2;

export type WorldConfig = {
    enableAdditionalCropDrops: boolean;
    enableAdditionalOreDrops: boolean;
    enableAdditionalMobDrops: boolean;
    enableNetheriteConversion: boolean;

    additionalWheatDropChance: number;
    additionalCarrotsDropChance: number;
    additionalPotatoesDropChance: number;
    additionalBeetrootsDropChance: number;

    additionalPhantomDropChance: number;
    additionalZombifiedPiglinDropChance: number;
    additionalPiglinDropChance: number;
    additionalEndermanDropChance: number;

    additionalRawIronDropChance: number;
    additionalRawGoldDropChance: number;
    additionalEmeraldDropChance: number;
    additionalDiamondDropChance: number;
    additionalGoldNuggetDropChance: number;
};

export type PlayerConfig = {
    showTooltips: boolean;
};

export type Stored<T> = { version: 2; values: T };

/** Legacy (v1 world-level) player defaults kept so they outlive the first session. */
export type LegacyDefaults = { showTooltips?: boolean };

export type StoredWorld = Stored<WorldConfig> & { legacy?: LegacyDefaults };

export const DEFAULT_WORLD_CONFIG: WorldConfig = {
    enableAdditionalCropDrops: true,
    enableAdditionalOreDrops: true,
    enableAdditionalMobDrops: true,
    enableNetheriteConversion: true,

    additionalWheatDropChance: 0.3,
    additionalCarrotsDropChance: 0.3,
    additionalPotatoesDropChance: 0.3,
    additionalBeetrootsDropChance: 0.2,

    additionalPhantomDropChance: 0.5,
    additionalZombifiedPiglinDropChance: 0.5,
    additionalPiglinDropChance: 0.15,
    additionalEndermanDropChance: 0.3,

    additionalRawIronDropChance: 0.2,
    additionalRawGoldDropChance: 0.3,
    additionalEmeraldDropChance: 0.4,
    additionalDiamondDropChance: 0.25,
    additionalGoldNuggetDropChance: 0.6,
};

export const DEFAULT_PLAYER_CONFIG: PlayerConfig = {
    showTooltips: true,
};

function asRecord(input: unknown): Record<string, unknown> {
    return typeof input === "object" && input !== null && !Array.isArray(input)
        ? (input as Record<string, unknown>)
        : {};
}

export function sanitizeWorld(input: unknown): WorldConfig {
    const src = asRecord(input);
    const out: Record<string, boolean | number> = {};
    for (const [key, def] of Object.entries(DEFAULT_WORLD_CONFIG)) {
        const v = src[key];
        if (typeof def === "boolean") {
            out[key] = typeof v === "boolean" ? v : def;
        } else {
            out[key] = typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1 ? v : def;
        }
    }
    return out as WorldConfig;
}

export function sanitizePlayer(input: unknown, fallback: PlayerConfig): PlayerConfig {
    const v = asRecord(input)["showTooltips"];
    return { showTooltips: typeof v === "boolean" ? v : fallback.showTooltips };
}
