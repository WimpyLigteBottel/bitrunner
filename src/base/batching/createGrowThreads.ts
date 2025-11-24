import { NS } from "@ns";
import { BUFFER, CustomServerV2, TASK_NAME, Task } from "/models/Models";

export function createGrowThreads(
  ns: NS,
  targetHost: string,
  targetPercentage: number,
  server: CustomServerV2
) {
  const maxMoney = ns.getServerMaxMoney(targetHost);
  const availableMoney = maxMoney * (1 - targetPercentage);

  let multi = maxMoney / availableMoney;

  let threads = ns.growthAnalyze(
    targetHost,
    multi,
    ns.getServer(server.hostname).cpuCores
  );
  threads = Math.ceil(threads);
  threads = Math.max(1, threads);

  const tGrow = ns.getGrowTime(targetHost);
  const tWeaken = ns.getWeakenTime(targetHost);

  if (threads < 1) {
    throw Error(`Zero grow threads ${targetHost}:${targetPercentage}`);
  }

  return {
    time: tGrow,
    delay: tWeaken - tGrow - BUFFER, // ⭐ correct for single-cycle HGW
    name: TASK_NAME.g,
    script: "base/grow.js",
    threads: threads,
    cost: threads * ns.getScriptRam("base/grow.js"),
  } as Task;
}
