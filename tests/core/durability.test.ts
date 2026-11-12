import { describe, expect, it } from "vitest";
import { blockBreakWear, interactionWear, rollWear } from "../../BP/scripts/core/durability.js";

const seq = (...v: number[]) => ({ next: () => v.shift() ?? 0 });

describe("durability", () => {
    it("wears lsan tools by 1 and weapons by 2 on block break", () => {
        expect(blockBreakWear("lsan:netherite_iron_pickaxe", new Set(["minecraft:is_pickaxe"]))).toBe(1);
        expect(blockBreakWear("lsan:netherite_iron_sword", new Set(["minecraft:is_sword"]))).toBe(2);
        expect(blockBreakWear("lsan:netherite_spear", new Set(["minecraft:is_spear", "minecraft:is_sword"]))).toBe(2);
        expect(blockBreakWear("minecraft:netherite_pickaxe", new Set(["minecraft:is_pickaxe"]))).toBe(0);
        expect(blockBreakWear("lsan:netherite_iron_ingot", new Set())).toBe(0);
    });
    it("scripts axe and hoe interactions but leaves the shovel to the engine", () => {
        expect(interactionWear("lsan:netherite_gold_axe", new Set(["minecraft:is_axe"]))).toBe(1);
        expect(interactionWear("lsan:netherite_gold_hoe", new Set(["minecraft:is_hoe"]))).toBe(1);
        expect(interactionWear("lsan:netherite_gold_shovel", new Set(["minecraft:is_shovel"]))).toBe(0);
    });
    it("applies unbreaking once", () => {
        expect(rollWear(seq(0.99, 0.5), 100, 100, 0)).toBe(true);
        expect(rollWear(seq(0.99, 0.6), 100, 100, 1)).toBe(false);
        expect(rollWear(seq(0.99, 0.4), 100, 100, 1)).toBe(true);
    });
});
