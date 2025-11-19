import { NS } from "@ns";
import { TASK_NAME, Task } from "/models/Models";


export function createGrowThreads(ns: NS, targetHost: string, targetPercentage: number) {
    const buffer = 100; // ms safety margin

    const maxMoney = ns.getServerMaxMoney(targetHost);
    const availableMoney = maxMoney * (1 - targetPercentage);

    let threads = Math.ceil(ns.growthAnalyze(targetHost, maxMoney / availableMoney));
    threads = Math.max(1, threads);

    const tGrow = ns.getGrowTime(targetHost);
    const tWeaken = ns.getWeakenTime(targetHost);

    if (threads < 1) {
        throw Error(`Zero grow threads ${targetHost}:${targetPercentage}`)
    }

    return {
        time: tGrow,
        delay: tWeaken - tGrow - buffer, // ⭐ correct for single-cycle HGW
        name: TASK_NAME.g,
        script: "base/grow.js",
        threads: threads,
        cost: threads * ns.getScriptRam("base/grow.js"),
    } as Task;
}
