import { world, system } from "@minecraft/server";
import { getEquippable } from "../api/index.js";

// ─────────────────────────────────────────────────────────────
//  Datos de materiales
// ─────────────────────────────────────────────────────────────
export const MATERIALS = [
    {
        tag: "lsan:iron",
        protections: ["lsan:phantom_immune"],
        loreKey: "lsan.material.iron",
    },
    {
        tag: "lsan:gold",
        protections: ["lsan:piglin_immune"],
        loreKey: "lsan.material.gold",
    },
    {
        tag: "lsan:emerald",
        protections: ["lsan:enderman_immune"],
        loreKey: "lsan.material.emerald",
    },
    {
        tag: "lsan:diamond",
        protections: ["lsan:phantom_immune", "lsan:piglin_immune", "lsan:enderman_immune"],
        loreKey: "lsan.material.diamond",
    },
];

export const ALL_PROTECTION_TAGS = [...new Set(MATERIALS.flatMap(m => m.protections))];

export const ARMOR_SLOTS = ["Head", "Chest", "Legs", "Feet"];

// ─────────────────────────────────────────────────────────────
//  Sistema: protecciones por armadura
// ─────────────────────────────────────────────────────────────
const INTERVAL_TICKS = 20;

const _equipCache = new Map();

function _equipHash(player) {
    const equippable = getEquippable(player);
    if (!equippable) return "";
    return ARMOR_SLOTS
        .map(slot => equippable.getEquipment(slot)?.typeId ?? "")
        .join("|");
}

function _getActiveProtections(player) {
    const equippable = getEquippable(player);
    if (!equippable) return new Set();

    const pieces = ARMOR_SLOTS
        .map(slot => equippable.getEquipment(slot))
        .filter(Boolean);

    const active = new Set();
    for (const material of MATERIALS) {
        if (pieces.some(piece => piece.hasTag(material.tag))) {
            for (const tag of material.protections) active.add(tag);
        }
    }
    return active;
}

function _recalculate(player) {
    const hash = _equipHash(player);
    if (_equipCache.get(player.id) === hash) return;
    _equipCache.set(player.id, hash);

    const active = _getActiveProtections(player);
    for (const tag of ALL_PROTECTION_TAGS) {
        const has    = player.hasTag(tag);
        const should = active.has(tag);
        if (should && !has)  player.addTag(tag);
        else if (!should && has) player.removeTag(tag);
    }
}

export const ArmorSystem = {
    name: "ArmorSystem",

    onInit() {
        try {
            world.afterEvents.playerEquipmentChange.subscribe((event) => {
                system.run(() => _recalculate(event.player));
            });
        } catch {
            console.log("[lsan:ArmorSystem] playerEquipmentChange unavailable, using interval fallback.");
        }

        system.runInterval(() => {
            for (const player of world.getAllPlayers()) {
                _recalculate(player);
            }
        }, INTERVAL_TICKS);

        world.afterEvents.playerLeave.subscribe((event) => {
            _equipCache.delete(event.playerId);
        });
    },
};
