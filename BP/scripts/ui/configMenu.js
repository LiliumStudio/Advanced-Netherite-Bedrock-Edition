import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { Config, clamp } from "../api/index.js";

const CHANCE_PLACEHOLDER = "e.g.: 0.30";

const CLIENT_TOGGLES = [
    { key: "showTooltips", labelKey: "config.lsan:client.show_tooltips" },
];

const COMMON_TOGGLES = [
    { key: "enableAdditionalCropDrops", labelKey: "config.lsan:common.additional_drops.enable_additional_crop_drops" },
    { key: "enableAdditionalOreDrops", labelKey: "config.lsan:common.additional_drops.enable_additional_ore_drops" },
    { key: "enableAdditionalMobDrops", labelKey: "config.lsan:common.additional_drops.enable_additional_mob_drops" },
];

const CROP_CHANCES = [
    { key: "additionalWheatDropChance", labelKey: "config.lsan:server.additional_drops.crops.wheat_drop_chance" },
    { key: "additionalCarrotsDropChance", labelKey: "config.lsan:server.additional_drops.crops.carrots_drop_chance" },
    { key: "additionalPotatoesDropChance", labelKey: "config.lsan:server.additional_drops.crops.potatoes_drop_chance" },
    { key: "additionalBeetrootsDropChance", labelKey: "config.lsan:server.additional_drops.crops.beetroots_drop_chance" },
];

const MOB_CHANCES = [
    { key: "additionalPhantomDropChance", labelKey: "config.lsan:server.additional_drops.mobs.phantom_drop_chance" },
    { key: "additionalZombifiedPiglinDropChance", labelKey: "config.lsan:server.additional_drops.mobs.zombified_piglin_drop_chance" },
    { key: "additionalPiglinDropChance", labelKey: "config.lsan:server.additional_drops.mobs.piglin_drop_chance" },
    { key: "additionalEndermanDropChance", labelKey: "config.lsan:server.additional_drops.mobs.enderman_drop_chance" },
];

const ORE_CHANCES = [
    { key: "additionalRawIronDropChance", labelKey: "config.lsan:server.additional_drops.ores.raw_iron_drop_chance" },
    { key: "additionalRawGoldDropChance", labelKey: "config.lsan:server.additional_drops.ores.raw_gold_drop_chance" },
    { key: "additionalEmeraldDropChance", labelKey: "config.lsan:server.additional_drops.ores.emerald_drop_chance" },
    { key: "additionalDiamondDropChance", labelKey: "config.lsan:server.additional_drops.ores.diamond_drop_chance" },
    { key: "additionalGoldNuggetDropChance", labelKey: "config.lsan:server.additional_drops.ores.gold_nugget_drop_chance" },
];

const DROP_SECTIONS = [
    { titleKey: "config.lsan:server.additional_drops.crops", fields: CROP_CHANCES },
    { titleKey: "config.lsan:server.additional_drops.mobs", fields: MOB_CHANCES },
    { titleKey: "config.lsan:server.additional_drops.ores", fields: ORE_CHANCES },
];

function translate(key) {
    return { translate: key };
}

function percent(value) {
    return `${Math.round(value * 100)}%`;
}

function chanceLabel(labelKey, value) {
    return {
        rawtext: [
            { translate: labelKey },
            { text: ` §7(0.0 – 1.0, actual: ${percent(value)})` },
        ],
    };
}

function parseChance(raw, fallback) {
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? fallback : clamp(parsed, 0, 1);
}

async function showToggleMenu(player, config, titleKey, toggles) {
    const form = new ModalFormData().title(translate(titleKey));
    for (const toggle of toggles) {
        form.toggle(translate(toggle.labelKey), { defaultValue: config[toggle.key] });
    }

    const response = await form.show(player);
    if (response.canceled) return config;

    const updates = {};
    toggles.forEach((toggle, index) => {
        updates[toggle.key] = response.formValues[index];
    });
    return { ...config, ...updates };
}

async function showChanceMenu(player, config, titleKey, fields) {
    const form = new ModalFormData().title(translate(titleKey));
    for (const field of fields) {
        form.textField(chanceLabel(field.labelKey, config[field.key]), CHANCE_PLACEHOLDER, {
            defaultValue: String(config[field.key]),
        });
    }

    const response = await form.show(player);
    if (response.canceled) return config;

    const updates = {};
    fields.forEach((field, index) => {
        updates[field.key] = parseChance(response.formValues[index], config[field.key]);
    });
    return { ...config, ...updates };
}

async function showServerMenu(player, config) {
    const form = new ActionFormData().title(translate("config.lsan:server"));
    for (const section of DROP_SECTIONS) form.button(translate(section.titleKey));

    const response = await form.show(player);
    if (response.canceled) return config;

    const section = DROP_SECTIONS[response.selection];
    if (!section) return config;

    return await showChanceMenu(player, config, section.titleKey, section.fields);
}

function resetConfig(player) {
    Config.reset();
    player.playSound("random.orb");
    player.sendMessage(translate("lsan.msg.reset"));
}

export async function openMainMenu(player) {
    player.playSound("random.click");

    const form = new ActionFormData()
        .title(translate("itemGroup.lsan:tab"))
        .button(translate("config.lsan:client"))
        .button(translate("config.lsan:common"))
        .button(translate("config.lsan:server"))
        .button(translate("lsan.menu.main.btn.reset"));

    const response = await form.show(player);
    if (response.canceled) return;

    if (response.selection === 3) {
        resetConfig(player);
        return;
    }

    const config = Config.get();
    let updated = config;

    if (response.selection === 0) {
        updated = await showToggleMenu(player, config, "config.lsan:client", CLIENT_TOGGLES);
    } else if (response.selection === 1) {
        updated = await showToggleMenu(player, config, "config.lsan:common", COMMON_TOGGLES);
    } else if (response.selection === 2) {
        updated = await showServerMenu(player, config);
    }

    Config.set(updated);
    player.playSound("random.orb");
    player.sendMessage(translate("lsan.msg.saved"));
}
