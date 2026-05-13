export const MATERIALS = [
    {
        tag: "lsan:iron",
        protections: ["lsan:phantom_immune"],
        loreKey: "lsan.material.iron",
    },
    {
        tag: "lsan:gold",
        protections: ["lsan:piglin_immune"],
        loreKey: "lsan.material.gold",
    },
    {
        tag: "lsan:emerald",
        protections: ["lsan:enderman_immune"],
        loreKey: "lsan.material.emerald",
    },
    {
        tag: "lsan:diamond",
        protections: ["lsan:phantom_immune", "lsan:piglin_immune", "lsan:enderman_immune"],
        loreKey: "lsan.material.diamond",
    },
];

export const ALL_PROTECTION_TAGS = [...new Set(MATERIALS.flatMap(m => m.protections))];

export const ARMOR_SLOTS = ["Head", "Chest", "Legs", "Feet"];
