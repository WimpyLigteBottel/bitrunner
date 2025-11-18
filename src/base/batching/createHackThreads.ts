import { NS } from "@ns";
import { Task, TASK_NAME } from "/models/Models";

export function createHackThreads(ns: NS, targetHost: string, targetPercentage: number): Task {
    let hackAmount = ns.getServerMaxMoney(targetHost) * targetPercentage;
    let threads = ns.hackAnalyzeThreads(targetHost, hackAmount);

    threads = Math.ceil(threads)
    threads = Math.max(1, threads)

    return {
        time: ns.getHackTime(targetHost), // timeIt will take to execute
        delay: ns.getWeakenTime(targetHost) - ns.getHackTime(targetHost) - 200, // that start delay of thread
        name: TASK_NAME.h, // Name of thread
        script: "base/hack.js",
        threads: threads,
        cost: threads * ns.getScriptRam("base/hack.js"),
    } as Task;
}
