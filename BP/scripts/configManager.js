<<<<<<< HEAD
import { world, system } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";
import { DEFAULT_CONFIG, CONFIG_KEY } from "./config.js";

function loadConfig() {
    try {
        const raw = world.getDynamicProperty(CONFIG_KEY);
        if (typeof raw === "string") {
            return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
        }
    } catch (e) {
        console.warn("[AdvancedNetherite] Error loading config, using defaults:", e);
    }
    return { ...DEFAULT_CONFIG };
}

function saveConfig(cfg) {
    try {
        world.setDynamicProperty(CONFIG_KEY, JSON.stringify(cfg));
    } catch (e) {
        console.warn("[AdvancedNetherite] Error saving config:", e);
    }
}

let _config = { ...DEFAULT_CONFIG };

export function getConfig() {
    return _config;
}

function t(key) {
    return { translate: key };
}

function pct(val) {
    return `${Math.round(val * 100)}%`;
}

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
    const form = new ModalFormData().title(t("an.menu.crop.title"));
    chanceField(form, "an.field.wheat", cfg.additionalWheatDropChance);
    chanceField(form, "an.field.carrots", cfg.additionalCarrotsDropChance);
    chanceField(form, "an.field.potatoes", cfg.additionalPotatoesDropChance);
    chanceField(form, "an.field.beetroots", cfg.additionalBeetrootsDropChance);

    const r = await form.show(player);
    if (r.canceled) return cfg;

    return {
        ...cfg,
        additionalWheatDropChance: parseChance(r.formValues[0], cfg.additionalWheatDropChance),
        additionalCarrotsDropChance: parseChance(r.formValues[1], cfg.additionalCarrotsDropChance),
        additionalPotatoesDropChance: parseChance(r.formValues[2], cfg.additionalPotatoesDropChance),
        additionalBeetrootsDropChance: parseChance(r.formValues[3], cfg.additionalBeetrootsDropChance),
    };
}

async function openMobDropsMenu(player, cfg) {
    const form = new ModalFormData().title(t("an.menu.mob.title"));
    chanceField(form, "an.field.phantom", cfg.additionalPhantomDropChance);
    chanceField(form, "an.field.zombified_piglin", cfg.additionalZombifiedPiglinDropChance);
    chanceField(form, "an.field.piglin", cfg.additionalPiglinDropChance);
    chanceField(form, "an.field.enderman", cfg.additionalEndermanDropChance);

    const r = await form.show(player);
    if (r.canceled) return cfg;

    return {
        ...cfg,
        additionalPhantomDropChance: parseChance(r.formValues[0], cfg.additionalPhantomDropChance),
        additionalZombifiedPiglinDropChance: parseChance(r.formValues[1], cfg.additionalZombifiedPiglinDropChance),
        additionalPiglinDropChance: parseChance(r.formValues[2], cfg.additionalPiglinDropChance),
        additionalEndermanDropChance: parseChance(r.formValues[3], cfg.additionalEndermanDropChance),
    };
}

async function openOreDropsMenu(player, cfg) {
    const form = new ModalFormData().title(t("an.menu.ore.title"));
    chanceField(form, "an.field.raw_iron", cfg.additionalRawIronDropChance);
    chanceField(form, "an.field.raw_gold", cfg.additionalRawGoldDropChance);
    chanceField(form, "an.field.emerald", cfg.additionalEmeraldDropChance);
    chanceField(form, "an.field.diamond", cfg.additionalDiamondDropChance);
    chanceField(form, "an.field.gold_nugget", cfg.additionalGoldNuggetDropChance);

    const r = await form.show(player);
    if (r.canceled) return cfg;

    return {
        ...cfg,
        additionalRawIronDropChance: parseChance(r.formValues[0], cfg.additionalRawIronDropChance),
        additionalRawGoldDropChance: parseChance(r.formValues[1], cfg.additionalRawGoldDropChance),
        additionalEmeraldDropChance: parseChance(r.formValues[2], cfg.additionalEmeraldDropChance),
        additionalDiamondDropChance: parseChance(r.formValues[3], cfg.additionalDiamondDropChance),
        additionalGoldNuggetDropChance: parseChance(r.formValues[4], cfg.additionalGoldNuggetDropChance),
    };
}

async function openClientConfig(player, cfg) {
    const form = new ModalFormData()
        .title(t("an.menu.client.title"))
        .toggle(t("an.menu.client.show_tooltips"), { defaultValue: cfg.showTooltips });

    const r = await form.show(player);
    if (r.canceled) return cfg;

    return { ...cfg, showTooltips: r.formValues[0] };
}

