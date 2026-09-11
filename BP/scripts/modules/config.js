import { world, system, ItemStack } from "@minecraft/server";
import { getContainer } from "../api/index.js";
import { openMainMenu } from "../ui/index.js";

export const CONFIG_KEY = "lsan:config";

export const DEFAULT_CONFIG = {
    showTooltips: true,

    enableAdditionalCropDrops: true,
    enableAdditionalOreDrops: true,
    enableAdditionalMobDrops: true,

    additionalWheatDropChance: 0.3,
    additionalCarrotsDropChance: 0.3,
    additionalPotatoesDropChance: 0.3,
    additionalBeetrootsDropChance: 0.2,

    additionalPhantomDropChance: 0.5,
    additionalZombifiedPiglinDropChance: 0.5,
    additionalPiglinDropChance: 0.15,
    additionalEndermanDropChance: 0.3,

    additionalRawIronDropChance: 0.2,
    additionalRawGoldDropChance: 0.3,
    additionalEmeraldDropChance: 0.4,
    additionalDiamondDropChance: 0.25,
    additionalGoldNuggetDropChance: 0.6,
};

const CONFIG_ITEM_ID = "lsan:config";
const RECEIVED_ITEM_TAG = "lsan:received_config_item";
const WELCOME_DELAY_TICKS = 40;

function giveConfigItem(player) {
    const container = getContainer(player);
    if (!container) return;

    try {
        container.addItem(new ItemStack(CONFIG_ITEM_ID, 1));
        player.addTag(RECEIVED_ITEM_TAG);
    } catch (error) {
        console.warn("[lsan:ConfigSystem] Could not give config item:", error);
    }
}

function sendWelcome(player) {
    system.runTimeout(() => {
        if (!player.isValid) return;
        player.playSound("random.levelup");
        player.sendMessage({ translate: "lsan.welcome.title" });
        player.sendMessage({ translate: "lsan.welcome.hint" });
    }, WELCOME_DELAY_TICKS);
}

export const ConfigSystem = {
    name: "ConfigSystem",

    onInit() {
        world.afterEvents.playerSpawn.subscribe(event => {
            if (!event.initialSpawn) return;
            if (event.player.hasTag(RECEIVED_ITEM_TAG)) return;

            giveConfigItem(event.player);
            sendWelcome(event.player);
        });

        world.beforeEvents.itemUse.subscribe(event => {
            if (event.itemStack?.typeId !== CONFIG_ITEM_ID) return;

            event.cancel = true;
            const player = event.source;

            system.run(() => {
                openMainMenu(player).catch(error => {
                    console.warn("[lsan:ConfigSystem] Error opening config menu:", error);
                });
            });
        });
    },
};
