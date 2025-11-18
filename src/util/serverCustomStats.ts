import { NS } from "@ns";
import { CustomServerV2 } from "/models/Models";

export function getCustomServer(ns: NS, hostname: string): CustomServerV2 {
    let s = ns.getServer(hostname);
    let player = ns.getPlayer();

    let maxBatches = Math.floor(ns.getWeakenTime(s.hostname) / 100)


    return {
        hostname: s.hostname,

        // Ram
        availableRam: s.maxRam - s.ramUsed,
        ramUsed: s.ramUsed,
        // Money Available
        maxRam: s.maxRam,
        moneyAvailable: ns.formatNumber(s.moneyAvailable || 0),
        moneyMax: ns.formatNumber(s.moneyMax || 0),

        // security
        currentSecurity: s.hackDifficulty ?? 0,
        minSecurity: s.minDifficulty ?? 0,

        // hacking
        backdoored: s.backdoorInstalled ?? false,
        canHack: player.skills.hacking >= (s.requiredHackingSkill || 999999),
        canExecuteScripts: s.hasAdminRights,
        hackChance: ns.formulas.hacking.hackChance(s, player) * 100,
        hacktime: ns.getHackTime(s.hostname),
        growTime: ns.getGrowTime(s.hostname),
        weakTime: ns.getWeakenTime(s.hostname),
        maxBatches: maxBatches
    };
}
