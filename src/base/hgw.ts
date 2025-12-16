import { NS } from "@ns";
import { createBatchOptimal } from "./batcher";
import { disableLogs } from "../models/debug";
import { BUFFER } from "/models/Models";
import { getCustomServer } from "/util/serverCustomStats";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  let targetHost = ns.args[0] as string;
  let currentServer = getCustomServer(ns, ns.getHostname());
  let batch = await createBatchOptimal(ns, targetHost, currentServer);

  batch.tasks.forEach((task) => {
    ns.exec(
      task.script,
      currentServer.hostname,
      task.threads,
      // arguments
      batch.server, // target
      task.delay, // sleep
      true, // affect stock
      `Threads ${task.threads}`
    );
  });

  let longestDelay = batch.tasks.find((x) => x.name == "w")!.time;

  ns.spawn(
    ns.getScriptName(),
    { threads: 1, spawnDelay: longestDelay + BUFFER },
    targetHost
  );
}
