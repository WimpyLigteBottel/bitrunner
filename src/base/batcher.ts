import { NS } from "@ns";
import { Batch, RequestType } from "/models/Models";
import { createBatch } from "./batching/create-batch";


export function createBatchOptimal(
    ns: NS,
    targetHost: string,
    availableRam: number
): Batch {

    let requestType = getBatchType(ns, targetHost)

    // Start with the smallest possible batch (0)
    let bestBatch = createBatch(ns, targetHost, 0.001, availableRam, requestType);

    try {
        for (let i = 1; i < 1000; i++) {
            const batch = createBatch(ns, targetHost, i / 1000, availableRam, requestType);

            if (batch.totalCost < availableRam) {
                bestBatch = batch;  // mid fits
            }
        }
    } catch (e) {
        ns.print('WARN failing batch -> ' + e)
    }

    return bestBatch;
}


function getBatchType(ns: NS, targetHost: string): RequestType {

    // return 'PREP'

    let server = ns.getServer(targetHost)

    if (server.hackDifficulty! > server.minDifficulty!) {
        return "WEAKEN"
    }


    if (server.moneyMax! > server.moneyAvailable!) {
        return "PREP"
    }
    return "HACK"
}