import {
    SCHEMA_VERSION,
    sanitizePlayer,
    sanitizeWorld,
    type PlayerConfig,
    type LegacyDefaults,
    type Stored,
    type StoredWorld,
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

function isV2(x: unknown): x is { version: 2; values: unknown; legacy?: unknown } {
    return isRecord(x) && x["version"] === SCHEMA_VERSION && isRecord(x["values"]);
}

function sameAsStored(parsed: unknown, stored: Stored<object> & { legacy?: LegacyDefaults }): boolean {
    if (!isV2(parsed)) return false;
    const parsedLegacy = (parsed as Record<string, unknown>)["legacy"];
    if (Object.keys(parsed).length !== (stored.legacy ? 3 : 2)) return false;
    if (stored.legacy) {
        if (!isRecord(parsedLegacy)) return false;
        if (Object.keys(parsedLegacy).length !== Object.keys(stored.legacy).length) return false;
        if (parsedLegacy["showTooltips"] !== stored.legacy.showTooltips) return false;
    }
    const values = parsed.values as Record<string, unknown>;
    const storedValues = stored.values as Record<string, unknown>;
    const keys = Object.keys(storedValues);
    if (Object.keys(values).length !== keys.length) return false;
    return keys.every(k => values[k] === storedValues[k]);
}

function sanitizeLegacy(input: unknown): LegacyDefaults {
    const out: LegacyDefaults = {};
    if (isRecord(input) && typeof input["showTooltips"] === "boolean") out.showTooltips = input["showTooltips"];
    return out;
}

export function migrateWorld(raw: string | undefined): {
    stored: StoredWorld;
    legacyPlayerDefaults: Partial<PlayerConfig>;
    changed: boolean;
} {
    const parsed = parse(raw);
    const v2 = isV2(parsed);
    const legacyPlayerDefaults = sanitizeLegacy(v2 ? parsed["legacy"] : parsed);
    const stored: StoredWorld = {
        version: SCHEMA_VERSION,
        values: sanitizeWorld(v2 ? parsed.values : parsed),
    };
    if (Object.keys(legacyPlayerDefaults).length > 0) stored.legacy = { ...legacyPlayerDefaults };
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
