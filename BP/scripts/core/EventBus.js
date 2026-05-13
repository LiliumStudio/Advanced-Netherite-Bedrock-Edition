const _listeners = new Map();

export const EventBus = {
    on(event, handler) {
        if (!_listeners.has(event)) _listeners.set(event, new Set());
        _listeners.get(event).add(handler);
    },

    off(event, handler) {
        _listeners.get(event)?.delete(handler);
    },

    emit(event, data) {
        for (const handler of _listeners.get(event) ?? []) {
            try {
                handler(data);
            } catch (e) {
                console.warn(`[lsan:EventBus] Handler error on "${event}":`, e);
            }
        }
    },
};
