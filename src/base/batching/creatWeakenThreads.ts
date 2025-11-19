import { NS } from "@ns";
import { TASK_NAME, Task } from "/models/Models";


export function creatWeakenThreads(ns: NS, targetHost: string, growthThreads: number, hackThreads: number) {
    let hackIncrease = ns.hackAnalyzeSecurity(hackThreads);
    let growIncrease = ns.growthAnalyzeSecurity(growthThreads);

    let weakenAnalyze = ns.weakenAnalyze(1)

    let weakenNeeded1 = Math.ceil(growIncrease / weakenAnalyze);
    let weakenNeeded2 = Math.ceil(hackIncrease / weakenAnalyze);

    let threads = weakenNeeded1 + weakenNeeded2;

    if (threads < 1) {
        throw Error(`Zero weaken threads ${targetHost}:${growthThreads}:${hackThreads}`)
    }

    return {
        time: ns.getWeakenTime(targetHost),
        delay: 0,
        name: TASK_NAME.w,
        script: "base/weaken.js",
        threads: threads,
        cost: threads * ns.getScriptRam("base/weaken.js"),
    } as Task;
}
