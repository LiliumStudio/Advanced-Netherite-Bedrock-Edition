import { ItemStack, world, type Dimension, type Vector3 } from "@minecraft/server";
import { resolveCropDrop, resolveMobDrops, resolveOreDrop, type Drop } from "../core/drops.js";
import { MOB_LOOT } from "../core/materials.js";
import type { Rng } from "../core/random.js";
import { enchantLevel, getHandItem, hasFamily, itemTags } from "../platform/items.js";
import type { Feature } from "./configStore.js";

const rng: Rng = { next: Math.random };

function spawn(dimension: Dimension, location: Vector3, drop: Drop | null): void {
    if (drop) dimension.spawnItem(new ItemStack(drop.item, drop.amount), location);
}

export const drops: Feature = {
    name: "drops",
    init({ config }) {
        world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
            const killer = damageSource.damagingEntity;
            if (killer?.typeId !== "minecraft:player") return;
            const weapon = getHandItem(killer);
            if (!weapon) return;
            const families = new Set(Object.keys(MOB_LOOT).filter(f => hasFamily(deadEntity, f)));
            if (families.size === 0) return;
            const { dimension, location } = deadEntity;
            for (const drop of resolveMobDrops(itemTags(weapon), families, config.world(), rng)) {
                spawn(dimension, location, drop);
            }
        });

        world.afterEvents.playerBreakBlock.subscribe(({ player, block, brokenBlockPermutation }) => {
            const tool = getHandItem(player);
            if (!tool) return;
            const tags = itemTags(tool);
            const cfg = config.world();
            const blockId = brokenBlockPermutation.type.id;
            const location = block.center();
            const silkTouch = enchantLevel(tool, "silk_touch") > 0;
            spawn(player.dimension, location, resolveOreDrop(tags, blockId, silkTouch, cfg, rng));
            const growth = brokenBlockPermutation.getState("growth");
            const g = typeof growth === "number" ? growth : undefined;
            spawn(player.dimension, location, resolveCropDrop(tags, blockId, g, cfg, rng));
        });
    },
};