async function openCommonConfig(player, cfg) {
    const form = new ModalFormData()
        .title(t("an.menu.common.title"))
        .toggle(t("an.menu.common.crop_drops"), { defaultValue: cfg.enableAdditionalCropDrops })
        .toggle(t("an.menu.common.ore_drops"), { defaultValue: cfg.enableAdditionalOreDrops })
        .toggle(t("an.menu.common.mob_drops"), { defaultValue: cfg.enableAdditionalMobDrops });

    const r = await form.show(player);
    if (r.canceled) return cfg;

    return {
        ...cfg,
        enableAdditionalCropDrops: r.formValues[0],
        enableAdditionalOreDrops: r.formValues[1],
        enableAdditionalMobDrops: r.formValues[2],
    };
}

async function openServerDropsMenu(player, cfg) {
    const form = new ActionFormData()
        .title(t("an.menu.server.title"))
        .button(t("an.menu.server.btn.crop"))
        .button(t("an.menu.server.btn.mob"))
        .button(t("an.menu.server.btn.ore"));

    const r = await form.show(player);
    if (r.canceled) return cfg;

    if (r.selection === 0) return await openCropDropsMenu(player, cfg);
    if (r.selection === 1) return await openMobDropsMenu(player, cfg);
    if (r.selection === 2) return await openOreDropsMenu(player, cfg);
    return cfg;
}

export async function openMainMenu(player) {
    player.playSound("random.click");
    let cfg = { ..._config };

    const main = new ActionFormData()
        .title(t("an.menu.main.title"))
        .button(t("an.menu.main.btn.client"))
        .button(t("an.menu.main.btn.common"))
        .button(t("an.menu.main.btn.server"))
        .button(t("an.menu.main.btn.reset"));

    const r = await main.show(player);
    if (r.canceled) return;

    if (r.selection === 3) {
        _config = { ...DEFAULT_CONFIG };
        saveConfig(_config);
        player.playSound("random.orb");
        player.sendMessage(t("an.msg.reset"));
        return;
    }

    if (r.selection === 0) cfg = await openClientConfig(player, cfg);
    if (r.selection === 1) cfg = await openCommonConfig(player, cfg);
    if (r.selection === 2) cfg = await openServerDropsMenu(player, cfg);

    _config = cfg;
    saveConfig(_config);
    player.playSound("random.orb");
    player.sendMessage(t("an.msg.saved"));
}

export function registerConfigSystem() {
    system.run(() => {
        _config = loadConfig();
        console.log("[AdvancedNetherite] Config loaded.");
    });
=======
import { world, system } from "@minecraft/server";
import { ModalFormData, ActionFormData } from "@minecraft/server-ui";
import { DEFAULT_CONFIG, CONFIG_KEY } from "./config.js";

function loadConfig() {
    try {
        const raw = world.getDynamicProperty(CONFIG_KEY);
        if (typeof raw === "string") {
            return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
        }
    } catch (e) {
        console.warn("[AdvancedNetherite] Error loading config, using defaults:", e);
    }
    return { ...DEFAULT_CONFIG };
}

function saveConfig(cfg) {
    try {
        world.setDynamicProperty(CONFIG_KEY, JSON.stringify(cfg));
    } catch (e) {
        console.warn("[AdvancedNetherite] Error saving config:", e);
    }
}

let _config = { ...DEFAULT_CONFIG };

export function getConfig() {
    return _config;
}

function t(key) {
    return { translate: key };
}

function pct(val) {
    return `${Math.round(val * 100)}%`;
}

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
    const form = new ModalFormData().title(t("an.menu.crop.title"));
    chanceField(form, "an.field.wheat", cfg.additionalWheatDropChance);
    chanceField(form, "an.field.carrots", cfg.additionalCarrotsDropChance);
    chanceField(form, "an.field.potatoes", cfg.additionalPotatoesDropChance);
    chanceField(form, "an.field.beetroots", cfg.additionalBeetrootsDropChance);

    const r = await form.show(player);
    if (r.canceled) return cfg;

    return {
        ...cfg,
        additionalWheatDropChance: parseChance(r.formValues[0], cfg.additionalWheatDropChance),
        additionalCarrotsDropChance: parseChance(r.formValues[1], cfg.additionalCarrotsDropChance),
        additionalPotatoesDropChance: parseChance(r.formValues[2], cfg.additionalPotatoesDropChance),
        additionalBeetrootsDropChance: parseChance(r.formValues[3], cfg.additionalBeetrootsDropChance),
    };
}

