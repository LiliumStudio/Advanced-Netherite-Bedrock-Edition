import { world, system, ItemStack } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";
import { Config } from "../api/index.js";

// ─────────────────────────────────────────────────────────────
//  Datos de configuración por defecto
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
//  Menú de configuración (UI)
// ─────────────────────────────────────────────────────────────
function t(key) { return { translate: key }; }

function pct(val) { return `${Math.round(val * 100)}%`; }

function chanceField(form, labelKey, currentVal) {
    form.textField(
        {
            rawtext: [
                { translate: labelKey },
                { text: ` §7(0.0 – 1.0, actual: ${pct(currentVal)})` }
            ]
        },
        "e.g.: 0.30",
        { defaultValue: String(currentVal) }
    );
}

function parseChance(raw, fallback) {
    const n = parseFloat(raw);
    if (isNaN(n)) return fallback;
    return Math.min(1.0, Math.max(0.0, n));
}

async function openCropDropsMenu(player, cfg) {
    const form = new ModalFormData().title(t("config.lsan:server.additional_drops.crops"));
    chanceField(form, "config.lsan:server.additional_drops.crops.wheat_drop_chance",     cfg.additionalWheatDropChance);
    chanceField(form, "config.lsan:server.additional_drops.crops.carrots_drop_chance",   cfg.additionalCarrotsDropChance);
    chanceField(form, "config.lsan:server.additional_drops.crops.potatoes_drop_chance",  cfg.additionalPotatoesDropChance);
    chanceField(form, "config.lsan:server.additional_drops.crops.beetroots_drop_chance", cfg.additionalBeetrootsDropChance);

    const r = await form.show(player);
    if (r.canceled) return cfg;
    return {
        ...cfg,
        additionalWheatDropChance:    parseChance(r.formValues[0], cfg.additionalWheatDropChance),
        additionalCarrotsDropChance:  parseChance(r.formValues[1], cfg.additionalCarrotsDropChance),
        additionalPotatoesDropChance: parseChance(r.formValues[2], cfg.additionalPotatoesDropChance),
        additionalBeetrootsDropChance:parseChance(r.formValues[3], cfg.additionalBeetrootsDropChance),
    };
}

async function openMobDropsMenu(player, cfg) {
    const form = new ModalFormData().title(t("config.lsan:server.additional_drops.mobs"));
    chanceField(form, "config.lsan:server.additional_drops.mobs.phantom_drop_chance",           cfg.additionalPhantomDropChance);
    chanceField(form, "config.lsan:server.additional_drops.mobs.zombified_piglin_drop_chance",  cfg.additionalZombifiedPiglinDropChance);
    chanceField(form, "config.lsan:server.additional_drops.mobs.piglin_drop_chance",            cfg.additionalPiglinDropChance);
    chanceField(form, "config.lsan:server.additional_drops.mobs.enderman_drop_chance",          cfg.additionalEndermanDropChance);

    const r = await form.show(player);
    if (r.canceled) return cfg;
    return {
        ...cfg,
        additionalPhantomDropChance:         parseChance(r.formValues[0], cfg.additionalPhantomDropChance),
        additionalZombifiedPiglinDropChance: parseChance(r.formValues[1], cfg.additionalZombifiedPiglinDropChance),
        additionalPiglinDropChance:          parseChance(r.formValues[2], cfg.additionalPiglinDropChance),
        additionalEndermanDropChance:        parseChance(r.formValues[3], cfg.additionalEndermanDropChance),
    };
}

