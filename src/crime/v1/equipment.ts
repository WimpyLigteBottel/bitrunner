import { EquipmentStats, NS } from "@ns"
import { print } from "/util/HackConstants"

export type Equipment = {
    cost: number
    name: string
} & EquipmentStats


export function upgradeMembers(ns: NS) {
    let equipments: Equipment[] = getAllEquipment(ns)
    equipments.forEach((equipment: Equipment) => {
        for (const name of ns.gang.getMemberNames()) {
            let result = ns.gang.purchaseEquipment(name, equipment.name)

            if (result) {
                print(ns, `UPGRADED!: ${JSON.stringify({ memberName: name, equipName: equipment.name })}`, true)
            }
        }
    });
}

function getAllEquipment(ns: NS): Equipment[] {
    let equipments: Equipment[] = []

    for (const equipName of ns.gang.getEquipmentNames()) {
        let equipStats = ns.gang.getEquipmentStats(equipName)
        let cost = ns.gang.getEquipmentCost(equipName)
        let object: Equipment = { cost: cost, name: equipName, ...equipStats }
        equipments.push(object)
    }

    equipments = equipments.sort((a: Equipment, b: Equipment) => a.cost - b.cost)

    return equipments
}
