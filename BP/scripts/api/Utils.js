import {
    EntityEquippableComponent,
    EntityTypeFamilyComponent,
    EquipmentSlot,
} from "@minecraft/server";

export function getHandItem(entity) {
    try {
        const comp = entity.getComponent(EntityEquippableComponent.componentId);
        return comp?.getEquipment(EquipmentSlot.Mainhand) ?? null;
    } catch {
        return null;
    }
}

export function hasFamily(entity, family) {
    try {
        const comp = entity.getComponent(EntityTypeFamilyComponent.componentId);
        return comp?.hasTypeFamily(family) ?? false;
    } catch {
        return false;
    }
}

export function getEquippable(entity) {
    return entity.getComponent(EntityEquippableComponent.componentId) ?? null;
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rollChance(probability) {
    return Math.random() < probability;
}

export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
