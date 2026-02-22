import { world, system, EntityEquippableComponent, EquipmentSlot } from "@minecraft/server";

const MOD_TAG = "advancednetherite:";
const TOOL_TAGS = ["minecraft:is_pickaxe", "minecraft:is_axe", "minecraft:is_shovel", "minecraft:is_hoe"];
const SWORD_TAGS = ["minecraft:is_sword"];

function isModItem(item) { return item?.typeId.startsWith(MOD_TAG); }
function isModTool(item) { return isModItem(item) && TOOL_TAGS.some(tag => item.hasTag(tag)); }
function isModSword(item) { return isModItem(item) && SWORD_TAGS.some(tag => item.hasTag(tag)); }

function applyDurability(tool, source, damageAmount) {
    try {
        system.run(() => {
            const component = source.getComponent(EntityEquippableComponent.componentId);
            const currentTool = component.getEquipment(EquipmentSlot.Mainhand);

            if (!currentTool || currentTool.typeId !== tool.typeId) return;

            const durability = currentTool.getComponent("durability");
            const enchantable = currentTool.getComponent("enchantable");

            if (currentTool && durability !== undefined) {
                let unbreakingLevel = 0;

                if (enchantable) {
                    for (const enchant of enchantable.getEnchantments()) {
                        if (enchant.type.id === "unbreaking") {
                            unbreakingLevel = enchant.level;
                            break;
                        }
                    }
                }

                if (durability.damage + damageAmount < durability.maxDurability) {
                    let shouldDamage = true;

                    if (unbreakingLevel > 0) {
                        const chance = 1 / (unbreakingLevel + 1);
                        if (Math.random() >= chance) {
                            shouldDamage = false;
                        }
                    }

                    if (shouldDamage) {
                        durability.damage += damageAmount;
                        component.setEquipment(EquipmentSlot.Mainhand, currentTool);
                    }
                } else {
                    component.setEquipment(EquipmentSlot.Mainhand, undefined);
                    source.playSound("random.break");
                }
            }
        });
    } catch (e) {
        console.warn("[AdvancedNetherite] Error in durability logic:", e);
    }
}

export function registerDurabilitySystem() {

    world.afterEvents.playerBreakBlock.subscribe((event) => {
        const { player } = event;
        const selectedItem = player.getComponent(EntityEquippableComponent.componentId)
            ?.getEquipment(EquipmentSlot.Mainhand);

        if (!selectedItem || !isModItem(selectedItem)) return;
        if (!isModTool(selectedItem) && !isModSword(selectedItem)) return;
        if (selectedItem.hasTag("minecraft:is_axe") || selectedItem.hasTag("minecraft:is_hoe")) return;

        const damage = isModSword(selectedItem) ? 2 : 1;
        applyDurability(selectedItem, player, damage);
    });

    world.afterEvents.itemUse.subscribe((event) => {
        const { source: player, itemStack } = event;
        if (!player || player.typeId !== "minecraft:player") return;
        if (!isModItem(itemStack)) return;
        if (!itemStack.hasTag("minecraft:is_axe") && !itemStack.hasTag("minecraft:is_hoe")) return;

        applyDurability(itemStack, player, 1);
    });

    world.afterEvents.entityHitEntity.subscribe((event) => {
        const { damagingEntity } = event;
        if (!damagingEntity || damagingEntity.typeId !== "minecraft:player") return;

        const selectedItem = damagingEntity.getComponent(EntityEquippableComponent.componentId)
            ?.getEquipment(EquipmentSlot.Mainhand);

        if (!selectedItem || !isModItem(selectedItem)) return;
        if (!isModSword(selectedItem) && !isModTool(selectedItem)) return;

        const damage = isModSword(selectedItem) ? 1 : 2;
        applyDurability(selectedItem, damagingEntity, damage);
    });
}