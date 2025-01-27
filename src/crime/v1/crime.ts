import { EquipmentStats, NS } from "@ns";
import { print } from "/util/HackConstants";
import { Equipment, getAllEquipment } from "./equipment";
import { accendMembersAndTrain } from "./accend";


export async function main(ns: NS) {
    ns.clearLog()
    ns.disableLog(`ALL`)
    ns.tail()


    let memberName = `9bf7412d-aea5-4632-8179-28b26ed01449`
    // print(ns, `${JSON.stringify(ns.gang.getMemberInformation(memberName), undefined, 1)}`)
    print(ns, `${JSON.stringify(ns.gang.getAscensionResult(memberName), undefined, 1)}`)
    
    accendMembersAndTrain(ns)
    upgradeMembers(ns)
    

}


function upgradeMembers(ns: NS) {
    let equipments: Equipment[] = getAllEquipment(ns)


    equipments.forEach((equipment: Equipment) => {
        for (const name of ns.gang.getMemberNames()) {
            let result = ns.gang.purchaseEquipment(name, equipment.name)

            if (result) {
                print(ns, `UPGRADED!: ${JSON.stringify({ memberName: name, equipName: equipment.name })}`)
            }
        }
    });
}