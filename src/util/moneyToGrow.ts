import { NS } from "@ns";



export function getMoneyToGrow(ns: NS, host: string): number {
    return ns.getServerMaxMoney(host) - ns.getServerMoneyAvailable(host)
}
