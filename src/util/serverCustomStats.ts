import { NS } from "@ns";
import { CustomServerMini, CustomServerV2 } from "/models/Models";

export function getCustomServer(ns: NS, hostname: string): CustomServerV2 {
  let s = ns.getServer(hostname);
  let player = ns.getPlayer();

  if (s.hackDifficulty == undefined) {
    return {
      hostname: s.hostname,
      parent: undefined,

      // Ram
      availableRam: s.maxRam - s.ramUsed,
      ramUsed: s.ramUsed,
      // Money Available
      maxRam: s.maxRam,
      moneyAvailable: ns.formatNumber(s.moneyAvailable ?? 0),
      moneyMax: ns.formatNumber(s.moneyMax ?? 0),

      requiredHacking: s.requiredHackingSkill ?? 999999,

      // security
      currentSecurity: s.hackDifficulty ?? 0,
      minSecurity: s.minDifficulty ?? 0,

      // hacking
      backdoored: s.backdoorInstalled ?? false,
      canHack: player.skills.hacking >= (s.requiredHackingSkill ?? 999999),
      canExecuteScripts: s.hasAdminRights,
      hackChance: ns.formulas.hacking.hackChance(s, player) * 100,
      hacktime: Infinity,
      growTime: Infinity,
      weakTime: Infinity,
      maxBatches: 0,
    };
  }
  let maxBatches = Math.floor(ns.getWeakenTime(s.hostname) / 100);

  return {
    hostname: s.hostname,
    parent: undefined,

    // Ram
    availableRam: s.maxRam - s.ramUsed,
    ramUsed: s.ramUsed,
    // Money Available
    maxRam: s.maxRam,
    moneyAvailable: ns.formatNumber(s.moneyAvailable ?? 0),
    moneyMax: ns.formatNumber(s.moneyMax ?? 0),

    requiredHacking: s.requiredHackingSkill ?? 999999,

    // security
    currentSecurity: s.hackDifficulty ?? 0,
    minSecurity: s.minDifficulty ?? 0,

    // hacking
    backdoored: s.backdoorInstalled ?? false,
    canHack: player.skills.hacking >= (s.requiredHackingSkill ?? 999999),
    canExecuteScripts: s.hasAdminRights,
    hackChance: ns.formulas.hacking.hackChance(s, player) * 100,
    hacktime: ns.getHackTime(s.hostname),
    growTime: ns.getGrowTime(s.hostname),
    weakTime: ns.getWeakenTime(s.hostname),
    hacktimeC: ns.tFormat(ns.getHackTime(s.hostname)),
    growTimeC: ns.tFormat(ns.getGrowTime(s.hostname)),
    weakTimeC: ns.tFormat(ns.getWeakenTime(s.hostname)),
    maxBatches: maxBatches,
  };
}

export function getMiniCustomServer(
  ns: NS,
  hostname: string
): CustomServerMini {
  let s = ns.getServer(hostname);
  let player = ns.getPlayer();

  let info = "";
  if (s.backdoorInstalled) {
    info += "Backdoor ";
  }

  if (s.hasAdminRights) {
    info += "Admin ";
  }

  if (player.skills.hacking >= (s.requiredHackingSkill ?? 999999)) {
    info += "Hackable✓ ";
  }

  return {
    hostname: s.hostname,
    ram: `${s.ramUsed} / ${s.maxRam}`,
    money: `${ns.formatNumber(s.moneyAvailable ?? 0)} / ${ns.formatNumber(
      s.moneyMax ?? 0
    )}`,
    security: `${s.minDifficulty} / ${s.hackDifficulty}`,
    info,
    hacktimeC: ns.tFormat(ns.getHackTime(s.hostname)),
    growTimeC: ns.tFormat(ns.getGrowTime(s.hostname)),
    weakTimeC: ns.tFormat(ns.getWeakenTime(s.hostname)),
  };
}
