const listeners = new Map();

export const EventBus = {
    on(event, handler) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(handler);
    },

    emit(event, data) {
        for (const handler of listeners.get(event) ?? []) {
            try {
                handler(data);
            } catch (error) {
                console.warn(`[lsan:EventBus] Handler error on "${event}":`, error);
            }
        }
    },
};
