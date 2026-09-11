const systems = [];

export const Registry = {
    register(system) {
        if (typeof system?.onInit !== "function") {
            console.warn(`[lsan:Registry] System "${system?.name}" has no onInit — skipped.`);
            return;
        }
        systems.push(system);
    },

    init() {
        for (const system of systems) {
            try {
                system.onInit();
                console.log(`[lsan] ✓ ${system.name}`);
            } catch (error) {
                console.warn(`[lsan:Registry] Failed to init "${system.name}":`, error);
            }
        }
    },
};
