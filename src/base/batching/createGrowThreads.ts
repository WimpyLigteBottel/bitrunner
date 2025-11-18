import { NS } from "@ns";
import { TASK_NAME, Task } from "/models/Models";


export function createGrowThreads(ns: NS, targetHost: string, targetPercentage: number) {
    const maxMoney = ns.getServerMaxMoney(targetHost);
    const availableMoney = maxMoney * (1 - targetPercentage);

    let growThreads = Math.ceil(ns.growthAnalyze(targetHost, maxMoney / availableMoney));
    growThreads = Math.max(1, growThreads)

    return {
        time: ns.getGrowTime(targetHost), // timeIt will take to execute
        delay: ns.getWeakenTime(targetHost) - ns.getGrowTime(targetHost) - 100, // that start delay of thread
        name: TASK_NAME.g, // Name of thread
        script: "base/grow.js",
        threads: growThreads,
        cost: growThreads * ns.getScriptRam("base/grow.js"),
    } as Task;
}
