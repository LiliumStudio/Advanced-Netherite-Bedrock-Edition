import { describe, expect, it } from "vitest";
import { DEFAULT_WORLD_CONFIG } from "../../BP/scripts/core/config.js";
import { protectionsFor } from "../../BP/scripts/core/materials.js";
import { randomInt, rollChance } from "../../BP/scripts/core/random.js";
import { resolveCropDrop, resolveMobDrops, resolveOreDrop } from "../../BP/scripts/core/drops.js";

function seq(...values: number[]) {
    let i = 0;
    return { next: () => values[Math.min(i++, values.length - 1)]! };
}
const always = { next: () => 0 };
const cfg = DEFAULT_WORLD_CONFIG;

describe("random", () => {
    it("rollChance and randomInt", () => {
        expect(rollChance(seq(0.49), 0.5)).toBe(true);
        expect(rollChance(seq(0.5), 0.5)).toBe(false);
        expect(randomInt(seq(0.99), 0, 3)).toBe(3);
        expect(randomInt(seq(0), 1, 2)).toBe(1);
    });
});

describe("protectionsFor", () => {
    it("maps materials to protections", () => {
        expect([...protectionsFor(["lsan:iron"])]).toEqual(["lsan:phantom_immune"]);
        expect(protectionsFor(["lsan:diamond"]).size).toBe(3);
        expect(protectionsFor([]).size).toBe(0);
    });
});

describe("resolveMobDrops", () => {
    const sword = new Set(["minecraft:is_sword", "lsan:gold"]);
    it("rolls chance then amount", () => {
        expect(resolveMobDrops(sword, new Set(["zombie_pigman"]), cfg, seq(0, 0.99))).toEqual([
            { item: "minecraft:gold_nugget", amount: 3 },
        ]);
    });
    it("amount 0 gives no drop", () => {
        expect(resolveMobDrops(sword, new Set(["zombie_pigman"]), cfg, seq(0, 0))).toEqual([]);
    });
    it("spear gives nothing", () => {
        const spear = new Set(["minecraft:is_sword", "minecraft:is_spear", "lsan:gold"]);
        expect(resolveMobDrops(spear, new Set(["piglin"]), cfg, always)).toEqual([]);
    });
    it("respects disabled flag and failed chance", () => {
        expect(resolveMobDrops(sword, new Set(["piglin"]), { ...cfg, enableAdditionalMobDrops: false }, always)).toEqual([]);
        expect(resolveMobDrops(sword, new Set(["piglin"]), cfg, seq(0.99))).toEqual([]);
    });
    it("diamond iterates families in deterministic order", () => {
        const d = new Set(["minecraft:is_sword", "lsan:diamond"]);
        const fam = new Set(["enderman", "phantom", "piglin"]);
        // family order follows material table (phantom, piglin, enderman), not set order
        expect(resolveMobDrops(d, fam, cfg, seq(0, 0.99, 0, 0.99, 0, 0.99)).map(x => x.item)).toEqual([
            "minecraft:phantom_membrane",
            "minecraft:gold_ingot",
            "minecraft:ender_pearl",
        ]);
    });
    it("no duplicate families across materials", () => {
        const t = new Set(["minecraft:is_sword", "lsan:iron", "lsan:diamond"]);
        expect(resolveMobDrops(t, new Set(["phantom"]), cfg, seq(0, 0.99)).length).toBe(1);
    });
});

describe("resolveOreDrop", () => {
    const pick = new Set(["minecraft:is_pickaxe", "lsan:iron"]);
    it("drops raw iron", () => {
        expect(resolveOreDrop(pick, "minecraft:deepslate_iron_ore", false, cfg, always)?.item).toBe("minecraft:raw_iron");
    });
    it("silk touch, wrong ore, disabled", () => {
        expect(resolveOreDrop(pick, "minecraft:deepslate_iron_ore", true, cfg, always)).toBeNull();
        expect(resolveOreDrop(pick, "minecraft:gold_ore", false, cfg, always)).toBeNull();
        expect(resolveOreDrop(pick, "minecraft:iron_ore", false, { ...cfg, enableAdditionalOreDrops: false }, always)).toBeNull();
    });
    it("needs pickaxe", () => {
        expect(resolveOreDrop(new Set(["lsan:iron"]), "minecraft:iron_ore", false, cfg, always)).toBeNull();
    });
});

describe("resolveCropDrop", () => {
    const hoe = new Set(["minecraft:is_hoe", "lsan:emerald"]);
    it("requires mature growth", () => {
        expect(resolveCropDrop(hoe, "minecraft:wheat", 6, cfg, always)).toBeNull();
        expect(resolveCropDrop(hoe, "minecraft:wheat", undefined, cfg, always)).toBeNull();
        expect(resolveCropDrop(hoe, "minecraft:wheat", 7, cfg, seq(0, 0.99))?.item).toBe("minecraft:wheat");
    });
    it("needs hoe with material, and flag", () => {
        expect(resolveCropDrop(new Set(["minecraft:is_hoe"]), "minecraft:wheat", 7, cfg, always)).toBeNull();
        expect(resolveCropDrop(hoe, "minecraft:wheat", 7, { ...cfg, enableAdditionalCropDrops: false }, always)).toBeNull();
        expect(resolveCropDrop(hoe, "minecraft:grass", 7, cfg, always)).toBeNull();
    });
});
