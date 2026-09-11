import { world, system, EquipmentSlot } from "@minecraft/server";
import { getEquippable, subscribeIfAvailable } from "../api/index.js";

export const ARMOR_SLOTS = [
    EquipmentSlot.Head,
    EquipmentSlot.Chest,
    EquipmentSlot.Legs,
    EquipmentSlot.Feet,
];

export const MATERIALS = [
    { tag: "lsan:iron", protections: ["lsan:phantom_immune"] },
    { tag: "lsan:gold", protections: ["lsan:piglin_immune"] },
    { tag: "lsan:emerald", protections: ["lsan:enderman_immune"] },
    {
        tag: "lsan:diamond",
        protections: ["lsan:phantom_immune", "lsan:piglin_immune", "lsan:enderman_immune"],
    },
];

export const PROTECTION_TAGS = [...new Set(MATERIALS.flatMap(material => material.protections))];

const REFRESH_TICKS = 20;

const equipmentCache = new Map();

function getArmorPieces(player) {
    const equippable = getEquippable(player);
    if (!equippable) return null;
    return ARMOR_SLOTS.map(slot => equippable.getEquipment(slot) ?? null);
}

function equipmentSignature(pieces) {
    return pieces.map(piece => piece?.typeId ?? "").join("|");
}

function activeProtections(pieces) {
    const active = new Set();
    for (const material of MATERIALS) {
        if (!pieces.some(piece => piece?.hasTag(material.tag))) continue;
        for (const tag of material.protections) active.add(tag);
    }
    return active;
}

function syncProtections(player) {
    const pieces = getArmorPieces(player);
    if (!pieces) return;

    const signature = equipmentSignature(pieces);
    if (equipmentCache.get(player.id) === signature) return;
    equipmentCache.set(player.id, signature);

    const active = activeProtections(pieces);
    for (const tag of PROTECTION_TAGS) {
        const hasTag = player.hasTag(tag);
        if (active.has(tag) && !hasTag) player.addTag(tag);
        else if (!active.has(tag) && hasTag) player.removeTag(tag);
    }
}

export const ArmorSystem = {
    name: "ArmorSystem",

    onInit() {
        subscribeIfAvailable(world.afterEvents.playerEquipmentChange, event => {
            system.run(() => syncProtections(event.player));
        });

        system.runInterval(() => {
            for (const player of world.getAllPlayers()) syncProtections(player);
        }, REFRESH_TICKS);

        world.afterEvents.playerLeave.subscribe(event => {
            equipmentCache.delete(event.playerId);
        });
    },
};
