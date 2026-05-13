import { world, system, ItemStack } from "@minecraft/server";
import { openMainMenu } from "../ui/ConfigMenu.js";

const CONFIG_ITEM_ID     = "lsan:config";
const TAG_RECEIVED_ITEM  = "lsan:received_config_item";

export const PlayerSpawnSystem = {
    name: "PlayerSpawnSystem",

    onInit() {
        world.afterEvents.playerSpawn.subscribe((event) => {
            const { player } = event;
            if (!event.initialSpawn) return;
            if (player.hasTag(TAG_RECEIVED_ITEM)) return;

            try {
                player.getComponent("minecraft:inventory")
                    .container
                    .addItem(new ItemStack(CONFIG_ITEM_ID, 1));
                player.addTag(TAG_RECEIVED_ITEM);
            } catch (e) {
                console.warn("[lsan:PlayerSpawnSystem] Could not give config item:", e);
            }

            system.runTimeout(() => {
                player.playSound("random.levelup");
                player.sendMessage({ translate: "lsan.welcome.title" });
                player.sendMessage({ translate: "lsan.welcome.hint" });
            }, 40);
        });

        world.beforeEvents.itemUse.subscribe((event) => {
            const { source, itemStack } = event;
            if (!itemStack || itemStack.typeId !== CONFIG_ITEM_ID) return;

            event.cancel = true;

            system.run(() => {
                openMainMenu(source).catch(e => {
                    console.warn("[lsan:PlayerSpawnSystem] Error opening config menu:", e);
                });
            });
        });
    },
};
