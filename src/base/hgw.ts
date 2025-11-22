import { NS } from "@ns";
import { createBatchOptimal } from "./batcher";
import { disableLogs } from "../models/debug";
import { BUFFER } from "/models/Models";
import { getCustomServer } from "/util/serverCustomStats";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns)
  let targetHost = ns.args[0] as string
  let availiableRam = getCustomServer(ns,'home').availableRam

  let batch = createBatchOptimal(ns, targetHost, availiableRam)

  batch.tasks.forEach(task => {
    ns.run(task.script, task.threads, batch.server, task.delay)
  });

  let longestDelay = batch.tasks.find(x => x.name == 'w')!.time 

  ns.spawn(ns.getScriptName(), {threads: 1, spawnDelay: longestDelay + BUFFER}, targetHost)
}