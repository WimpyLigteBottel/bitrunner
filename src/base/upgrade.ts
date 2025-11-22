import { NS } from "@ns";
import { getCustomServer } from "/util/serverCustomStats";

export async function main(ns: NS): Promise<void> {

    ns.ui.openTail()


    while (ns.getPurchasedServers().length < 25) {
        await ns.sleep(1000)
        if (ns.getPurchasedServerCost(32) < ns.getPlayer().money) {
            let bought = ns.getPurchasedServers().map(x => getCustomServer(ns, x))
            let counter = bought.length

            ns.purchaseServer('home-' + counter, 32)
        }
    }


    let lowest = lowestServer(ns)!
    while (lowest.maxRam < 1048576) {
        await ns.sleep(100)


        if (canAfford(ns, lowest.maxRam * 2)) {
            ns.upgradePurchasedServer(lowest?.hostname, lowest?.maxRam * 2)
        }
        lowest = lowestServer(ns)!
        ns.print(lowest.hostname)
    }

}

function canAfford(ns: NS, amount: number) {
    return ns.getPurchasedServerCost(amount) < ns.getPlayer().money
}


function lowestServer(ns: NS) {
    let bought = ns.getPurchasedServers().map(x => getCustomServer(ns, x)).toSorted((b, a) => a.maxRam - b.maxRam)

    return bought.pop()
}


