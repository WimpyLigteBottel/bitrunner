import { NS } from "@ns";
import { getAvailiableRam } from "/util/HackThreadUtil";
import { BATCH_DELAY, growScriptName, HOST_HACK_V3, print, SINGLE_BATCH_V3, singleBatcherName, weakenScriptName } from "/util/HackConstants";
import { findServerStats } from "/util/Find";


export type PrepServerModel = {
    availableMoney: number;
    maxMoney: number;
    currentSecurity: number;
    minSecurity: number;
}


export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    const targetHost: string = ns.args[0] as string
    const currentHost = ns.getHostname();

    while (true) {
        await ns.sleep(100) // safety sleep
        await blockTillAllWeakensAreDonePrep(ns, currentHost, targetHost)
        if (await prepServer(ns, targetHost, currentHost)) {
            break
        }

        ns.print("INFO \n", JSON.stringify(findServerStats(ns, targetHost), null, 2))
    }


    await ns.sleep(5000)
    ns.killall(currentHost, true)

    if (currentHost == "home") {
        ns.exec(HOST_HACK_V3, currentHost, 1)
    }
    ns.spawn(SINGLE_BATCH_V3, { spawnDelay: 1000, }, targetHost)
}

export async function prepServer(ns: NS, targetHost: string, currentHost: string) {
    await blockTillAllWeakensAreDonePrep(ns, currentHost, targetHost)

    const model = getServerPrepModel(ns, targetHost)

    if (isPrepped(model)) {
        ns.print(`Server is fully prepped! ${targetHost} by ${ns.getHostname()}`);
        return true
    }

    let host = ns.getHostname()


    if (!isSecurityPrepped(model)) {
        let threads = maxPossibleThreads(ns, host);
        threads = Math.min(threads, Math.ceil((ns.getServerSecurityLevel(targetHost)) / ns.weakenAnalyze(1))) || 1
        ns.exec(weakenScriptName, host, threads, targetHost, 0, threads);
    }

    if (!isMoneyPrepped(model)) {
        let delay = 0
        const threads = maxPossibleThreads(ns, host) || 1;
        ns.exec(growScriptName, host, threads, targetHost, delay, threads);
    }


    return false;
}


export function getServerPrepModel(ns: NS, target: string, host: string = ns.getHostname()): PrepServerModel {
    const availableMoney = ns.getServerMoneyAvailable(target); // Current money
    const maxMoney = ns.getServerMaxMoney(target); // Max money
    const currentSecurity = ns.getServerSecurityLevel(target); // Current security level
    const minSecurity = ns.getServerMinSecurityLevel(target); // Min security level


    let neededGrowThreads = ns.formulas.hacking.growThreads(ns.getServer(target), ns.getPlayer(), maxMoney, ns.getServer(host).cpuCores)
    let threads = maxPossibleThreads(ns, host);


    let weakenThreads = Math.floor(ns.growthAnalyzeSecurity(threads, target) / ns.weakenAnalyze(1)) || 0;
    let growThreads = Math.min(neededGrowThreads, threads) || 1

    if (growThreads < 1) {
        // ns.tprint(`ERROR growThreads is broken ${growThreads} | host: ${host} | target: ${target}`)
    }

    if (weakenThreads < 1 || growThreads < 1) {
        weakenThreads = Math.min(threads, Math.ceil((currentSecurity) / ns.weakenAnalyze(1))) || 1
    }

    if (weakenThreads < 1) {
        weakenThreads = 1
        // ns.tprint(`ERROR weakenThreads is broken ${weakenThreads} | host: ${host}  | target: ${target}`)
    }

    return {
        availableMoney,
        maxMoney,
        currentSecurity,
        minSecurity,
    }
}


function maxPossibleThreads(ns: NS, host: string) {
    return Math.floor(getAvailiableRam(ns, host, 1) / ns.getScriptRam(weakenScriptName))
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
        await ns.sleep(500)
        scripts = ns.ps(currentHost).filter(x => x.filename.includes("weak") || x.filename.includes("grow"))
    }
    ns.print("Continuing with run")
}

export async function blockTillAllWeakensAreDonePrep(ns: NS, currentHost: string, targetHost: string) {
    let scripts = ns.ps(currentHost).filter(x => x.filename.includes("weak") || x.filename.includes("grow"))
    while (scripts.length > 0) {
        if (isPrepped(getServerPrepModel(ns, targetHost, currentHost))) {
            break;
        }

        await ns.sleep(500)
        scripts = ns.ps(currentHost).filter(x => x.filename.includes("weak") || x.filename.includes("grow"))
    }
    ns.print("Continuing with run")
}