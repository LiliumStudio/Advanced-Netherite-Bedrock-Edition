import { system, world, type Container, type Player } from "@minecraft/server";
import { buildLoreLines, loreSignature, perksFor } from "../core/lore.js";
import { MATERIAL_TAGS } from "../core/materials.js";
import { getContainer, itemTags } from "../platform/items.js";
import type { ConfigStore, Feature } from "./configStore.js";

const MOD_PREFIX = "lsan:";
const LORE_PROPERTY = "lsan:lore";

function applyLore(container: Container, slot: number, store: ConfigStore, showTooltips: boolean): void {
    const item = container.getItem(slot);
    if (!item || !item.typeId.startsWith(MOD_PREFIX) || item.isStackable) return;
    const perks = perksFor(itemTags(item), store.world(), showTooltips);
    const signature = loreSignature(perks);
    if (item.getDynamicProperty(LORE_PROPERTY) === signature) return;
    const { translated, fallback } = buildLoreLines(perks);
    try {
        item.setLore(translated);
    } catch {
        item.setLore(fallback);
    }
    item.setDynamicProperty(LORE_PROPERTY, signature);
    container.setItem(slot, item);
}

function refreshInventory(player: Player, store: ConfigStore): void {
    if (!player.isValid) return;
    const container = getContainer(player);
    if (!container) return;
    const { showTooltips } = store.player(player);
    for (let slot = 0; slot < container.size; slot++) {
        try {
            applyLore(container, slot, store, showTooltips);
        } catch (error) {
            console.warn("[lsan:lore] Error applying lore:", error);
        }
    }
}

export const lore: Feature = {
    name: "lore",
    init({ config }) {
        world.afterEvents.playerInventoryItemChange.subscribe(
            ({ player }) => refreshInventory(player, config),
            { includeTags: [...MATERIAL_TAGS], ignoreQuantityChange: true },
        );
        config.onChange(scope => {
            system.run(() => {
                if (scope === "world") for (const p of world.getAllPlayers()) refreshInventory(p, config);
                else refreshInventory(scope, config);
            });
        });
        world.afterEvents.playerSpawn.subscribe(({ player }) => {
            system.run(() => refreshInventory(player, config));
        });
    },
};
