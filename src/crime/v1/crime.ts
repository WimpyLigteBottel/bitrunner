import { NS } from "@ns";
import { print } from "/util/HackConstants";
import { upgradeMembers } from "./equipment";
import { accendMembersAndTrain } from "./accend";
import { activateWareFare, assignJobs } from "./gang";
import { recruitMembers } from "./recruit";


export async function main(ns: NS) {
    ns.clearLog()
    ns.disableLog(`ALL`)
    ns.tail()


    print(ns, `${JSON.stringify(ns.getPlayer(), undefined, 1)}`)
    print(ns, `${JSON.stringify(ns.gang.getGangInformation(), undefined, 1)}`)

    while (true) {
        await ns.sleep(1 * 1000)
        recruitMembers(ns) // safe
        upgradeMembers(ns) // can be disabled if ram to high
        activateWareFare(ns) // can be disabled if ram to high
        assignJobs(ns)
        accendMembersAndTrain(ns)
    }
}


