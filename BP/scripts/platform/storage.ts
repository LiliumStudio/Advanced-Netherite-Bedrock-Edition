export function readJson(target: { getDynamicProperty(k: string): unknown }, key: string): string | undefined {
    const v = target.getDynamicProperty(key);
    return typeof v === "string" ? v : undefined;
}

export function writeJson(
    target: { setDynamicProperty(k: string, v?: string): void },
    key: string,
    value: unknown,
): void {
    target.setDynamicProperty(key, JSON.stringify(value));
}
