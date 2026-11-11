import { describe, expect, test } from "vitest";
import { DEFAULT_PLAYER_CONFIG, DEFAULT_WORLD_CONFIG, sanitizePlayer, sanitizeWorld } from "../../BP/scripts/core/config.js";

describe("config", () => {
    test("defaults match v1 plus netherite conversion", () => {
        expect(Object.keys(DEFAULT_WORLD_CONFIG).length).toBe(3 + 13 + 1);
        expect(DEFAULT_WORLD_CONFIG.additionalPiglinDropChance).toBe(0.15);
        expect(DEFAULT_WORLD_CONFIG.enableNetheriteConversion).toBe(true);
    });
    test("sanitizeWorld rejects bad types and ranges", () => {
        const r = sanitizeWorld({ additionalWheatDropChance: NaN, additionalCarrotsDropChance: -0.1, additionalPotatoesDropChance: "0.5", additionalBeetrootsDropChance: 1, enableAdditionalMobDrops: 1 });
        expect(r.additionalWheatDropChance).toBe(0.3);
        expect(r.additionalCarrotsDropChance).toBe(0.3);
        expect(r.additionalPotatoesDropChance).toBe(0.3);
        expect(r.additionalBeetrootsDropChance).toBe(1);
        expect(r.enableAdditionalMobDrops).toBe(true);
        expect(sanitizeWorld(null)).toEqual(DEFAULT_WORLD_CONFIG);
    });
    test("sanitizePlayer uses fallback", () => {
        expect(sanitizePlayer({ showTooltips: "x" }, { showTooltips: false }).showTooltips).toBe(false);
        expect(sanitizePlayer({ showTooltips: true }, { showTooltips: false }).showTooltips).toBe(true);
    });
});
