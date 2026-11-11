import { EquipmentSlot, GameMode, HudElement, HudVisibility, system, world, type ItemStack, type Player } from "@minecraft/server";
import { ArmorBarState, encodePayload, healthRows, slotInfoFor, type SlotInfo } from "../core/armorBar.js";
import { getEquippable } from "../platform/items.js";
import type { Feature } from "./configStore.js";

const ARMOR_BAR_COMPONENT = "lsan:armor_bar";
const REFRESH_TICKS = 4;
const RESPAWN_DELAY_TICKS = 20;
const DIMENSION_RESEND_TICKS = [20, 60] as const;
const SLOTS = [EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet] as const;
const HIDDEN_GAME_MODES = new Set<GameMode>([GameMode.Creative, GameMode.Spectator]);
const TITLE_TIMES = { fadeInDuration: 0, stayDuration: 0, fadeOutDuration: 0 };

type ArmorBarParams = { texture?: string; armor_protection?: number };

const state = new ArmorBarState();

function customParams(item: ItemStack): ArmorBarParams | undefined {
    if (!item.hasComponent(ARMOR_BAR_COMPONENT)) return undefined;
    const component = item.getComponent(ARMOR_BAR_COMPONENT) as
        | { customComponentParameters?: { params?: unknown } }
        | undefined;
    const ccp = component?.customComponentParameters;
    return (ccp?.params ?? ccp) as ArmorBarParams | undefined;
}

function updateArmorBar(player: Player, force = false): void {
    if (HIDDEN_GAME_MODES.has(player.getGameMode())) {
        state.forget(player.id);
        return;
    }
    const equippable = getEquippable(player);
    if (!equippable) return;
    const slots: SlotInfo[] = SLOTS.map((slot, i) => {
        const item = equippable.getEquipment(slot);
        return slotInfoFor(item?.typeId, i as 0 | 1 | 2 | 3, item ? customParams(item) : undefined);
    });
    const health = player.getComponent("minecraft:health");
    const rows = health ? healthRows(health.effectiveMax, player.getEffect("absorption")?.amplifier) : 0;
    const { text, unsupported } = encodePayload(slots, rows);
    if (force) state.forget(player.id);
    if (!state.shouldSend(player.id, text)) return;
    player.onScreenDisplay.setHudVisibility(unsupported ? HudVisibility.Reset : HudVisibility.Hide, [HudElement.Armor]);
    player.onScreenDisplay.setTitle(text, TITLE_TIMES);
}

export const armorBar: Feature = {
    name: "armorBar",
    init({ scheduler }) {
        system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
            try {
                itemComponentRegistry.registerCustomComponent(ARMOR_BAR_COMPONENT, {});
            } catch (error) {
                console.warn(`[lsan:armorBar] Failed to register ${ARMOR_BAR_COMPONENT}:`, error);
            }
        });
        scheduler.every(REFRESH_TICKS, function updateArmorBars(player: Player) {
            updateArmorBar(player);
        });
        world.afterEvents.playerSpawn.subscribe(({ player }) => {
            system.runTimeout(() => {
                if (player.isValid) updateArmorBar(player, true);
            }, RESPAWN_DELAY_TICKS);
        });
        // The client drops the HUD title during the dimension loading screen, and the payload cache
        // would otherwise suppress the resend. Retry once more in case loading takes longer.
        world.afterEvents.playerDimensionChange.subscribe(({ player }) => {
            for (const delay of DIMENSION_RESEND_TICKS) {
                system.runTimeout(() => {
                    if (player.isValid) updateArmorBar(player, true);
                }, delay);
            }
        });
        world.afterEvents.playerGameModeChange.subscribe(({ player }) => {
            system.run(() => {
                if (player.isValid) updateArmorBar(player, true);
            });
        });
        world.afterEvents.playerLeave.subscribe(({ playerId }) => state.forget(playerId));
    },
};
