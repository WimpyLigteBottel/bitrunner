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

    return Array.from(servers);
}


/** 
 * @param ns 
 * @param withParent 
 * @param homeServersOnly 
 * @returns 
 */
export function findAllServers(ns: NS, withParent: boolean = false, homeServersOnly: boolean = true) {
    let servers = findAllServersWithParent(ns, withParent).sort((a, b) => a.host.localeCompare(b.host))
    if (homeServersOnly) {
        return servers.filter(x => x.host.includes("home"))
    }

    return servers
}

export function findAllServersHome(ns: NS) {
    return findAllServers(ns, false, true)
}

export function prepServersForHack(ns: NS) {
    findAllServers(ns, false, false)
        .filter(x => ns.hasRootAccess(x.host) && !x.host.includes("home"))
        .forEach((server) => {
            let copy = ns.scp(ALL_SCRIPTS_TO_COPY, server.host, "home")
            if (!copy) {
                ns.tprint(`FAILED to copy all to ${server.host}`)
            };
        })

    findAllServers(ns, false, false)
        .filter(x => x.host.includes("home"))
        .forEach((server) => {
            let copy = ns.scp(ALL_SCRIPTS_TO_COPY, server.host, "home")
            if (!copy) {
                ns.tprint(`FAILED to copy all to ${server.host}`)
            };
        })
}


function debugCopy(ns: NS, serverHost: string) {
    ALL_SCRIPTS_TO_COPY.forEach(x => {
        let copy = ns.scp(x, serverHost, "home")
        if (!copy) {
            ns.tprint(`FAILED to copy ${x} to ${serverHost}`)
        };
    })
}