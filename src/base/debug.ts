export let DEBUG = true
import { NS } from "@ns";



export function printDone(ns: NS, name: string) {
    if (DEBUG) {
        ns.tprint(`${name} - ${new Date().toISOString()}`)
    }
}