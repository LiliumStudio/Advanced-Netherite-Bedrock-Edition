import { system, world } from "@minecraft/server";

const ARMOR_SLOTS = ["Head", "Chest", "Legs", "Feet"];

const ARMOR_PROTECTIONS = [
    { itemTag: "advancednetherite:iron", playerTag: "an:phantom_immune" },
    { itemTag: "advancednetherite:gold", playerTag: "an:piglin_immune" },
    { itemTag: "advancednetherite:emerald", playerTag: "an:enderman_immune" },
    { itemTag: "advancednetherite:diamond", playerTag: "an:phantom_immune" },
    { itemTag: "advancednetherite:diamond", playerTag: "an:piglin_immune" },
    { itemTag: "advancednetherite:diamond", playerTag: "an:enderman_immune" }
];

const UNIQUE_PLAYER_TAGS = [...new Set(ARMOR_PROTECTIONS.map(p => p.playerTag))];

function getActiveProtections(player) {
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) return new Set();

    const pieces = ARMOR_SLOTS
        .map(slot => equippable.getEquipment(slot))
        .filter(Boolean);

    const active = new Set();
    for (const { itemTag, playerTag } of ARMOR_PROTECTIONS) {
        if (pieces.some(piece => piece.hasTag(itemTag))) {
            active.add(playerTag);
        }
    }
    return active;
}

export function registerArmorSystem() {
    system.runInterval(() => {
        for (const player of world.getAllPlayers()) {
            const active = getActiveProtections(player);
            for (const playerTag of UNIQUE_PLAYER_TAGS) {
                const has = player.hasTag(playerTag);
                const should = active.has(playerTag);
                if (should && !has) player.addTag(playerTag);
                else if (!should && has) player.removeTag(playerTag);
            }
        }
    }, 10);
}
