const _systems = [];

export const Registry = {
    register(system) {
        if (typeof system?.onInit !== "function") {
            console.warn(`[lsan:Registry] System "${system?.name}" has no onInit — skipped.`);
            return;
        }
        _systems.push(system);
    },

    init() {
        for (const system of _systems) {
            try {
                system.onInit();
                console.log(`[lsan] ✓ ${system.name}`);
            } catch (e) {
                console.warn(`[lsan:Registry] Failed to init "${system.name}":`, e);
            }
        }
    },

    shutdown() {
        for (const system of [..._systems].reverse()) {
            try {
                system.onShutdown?.();
            } catch (e) {
                console.warn(`[lsan:Registry] Failed to shutdown "${system.name}":`, e);
            }
        }
    },
};
