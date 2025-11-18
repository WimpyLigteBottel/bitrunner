import { NS } from "@ns";
import { TASK_NAME, Task } from "/models/Models";


export function creatWeakenThreads(ns: NS, targetHost: string, growthThreads: number, hackThreads: number) {
    let hackIncrease = ns.hackAnalyzeSecurity(hackThreads);
    let growIncrease = ns.growthAnalyzeSecurity(growthThreads);

    let weakenAnalyze = ns.weakenAnalyze(1)

    let weakenNeeded1 = Math.ceil(growIncrease / weakenAnalyze);
    let weakenNeeded2 = Math.ceil(hackIncrease / weakenAnalyze);

    let totalThreads = weakenNeeded1 + weakenNeeded2;

    return {
        time: ns.getWeakenTime(targetHost),
        delay: 0,
        name: TASK_NAME.w,
        script: "base/weaken.js",
        threads: totalThreads,
        cost: totalThreads * ns.getScriptRam("base/weaken.js"),
    } as Task;
}
