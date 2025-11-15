export let DEBUG = false
import { NS } from "@ns";



export function printDone(ns: NS, name: string) {
    if (DEBUG) {
        ns.tprint(`${name} - ${new Date().toISOString()}`)
    }
}

export function disableLogs(ns: NS){
    ns.disableLog("getServerMaxRam")
    ns.disableLog("getServerUsedRam")
    ns.disableLog("getServerMaxMoney")
    ns.clearLog()
}