import { NS } from "@ns";



export function getAvailableRam(ns: NS, host: string): number {
    return ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
}
