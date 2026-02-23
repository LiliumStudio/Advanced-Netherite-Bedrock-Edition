import { registerConfigSystem } from "./configManager.js";
import { registerPlayerSpawnSystem } from "./playerSpawn.js";
import { registerArmorSystem } from "./armors.js";
import { registerSwordSystem } from "./swords.js";
import { registerPickaxeSystem } from "./pickaxes.js";
import { registerHoeSystem } from "./hoes.js";
import { registerDurabilitySystem } from "./durability.js";
import { registerLoreSystem } from "./lore.js";
import { registerNetheriteConverterSystem } from "./netheriteConverter.js";

registerConfigSystem();
registerPlayerSpawnSystem();
registerArmorSystem();
registerSwordSystem();
registerPickaxeSystem();
registerHoeSystem();
registerDurabilitySystem();
registerLoreSystem();
registerNetheriteConverterSystem();
