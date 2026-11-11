import { describe, expect, it } from "vitest";
import { DEFAULT_WORLD_CONFIG } from "../../BP/scripts/core/config.js";
import { buildLoreLines, loreSignature, perksFor } from "../../BP/scripts/core/lore.js";

const cfg = DEFAULT_WORLD_CONFIG;
const keys = (tags: string[], c = cfg, show = true) => perksFor(new Set(tags), c, show).map(p => p.key);

describe("perksFor", () => {
    it("diamond armor order", () => {
        expect(keys(["minecraft:is_armor", "lsan:diamond"])).toEqual([
            "tooltip.lsan:armor.enderman_passive",
            "tooltip.lsan:armor.piglin_passive",
            "tooltip.lsan:armor.phantom_passive",
        ]);
    });
    it("showTooltips false", () => {
        expect(keys(["minecraft:is_armor", "lsan:diamond"], cfg, false)).toEqual([]);
    });
    it("sword disabled", () => {
        expect(keys(["minecraft:is_sword", "lsan:gold"], { ...cfg, enableAdditionalMobDrops: false })).toEqual([]);
        expect(keys(["minecraft:is_sword", "lsan:gold"]).length).toBe(2);
    });
    it("spear beats sword; armor beats all", () => {
        expect(keys(["minecraft:is_spear", "minecraft:is_sword", "lsan:gold"])).toEqual([]);
        expect(keys(["minecraft:is_armor", "minecraft:is_sword", "lsan:iron"])).toEqual(["tooltip.lsan:armor.phantom_passive"]);
    });
    it("pickaxe and hoe", () => {
        expect(keys(["minecraft:is_pickaxe", "lsan:diamond"])).toEqual(["tooltip.lsan:pickaxe.additional_diamond_drop"]);
        expect(keys(["minecraft:is_hoe", "lsan:iron"])).toEqual(["tooltip.lsan:hoe.additional_crop_drops"]);
        expect(keys(["minecraft:is_hoe", "lsan:iron"], { ...cfg, enableAdditionalCropDrops: false })).toEqual([]);
    });
});

describe("loreSignature", () => {
    it("none and joined", () => {
        expect(loreSignature([])).toBe("v2:none");
        expect(loreSignature([{ key: "a", color: "", fallback: "" }, { key: "b", color: "", fallback: "" }])).toBe("v2:a|b");
    });
});

describe("buildLoreLines", () => {
    it("matches v1 text", () => {
        const perks = perksFor(new Set(["minecraft:is_pickaxe", "lsan:gold"]), cfg, true);
        const { translated, fallback } = buildLoreLines(perks);
        expect(translated).toEqual([
            { rawtext: [{ text: "§r§6" }, { translate: "tooltip.lsan:pickaxe.additional_gold_drop", with: ["§a§l+§r§6"] }] },
            "",
            "§r§o§9Advanced Netherite",
        ]);
        expect(fallback).toEqual(["§r§a+ §6Raw gold from gold ore", "", "§r§o§9Advanced Netherite"]);
    });
    it("empty perks give empty lore", () => {
        expect(buildLoreLines([])).toEqual({ translated: [], fallback: [] });
    });
});
