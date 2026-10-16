import { Config, Registry } from "./api/index.js";
import {
    ArmorSystem,
    ConfigSystem,
    CONFIG_KEY,
    ConverterSystem,
    DEFAULT_CONFIG,
    DEFAULT_PLAYER_CONFIG,
    DropsSystem,
    DurabilitySystem,
    LoreSystem,
} from "./modules/index.js";
import { ArmorBarSystem } from "./ui/index.js";

Config.init(DEFAULT_CONFIG, CONFIG_KEY, DEFAULT_PLAYER_CONFIG);
Config.load();

for (const system of [
    ConfigSystem,
    ArmorSystem,
    DropsSystem,
    DurabilitySystem,
    LoreSystem,
    ConverterSystem,
    ArmorBarSystem,
]) {
    Registry.register(system);
}

Registry.init();
