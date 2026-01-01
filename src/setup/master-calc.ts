import { NS } from "@ns";
import { createBatchOptimal } from "/base/batcher";
import { disableLogs, openTail, pTime } from "../models/debug";
import { BUFFER, CustomServerV2, TASK_NAME } from "/models/Models";
import { getCustomServer } from "/util/serverCustomStats";
import { notPreppedServers } from "/util/preppedServers";
import { getKnownServers } from "/util/find";
import { isTrendingUp } from "/stock/stock-utils";

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
    ns.clearLog();
    await ns.sleep(1); // to prevent hainging calls a second
    let target = getTargetServer(ns);
    let firstWeakenFinish = performance.now() + target.weakTime;
    let offset = 0;
    let affectStock = isStockAndIsTrendingUp(ns, target.hostname);

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
            // arguments
            batch.server, // target
            additionalMsec, // sleep
            task.name == affectStock, // affect stock
            `Threads ${task.threads}`
          );
          offset += BUFFER;
        }
      } catch (e) {
        let shouldExit = await noMoreServers(ns, e as Error, target, offset);
        if (shouldExit) {
          currentProductionByScript(ns);
          offset = 0;
          break;
        }

        counter++;
        ns.print(`ERROR counter:${counter} -> ${e}`);
        await ns.sleep(5000);
      }
    }
  }
}

/**
 *
 * @param ns This is to indicate if stock market should be affected
 * @param hostname
 * @returns
 */
function isStockAndIsTrendingUp(ns: NS, hostname: string) {
  const trend = isTrendingUp(ns, hostname);

  if (trend == undefined) {
    return undefined
  } else if (trend) {
    return TASK_NAME.g;
  } else if (!trend) {
    return TASK_NAME.h;
  }

  return undefined;
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

  await ns.sleep(target.weakTime + offset + BUFFER);

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
    .filter((server) => !server.hostname.includes("hacknet"))
    .filter((server) => server.hostname.includes("home"))
    .filter(
      (server) => server.canExecuteScripts || server.hostname.includes("home")
    )
    .filter((server) => server.availableRam > 1.75 * 10);
}
