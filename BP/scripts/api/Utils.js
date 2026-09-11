import {
    EntityEquippableComponent,
    EntityTypeFamilyComponent,
    EquipmentSlot,
} from "@minecraft/server";

export function subscribeIfAvailable(signal, handler) {
    if (typeof signal?.subscribe !== "function") return false;
    signal.subscribe(handler);
    return true;
}

export function getEquippable(entity) {
    try {
        return entity.getComponent(EntityEquippableComponent.componentId) ?? null;
    } catch {
        return null;
    }
}

export function getHandItem(entity) {
    return getEquippable(entity)?.getEquipment(EquipmentSlot.Mainhand) ?? null;
}

export function getContainer(entity) {
    return entity.getComponent("minecraft:inventory")?.container ?? null;
}

export function hasFamily(entity, family) {
    try {
        const component = entity.getComponent(EntityTypeFamilyComponent.componentId);
        return component?.hasTypeFamily(family) ?? false;
    } catch {
        return false;
    }
}

export function isPlayer(entity) {
    return entity?.typeId === "minecraft:player";
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
