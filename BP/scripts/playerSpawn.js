import { world, system, ItemStack } from "@minecraft/server";
import { openMainMenu } from "./configManager.js";

const CONFIG_ITEM = "advancednetherite:config";
const TAG_RECEIVED_ITEM = "an:received_config_item";

export function registerPlayerSpawnSystem() {
    world.afterEvents.playerSpawn.subscribe((event) => {
        const { player } = event;

        if (!event.initialSpawn) return;
        if (player.hasTag(TAG_RECEIVED_ITEM)) return;

        player.getComponent("minecraft:inventory").container.addItem(new ItemStack(CONFIG_ITEM, 1));
        player.addTag(TAG_RECEIVED_ITEM);

        system.runTimeout(() => {
            player.playSound("random.levelup");
            player.sendMessage({ translate: "an.welcome.title" });
            player.sendMessage({ translate: "an.welcome.hint" });
        }, 40);
    });

    world.beforeEvents.itemUse.subscribe((event) => {
        const { source, itemStack } = event;

        if (!itemStack || itemStack.typeId !== CONFIG_ITEM) return;

        event.cancel = true;

        system.run(() => {
            openMainMenu(source).catch(e => {
                console.warn("[AdvancedNetherite] Error opening config menu:", e);
            });
        });
    });
}