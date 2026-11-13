export function groupBy<T, K extends keyof T>(items: T[], key: K): Record<string, T[]> {
    const buckets = new Map<string, T[]>();

    for (const item of items) {
        const groupName = String(item[key]);
        const existingGroup = buckets.get(groupName);

        if (existingGroup) {
            existingGroup.push(item);
        } else {
            buckets.set(groupName, [item]);
        }
    }

    return Object.fromEntries(buckets);
}
