import { NS } from "@ns";
import { ALL_SCRIPTS_TO_COPY } from "./HackConstants";

export interface HostObj {
    host: string,
    depth: number,
    parent?: HostObj
}

function findAllServersWithParent(ns: NS, withParent: boolean = true) {
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
                queue.push({ host: neighbor, parent: undefined, depth: obj.depth + 1 })
            }
            visited.add(obj.host)
        });
    }

    return Array.from(servers).sort((a, b) => a!.host.localeCompare(b.host)).sort((a, b) => a!.host.length - b!.host.length);
}


export function findAllServers(ns: NS, withParent: boolean = false, homeServersOnly: boolean = true) {
    let servers = findAllServersWithParent(ns, withParent)
    if (homeServersOnly) {
        return servers.filter(x => x.host.includes("home"))
    }

    return servers
}

export function prepServersForHack(ns: NS) {
    findAllServers(ns, false, false)
        .forEach((server) => {
            ns.scp(ALL_SCRIPTS_TO_COPY, server.host, "home");
        })

    findAllServers(ns, false, true)
        .forEach((server) => {
            ns.scp(ALL_SCRIPTS_TO_COPY, server.host, "home");
        })
}