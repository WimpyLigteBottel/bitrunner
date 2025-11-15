import { NS } from "@ns";
import { createBatchOptimal } from "./batcher";
import { disableLogs } from "./debug";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns)
  let targetHost = ns.args[0] as string
  let availiableRam = remainingServerRam(ns, ns.getHostname())

  let batch = createBatchOptimal(ns, targetHost, availiableRam)

  batch.tasks.forEach(task => {
    ns.run(task.script, task.threads, batch.server, task.delay)
  });

  let longestDelay = batch.tasks.find(x => x.name == 'w')!.time 

  ns.spawn(ns.getScriptName(), {threads: 1, spawnDelay: longestDelay + 500}, targetHost)
}


function remainingServerRam(ns: NS, host: string): number {
  return ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
}
