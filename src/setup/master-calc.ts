import { NS } from "@ns";
import { getAvailableRam } from "../util/availableram";
import { createBatchOptimal } from "/base/batcher";
import { disableLogs, pTime } from "../models/debug";
import { BUFFER, CustomServerV2 } from "/models/Models";
import { getCustomServer } from "/util/serverCustomStats";
import { notPreppedServers } from "/util/preppedServers";
import { getKnownServers } from "/util/find";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  ns.ui.openTail();

  ns.exec("setup/setup.js", "home", 1);
  ns.exec("util/killall.js", "home", 1);

  let counter = 0;
  while (true) {
    await ns.sleep(1000);
    let target = getTargetServer(ns);
    let firstWeakenFinish = performance.now() + target.weakTime;
    let offset = 0;

    // let pid = ns.exec("util/analyze.js", "home", 1, target.hostname);
    // ns.ui.moveTail(0, 0, pid);
    while (true) {
      try {
        let server = await nextUsableServer(ns);
        let batch = createBatchOptimal(ns, target.hostname, server);

        for (const task of batch.tasks) {
          const additionalMsec = Math.max(
            0,
            firstWeakenFinish + offset - performance.now() - task.time
          );

          ns.exec(
            task.script,
            server.hostname,
            task.threads,
            batch.server,
            additionalMsec,
            `Threads ${task.threads}`
          );
          offset += BUFFER;
        }
      } catch (e) {
        if (
          e instanceof Error &&
          e.message == "There is no more servers to execute on"
        ) {
          ns.print(
            "Going to wait now " +
              `${pTime(ns, target.weakTime + offset)} for ${
                target.hostname
              }`
          );

          let timeToWakeUp = performance.now() + target.weakTime + offset;
          while (performance.now() < timeToWakeUp) {
            await ns.sleep(1000);
          }

          let script = ns.getRunningScript();
          let currentMoneyPerSecond =
            script?.onlineMoneyMade! / script?.onlineRunningTime!;
          ns.print(
            `Current production ${ns.formatNumber(currentMoneyPerSecond)}`
          );

          break;
        }

        counter++;
        ns.print(`ERROR counter:${counter} -> ${e}`);
        await ns.sleep(5000);
      }
    }
    // ns.ui.closeTail(pid);
    // ns.kill(pid);
  }
}

function getTargetServer(ns: NS) {
  if (ns.args[0] != undefined && ns.args[0] != "") {
    return getCustomServer(ns, ns.args[0] as string);
  }

  return notPreppedServers(ns).pop()!;
}

async function nextUsableServer(ns: NS): Promise<CustomServerV2> {
  let target = getTargetServer(ns);
  let servers = findServersThatCanBeUsed(ns).toSorted(
    (b, a) => a.availableRam - b.availableRam
  );

  for (const x of servers) {
    let batch = createBatchOptimal(ns, target.hostname, x).totalCost;

    let noScriptsRunning = getAvailableRam(ns, x.hostname) > batch;
    if (noScriptsRunning) {
      return x;
    }
  }

  throw Error("There is no more servers to execute on");
}

function findServersThatCanBeUsed(ns: NS) {
  // return ns.getPurchasedServers().toSorted().map(server => getCustomServer(ns, server.hostname))
  return getKnownServers(ns, false)
    .map((server) => getCustomServer(ns, server.hostname))
    .filter((server) => !server.hostname.includes("hacknet"))
    .filter((server) => server.canExecuteScripts)
    .filter((server) => getAvailableRam(ns, server.hostname) > 1.75 * 3);
}
