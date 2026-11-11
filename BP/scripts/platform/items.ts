import {
    EnchantmentType,
    EntityEquippableComponent,
    EntityTypeFamilyComponent,
    EquipmentSlot,
    ItemComponentTypes,
    ItemStack,
} from "@minecraft/server";
import type { Container, Entity } from "@minecraft/server";
import type { ItemSnapshot } from "../core/conversion.js";

export function getEquippable(entity: Entity): EntityEquippableComponent | null {
    try {
        return entity.getComponent(EntityEquippableComponent.componentId) ?? null;
    } catch {
        return null;
    }
}

export function getHandItem(entity: Entity): ItemStack | null {
    return getEquippable(entity)?.getEquipment(EquipmentSlot.Mainhand) ?? null;
}

export function getOffhandItem(entity: Entity): ItemStack | null {
    return getEquippable(entity)?.getEquipment(EquipmentSlot.Offhand) ?? null;
}

export function getContainer(entity: Entity): Container | null {
    return entity.getComponent("minecraft:inventory")?.container ?? null;
}

export function hasFamily(entity: Entity, family: string): boolean {
    try {
        const component = entity.getComponent(EntityTypeFamilyComponent.componentId);
        return component?.hasTypeFamily(family) ?? false;
    } catch {
        return false;
    }
}

export function itemTags(item: ItemStack): Set<string> {
    return new Set(item.getTags());
}

export function enchantLevel(item: ItemStack, id: string): number {
    try {
        return item.getComponent(ItemComponentTypes.Enchantable)?.getEnchantment(id)?.level ?? 0;
    } catch {
        return 0;
    }
}

export function snapshotItem(item: ItemStack): ItemSnapshot {
    const dynamicProperties: Record<string, string | number | boolean> = {};
    for (const key of item.getDynamicPropertyIds()) {
        const v = item.getDynamicProperty(key);
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            dynamicProperties[key] = v;
        }
    }
    const snapshot: ItemSnapshot = {
        typeId: item.typeId,
        lore: item.getLore(),
        enchantments: [],
        dynamicProperties,
    };
    if (item.nameTag !== undefined) snapshot.nameTag = item.nameTag;
    const durability = item.getComponent(ItemComponentTypes.Durability);
    if (durability) snapshot.damage = durability.damage;
    const enchantable = item.getComponent(ItemComponentTypes.Enchantable);
    if (enchantable) {
        for (const e of enchantable.getEnchantments()) {
            snapshot.enchantments.push({ id: e.type.id, level: e.level });
        }
    }
    return snapshot;
}

export function applySnapshot(s: ItemSnapshot): ItemStack {
    const item = new ItemStack(s.typeId, 1);
    if (s.nameTag !== undefined) item.nameTag = s.nameTag;
    item.setLore(s.lore);
    for (const [k, v] of Object.entries(s.dynamicProperties)) item.setDynamicProperty(k, v);
    if (s.damage !== undefined) {
        const durability = item.getComponent(ItemComponentTypes.Durability);
        if (durability) durability.damage = s.damage;
    }
    const enchantable = item.getComponent(ItemComponentTypes.Enchantable);
    if (enchantable) {
        for (const e of s.enchantments) {
            try {
                enchantable.addEnchantment({ type: new EnchantmentType(e.id), level: e.level });
            } catch {
                console.warn(`[lsan] skipped enchantment ${e.id}`);
            }
        }
    }
    return item;
}
