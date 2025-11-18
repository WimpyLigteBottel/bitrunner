import { NS } from "@ns"
import { disableLogs } from "/base/debug"
import { getKnownServers } from "./find"

export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.clearLog()
    // ns.ui.openTail()

    getKnownServers(ns)
        .filter(x => x.hostname != 'home')
        .forEach(x => {
            ns.killall(x.hostname)
        })
}