async function openOreDropsMenu(player, cfg) {
    const form = new ModalFormData().title(t("config.lsan:server.additional_drops.ores"));
    chanceField(form, "config.lsan:server.additional_drops.ores.raw_iron_drop_chance",    cfg.additionalRawIronDropChance);
    chanceField(form, "config.lsan:server.additional_drops.ores.raw_gold_drop_chance",    cfg.additionalRawGoldDropChance);
    chanceField(form, "config.lsan:server.additional_drops.ores.emerald_drop_chance",     cfg.additionalEmeraldDropChance);
    chanceField(form, "config.lsan:server.additional_drops.ores.diamond_drop_chance",     cfg.additionalDiamondDropChance);
    chanceField(form, "config.lsan:server.additional_drops.ores.gold_nugget_drop_chance", cfg.additionalGoldNuggetDropChance);

    const r = await form.show(player);
    if (r.canceled) return cfg;
    return {
        ...cfg,
        additionalRawIronDropChance:    parseChance(r.formValues[0], cfg.additionalRawIronDropChance),
        additionalRawGoldDropChance:    parseChance(r.formValues[1], cfg.additionalRawGoldDropChance),
        additionalEmeraldDropChance:    parseChance(r.formValues[2], cfg.additionalEmeraldDropChance),
        additionalDiamondDropChance:    parseChance(r.formValues[3], cfg.additionalDiamondDropChance),
        additionalGoldNuggetDropChance: parseChance(r.formValues[4], cfg.additionalGoldNuggetDropChance),
    };
}

async function openClientConfig(player, cfg) {
    const form = new ModalFormData()
        .title(t("config.lsan:client"))
        .toggle(t("config.lsan:client.show_tooltips"), { defaultValue: cfg.showTooltips });

    const r = await form.show(player);
    if (r.canceled) return cfg;
    return { ...cfg, showTooltips: r.formValues[0] };
}

async function openCommonConfig(player, cfg) {
    const form = new ModalFormData()
        .title(t("config.lsan:common"))
        .toggle(t("config.lsan:common.additional_drops.enable_additional_crop_drops"), { defaultValue: cfg.enableAdditionalCropDrops })
        .toggle(t("config.lsan:common.additional_drops.enable_additional_ore_drops"),  { defaultValue: cfg.enableAdditionalOreDrops })
        .toggle(t("config.lsan:common.additional_drops.enable_additional_mob_drops"),  { defaultValue: cfg.enableAdditionalMobDrops });

    const r = await form.show(player);
    if (r.canceled) return cfg;
    return {
        ...cfg,
        enableAdditionalCropDrops: r.formValues[0],
        enableAdditionalOreDrops:  r.formValues[1],
        enableAdditionalMobDrops:  r.formValues[2],
    };
}

async function openServerDropsMenu(player, cfg) {
    const form = new ActionFormData()
        .title(t("config.lsan:server"))
        .button(t("config.lsan:server.additional_drops.crops"))
        .button(t("config.lsan:server.additional_drops.mobs"))
        .button(t("config.lsan:server.additional_drops.ores"));

    const r = await form.show(player);
    if (r.canceled) return cfg;
    if (r.selection === 0) return await openCropDropsMenu(player, cfg);
    if (r.selection === 1) return await openMobDropsMenu(player, cfg);
    if (r.selection === 2) return await openOreDropsMenu(player, cfg);
    return cfg;
}

export async function openMainMenu(player) {
    player.playSound("random.click");
    let cfg = Config.get();

    const main = new ActionFormData()
        .title(t("itemGroup.lsan:tab"))
        .button(t("config.lsan:client"))
        .button(t("config.lsan:common"))
        .button(t("config.lsan:server"))
        .button(t("lsan.menu.main.btn.reset"));

    const r = await main.show(player);
    if (r.canceled) return;

    if (r.selection === 3) {
        Config.reset();
        player.playSound("random.orb");
        player.sendMessage(t("lsan.msg.reset"));
        return;
    }

    if (r.selection === 0) cfg = await openClientConfig(player, cfg);
    if (r.selection === 1) cfg = await openCommonConfig(player, cfg);
    if (r.selection === 2) cfg = await openServerDropsMenu(player, cfg);

    Config.set(cfg);
    player.playSound("random.orb");
    player.sendMessage(t("lsan.msg.saved"));
}

// ─────────────────────────────────────────────────────────────
//  Sistema: entrega del ítem de configuración y apertura del menú
// ─────────────────────────────────────────────────────────────
const CONFIG_ITEM_ID     = "lsan:config";
const TAG_RECEIVED_ITEM  = "lsan:received_config_item";

export const ConfigSystem = {
    name: "ConfigSystem",

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
                console.warn("[lsan:ConfigSystem] Could not give config item:", e);
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
                    console.warn("[lsan:ConfigSystem] Error opening config menu:", e);
                });
            });
        });
    },
};
