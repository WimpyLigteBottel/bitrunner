import { NS } from "@ns";
import { Batch, CustomServerV2, RequestType } from "/models/Models";
import { createBatch } from "./batching/create-batch";

export async function createBatchOptimal(
  ns: NS,
  targetHost: string,
  server: CustomServerV2
): Promise<Batch> {
  let requestType = getBatchType(ns, targetHost);

  let low = 0; // definitely fits
  let high = 1; // probably too big, but serves as the upper bound

  let bestBatch = createBatch(ns, targetHost, low, requestType, server);

  try {
    // 20–30 iterations = enough precision
    for (let i = 0; i < 30; i++) {
      let mid: string | number = ((low + high) / 2).toFixed(4);
      mid = parseFloat(mid);

      // // this is safety clamp so that i dont hack too much and cause instability
      if (mid > 0.5 && requestType == "HACK") {
        mid = 0.5;
      }

      const batch = createBatch(ns, targetHost, mid, requestType, server);

      if (batch.totalCost <= server.availableRam) {
        bestBatch = batch;
        low = mid;
      } else {
        // mid too big -> reduce
        high = mid;
      }
    }
  } catch (er) {
    await ns.sleep(1);
    ns.print("ERROR " + er);
  }

  return bestBatch;
}

function getBatchType(ns: NS, targetHost: string): RequestType {
  let server = ns.getServer(targetHost);

  if (server.hackDifficulty! > server.minDifficulty!) {
    return "WEAKEN";
  }

  if (server.moneyMax! > server.moneyAvailable!) {
    return "PREP";
  }

  return "HACK";
}

const findTask = (batch: Batch, name: "h" | "g" | "w") => {
  return batch.tasks.find((x) => x.name == name);
};
