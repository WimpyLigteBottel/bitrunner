import { NS } from "@ns";
import { getAvailiableRam } from "/util/HackThreadUtil";
import { BATCH_DELAY, growScriptName, singleBatcherName, weakenScriptName } from "/util/HackConstants";
import { findServerStats } from "/util/Find";


export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    const targetHost: string = ns.args[0] as string

    ns.print(`WeakenTime ${ns.getWeakenTime(targetHost)} -> ${targetHost}`)


    while (true) {
        await ns.sleep(1000);
        const availableMoney = ns.getServerMoneyAvailable(targetHost); // Current money
        const maxMoney = ns.getServerMaxMoney(targetHost); // Max money
        const currentSecurity = ns.getServerSecurityLevel(targetHost); // Current security level
        const minSecurity = ns.getServerMinSecurityLevel(targetHost); // Min security level

        // Exit if the server is fully prepped
        if (availableMoney === maxMoney && currentSecurity === minSecurity) {
            ns.tprint(`Server is fully prepped! ${targetHost} by ${ns.getHostname()}`);
            break;
        }

        // Weaken first if security is above minimum
        if (availableMoney < maxMoney) {
            const availableRam = getAvailiableRam(ns, ns.getHostname(), 1);
            const scriptRam = ns.getScriptRam(weakenScriptName);
            const threads = Math.max(1, Math.floor(availableRam / scriptRam));
            const weakenThreads = Math.floor(ns.growthAnalyzeSecurity(threads) / ns.weakenAnalyze(1)) + 1;

            if (threads < 2 || weakenThreads < 1)
                continue

            ns.exec(weakenScriptName, ns.getHostname(), weakenThreads, targetHost, 0, weakenThreads);
            let delay = ns.getWeakenTime(targetHost) - ns.getGrowTime(targetHost)
            ns.exec(growScriptName, ns.getHostname(), threads - weakenThreads, targetHost, delay, threads - weakenThreads);
        } else {
            const availableRam = getAvailiableRam(ns, ns.getHostname(), 1);
            const scriptRam = ns.getScriptRam(weakenScriptName);
            const threads = Math.max(1, Math.floor(availableRam / scriptRam));

            if (threads == 1)
                continue
            weakenScriptName
            ns.exec(weakenScriptName, ns.getHostname(), threads, targetHost, 0, threads);
        }

        ns.print("INFO \n", JSON.stringify(findServerStats(ns, targetHost), null, 2))

    }


    ns.killall(ns.getHostname(), true)
    ns.spawn(singleBatcherName, { spawnDelay: 0, }, targetHost)
}