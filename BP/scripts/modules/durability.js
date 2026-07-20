import { world, system, EntityEquippableComponent, EquipmentSlot } from "@minecraft/server";

const MOD_PREFIX  = "lsan:";
const TOOL_TAGS   = ["minecraft:is_pickaxe", "minecraft:is_axe", "minecraft:is_shovel", "minecraft:is_hoe"];
const SWORD_TAGS  = ["minecraft:is_sword", "minecraft:is_spear"];

function _isModItem(item)  { return item?.typeId.startsWith(MOD_PREFIX) ?? false; }

function _isModTool(item)  { return _isModItem(item) && TOOL_TAGS.some(t  => item.hasTag(t)); }

function _isModWeapon(item){ return _isModItem(item) && SWORD_TAGS.some(t => item.hasTag(t)); }

function _getUnbreakingLevel(item) {
    const enchantable = item.getComponent("minecraft:enchantable");
    if (!enchantable) return 0;
    for (const enchant of enchantable.getEnchantments()) {
        if (enchant.type.id === "unbreaking") return enchant.level;
    }
    return 0;
}

function _applyDurability(snapshot, source, damage) {
    system.run(() => {
        try {
            const equippable = source.getComponent(EntityEquippableComponent.componentId);
            if (!equippable) return;

            const current = equippable.getEquipment(EquipmentSlot.Mainhand);
            if (!current || current.typeId !== snapshot.typeId) return;

            const durability = current.getComponent("minecraft:durability");
            if (!durability) return;

            const unbreakLv = _getUnbreakingLevel(current);
            if (unbreakLv > 0 && Math.random() >= 1 / (unbreakLv + 1)) return;

            if (durability.damage + damage < durability.maxDurability) {
                durability.damage += damage;
                equippable.setEquipment(EquipmentSlot.Mainhand, current);
            } else {
                equippable.setEquipment(EquipmentSlot.Mainhand, undefined);
                source.playSound("random.break");
            }
        } catch (e) {
            console.warn("[lsan:DurabilitySystem] Error applying durability:", e);
        }
    });
}

export const DurabilitySystem = {
    name: "DurabilitySystem",

    onInit() {
        world.afterEvents.playerBreakBlock.subscribe((event) => {
            const { player } = event;
            const equippable = player.getComponent(EntityEquippableComponent.componentId);
            const item = equippable?.getEquipment(EquipmentSlot.Mainhand);
            if (!item || !_isModItem(item)) return;

            if (item.hasTag("minecraft:is_axe") || item.hasTag("minecraft:is_hoe")) return;
            if (!_isModTool(item) && !_isModWeapon(item)) return;

            _applyDurability(item, player, _isModWeapon(item) ? 2 : 1);
        });

        world.afterEvents.itemUse.subscribe((event) => {
            const { source: player, itemStack } = event;
            if (!player || player.typeId !== "minecraft:player") return;
            if (!itemStack || !_isModItem(itemStack)) return;
            if (!itemStack.hasTag("minecraft:is_axe") && !itemStack.hasTag("minecraft:is_hoe")) return;

            _applyDurability(itemStack, player, 1);
        });

        world.afterEvents.entityHitEntity.subscribe((event) => {
            const { damagingEntity } = event;
            if (!damagingEntity || damagingEntity.typeId !== "minecraft:player") return;

            const equippable = damagingEntity.getComponent(EntityEquippableComponent.componentId);
            const item = equippable?.getEquipment(EquipmentSlot.Mainhand);
            if (!item || !_isModItem(item)) return;
            if (!_isModWeapon(item) && !_isModTool(item)) return;

            _applyDurability(item, damagingEntity, _isModWeapon(item) ? 1 : 2);
        });
    },
};
