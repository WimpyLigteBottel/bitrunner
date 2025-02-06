import { NS, Server } from "@ns";
import { getAvailiableRam, getTotalCostThreads } from "/util/HackThreadUtil";
import { BATCH_DELAY, print } from "/util/HackConstants";

export interface ServerMoneyStats {
    server: string;
    moneyPerSecond: number;
    totalRamCost: number;
}

export function findBestHackConstantToGenerateMoney(
    ns: NS,
    hackTarget: string,
    host: string
): number {

    let highestPaid = 0
    let highestPercentage = 0.001
    let lastRatio = null
    let divideNumber = 100

    let ramAvailaible = getAvailiableRam(ns, host, 0)

    let targetServer = ns.getServer(hackTarget)

    for (let x = 1; x < 99; x++) {
        highestPercentage = x / divideNumber
        let first = calculateFullCycleMoneyPerSecond(ns, targetServer, highestPercentage);
        if (first == undefined) {
            break;
        }

        if (first.totalRamCost >= ramAvailaible) {
            x--;
            highestPercentage = x / divideNumber
            break;
        }

        if (first.moneyPerSecond >= highestPaid && first.totalRamCost < ramAvailaible) {
            highestPaid = first.moneyPerSecond
            highestPercentage = highestPercentage
            lastRatio = first
        }
    }

    highestPercentage = Math.floor(highestPercentage * divideNumber) / divideNumber

    print(ns, `Highest percentage ${highestPercentage}`)

    return highestPercentage
}

/**
 * Caluclate the full cycle ServerMoneyStats
 * @param ns 
 * @param server The server that is being hacked
 * @param percentageConstant the hacking percentage
 * @returns {ServerMoneyStats}
 */
function calculateFullCycleMoneyPerSecond(ns: NS, server: Server, percentageConstant: number): ServerMoneyStats | undefined {
    const maxMoney = ns.getServerMaxMoney(server.hostname);
    const hackChance = ns.hackAnalyzeChance(server.hostname);

    // Exit if the server cannot generate money or hacking chance is too low
    if (maxMoney === 0 || hackChance === 0) {
        return undefined;
    }

    const hackAmount = maxMoney * percentageConstant;
    const hackThreads = Math.ceil(ns.hackAnalyzeThreads(server.hostname, hackAmount));

    // Exit if hackThreads is invalid or too small
    if (hackThreads < 1 || hackThreads === Infinity) {
        return undefined;
    }

    // Mock the money availaible like its the percentage availble 
    server.moneyAvailable = maxMoney * (1 - percentageConstant)

    const growThreads = ns.formulas.hacking.growThreads(server, ns.getPlayer(), maxMoney, 1);

    // Calculate weaken threads to offset security increases
    const weakenThreads1 = Math.abs(Math.ceil(ns.weakenAnalyze(1) * hackThreads)); // Offset hack security increase
    const weakenThreads2 = Math.abs(Math.ceil(ns.weakenAnalyze(1) * growThreads)); // Offset grow security increase

    const weakenThread = weakenThreads1 + weakenThreads2

    const fullCycleTime = ns.formulas.hacking.weakenTime(server, ns.getPlayer()) + BATCH_DELAY * 4;
    // Calculate money generated per cycle and per second
    const moneyPerCycle = hackAmount * hackChance; // Adjust for success probability
    const moneyPerSecond = moneyPerCycle / (fullCycleTime / 1000); // Convert ms to seconds

    return {
        server: server.hostname,
        moneyPerSecond,
        totalRamCost: getTotalCostThreads(ns, hackThreads, weakenThread, growThreads),
    } as ServerMoneyStats;

}