type Task<P> = {
    period: number;
    phase: number;
    fn: (p: P) => void;
    name: string;
};

/**
 * Spreads per-player work over `period` ticks. Each tick processes the slice
 * [floor(phase*n/period), floor((phase+1)*n/period)) of the player list, so with
 * a stable list every player is handled exactly once per period (at most
 * ceil(n/period) per tick). Uses one shared runInterval for all tasks.
 */
export class PlayerScheduler<P extends { id: string; isValid: boolean }> {
    private readonly tasks: Task<P>[] = [];
    private started = false;

    constructor(
        private readonly getPlayers: () => P[],
        private readonly runInterval: (fn: () => void, ticks: number) => number,
    ) {}

    every(periodTicks: number, task: (p: P) => void): void {
        const period = Math.max(1, Math.floor(periodTicks));
        this.tasks.push({ period, phase: 0, fn: task, name: task.name || `task${this.tasks.length}` });
        if (!this.started) {
            this.started = true;
            this.runInterval(() => this.tick(), 1);
        }
    }

    private tick(): void {
        const players = this.getPlayers();
        const n = players.length;
        for (const t of this.tasks) {
            const start = Math.floor((t.phase * n) / t.period);
            const end = Math.floor(((t.phase + 1) * n) / t.period);
            t.phase = (t.phase + 1) % t.period;
            for (let i = start; i < end; i++) {
                const p = players[i];
                if (!p || !p.isValid) continue;
                try {
                    t.fn(p);
                } catch (e) {
                    console.warn(`[lsan] ${t.name}:`, e);
                }
            }
        }
    }
}
