import { NS } from "@ns";
import { Batch, BUFFER } from "/models/Models";
import { createBatchOptimal } from "/base/batcher";
import { getCustomServer } from "./serverCustomStats";
import { getKnownServers } from "./find";
import { disableLogs } from "/models/debug";
import { isPrepped } from "./preppedServers";

export async function main(ns: NS): Promise<void> {
  disableLogs(ns);
  ns.clearLog();
  // ns.ui.openTail()
  let servers = getKnownServers(ns)
    .map((x) => getCustomServer(ns, x.hostname))
    .filter((x) => x.canHack)
    .toSorted((a, b) => a.hacktime - b.hacktime);

  let stats: Stat[] = [];

  for (const server of servers) {
    try {
      const first = await createBatchOptimal(
        ns,
        server.hostname,
        getCustomServer(ns, "home")
      );

      // Correct full cycle time (weaken finishes last)
      const stat = calculateFullCycleMoneyPerSecond(ns, first);

      if (first == undefined || stat == undefined || stat.moneyPerSecond < 1) {
        continue;
      }

      stats.push(stat);
    } catch (e) {
      ns.print(`Failed to do ${server.hostname}`);
    }
  }

  stats = stats.toSorted((b, a) => a.moneyPerSecond - b.moneyPerSecond);

  for (let stat of stats) {
    ns.print(
      `${stat.server} -> Money p/s: $${ns.formatNumber(stat.moneyPerSecond)}`
    );
  }

  ns.write("profits.txt", toPretty(stats), "w");
}

/** @param {NS} ns **/
export function calculateFullCycleMoneyPerSecond(
  ns: NS,
  batch: Batch
): Stat | undefined {
  const maxMoney = ns.getServerMaxMoney(batch.server);
  const hackChance = ns.hackAnalyzeChance(batch.server);

  if (maxMoney === 0 || hackChance === 0) return undefined;

  // Hack threads
  const hackAmount = maxMoney * batch.percentage;

  const weakenTime = ns.getWeakenTime(batch.server);

  // Correct full cycle time (weaken finishes last)
  const fullCycleTime = weakenTime + BUFFER;

  // Expected money per cycle
  const moneyPerCycle = hackAmount * hackChance;

  // Correct money per second
  const moneyPerSecond = moneyPerCycle / (fullCycleTime / 1000);

  return {
    server: batch.server,
    fullCycleTime: ns.tFormat(fullCycleTime),
    moneyPerCycle: moneyPerCycle,
    moneyPerSecond: moneyPerSecond,
    totalRamCost: batch.totalCost,
    percentage: batch.percentage,
    prepped: isPrepped(ns, batch.server),
  } as Stat;
}

type Stat = {
  server: string;
  moneyPerSecond: number;
  totalRamCost: number;
  percentage: number;
  prepped: boolean;
};

function toPretty(stats: Stat[]) {
  let pretty = stats.map((x) => {
    return {
      server: x.server,
      moneyPerSecond: x.moneyPerSecond,
      totalRamCost: x.totalRamCost,
      percentage: x.percentage,
      prepped: x.prepped
    };
  });
  return JSON.stringify(pretty, null, 1);
}
