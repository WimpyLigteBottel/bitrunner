import { Infiltration, InfiltrationLocation, NS } from "@ns";


export async function main(ns: NS) {

    ns.clearLog()
    ns.tail()

    let locations = ns.infiltration.getPossibleLocations();

    let data: InfiltrationLocation[] = []
    locations.forEach(x => {
        try {
            data.push((ns.infiltration.getInfiltration(x.name) || "empty"))
        } catch (error) {
        }
    })

    data = data.sort((b,a)=> a.difficulty - b.difficulty)
    data.forEach((x) => {
        ns.print(JSON.stringify(x, undefined, 1))
    })
}