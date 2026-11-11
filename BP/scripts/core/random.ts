export interface Rng {
    next(): number;
}

export function rollChance(rng: Rng, p: number): boolean {
    return rng.next() < p;
}

export function randomInt(rng: Rng, min: number, max: number): number {
    return Math.floor(rng.next() * (max - min + 1)) + min;
}
