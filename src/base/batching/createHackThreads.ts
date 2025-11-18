import { NS } from "@ns";
import { Task, TASK_NAME } from "/models/Models";

export function createHackThreads(ns: NS, targetHost: string, targetPercentage: number): Task {
    const buffer = 100;

    const tHack = ns.getHackTime(targetHost);
    const tWeaken = ns.getWeakenTime(targetHost);

    const hackAmount = ns.getServerMaxMoney(targetHost) * targetPercentage;
    let threads = Math.ceil(ns.hackAnalyzeThreads(targetHost, hackAmount));
    threads = Math.max(1, threads);

    return {
        time: tHack,
        delay: tWeaken - tHack - 2 * buffer,   // ⭐ Correct Hack Delay for HGW
        name: TASK_NAME.h,
        script: "base/hack.js",
        threads: threads,
        cost: threads * ns.getScriptRam("base/hack.js"),
    } as Task;
}
