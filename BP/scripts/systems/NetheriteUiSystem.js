import { world, system } from "@minecraft/server";

const hudData = { title: {}, subtitle: {}, time: {} };
const hudQueue = { title: {}, subtitle: {} };

export const NetheriteUiSystem = {
    name: "NetheriteUiSystem",

    onInit() {
        system.afterEvents.scriptEventReceive.subscribe((event) => {
            const { sourceEntity: player, id: identifier, message } = event;
            if (!player || player.typeId !== "minecraft:player") return;

            const id = player.id;
            const dataId = identifier.split(":")[1];

            try {
                JSON.parse(message);
            } catch (error) {
                return;
            }

            if (!hudData.title[id]) {
                hudData.title[id] = {};
                hudData.time[id] = {};
                hudQueue.title[id] = [];
            }

            if (hudData.title[id][dataId] !== message) {
                hudData.title[id][dataId] = message;
                hudData.time[id][dataId] = system.currentTick;
                hudQueue.title[id].push(dataId);
            }
        }, { namespaces: ["lsan_title"] });

        system.afterEvents.scriptEventReceive.subscribe((event) => {
            const { sourceEntity: player, id: identifier, message } = event;
            if (!player || player.typeId !== "minecraft:player") return;

            const id = player.id;
            const dataId = identifier.split(":")[1];

            try {
                JSON.parse(message);
            } catch (error) {
                return;
            }

            if (!hudData.subtitle[id]) {
                hudData.subtitle[id] = {};
                hudQueue.subtitle[id] = [];
            }

            if (hudData.subtitle[id][dataId] !== message) {
                hudData.subtitle[id][dataId] = message;
                hudQueue.subtitle[id].push(dataId);
            }
        }, { namespaces: ["lsan_subtitle"] });

        system.runInterval(() => {
            system.runJob(function* () {
                for (const player of world.getAllPlayers()) {
                    const id = player.id;
                    const title = hudData.title[id] ?? {};
                    const subtitle = hudData.subtitle[id] ?? {};
                    const time = hudData.time[id] ?? {};

                    if (Object.keys(title).length === 0) continue;

                    let setTitle = "";
                    let option = { stayDuration: 0, fadeInDuration: 0, fadeOutDuration: 0, subtitle: "" };

                    const queue = hudQueue.title[id] ?? [];
                    const index = queue[0] ?? "";

                    if (title[index]) {
                        setTitle = JSON.parse(title[index]);
                        queue.splice(0, 1);
                    } else {
                        for (const dataId of Object.keys(title)) {
                            if (time[dataId] && system.currentTick - time[dataId] > 20) {
                                queue.push(dataId);
                                time[dataId] = system.currentTick + (Math.random() * 10);
                            }
                            if (Math.random() < 0.5) break;
                        }
                    }

                    if (Object.keys(subtitle).length > 0) {
                        const localQueue = hudQueue.subtitle[id] ?? [];
                        const localIndex = localQueue[0] ?? "";

                        if (subtitle[localIndex] || subtitle[index]) {
                            option.subtitle = localQueue.length === 0 
                                ? JSON.parse(subtitle[index]) 
                                : JSON.parse(subtitle[localIndex]);
                            localQueue.splice(0, 1);
                        }
                    }

                    if (setTitle !== "") {
                        try {
                            player.onScreenDisplay.setTitle(setTitle, option);
                        } catch (e) {
                            // Fail silently
                        }
                    }
                    yield;
                }
            }());
        }, 1);

        world.afterEvents.playerLeave.subscribe((event) => {
            const id = event.playerId;
            delete hudData.title[id];
            delete hudData.subtitle[id];
            delete hudData.time[id];
            delete hudQueue.title[id];
            delete hudQueue.subtitle[id];
        });
    }
};
