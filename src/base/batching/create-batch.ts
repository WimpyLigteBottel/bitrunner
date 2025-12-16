import { NS } from "@ns";
import { Batch, BUFFER, CustomServerV2, RequestType } from "/models/Models";
import { createGrowThreads } from "./createGrowThreads";
import { createHackThreads } from "./createHackThreads";
import { creatWeakenThreads } from "./creatWeakenThreads";
import { TASK_NAME, Task, buildBatch } from "/models/Models";

export function createBatch(
  ns: NS,
  targetHost: string,
  targetPercentage: number,
  requestType: RequestType,
  server: CustomServerV2
): Batch {
  switch (requestType) {
    case "HACK":
      return hgwBatch(ns, targetHost, targetPercentage, server);
    case "WEAKEN":
      return weakenBatch(ns, targetHost, targetPercentage, server);
    case "PREP":
      return prepBatch(ns, targetHost, targetPercentage, server);
  }
}

export function hgwBatch(
  ns: NS,
  targetHost: string,
  targetPercentage: number,
  server: CustomServerV2
): Batch {
  let hackTask = createHackThreads(ns, targetHost, targetPercentage);
  let growTask = createGrowThreads(ns, targetHost, targetPercentage, server);
  let weakenTask = creatWeakenThreads(
    ns,
    targetHost,
    growTask.threads,
    hackTask.threads
  );

  return {
    tasks: [hackTask, growTask, weakenTask],
    server: targetHost,
    totalCost: hackTask.cost + growTask.cost + weakenTask.cost,
    percentage: targetPercentage,
  };
}

function prepBatch(
  ns: NS,
  targetHost: string,
  targetPercentage: number,
  server: CustomServerV2
): Batch {
  let growTask = createGrowThreads(ns, targetHost, targetPercentage, server);
  let weakenTask = creatWeakenThreads(ns, targetHost, growTask.threads, 1);

  return buildBatch([weakenTask, growTask], targetHost, targetPercentage);
}

function weakenBatch(
  ns: NS,
  targetHost: string,
  targetPercentage: number,
  server: CustomServerV2
) {
  let target = ns.getServer(targetHost);

  let toWeaken = (target.hackDifficulty ?? 0) - (target.minDifficulty ?? 0);

  let weakenTask = {
    time: ns.getWeakenTime(targetHost),
    delay: 0,
    name: TASK_NAME.W,
    script: "base/weaken.js",
    threads: Math.ceil(toWeaken / ns.weakenAnalyze(1)),
    cost: toWeaken * ns.getScriptRam("base/weaken.js"),
  } as Task;

  let batch = prepBatch(ns, targetHost, targetPercentage, server);

  batch.tasks[0].delay = batch.tasks[0].delay + BUFFER * 2;
  batch.tasks[1].delay = batch.tasks[1].delay + BUFFER * 2;
  batch.tasks[1].threads = batch.tasks[1].threads - weakenTask.threads;

  let tasks = [weakenTask, batch.tasks[0], batch.tasks[1]];

  return buildBatch(tasks, targetHost, targetPercentage);
}
