import { describe, expect, it } from "vitest";
import { NETHERITE_REPLACEMENTS, planConversion, type ItemSnapshot } from "../../BP/scripts/core/conversion.js";

const snap = (typeId: string): ItemSnapshot => ({
    typeId,
    nameTag: "Excalibur",
    lore: ["a", "b"],
    damage: 100,
    enchantments: [{ id: "minecraft:sharpness", level: 5 }],
    dynamicProperties: { x: 1 },
});

describe("planConversion", () => {
    it("keeps metadata", () => {
        const input = snap("minecraft:netherite_sword");
        const out = planConversion(input);
        expect(out).toEqual({ ...input, typeId: "lsan:netherite_sword" });
        expect(input.typeId).toBe("minecraft:netherite_sword");
    });
    it("returns null without replacement", () => {
        expect(planConversion(snap("minecraft:diamond_sword"))).toBeNull();
    });
    it("has six replacements", () => {
        expect(Object.keys(NETHERITE_REPLACEMENTS)).toHaveLength(6);
    });
});
