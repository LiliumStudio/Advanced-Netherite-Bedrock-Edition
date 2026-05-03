<<<<<<< HEAD
import { Entity, EntityEquippableComponent, EntityTypeFamilyComponent, EquipmentSlot, ItemStack } from "@minecraft/server";

export class EntityUtils {
    /**
     * @param {Entity} entity
     * @returns {ItemStack}
     */
    static getHandItem(entity) {
        /** @type {EntityEquippableComponent} */
        const component = entity.getComponent(EntityEquippableComponent.componentId);
        return component.getEquipment(EquipmentSlot.Mainhand) ?? new ItemStack("minecraft:air", 1);
    }

    /**
     * @param {Entity} entity
     * @param {string} family
     * @returns {boolean}
     */
    static hasFamily(entity, family) {
        const familyComponent = entity.getComponent(EntityTypeFamilyComponent.componentId);
        if (familyComponent) {
            return familyComponent.hasTypeFamily(family);
        }
        return false;
    }
=======
import { Entity, EntityEquippableComponent, EntityTypeFamilyComponent, EquipmentSlot, ItemStack } from "@minecraft/server";

export class EntityUtils {
    /**
     * @param {Entity} entity
     * @returns {ItemStack}
     */
    static getHandItem(entity) {
        /** @type {EntityEquippableComponent} */
        const component = entity.getComponent(EntityEquippableComponent.componentId);
        return component.getEquipment(EquipmentSlot.Mainhand) ?? new ItemStack("minecraft:air", 1);
    }

    /**
     * @param {Entity} entity
     * @param {string} family
     * @returns {boolean}
     */
    static hasFamily(entity, family) {
        const familyComponent = entity.getComponent(EntityTypeFamilyComponent.componentId);
        if (familyComponent) {
            return familyComponent.hasTypeFamily(family);
        }
        return false;
    }
>>>>>>> 97914f8 (Update: Spearsand lang)
}