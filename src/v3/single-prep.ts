import { NS } from "@ns";
import { getAvailiableRam } from "/util/HackThreadUtil";
import { growScriptName, singleBatcherName, weakenScriptName } from "/util/HackConstants";
import { findServerStats } from "/util/Find";


export type PrepServerModel = {
    availableMoney: number;
    maxMoney: number;
    currentSecurity: number;
    minSecurity: number;
    growThreads: number,
    weakenThreads: number
}


export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    const targetHost: string = ns.args[0] as string
    const currentHost = ns.getHostname();

    while (true) {
        await blockTillAllWeakensAreDone(ns, currentHost)
        if (await prepServer(ns, targetHost, currentHost)) {
            break
        }

        ns.print("INFO \n", JSON.stringify(findServerStats(ns, targetHost), null, 2))
    }


    ns.killall(currentHost, true)
    ns.spawn(singleBatcherName, { spawnDelay: 1000, }, targetHost)
}

export async function prepServer(ns: NS, targetHost: string, currentHost: string) {
    await blockTillAllWeakensAreDone(ns, currentHost)

    const model = getServerPrepModel(ns, targetHost)

    if (isPrepped(model)) {
        ns.tprint(`Server is fully prepped! ${targetHost} by ${ns.getHostname()}`);
        return true
    }

    if (!isMoneyPrepped(model)) {
        let delay = ns.getWeakenTime(targetHost) - ns.getGrowTime(targetHost)

        ns.exec(growScriptName, ns.getHostname(), model.growThreads, targetHost, delay, model.growThreads);

    }

    if (!isSecurityPrepped(model)) {
        ns.exec(weakenScriptName, ns.getHostname(), model.weakenThreads, targetHost, 0, model.weakenThreads);
    }

    return false;
}


export function getServerPrepModel(ns: NS, target: string, host: string = ns.getHostname()): PrepServerModel {
    const availableMoney = ns.getServerMoneyAvailable(target); // Current money
    const maxMoney = ns.getServerMaxMoney(target); // Max money
    const currentSecurity = ns.getServerSecurityLevel(target); // Current security level
    const minSecurity = ns.getServerMinSecurityLevel(target); // Min security level


    let neededGrowThreads = ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), maxMoney, ns.getServer("home").cpuCores)

    let threads = maxPossibleThreads(ns, host);

    if (threads >= neededGrowThreads) {
        threads = neededGrowThreads
    }

    let weakenThreads = Math.floor(ns.growthAnalyzeSecurity(threads, target) / ns.weakenAnalyze(1)) || 0;
    let growThreads = (threads - weakenThreads) || 2

    if (growThreads < 1) {
        ns.tprint(`ERROR growThreads is broken ${growThreads} | host: ${host} | target: ${target}`)
    }

    if (weakenThreads < 1) {
        weakenThreads = Math.ceil((currentSecurity) / ns.weakenAnalyze(1)) || threads
    }

    if (weakenThreads < 1) {
        ns.tprint(`ERROR weakenThreads is broken ${weakenThreads} | host: ${host}  | target: ${target}`)
    }

    return {
        availableMoney,
        maxMoney,
        currentSecurity,
        minSecurity,
        growThreads: growThreads,
        weakenThreads: weakenThreads
    }
}


function maxPossibleThreads(ns: NS, host: string) {
    return Math.floor(getAvailiableRam(ns, host, 1) / ns.getScriptRam(growScriptName))
}

export function isPrepped(model: PrepServerModel) {
    return isMoneyPrepped(model) && isSecurityPrepped(model)
}

export function isMoneyPrepped(model: PrepServerModel) {
    return model.availableMoney === model.maxMoney;
}

export function isSecurityPrepped(model: PrepServerModel) {
    return model.currentSecurity === model.minSecurity;
}

export async function blockTillAllWeakensAreDone(ns: NS, currentHost: string) {
    let scripts = ns.ps(currentHost).filter(x => x.filename.includes("weak") || x.filename.includes("grow"))
    while (scripts.length > 0) {
        await ns.sleep(1000)
        scripts = ns.ps(currentHost).filter(x => x.filename.includes("weak") || x.filename.includes("grow"))
    }
    ns.print("Continuing with run")
}