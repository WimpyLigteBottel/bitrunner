import { NS } from "@ns";
import { calculateFullCycleThreads, Task } from "./batcher";
import { print } from "/util/HackConstants";
import { findBestHackConstantToGenerateMoney } from "./hwg-caluclator";

export class HackWeakGrowTask {
    target: string = "";
    host: string = "";
    ramLimit: number = 0;
}

export interface RespondThreads {
    intededServer: string
    tasks: Task[]
    hackPercentage: number
    totalCost: number
}

export const HOST_LISTENER = 10000
export const NULL_VALUE = 'NULL PORT DATA'
export const LISTENER_PORT = 10001

const disableLog = (ns: NS) => {
    ns.disableLog("sleep")
    ns.disableLog("getServerMaxRam")
    ns.disableLog("getServerMaxMoney")
    ns.disableLog("getServerUsedRam")
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("getServerMinSecurityLevel")
    ns.disableLog("getServerSecurityLevel")
}

export async function main(ns: NS): Promise<void> {
    ns.tprint(`Start hacking host`)
    disableLog(ns)

    let text = `
    1. Clear ListenerPort
    2. Clear HostPort
    `;

    let input = await ns.prompt(text, { type: "text" }) as string
    if (input.includes("1")) {
        ns.clearPort(LISTENER_PORT)
    }

    if (input.includes("2")) {
        ns.clearPort(HOST_LISTENER)
    }
    ns.clearLog()

    while (true) {
        await ns.sleep(100) // Safety sleep

        let task = await getNextTask(ns)

        if (task == undefined) {
            continue
        }

        respond(ns, task)
    }
}

export function shiftTaskToBackOfQueue(ns: NS) {
    ns.writePort(LISTENER_PORT, JSON.stringify(ns.readPort(LISTENER_PORT)))
}

function respond(ns: NS, task: HackWeakGrowTask) {
    let highestPercentage = findBestHackConstantToGenerateMoney(ns, task.target, task.host)
    let threads = calculateFullCycleThreads(ns, task.target, highestPercentage)

    let tasks = [threads.hack, threads.grow, threads.weaken]
    const totalCost = totalRamCost(ns, tasks)

    let response = {
        intededServer: task.host,
        tasks: tasks,
        hackPercentage: highestPercentage,
        totalCost: totalCost,
    } as RespondThreads

    ns.writePort(LISTENER_PORT, JSON.stringify(response))

    print(ns, `SENT TASK TO ${JSON.stringify(response)} on ${LISTENER_PORT}`, true)
}

async function getNextTask(ns: NS): Promise<HackWeakGrowTask | undefined> {
    await sleepWaitingForData(ns, HOST_LISTENER)
    let task = JSON.parse(ns.readPort(HOST_LISTENER))

    if (rejectInvalidTask(task)) {
        print(ns, `INVALID TASK ${task}`)
        return undefined
    }

    print(ns, `RECEIVED TASK ${JSON.stringify(task)}`, false)

    return task
}


async function sleepWaitingForData(ns: NS, port: number) {
    while (ns.peek(port) == NULL_VALUE) {
        await ns.sleep(100)
    }
}

function rejectInvalidTask(data: any) {
    return data instanceof HackWeakGrowTask
}

function totalRamCost(ns: NS, threads: Task[]): number {
    let tasks: number[] = threads.map(x => x.threads * ns.getScriptRam(x.script))

    return tasks.reduce((acc, value) => acc + value)
}