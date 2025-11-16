import { NS } from "@ns"
import { disableLogs } from "/base/debug"
import { ALL_SERVERS } from "/models/Servers"

export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.clearLog()
    // ns.ui.openTail()

    ALL_SERVERS.forEach(x => {
        ns.print(`'${x.toString()}',`)
        ns.killall(x.toString())
    })
}