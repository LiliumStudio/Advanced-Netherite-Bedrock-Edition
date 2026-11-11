import { describe, expect, test } from "vitest";
import { DEFAULT_PLAYER_CONFIG, DEFAULT_WORLD_CONFIG } from "../../BP/scripts/core/config.js";
import { migratePlayer, migrateWorld } from "../../BP/scripts/core/migration.js";

describe("migration", () => {
    test("migrateWorld from v1 flat object", () => {
        const r = migrateWorld(JSON.stringify({ enableAdditionalOreDrops: false, additionalDiamondDropChance: 0.5, showTooltips: false }));
        expect(r.stored.version).toBe(2);
        expect(r.stored.values.enableAdditionalOreDrops).toBe(false);
        expect(r.stored.values.additionalDiamondDropChance).toBe(0.5);
        expect(r.stored.values.enableNetheriteConversion).toBe(true);
        expect(r.legacyPlayerDefaults).toEqual({ showTooltips: false });
        expect(r.changed).toBe(true);
    });
    test("migrateWorld sanitizes invalid values", () => {
        const r = migrateWorld(JSON.stringify({ additionalWheatDropChance: 5, enableAdditionalCropDrops: "yes", additionalRawIronDropChance: 0.1 }));
        expect(r.stored.values.additionalWheatDropChance).toBe(0.3);
        expect(r.stored.values.enableAdditionalCropDrops).toBe(true);
        expect(r.stored.values.additionalRawIronDropChance).toBe(0.1);
        expect(migrateWorld("{not json").stored.values).toEqual(DEFAULT_WORLD_CONFIG);
        expect(migrateWorld(undefined).stored.values).toEqual(DEFAULT_WORLD_CONFIG);
    });
    test("migrations are idempotent", () => {
        const once = migrateWorld(JSON.stringify({ additionalPiglinDropChance: 0.9 }));
        const twice = migrateWorld(JSON.stringify(once.stored));
        expect(twice.stored).toEqual(once.stored);
        expect(twice.changed).toBe(false);
        const p = migratePlayer(JSON.stringify({ showTooltips: false }), DEFAULT_PLAYER_CONFIG);
        expect(migratePlayer(JSON.stringify(p.stored), DEFAULT_PLAYER_CONFIG).changed).toBe(false);
    });
    test("migratePlayer uses fallback when absent", () => {
        expect(migratePlayer(undefined, { showTooltips: false }).stored.values.showTooltips).toBe(false);
    });
    test("changed is true for invalid json, undefined and unsanitized v2", () => {
        expect(migrateWorld(undefined).changed).toBe(true);
        expect(migrateWorld("{bad").changed).toBe(true);
        expect(migrateWorld(JSON.stringify({ version: 2, values: { ...DEFAULT_WORLD_CONFIG, additionalWheatDropChance: 9 } })).changed).toBe(true);
        expect(migrateWorld(JSON.stringify({ version: 2, values: DEFAULT_WORLD_CONFIG })).changed).toBe(false);
    });
});
