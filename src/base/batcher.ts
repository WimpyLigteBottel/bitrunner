import { NS } from "@ns";
import { Batch, RequestType } from "/models/Models";
import { createBatch } from "./batching/create-batch";

export function createBatchOptimal(
    ns: NS,
    targetHost: string,
    availableRam: number
): Batch {

    let requestType = getBatchType(ns, targetHost)

    let low = 0;     // definitely fits
    let high = 1;    // probably too big, but serves as the upper bound

    let bestBatch = createBatch(ns, targetHost, low, availableRam, requestType);

    try {
        // 20–30 iterations = enough precision
        for (let i = 0; i < 30; i++) {
            let mid: string | number = ((low + high) / 2).toFixed(3);
            mid = parseFloat(mid)
            const batch = createBatch(ns, targetHost, mid, availableRam, requestType);

            if (batch.totalCost <= availableRam) {
                bestBatch = batch;
                low = mid;
            } else {
                // mid too big -> reduce
                high = mid;
            }
        }
    } catch (er) {
        ns.print('ERROR ' + er)
    }

    let hackT = bestBatch.tasks.find(x => x.name == 'h')


    if (hackT != undefined) {
        let growT = bestBatch.tasks.find(x => x.name == 'g')!
        let weakT = bestBatch.tasks.find(x => x.name == 'w')!
        if (growT.threads <= 0 || weakT.threads <= 0 || hackT.threads <= 0) {
            ns.print("WARN " + JSON.stringify(bestBatch, null, 1))
        }
    }


    return bestBatch;
}


function getBatchType(ns: NS, targetHost: string): RequestType {
    let server = ns.getServer(targetHost)

    if (server.hackDifficulty! > server.minDifficulty!) {
        return "WEAKEN"
    }

    if (server.moneyMax! > server.moneyAvailable!) {
        return "PREP"
    }

    return "HACK"
}