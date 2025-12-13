import { NS } from "@ns";
import { Batch, CustomServerV2, RequestType } from "/models/Models";
import { createBatch } from "./batching/create-batch";
import { DEBUG } from "/models/debug";

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
    for (let i = 0; i < 10; i++) {
      let mid: string | number = ((low + high) / 2).toFixed(4);
      mid = parseFloat(mid);
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
    await ns.sleep(1)
    ns.print("ERROR " + er);
  }

  return updateBatch(ns, bestBatch);
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

const updateBatch = (ns: NS, bestBatch: Batch): Batch => {
  let hack = findTask(bestBatch, "h");
  let weaken = findTask(bestBatch, "w");
  let grow = findTask(bestBatch, "g");

  if(bestBatch.server == "n00dles")
    return bestBatch

  if (hack?.threads == 1 || hack?.threads! >= grow?.threads!) {
    if (DEBUG) {
      ns.print(
        "WARN seems like hack is greater than grow which means i might not grow it properly"
      );
    }

    let tasks = [];

    if (grow != undefined) tasks.push(grow);
    if (weaken != undefined) tasks.push(weaken);

    return { ...bestBatch, tasks };
  }

  return bestBatch;
};
