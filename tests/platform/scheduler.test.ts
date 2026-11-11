import { describe, expect, it, vi } from "vitest";
import { PlayerScheduler } from "../../BP/scripts/platform/scheduler.js";

type FakePlayer = { id: string; isValid: boolean };

function setup(players: FakePlayer[]) {
    let cb: (() => void) | undefined;
    let calls = 0;
    const sched = new PlayerScheduler<FakePlayer>(
        () => players,
        (fn, ticks) => {
            calls++;
            expect(ticks).toBe(1);
            cb = fn;
            return 1;
        },
    );
    const tick = (n: number) => {
        for (let i = 0; i < n; i++) cb!();
    };
    return { sched, tick, runIntervalCalls: () => calls };
}

const make = (n: number): FakePlayer[] =>
    Array.from({ length: n }, (_, i) => ({ id: `p${i}`, isValid: true }));

describe("PlayerScheduler", () => {
    it("processes each player exactly once per period", () => {
        const { sched, tick } = setup(make(5));
        const seen: string[] = [];
        sched.every(5, p => seen.push(p.id));
        tick(5);
        expect(seen.sort()).toEqual(["p0", "p1", "p2", "p3", "p4"]);
    });

    it("handles n not divisible by period", () => {
        const { sched, tick } = setup(make(7));
        const counts: Record<string, number> = {};
        sched.every(3, p => (counts[p.id] = (counts[p.id] ?? 0) + 1));
        tick(3);
        expect(Object.keys(counts)).toHaveLength(7);
        expect(Object.values(counts).every(c => c === 1)).toBe(true);
    });

    it("skips invalid players", () => {
        const players = make(5);
        players[2]!.isValid = false;
        const { sched, tick } = setup(players);
        const seen: string[] = [];
        sched.every(5, p => seen.push(p.id));
        tick(5);
        expect(seen).not.toContain("p2");
        expect(seen).toHaveLength(4);
    });

    it("keeps processing others when the task throws", () => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const { sched, tick } = setup(make(5));
        const seen: string[] = [];
        sched.every(5, p => {
            if (p.id === "p1") throw new Error("boom");
            seen.push(p.id);
        });
        tick(5);
        expect(seen).toHaveLength(4);
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it("uses a single runInterval for multiple tasks", () => {
        const { sched, tick, runIntervalCalls } = setup(make(2));
        const a: string[] = [];
        const b: string[] = [];
        sched.every(1, p => a.push(p.id));
        sched.every(2, p => b.push(p.id));
        tick(2);
        expect(runIntervalCalls()).toBe(1);
        expect(a).toHaveLength(4);
        expect(b.sort()).toEqual(["p0", "p1"]);
    });

    it("does nothing with no players", () => {
        const { sched, tick } = setup([]);
        const seen: string[] = [];
        sched.every(4, p => seen.push(p.id));
        tick(4);
        expect(seen).toEqual([]);
    });
});
