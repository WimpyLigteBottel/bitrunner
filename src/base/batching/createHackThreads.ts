import { NS } from "@ns";
import { BUFFER, Task, TASK_NAME } from "/models/Models";

export function createHackThreads(
  ns: NS,
  targetHost: string,
  targetPercentage: number
): Task {
  const tHack = ns.getHackTime(targetHost);
  const tWeaken = ns.getWeakenTime(targetHost);

  const players = ns.getPlayer();
  const server = ns.getServer(targetHost);

  let threads = Math.floor(
    targetPercentage / ns.formulas.hacking.hackPercent(server, players)
  );
  threads = Math.max(1, threads);

  if (threads < 1) {
    throw Error(`Zero hack threads ${targetHost}:${targetPercentage}`);
  }

  return {
    time: tHack,
    delay: tWeaken - tHack - 2 * BUFFER, // ⭐ Correct Hack Delay for HGW
    name: TASK_NAME.h,
    script: "base/hack.js",
    threads: threads,
    cost: threads * ns.getScriptRam("base/hack.js"),
  } as Task;
}
