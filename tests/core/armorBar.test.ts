import { describe, expect, it } from "vitest";
import {
    ArmorBarState,
    encodePayload,
    healthRows,
    slotInfoFor,
    VANILLA_ARMOR,
    type SlotInfo,
} from "../../BP/scripts/core/armorBar.js";

// v1 (1.4.0) formula, written inline on purpose.
const v1Slot = (texture: string, p: number) =>
    texture.replace(/[^a-zA-Z0-9_]/g, "").padEnd(50, "^") + String(p).padStart(2, "^");
const v1Payload = (slots: SlotInfo[], rows: number, unsupported: boolean) =>
    "LSAN-AN:" +
    slots.map(s => v1Slot(s.texture, s.protection)).join("") +
    String(rows).padStart(2, "^") +
    (unsupported ? "0" : "1");

describe("encodePayload", () => {
    it("matches v1 golden: no armor", () => {
        const slots = [0, 1, 2, 3].map(() => ({ texture: "", protection: 0 }));
        expect(encodePayload(slots, 0).text).toBe(v1Payload(slots, 0, false));
    });
    it("matches v1 golden: full vanilla netherite", () => {
        const ids = ["helmet", "chestplate", "leggings", "boots"].map(p => `minecraft:netherite_${p}`);
        const slots = ids.map((id, i) => slotInfoFor(id, i as 0 | 1 | 2 | 3));
        expect(slots.map(s => s.protection)).toEqual([3, 8, 6, 3]);
        expect(encodePayload(slots, 2).text).toBe(v1Payload(slots, 2, false));
    });
    it("matches v1 golden: custom piece", () => {
        const slots: SlotInfo[] = [
            slotInfoFor("lsan:x", 0, { texture: "netherite_iron", armor_protection: 3 }),
            slotInfoFor(undefined, 1),
            slotInfoFor("minecraft:iron_leggings", 2),
            slotInfoFor("modded:boots", 3),
        ];
        expect(slots[3]).toEqual({ texture: "armor", protection: 3 });
        expect(encodePayload(slots, 1).text).toBe(v1Payload(slots, 1, false));
    });
    it("sanitizes invalid characters", () => {
        const { text } = encodePayload([{ texture: "a-b c", protection: 1 }], 0);
        expect(text.startsWith("LSAN-AN:abc" + "^".repeat(47) + "^1")).toBe(true);
    });
    it("flags unsupported textures", () => {
        // v1 only detects the marker when the texture fills the 50-char field exactly.
        const slots = [{ texture: "a".repeat(43) + "gaktawu", protection: 0 }];
        const r = encodePayload(slots, 0);
        expect(r.unsupported).toBe(true);
        expect(r.text.endsWith("0")).toBe(true);
        expect(r.text).toBe(v1Payload(slots, 0, true));
    });
});

describe("slotInfoFor", () => {
    it("treats Object.prototype names as unknown ids (slot default, not NaN)", () => {
        expect(slotInfoFor("constructor", 1)).toEqual({ texture: "armor", protection: 8 });
        expect(slotInfoFor("toString", 0)).toEqual({ texture: "armor", protection: 3 });
    });
    it("handles undefined and vanilla map", () => {
        expect(slotInfoFor(undefined, 0)).toEqual({ texture: "", protection: 0 });
        expect(slotInfoFor("minecraft:elytra", 1)).toEqual({ texture: "armor", protection: 0 });
        expect(VANILLA_ARMOR["minecraft:turtle_helmet"]).toBe(2);
    });
});

describe("healthRows", () => {
    it("computes rows", () => {
        expect(healthRows(20, undefined)).toBe(0);
        expect(healthRows(40, 1)).toBe(2);
    });
});

describe("ArmorBarState", () => {
    it("forgets payload when hidden", () => {
        const s = new ArmorBarState();
        expect(s.shouldSend("p", "a")).toBe(true);
        expect(s.shouldSend("p", "a")).toBe(false);
        s.forget("p");
        expect(s.shouldSend("p", "a")).toBe(true);
    });
});
