import { PlayerPermissionLevel, type Player, type RawMessage } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import type { PlayerConfig, WorldConfig } from "../core/config.js";
import type { ConfigStore } from "./configStore.js";

type Field<K extends string> = { key: K; labelKey: string };
type WorldToggleKey = {
    [K in keyof WorldConfig]: WorldConfig[K] extends boolean ? K : never;
}[keyof WorldConfig];
type WorldChanceKey = Exclude<keyof WorldConfig, WorldToggleKey>;

const CHANCE_PLACEHOLDER = "e.g.: 0.30";

const CLIENT_TOGGLES: Field<keyof PlayerConfig>[] = [
    { key: "showTooltips", labelKey: "config.lsan:client.show_tooltips" },
];

const COMMON_TOGGLES: Field<WorldToggleKey>[] = [
    { key: "enableAdditionalCropDrops", labelKey: "config.lsan:common.additional_drops.enable_additional_crop_drops" },
    { key: "enableAdditionalOreDrops", labelKey: "config.lsan:common.additional_drops.enable_additional_ore_drops" },
    { key: "enableAdditionalMobDrops", labelKey: "config.lsan:common.additional_drops.enable_additional_mob_drops" },
    { key: "enableNetheriteConversion", labelKey: "config.lsan:common.enable_netherite_conversion" },
];

const CROP_CHANCES: Field<WorldChanceKey>[] = [
    { key: "additionalWheatDropChance", labelKey: "config.lsan:server.additional_drops.crops.wheat_drop_chance" },
    { key: "additionalCarrotsDropChance", labelKey: "config.lsan:server.additional_drops.crops.carrots_drop_chance" },
    { key: "additionalPotatoesDropChance", labelKey: "config.lsan:server.additional_drops.crops.potatoes_drop_chance" },
    { key: "additionalBeetrootsDropChance", labelKey: "config.lsan:server.additional_drops.crops.beetroots_drop_chance" },
];

const MOB_CHANCES: Field<WorldChanceKey>[] = [
    { key: "additionalPhantomDropChance", labelKey: "config.lsan:server.additional_drops.mobs.phantom_drop_chance" },
    { key: "additionalZombifiedPiglinDropChance", labelKey: "config.lsan:server.additional_drops.mobs.zombified_piglin_drop_chance" },
    { key: "additionalPiglinDropChance", labelKey: "config.lsan:server.additional_drops.mobs.piglin_drop_chance" },
    { key: "additionalEndermanDropChance", labelKey: "config.lsan:server.additional_drops.mobs.enderman_drop_chance" },
];

const ORE_CHANCES: Field<WorldChanceKey>[] = [
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

function translate(key: string): RawMessage {
    return { translate: key };
}

function isOperator(player: Player): boolean {
    return player.playerPermissionLevel === PlayerPermissionLevel.Operator;
}

function percent(value: number): string {
    return `${Math.round(value * 100)}%`;
}

function chanceLabel(labelKey: string, value: number): RawMessage {
    return { rawtext: [{ translate: labelKey }, { text: ` §7(0.0 – 1.0, actual: ${percent(value)})` }] };
}

function parseChance(raw: unknown, fallback: number): number {
    const parsed = parseFloat(String(raw));
    return isNaN(parsed) ? fallback : Math.min(1, Math.max(0, parsed));
}

function confirmSaved(player: Player): void {
    player.playSound("random.orb");
    player.sendMessage(translate("lsan.msg.saved"));
}

async function showToggleMenu<K extends string>(
    player: Player,
    values: Record<K, boolean>,
    titleKey: string,
    toggles: Field<K>[],
): Promise<Partial<Record<K, boolean>> | null> {
    const form = new ModalFormData().title(translate(titleKey));
    for (const t of toggles) form.toggle(translate(t.labelKey), { defaultValue: values[t.key] });
    const response = await form.show(player);
    if (response.canceled || !response.formValues) return null;
    const formValues = response.formValues;
    const updates: Partial<Record<K, boolean>> = {};
    toggles.forEach((t, i) => {
        updates[t.key] = Boolean(formValues[i]);
    });
    return updates;
}

async function showChanceMenu(
    player: Player,
    values: WorldConfig,
    titleKey: string,
    fields: Field<WorldChanceKey>[],
): Promise<Partial<WorldConfig> | null> {
    const form = new ModalFormData().title(translate(titleKey));
    for (const f of fields) {
        form.textField(chanceLabel(f.labelKey, values[f.key]), CHANCE_PLACEHOLDER, {
            defaultValue: String(values[f.key]),
        });
    }
    const response = await form.show(player);
    if (response.canceled || !response.formValues) return null;
    const formValues = response.formValues;
    const updates: Partial<WorldConfig> = {};
    fields.forEach((f, i) => {
        updates[f.key] = parseChance(formValues[i], values[f.key]);
    });
    return updates;
}

async function openClientMenu(player: Player, store: ConfigStore): Promise<void> {
    const updates = await showToggleMenu(player, store.player(player), "config.lsan:client", CLIENT_TOGGLES);
    if (!updates) return;
    store.setPlayer(player, updates);
    confirmSaved(player);
}

async function openCommonMenu(player: Player, store: ConfigStore): Promise<void> {
    const updates = await showToggleMenu(player, store.world(), "config.lsan:common", COMMON_TOGGLES);
    if (!updates || !isOperator(player)) return;
    store.setWorld(updates);
    confirmSaved(player);
}

async function openServerMenu(player: Player, store: ConfigStore): Promise<void> {
    const form = new ActionFormData().title(translate("config.lsan:server"));
    for (const section of DROP_SECTIONS) form.button(translate(section.titleKey));
    const response = await form.show(player);
    if (response.canceled || response.selection === undefined) return;
    const section = DROP_SECTIONS[response.selection];
    if (!section) return;
    const updates = await showChanceMenu(player, store.world(), section.titleKey, section.fields);
    if (!updates || !isOperator(player)) return;
    store.setWorld(updates);
    confirmSaved(player);
}

async function resetConfig(player: Player, store: ConfigStore): Promise<void> {
    if (!isOperator(player)) return;
    store.resetWorld();
    player.playSound("random.orb");
    player.sendMessage(translate("lsan.msg.reset"));
}

const MENU_ENTRIES: {
    labelKey: string;
    open: (player: Player, store: ConfigStore) => Promise<void>;
    operatorOnly?: boolean;
}[] = [
    { labelKey: "config.lsan:client", open: openClientMenu },
    { labelKey: "config.lsan:common", open: openCommonMenu, operatorOnly: true },
    { labelKey: "config.lsan:server", open: openServerMenu, operatorOnly: true },
    { labelKey: "lsan.menu.main.btn.reset", open: resetConfig, operatorOnly: true },
];

export async function openMainMenu(player: Player, store: ConfigStore): Promise<void> {
    player.playSound("random.click");
    const entries = MENU_ENTRIES.filter(e => !e.operatorOnly || isOperator(player));
    const form = new ActionFormData().title(translate("itemGroup.lsan:tab"));
    for (const e of entries) form.button(translate(e.labelKey));
    const response = await form.show(player);
    if (response.canceled || response.selection === undefined) return;
    await entries[response.selection]?.open(player, store);
}
