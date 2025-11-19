export let DEBUG = false
import { NS } from "@ns";



export function printDone(ns: NS, name: string, target: string) {
    if (DEBUG) {
        ns.tprint(`${name} - ${new Date().toISOString()} - ${target}`)
    }
}

export function disableLogs(ns: NS) {
    ns.disableLog("run")
    ns.disableLog('getServerMaxRam')
    ns.disableLog('getServerUsedRam')
    ns.disableLog('getServerSecurityLevel')
    ns.disableLog('getServerMinSecurityLevel')
    ns.disableLog('scan')
    ns.disableLog('sleep')
    ns.disableLog('getServerMaxMoney')
    ns.disableLog('getServerMoneyAvailable')
    ns.disableLog('exec')
    ns.disableLog('killall')
    ns.clearLog()
}