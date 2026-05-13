import { Registry }           from "./core/Registry.js";
import { Config }             from "./core/Config.js";

import { ArmorSystem }        from "./systems/ArmorSystem.js";
import { WeaponDropSystem }   from "./systems/WeaponDropSystem.js";
import { PickaxeSystem }      from "./systems/PickaxeSystem.js";
import { HoeSystem }          from "./systems/HoeSystem.js";
import { DurabilitySystem }   from "./systems/DurabilitySystem.js";
import { LoreSystem }         from "./systems/LoreSystem.js";
import { ConverterSystem }    from "./systems/ConverterSystem.js";
import { PlayerSpawnSystem }  from "./systems/PlayerSpawnSystem.js";

Config.load();

Registry.register(ArmorSystem);
Registry.register(WeaponDropSystem);
Registry.register(PickaxeSystem);
Registry.register(HoeSystem);
Registry.register(DurabilitySystem);
Registry.register(LoreSystem);
Registry.register(ConverterSystem);
Registry.register(PlayerSpawnSystem);

Registry.init();
