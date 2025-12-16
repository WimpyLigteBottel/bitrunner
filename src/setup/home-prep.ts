import { NS } from "@ns";
import { createBatchOptimal } from "/base/batcher";
import { disableLogs } from "../models/debug";
import { getCustomServer } from "/util/serverCustomStats";
import { notPreppedServers } from "/util/preppedServers";
import { BUFFER } from "/models/Models";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  ns.ui.openTail();

  ns.exec("setup/setup.js", "home", 1);

  let target = findNextServerToPrep(ns);
  let currentTarget = target.hostname;

  let pids = [];

  ns.exec("util/profits.js", "home", 1);
  let pid2 = ns.exec("util/analyze.js", "home", 1, target.hostname);
  pids.push(pid2);

  let counter = 0;
  while (true) {
    let target = findNextServerToPrep(ns);

    if (currentTarget != target.hostname) {
      ns.print("New target " + target.hostname);
      pids.forEach((x) => {
        ns.ui.closeTail(x);
        ns.kill(x);
      });
      currentTarget = target.hostname;

      pids = [];
    }

    ns.print(target.hostname + " is my next target");

    let server = getCustomServer(ns, "home");
    let firstWeakenFinish = performance.now() + target.weakTime;
    let offset = 0;
    try {
      let batch = await createBatchOptimal(ns, target.hostname, server);

      for (const task of batch.tasks) {
        const additionalMsec = Math.max(
          0,
          firstWeakenFinish + offset - performance.now() - task.time
        );

        ns.exec(
          task.script,
          server.hostname,
          task.threads,
          // arguments
          batch.server, // target
          additionalMsec, // sleep
          true, // affect stock
          `Threads ${task.threads}`
        );
      }

      await ns.sleep(target.weakTime + BUFFER * 3);
    } catch (e) {
      counter++;
      ns.print(`ERROR counter:${counter} -> ${e}`);
      await ns.sleep(target.weakTime + 5000);
    }
  }
}

function findNextServerToPrep(ns: NS) {
  if (ns.args[0] != undefined && ns.args[0] != "") {
    return getCustomServer(ns, ns.args[0] as string);
  }

  let counter = 2;

  if (ns.args[1] != undefined) {
    counter = ns.args[1] as number;
  }

  let servers = notPreppedServers(ns);

  while (counter > 1) {
    servers.pop();
    counter--;
  }

  return servers.pop()!;
}
