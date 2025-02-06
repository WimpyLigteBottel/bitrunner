import { NS } from "@ns"
import { print } from "/util/HackConstants"



export function accendMembersAndTrain(ns: NS) {
    for (const name of ns.gang.getMemberNames()) {
        if (isGangMemberAccessionWorthIt(ns, name)) {
            if (ns.gang.ascendMember(name)) {
                print(ns, `MEMBER HAS ACCENDED!!! ${name}`)
                ns.gang.setMemberTask(name, `Train Combat`)
            }
        }
    }
}

function isGangMemberAccessionWorthIt(ns: NS, name: string) {
    let acsResult = ns.gang.getAscensionResult(name)

    let shouldUpgrade: boolean[] = []
    shouldUpgrade.push((acsResult?.agi ?? 1) > 1.2)
    shouldUpgrade.push((acsResult?.str ?? 1) > 1.2)
    shouldUpgrade.push((acsResult?.dex ?? 1) > 1.2)
    shouldUpgrade.push((acsResult?.def ?? 1) > 1.2)

    return shouldUpgrade.filter(x => x).length == 4
}
