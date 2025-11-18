import { NS } from "@ns";
import { Batch, RequestType } from "/models/Models";
import { createGrowThreads } from "./createGrowThreads";
import { createHackThreads } from "./createHackThreads";
import { creatWeakenThreads } from "./creatWeakenThreads";
import { TASK_NAME, Task, buildBatch } from "/models/Models";


export function createBatch(ns: NS, targetHost: string, targetPercentage: number, availableRam: number, requestType: RequestType): Batch {
    switch (requestType) {
        case "HACK":
            return hgwBatch(ns, targetHost, targetPercentage)
        case "WEAKEN":
            return weakenBatch(ns, targetHost, targetPercentage, availableRam)
        case "PREP":
            return prepBatch(ns, targetHost, targetPercentage)
    }
}


export function hgwBatch(ns: NS, targetHost: string, targetPercentage: number): Batch {
    let hackTask = createHackThreads(ns, targetHost, targetPercentage);
    let growTask = createGrowThreads(ns, targetHost, targetPercentage);
    let weakenTask = creatWeakenThreads(ns, targetHost, growTask.threads, hackTask.threads);

    return {
        tasks: [hackTask, growTask, weakenTask],
        server: targetHost,
        totalCost: hackTask.cost + growTask.cost + weakenTask.cost,
        percentage: targetPercentage
    };
}

function prepBatch(ns: NS, targetHost: string, targetPercentage: number): Batch {
    let growTask = createGrowThreads(ns, targetHost, targetPercentage);
    let weakenTask = creatWeakenThreads(ns, targetHost, growTask.threads, 1);

    return buildBatch([weakenTask, growTask], targetHost, targetPercentage);
}


function weakenBatch(ns: NS, targetHost: string, targetPercentage: number, availableRam: number) {
    let totalThreads = Math.floor(availableRam / ns.getScriptRam("base/weaken.js"));

    let weakenTask = {
        time: ns.getWeakenTime(targetHost),
        delay: 0,
        name: TASK_NAME.w,
        script: "base/weaken.js",
        threads: totalThreads,
        cost: totalThreads * ns.getScriptRam("base/weaken.js"),
    } as Task;

    return buildBatch([weakenTask], targetHost, targetPercentage);
}