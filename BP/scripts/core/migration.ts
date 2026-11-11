import {
    SCHEMA_VERSION,
    sanitizePlayer,
    sanitizeWorld,
    type PlayerConfig,
    type Stored,
    type WorldConfig,
} from "./config.js";

function parse(raw: string | undefined): unknown {
    if (raw === undefined) return undefined;
    try {
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}

function isRecord(x: unknown): x is Record<string, unknown> {
    return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isV2(x: unknown): x is { version: 2; values: unknown } {
    return isRecord(x) && x["version"] === SCHEMA_VERSION && isRecord(x["values"]);
}

/** True when `parsed` is a v2 envelope identical to `stored` (no extra/missing/changed keys). */
function sameAsStored(parsed: unknown, stored: Stored<object>): boolean {
    if (!isV2(parsed)) return false;
    if (Object.keys(parsed).length !== 2) return false;
    const values = parsed.values as Record<string, unknown>;
    const storedValues = stored.values as Record<string, unknown>;
    const keys = Object.keys(storedValues);
    if (Object.keys(values).length !== keys.length) return false;
    return keys.every(k => values[k] === storedValues[k]);
}

export function migrateWorld(raw: string | undefined): {
    stored: Stored<WorldConfig>;
    legacyPlayerDefaults: Partial<PlayerConfig>;
    changed: boolean;
} {
    const parsed = parse(raw);
    const v2 = isV2(parsed);
    const stored: Stored<WorldConfig> = {
        version: SCHEMA_VERSION,
        values: sanitizeWorld(v2 ? parsed.values : parsed),
    };
    const legacyPlayerDefaults: Partial<PlayerConfig> = {};
    if (!v2 && isRecord(parsed) && typeof parsed["showTooltips"] === "boolean") {
        legacyPlayerDefaults.showTooltips = parsed["showTooltips"];
    }
    return { stored, legacyPlayerDefaults, changed: !sameAsStored(parsed, stored) };
}

export function migratePlayer(
    raw: string | undefined,
    fallback: PlayerConfig,
): { stored: Stored<PlayerConfig>; changed: boolean } {
    const parsed = parse(raw);
    const stored: Stored<PlayerConfig> = {
        version: SCHEMA_VERSION,
        values: sanitizePlayer(isV2(parsed) ? parsed.values : parsed, fallback),
    };
    return { stored, changed: !sameAsStored(parsed, stored) };
}
