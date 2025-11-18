import { NS } from "@ns";
import { disableLogs } from "/base/debug";
import { findBestMoneyPerSecondServer } from "./find";
import { getCustomServer } from "./serverCustomStats";
import { preppedServers } from "./preppedServers";


export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.ui.openTail()

    await analyze(ns)
}


async function analyze(ns: NS) {
    let hostname = await ns.prompt('What server would you like to analyze?', {
        type: 'text'
    }) as any

    if (hostname == '') {
        hostname = findBestMoneyPerSecondServer(ns).hostname
        ns.print(hostname)
    }

    while (true) {
        ns.clearLog()

        ns.print(" ----------- ")

        let servers = preppedServers(ns).map((x) => {
            let newMap = { name: x.hostname, money: x.moneyMax }
            return newMap;
        }
        )

        ns.print(JSON.stringify(servers, null, 2))
        ns.print(" ----------- ")


        let s = getCustomServer(ns, hostname)

        ns.print(JSON.stringify(s, null, 2))
        await ns.sleep(50)
    }
}
