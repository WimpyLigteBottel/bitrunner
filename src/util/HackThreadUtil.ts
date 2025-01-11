import { NS } from "@ns";
import { growScriptName, hackScriptName, weakenScriptName } from "./HackConstants";

export function getTotalCost(ns: NS, thread: number, script: string): number {
    return ns.getScriptRam(script) * Math.abs(thread)
}

export function getTotalCostThreads(ns: NS, hackThreads: number, weakenThreads: number, growThreads: number,): number {

    let hackCost = getTotalCost(ns, hackThreads, hackScriptName)
    let growCost = getTotalCost(ns, growThreads, growScriptName)
    let weakenCost = getTotalCost(ns, weakenThreads, weakenScriptName)
    return hackCost + growCost + weakenCost
}

export function getAvailiableRam(ns: NS, serverName: string, reserve: number = 10): number {
    return ns.getServerMaxRam(serverName) - reserve - ns.getServerUsedRam(serverName)
}
