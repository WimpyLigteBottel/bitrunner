import { NS } from "@ns";
import { disableLogs } from "/base/debug";


export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.ui.openTail()

    while (true) {
        ns.clearLog()
        let s = ns.getServer(ns.args[0] as string)
        ns.print(JSON.stringify(s,null,2))
        await ns.sleep(10)
    }
}
