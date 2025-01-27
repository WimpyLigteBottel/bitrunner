import { EquipmentStats, NS } from "@ns"

export type Equipment = {
    cost: number
    name: string
} & EquipmentStats

export function getAllEquipment(ns: NS): Equipment[] {
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
