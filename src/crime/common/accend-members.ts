import { NS } from "@ns";

export const accendMembers = (ns: NS, gangType: "HACKING" | "COMBAT") => {
  for (const name of ns.gang.getMemberNames()) {
    if (gangType === "HACKING" && shouldAccendHacking(ns, name)) {
      ns.gang.ascendMember(name);
    }
    if (gangType === "COMBAT" && shouldAccendCombat(ns, name)) {
      ns.gang.ascendMember(name);
    }
  }
};

const shouldAccendHacking = (ns: NS, name: string) => {
  let member = ns.gang.getMemberInformation(name);

  let result = ns.gang.getAscensionResult(member.name);

  let hack = result?.hack ?? 1 / member.hack;

  let countAbove = [hack].filter((x) => x > 1.2).length >= 1;

  return countAbove;
};

const shouldAccendCombat = (ns: NS, name: string) => {
  let member = ns.gang.getMemberInformation(name);

  let result = ns.gang.getAscensionResult(member.name);

  let agi = result?.agi ?? 1 / member.agi;
  let dex = result?.dex ?? 1 / member.dex;
  let str = result?.str ?? 1 / member.str;
  let def = result?.def ?? 1 / member.def;
  let cha = result?.cha ?? 1 / member.cha;

  let countAbove = [agi, str, def, cha, dex].filter((x) => x > 1.2).length >= 3;

  return countAbove;
};
