import { EquipmentSlot, world, type Player } from "@minecraft/server";
import { PROTECTION_TAGS, materialTagsOf, protectionsFor, type MaterialTag } from "../core/materials.js";
import { getEquippable, itemTags } from "../platform/items.js";
import type { Feature } from "./configStore.js";

const PERIOD_TICKS = 20;
const VERIFY_EVERY_PERIODS = 10;
const ARMOR_SLOTS = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet];

const signatures = new Map<string, string>();
const periodsSinceVerify = new Map<string, number>();

export const protections: Feature = {
    name: "protections",
    init({ scheduler }) {
        scheduler.every(PERIOD_TICKS, function syncProtections(player: Player) {
            const equippable = getEquippable(player);
            if (!equippable) return;
            const pieces = ARMOR_SLOTS.map(slot => equippable.getEquipment(slot) ?? null);
            const signature = pieces.map(p => p?.typeId ?? "").join("|");

            const count = (periodsSinceVerify.get(player.id) ?? 0) + 1;
            const verify = count >= VERIFY_EVERY_PERIODS;
            periodsSinceVerify.set(player.id, verify ? 0 : count);
            if (signatures.get(player.id) === signature && !verify) return;
            signatures.set(player.id, signature);

            const materials = new Set<MaterialTag>();
            for (const piece of pieces) {
                if (piece) for (const t of materialTagsOf(itemTags(piece))) materials.add(t);
            }
            const active = protectionsFor(materials);
            for (const tag of PROTECTION_TAGS) {
                const has = player.hasTag(tag);
                if (active.has(tag) && !has) player.addTag(tag);
                else if (!active.has(tag) && has) player.removeTag(tag);
            }
        });
        world.afterEvents.playerLeave.subscribe(({ playerId }) => {
            signatures.delete(playerId);
            periodsSinceVerify.delete(playerId);
        });
    },
};
