import { NS } from "@ns";
import { TASK_NAME, Task } from "/models/Models";


export function createGrowThreads(ns: NS, targetHost: string, targetPercentage: number) {
    const buffer = 100; // ms safety margin

    const maxMoney = ns.getServerMaxMoney(targetHost);
    const availableMoney = maxMoney * (1 - targetPercentage);

    let growThreads = Math.ceil(ns.growthAnalyze(targetHost, maxMoney / availableMoney));
    growThreads = Math.max(1, growThreads);

    const tGrow = ns.getGrowTime(targetHost);
    const tWeaken = ns.getWeakenTime(targetHost);

    return {
        time: tGrow,
        delay: tWeaken - tGrow - buffer, // ⭐ correct for single-cycle HGW
        name: TASK_NAME.g,
        script: "base/grow.js",
        threads: growThreads,
        cost: growThreads * ns.getScriptRam("base/grow.js"),
    } as Task;
}
