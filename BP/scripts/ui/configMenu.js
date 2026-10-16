import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { Config, clamp, isOperator } from "../api/index.js";

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
    const parsed = parseFloat(String(raw));
    return isNaN(parsed) ? fallback : clamp(parsed, 0, 1);
}

function confirmSaved(player) {
    player.playSound("random.orb");
    player.sendMessage(translate("lsan.msg.saved"));
}

async function showToggleMenu(player, values, titleKey, toggles) {
    const form = new ModalFormData().title(translate(titleKey));
    for (const toggle of toggles) {
        form.toggle(translate(toggle.labelKey), { defaultValue: values[toggle.key] });
    }

    const response = await form.show(player);
    if (response.canceled || !response.formValues) return null;

    const formValues = response.formValues;
    const updates = {};
    toggles.forEach((toggle, index) => {
        updates[toggle.key] = Boolean(formValues[index]);
    });
    return updates;
}

async function showChanceMenu(player, values, titleKey, fields) {
    const form = new ModalFormData().title(translate(titleKey));
    for (const field of fields) {
        form.textField(chanceLabel(field.labelKey, values[field.key]), CHANCE_PLACEHOLDER, {
            defaultValue: String(values[field.key]),
        });
    }

    const response = await form.show(player);
    if (response.canceled || !response.formValues) return null;

    const formValues = response.formValues;
    const updates = {};
    fields.forEach((field, index) => {
        updates[field.key] = parseChance(formValues[index], values[field.key]);
    });
    return updates;
}

async function openClientMenu(player) {
    const updates = await showToggleMenu(player, Config.getPlayer(player), "config.lsan:client", CLIENT_TOGGLES);
    if (!updates) return;

    Config.setPlayer(player, updates);
    confirmSaved(player);
}

async function openCommonMenu(player) {
    const updates = await showToggleMenu(player, Config.get(), "config.lsan:common", COMMON_TOGGLES);
    if (!updates || !isOperator(player)) return;

    Config.set(updates);
    confirmSaved(player);
}

async function openServerMenu(player) {
    const form = new ActionFormData().title(translate("config.lsan:server"));
    for (const section of DROP_SECTIONS) form.button(translate(section.titleKey));

    const response = await form.show(player);
    if (response.canceled || response.selection === undefined) return;

    const section = DROP_SECTIONS[response.selection];
    if (!section) return;

    const updates = await showChanceMenu(player, Config.get(), section.titleKey, section.fields);
    if (!updates || !isOperator(player)) return;

    Config.set(updates);
    confirmSaved(player);
}

async function resetConfig(player) {
    if (!isOperator(player)) return;

    Config.reset();
    player.playSound("random.orb");
    player.sendMessage(translate("lsan.msg.reset"));
}

const MENU_ENTRIES = [
    { labelKey: "config.lsan:client", open: openClientMenu },
    { labelKey: "config.lsan:common", open: openCommonMenu, operatorOnly: true },
    { labelKey: "config.lsan:server", open: openServerMenu, operatorOnly: true },
    { labelKey: "lsan.menu.main.btn.reset", open: resetConfig, operatorOnly: true },
];

export async function openMainMenu(player) {
    player.playSound("random.click");

    const entries = MENU_ENTRIES.filter(entry => !entry.operatorOnly || isOperator(player));
    const form = new ActionFormData().title(translate("itemGroup.lsan:tab"));
    for (const entry of entries) form.button(translate(entry.labelKey));

    const response = await form.show(player);
    if (response.canceled || response.selection === undefined) return;

    await entries[response.selection]?.open(player);
}
