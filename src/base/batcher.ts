import { NS } from "@ns";
import { Batch, RequestType } from "/models/Models";
import { createBatch } from "./batching/create-batch";


export function createBatchOptimal(
    ns: NS,
    targetHost: string,
    availableRam: number
): Batch {

    let requestType = getBatchType(ns,targetHost)

    let low = 0;
    let high = 1;  // guarantee upper bound exceeds feasible size

    // Start with the smallest possible batch (0)
    let bestBatch = createBatch(ns, targetHost, 0.001, availableRam, requestType);

    let lastk = 0
    try {
        for (let i = 0; i < 30; i++) {
            const mid = (low + high) / 2;

            lastk = mid
            const batch = createBatch(ns, targetHost, mid, availableRam, requestType);

            if (batch.totalCost < availableRam) {
                bestBatch = batch;  // mid fits
                low = mid;

            } else {
                high = mid;         // too large, shrink
            }
        }
    } catch (e) {
        ns.print('WARN failing batch -> ' + e)
    }

    return bestBatch;
}


function getBatchType(ns: NS, targetHost: string): RequestType {

    return 'PREP'

    let server = ns.getServer(targetHost)

    if (server.hackDifficulty! > server.minDifficulty!) {
        return "WEAKEN"
    }


    if (server.moneyMax! > server.moneyAvailable!) {
        return "PREP"
    }
    return "HACK"
}