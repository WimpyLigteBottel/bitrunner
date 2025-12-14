import { NS } from "@ns";
import { getAvailableRam } from "../util/availableram";
import { createBatchOptimal } from "/base/batcher";
import { disableLogs, openTail, pTime } from "../models/debug";
import { BUFFER, CustomServerV2 } from "/models/Models";
import { getCustomServer } from "/util/serverCustomStats";
import { notPreppedServers } from "/util/preppedServers";
import { getKnownServers } from "/util/find";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  openTail(ns, true);

  // Restarting hack grow on home
  ns.scriptKill("base/hack.js", "home");
  ns.scriptKill("base/grow.js", "home");
  ns.scriptKill("base/weaken.js", "home");

  ns.exec("setup/setup.js", "home", 1);

  // kill other scripts on other services
  ns.exec("util/killall.js", "home", 1);

  let counter = 0;
  while (true) {
    await ns.sleep(1); // to prevent hainging calls a second
    let target = getTargetServer(ns);
    let firstWeakenFinish = performance.now() + target.weakTime;
    let offset = 0;

    while (true) {
      await ns.sleep(1); // to prevent hainging calls a second

      try {
        let server = await nextUsableServer(ns);
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
            batch.server,
            additionalMsec,
            `Threads ${task.threads}`
          );
          offset += BUFFER;
        }
      } catch (e) {
        let shouldExit = await noMoreServers(ns, e as Error, target, offset);
        if (shouldExit) {
          currentProductionByScript(ns);
          break;
        }

        counter++;
        ns.print(`ERROR counter:${counter} -> ${e}`);
        await ns.sleep(5000);
      }
    }
  }
}

async function noMoreServers(
  ns: NS,
  e: Error,
  target: CustomServerV2,
  offset: number
) {
  if (e.message != "There is no more servers to execute on") {
    return false;
  }

  let time = pTime(ns, target.weakTime + offset);
  ns.print(`Going to wait now ${time} for ${target.hostname}`);

  await ns.sleep(target.weakTime + offset);

  return true;
}

function currentProductionByScript(ns: NS) {
  let script = ns.getRunningScript();
  let currentMoneyPerSecond =
    script?.onlineMoneyMade! / script?.onlineRunningTime!;
  ns.print(`Current production ${ns.formatNumber(currentMoneyPerSecond)}`);
}

function getTargetServer(ns: NS) {
  if (ns.args[0] != undefined && ns.args[0] != "") {
    return getCustomServer(ns, ns.args[0] as string);
  }

  return notPreppedServers(ns).pop()!;
}

async function nextUsableServer(ns: NS): Promise<CustomServerV2> {
  let target = getTargetServer(ns);
  let servers = findServersThatCanBeUsed(ns)
    .filter((x) => x.availableRam > x.maxRam * 0.1)
    .toSorted((b, a) => a.availableRam - b.availableRam);

  // ns.print(target.hostname,servers.map(x=>x.hostname))

  for (const x of servers) {
    let batch = await createBatchOptimal(ns, target.hostname, x);
    let cost = batch.totalCost;

    let noScriptsRunning = x.availableRam >= cost;
    if (noScriptsRunning) {
      return x;
    }
  }

  throw Error("There is no more servers to execute on");
}

function findServersThatCanBeUsed(ns: NS) {
  return getKnownServers(ns, false)
    .map((server) => getCustomServer(ns, server.hostname))
    .filter((server) => server.hostname.includes("home"))
    .filter(
      (server) => server.canExecuteScripts || server.hostname.includes("home")
    )
    .filter((server) => server.availableRam > 1.75 * 3);
}
