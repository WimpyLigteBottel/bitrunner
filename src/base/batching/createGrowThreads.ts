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

  if (multi == Infinity) {
    throw Error("Cant grow this much");
  }

  let threads = ns.growthAnalyze(targetHost, multi);

  // Safety scaling by hack percentage
  if (targetPercentage >= 0.75) {
    threads *= 2.0; // 100% extra for 75%+ hacks
  } else if (targetPercentage >= 0.5) {
    threads *= 1.5; // 50% extra for 50-75% hacks
  } else if (targetPercentage >= 0.25) {
    threads *= 1.25; // 25% extra for 25-50% hacks
  } else if (targetPercentage >= 0.1) {
    threads *= 1.15; // 15% extra for 10-25% hacks
  } else {
    threads *= 1.05; // 5% extra for <10% hacks
  }
  threads = Math.max(1, Math.floor(threads));

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
