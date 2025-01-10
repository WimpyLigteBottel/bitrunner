import { NS } from "@ns";

interface HostObj {
    host: string,
    depth: number,
    parent?: HostObj
}

export function findAllServers(ns: NS, withParent: boolean = true) {
    const servers: HostObj[] = [];
    const visited = new Set<string>();
    const queue: HostObj[] = [{ host: "home", depth: 0 }];

    while (queue.length > 0) {
        const obj = queue.pop()!;

        if (visited.has(obj.host))
            continue;


        servers.push(obj)

        ns.scan(obj.host).forEach((neighbor) => {

            if (withParent) {
                queue.push({ host: neighbor, parent: obj, depth: obj.depth + 1 })
            } else {
                queue.push({ host: neighbor, parent: obj, depth: obj.depth + 1 })
            }
            visited.add(obj.host)
        });
    }

    return Array.from(servers).sort((a, b) => a!.depth - b!.depth).sort((a, b) => a!.host.localeCompare(b.host));
}