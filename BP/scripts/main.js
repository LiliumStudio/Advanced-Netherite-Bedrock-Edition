import { Registry, Config } from "./api/index.js";

import { DEFAULT_CONFIG, CONFIG_KEY, ConfigSystem } from "./modules/config.js";
import { ArmorSystem } from "./modules/armor.js";
import { ArmorBarSystem } from "./modules/armorBar.js";
import { LoreSystem } from "./modules/lore.js";
import { DropsSystem } from "./modules/drops.js";
import { DurabilitySystem } from "./modules/durability.js";
import { ConverterSystem } from "./modules/converter.js";
import { NetheriteUiSystem } from "./modules/netheriteUi.js";

Config.init(DEFAULT_CONFIG, CONFIG_KEY);
Config.load();

Registry.register(ArmorSystem);
Registry.register(DropsSystem);
Registry.register(DurabilitySystem);
Registry.register(LoreSystem);
Registry.register(ConverterSystem);
Registry.register(ConfigSystem);
Registry.register(ArmorBarSystem);
Registry.register(NetheriteUiSystem);

Registry.init();
