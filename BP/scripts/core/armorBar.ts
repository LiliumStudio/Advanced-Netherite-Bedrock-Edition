export const PACK_ID = "LSAN-AN";

export type SlotInfo = { texture: string; protection: number };

const PADDING = "^";
const TEXTURE_WIDTH = 50;
const VALUE_WIDTH = 2;
const UNSUPPORTED_SUFFIX = "gaktawu^0";
const DEFAULT_TEXTURE = "armor";

/** Fallback protection by slot index: Head, Chest, Legs, Feet. */
export const DEFAULT_PROTECTION: readonly number[] = [3, 8, 6, 3];

export const VANILLA_ARMOR: Readonly<Record<string, number>> = {
    "minecraft:leather_helmet": 1,
    "minecraft:leather_chestplate": 3,
    "minecraft:leather_leggings": 2,
    "minecraft:leather_boots": 1,

    "minecraft:chainmail_helmet": 2,
    "minecraft:chainmail_chestplate": 5,
    "minecraft:chainmail_leggings": 4,
    "minecraft:chainmail_boots": 1,

    "minecraft:iron_helmet": 2,
    "minecraft:iron_chestplate": 6,
    "minecraft:iron_leggings": 5,
    "minecraft:iron_boots": 2,

    "minecraft:golden_helmet": 2,
    "minecraft:golden_chestplate": 5,
    "minecraft:golden_leggings": 3,
    "minecraft:golden_boots": 1,

    "minecraft:diamond_helmet": 3,
    "minecraft:diamond_chestplate": 8,
    "minecraft:diamond_leggings": 6,
    "minecraft:diamond_boots": 3,

    "minecraft:netherite_helmet": 3,
    "minecraft:netherite_chestplate": 8,
    "minecraft:netherite_leggings": 6,
    "minecraft:netherite_boots": 3,

    "minecraft:copper_helmet": 2,
    "minecraft:copper_chestplate": 4,
    "minecraft:copper_leggings": 3,
    "minecraft:copper_boots": 1,

    "minecraft:elytra": 0,
    "minecraft:turtle_helmet": 2,

    "minecraft:carved_pumpkin": 0,
    "minecraft:skeleton_skull": 0,
    "minecraft:wither_skeleton_skull": 0,
    "minecraft:zombie_head": 0,
    "minecraft:player_head": 0,
    "minecraft:creeper_head": 0,
    "minecraft:dragon_head": 0,
    "minecraft:piglin_head": 0,
};

export function sanitize(texture: string): string {
    return texture.replace(/[^a-zA-Z0-9_]/g, "");
}

export function slotInfoFor(
    typeId: string | undefined,
    slotIndex: 0 | 1 | 2 | 3,
    custom?: { texture?: string; armor_protection?: number },
): SlotInfo {
    if (typeId === undefined) return { texture: "", protection: 0 };
    if (custom) return { texture: custom.texture ?? "", protection: custom.armor_protection ?? 0 };
    if (Object.hasOwn(VANILLA_ARMOR, typeId)) return { texture: DEFAULT_TEXTURE, protection: VANILLA_ARMOR[typeId]! };
    return { texture: DEFAULT_TEXTURE, protection: DEFAULT_PROTECTION[slotIndex] ?? 0 };
}

export function healthRows(effectiveMax: number, absorptionAmplifier: number | undefined): number {
    const absorption = absorptionAmplifier === undefined ? 0 : absorptionAmplifier > 0 ? 16 : 4;
    return Math.ceil((effectiveMax + absorption) / 20 - 1);
}

function encodeSlot({ texture, protection }: SlotInfo): string {
    return sanitize(texture).padEnd(TEXTURE_WIDTH, PADDING) + String(protection).padStart(VALUE_WIDTH, PADDING);
}

export function encodePayload(
    slots: readonly SlotInfo[],
    rows: number,
): { text: string; unsupported: boolean } {
    const encoded = slots.map(encodeSlot);
    const rowsText = String(rows).padStart(VALUE_WIDTH, PADDING);
    const unsupported = encoded.some(slot => slot.endsWith(UNSUPPORTED_SUFFIX));
    return { text: `${PACK_ID}:${encoded.join("")}${rowsText}${unsupported ? "0" : "1"}`, unsupported };
}

export class ArmorBarState {
    private readonly cache = new Map<string, string>();

    shouldSend(playerId: string, payload: string): boolean {
        if (this.cache.get(playerId) === payload) return false;
        this.cache.set(playerId, payload);
        return true;
    }

    forget(playerId: string): void {
        this.cache.delete(playerId);
    }
}
