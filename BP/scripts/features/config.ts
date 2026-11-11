import { ItemStack, system, world, type Player } from "@minecraft/server";
import { getContainer } from "../platform/items.js";
import { openMainMenu } from "./configMenu.js";
import type { Feature } from "./configStore.js";
import { RECEIVED_CONFIG_ITEM } from "./migration.js";

const CONFIG_ITEM_ID = "lsan:config";
const WELCOME_DELAY_TICKS = 40;

function giveConfigItem(player: Player): void {
    const container = getContainer(player);
    if (!container) return;
    try {
        container.addItem(new ItemStack(CONFIG_ITEM_ID, 1));
        player.setDynamicProperty(RECEIVED_CONFIG_ITEM, true);
    } catch (error) {
        console.warn("[lsan:config] Could not give config item:", error);
    }
}

function sendWelcome(player: Player): void {
    system.runTimeout(() => {
        if (!player.isValid) return;
        player.playSound("random.levelup");
        player.sendMessage({ translate: "lsan.welcome.title" });
        player.sendMessage({ translate: "lsan.welcome.hint" });
    }, WELCOME_DELAY_TICKS);
}

export const config: Feature = {
    name: "config",
    init(ctx) {
        world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
            if (!initialSpawn) return;
            if (player.getDynamicProperty(RECEIVED_CONFIG_ITEM) === true) return;
            giveConfigItem(player);
            sendWelcome(player);
        });

        world.beforeEvents.itemUse.subscribe(event => {
            if (event.itemStack?.typeId !== CONFIG_ITEM_ID) return;
            event.cancel = true;
            const player = event.source;
            system.run(() => {
                openMainMenu(player, ctx.config).catch(error => {
                    console.warn("[lsan:config] Error opening config menu:", error);
                });
            });
        });
    },
};
