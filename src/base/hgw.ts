import { NS } from "@ns";
import { createBatchOptimal } from "./batcher";




export async function main(ns: NS): Promise<void> {
  let targetHost = ns.args[0] as string
  let availiableRam = remainingServerRam(ns, ns.getHostname())

  let batch = createBatchOptimal(ns, targetHost, availiableRam)


  
  batch.tasks.forEach(task => {
    ns.run(task.script, task.threads, batch.server, task.delay)
  });

  ns.print(JSON.stringify(batch, null, 2))
}


function remainingServerRam(ns: NS, host: string): number {
  return ns.getServerMaxRam(host) - ns.getServerUsedRam(host)
}