async function openMobDropsMenu(player, cfg) {
    const form = new ModalFormData().title(t("an.menu.mob.title"));
    chanceField(form, "an.field.phantom", cfg.additionalPhantomDropChance);
    chanceField(form, "an.field.zombified_piglin", cfg.additionalZombifiedPiglinDropChance);
    chanceField(form, "an.field.piglin", cfg.additionalPiglinDropChance);
    chanceField(form, "an.field.enderman", cfg.additionalEndermanDropChance);

    const r = await form.show(player);
    if (r.canceled) return cfg;

    return {
        ...cfg,
        additionalPhantomDropChance: parseChance(r.formValues[0], cfg.additionalPhantomDropChance),
        additionalZombifiedPiglinDropChance: parseChance(r.formValues[1], cfg.additionalZombifiedPiglinDropChance),
        additionalPiglinDropChance: parseChance(r.formValues[2], cfg.additionalPiglinDropChance),
        additionalEndermanDropChance: parseChance(r.formValues[3], cfg.additionalEndermanDropChance),
    };
}

async function openOreDropsMenu(player, cfg) {
    const form = new ModalFormData().title(t("an.menu.ore.title"));
    chanceField(form, "an.field.raw_iron", cfg.additionalRawIronDropChance);
    chanceField(form, "an.field.raw_gold", cfg.additionalRawGoldDropChance);
    chanceField(form, "an.field.emerald", cfg.additionalEmeraldDropChance);
    chanceField(form, "an.field.diamond", cfg.additionalDiamondDropChance);
    chanceField(form, "an.field.gold_nugget", cfg.additionalGoldNuggetDropChance);

    const r = await form.show(player);
    if (r.canceled) return cfg;

    return {
        ...cfg,
        additionalRawIronDropChance: parseChance(r.formValues[0], cfg.additionalRawIronDropChance),
        additionalRawGoldDropChance: parseChance(r.formValues[1], cfg.additionalRawGoldDropChance),
        additionalEmeraldDropChance: parseChance(r.formValues[2], cfg.additionalEmeraldDropChance),
        additionalDiamondDropChance: parseChance(r.formValues[3], cfg.additionalDiamondDropChance),
        additionalGoldNuggetDropChance: parseChance(r.formValues[4], cfg.additionalGoldNuggetDropChance),
    };
}

async function openClientConfig(player, cfg) {
    const form = new ModalFormData()
        .title(t("an.menu.client.title"))
        .toggle(t("an.menu.client.show_tooltips"), { defaultValue: cfg.showTooltips });

    const r = await form.show(player);
    if (r.canceled) return cfg;

    return { ...cfg, showTooltips: r.formValues[0] };
}

async function openCommonConfig(player, cfg) {
    const form = new ModalFormData()
        .title(t("an.menu.common.title"))
        .toggle(t("an.menu.common.crop_drops"), { defaultValue: cfg.enableAdditionalCropDrops })
        .toggle(t("an.menu.common.ore_drops"), { defaultValue: cfg.enableAdditionalOreDrops })
        .toggle(t("an.menu.common.mob_drops"), { defaultValue: cfg.enableAdditionalMobDrops });

    const r = await form.show(player);
    if (r.canceled) return cfg;

    return {
        ...cfg,
        enableAdditionalCropDrops: r.formValues[0],
        enableAdditionalOreDrops: r.formValues[1],
        enableAdditionalMobDrops: r.formValues[2],
    };
}

async function openServerDropsMenu(player, cfg) {
    const form = new ActionFormData()
        .title(t("an.menu.server.title"))
        .button(t("an.menu.server.btn.crop"))
        .button(t("an.menu.server.btn.mob"))
        .button(t("an.menu.server.btn.ore"));

    const r = await form.show(player);
    if (r.canceled) return cfg;

    if (r.selection === 0) return await openCropDropsMenu(player, cfg);
    if (r.selection === 1) return await openMobDropsMenu(player, cfg);
    if (r.selection === 2) return await openOreDropsMenu(player, cfg);
    return cfg;
}

export async function openMainMenu(player) {
    player.playSound("random.click");
    let cfg = { ..._config };

    const main = new ActionFormData()
        .title(t("an.menu.main.title"))
        .button(t("an.menu.main.btn.client"))
        .button(t("an.menu.main.btn.common"))
        .button(t("an.menu.main.btn.server"))
        .button(t("an.menu.main.btn.reset"));

    const r = await main.show(player);
    if (r.canceled) return;

    if (r.selection === 3) {
        _config = { ...DEFAULT_CONFIG };
        saveConfig(_config);
        player.playSound("random.orb");
        player.sendMessage(t("an.msg.reset"));
        return;
    }

    if (r.selection === 0) cfg = await openClientConfig(player, cfg);
    if (r.selection === 1) cfg = await openCommonConfig(player, cfg);
    if (r.selection === 2) cfg = await openServerDropsMenu(player, cfg);

    _config = cfg;
    saveConfig(_config);
    player.playSound("random.orb");
    player.sendMessage(t("an.msg.saved"));
}

export function registerConfigSystem() {
    system.run(() => {
        _config = loadConfig();
        console.log("[AdvancedNetherite] Config loaded.");
    });
>>>>>>> 97914f8 (Update: Spearsand lang)
}