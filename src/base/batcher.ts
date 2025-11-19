import { NS } from "@ns";
import { Batch, RequestType } from "/models/Models";
import { createBatch } from "./batching/create-batch";
import { getCustomServer } from "/util/serverCustomStats";


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
    let growT = bestBatch.tasks.find(x => x.name == 'g')
    let weakT = bestBatch.tasks.find(x => x.name == 'w')





    if (hackT != null) {
        let hackAmount = ns.hackAnalyze(targetHost) * hackT!.threads * ns.getServer(targetHost).moneyMax!
        let growAmount = ns.formulas.hacking.growAmount(ns.getServer(targetHost), ns.getPlayer(), hackT!.threads)

        ns.print({
            percentage: bestBatch.percentage,
            hackAmount: ns.formatNumber(hackAmount),
            growAmount: ns.formatNumber(growAmount),
        })
    }


    // ns.print(JSON.stringify(bestBatch, null, 1))

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