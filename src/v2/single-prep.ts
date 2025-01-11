import { NS } from "@ns";
import { getAvailiableRam } from "/util/HackThreadUtil";
import { BATCH_DELAY, singleBatcherName } from "/util/HackConstants";

export async function main(ns: NS): Promise<void> {
    ns.clearLog();
    ns.disableLog("ALL");
    // ns.tail();

    const targetHost: string = ns.args[0] as string

    ns.print(`WeakenTime ${ns.getWeakenTime(targetHost)} -> ${targetHost}`)

    // let currentFindPid = ns.exec("test.js", "home", 1, targetHost)

    // Prep the target server
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
            const scriptRam = ns.getScriptRam("/v1/weak.js");
            const threads = Math.max(1, Math.floor(availableRam / scriptRam / 2));

            if (threads == 1)
                continue

            ns.exec("/v1/weak.js", ns.getHostname(), threads, targetHost, BATCH_DELAY);
            ns.exec("/v1/grow.js", ns.getHostname(), threads, targetHost, 0);
        } else {
            const availableRam = getAvailiableRam(ns, ns.getHostname(), 1);
            const scriptRam = ns.getScriptRam("/v1/weak.js");
            const threads = Math.max(1, Math.floor(availableRam / scriptRam));

            if (threads == 1)
                continue

            ns.exec("/v1/weak.js", ns.getHostname(), threads, targetHost, 0);
        }
    }

    ns.spawn(singleBatcherName, {spawnDelay: 0, }, targetHost)
}