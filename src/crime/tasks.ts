import { NS } from "@ns";

export const figureOutTask = (ns: NS, task: string) => {
  if (task == "Money") {
    assignBestJobs(ns);
  } else if (task == "Territory Warfare" || task == "Vigilante Justice") {
    for (const name of ns.gang.getMemberNames()) {
      ns.gang.setMemberTask(name, task);
    }
  } else if (task == "Train") {
    trainEachMemberWeakestStat(ns);
  }
};

export const hireAllGangMembers = (ns: NS) => {
  while (ns.gang.canRecruitMember()) {
    ns.gang.recruitMember(crypto.randomUUID().toString());
  }
};

export const assignBestJobs = (ns: NS) => {
  for (const name of ns.gang.getMemberNames()) {
    assignBestJob(ns, name);
  }
};

const assignBestJob = (ns: NS, memberName: string) => {
  const bestJob = findBestTask(ns, memberName);
  ns.gang.setMemberTask(memberName, bestJob.task);
};

const taskNames = [
  "Unassigned",
  "Mug People",
  "Deal Drugs",
  "Strongarm Civilians",
  "Run a Con",
  "Armed Robbery",
  "Traffick Illegal Arms",
  "Threaten & Blackmail",
  "Human Trafficking",
  "Terrorism",
  "Vigilante Justice",
  "Train Combat",
  "Train Hacking",
  "Train Charisma",
  "Territory Warfare",
];

const findBestTask = (ns: NS, memberName: string) => {
  let highestGain = {
    task: "Train Combat",
    income: 0,
  };

  for (const task of taskNames) {
    let member = ns.gang.getMemberInformation(memberName);
    if (ns.gang.setMemberTask(member.name, task)) {
      member = ns.gang.getMemberInformation(memberName);

      if (member.moneyGain > highestGain.income) {
        highestGain = {
          task: task,
          income: member.moneyGain,
        };
      }
    }
  }

  return highestGain;
};

export const assignSpecificJob = (ns: NS, taskName: string) => {
  for (const name of ns.gang.getMemberNames()) {
    ns.gang.setMemberTask(name, taskName);
  }
};

export const trainEachMemberWeakestStat = (ns: NS) => {
  for (const name of ns.gang.getMemberNames()) {
    let taskName = getWeakestTrainingTask(ns, name);
    ns.gang.setMemberTask(name, taskName);
  }
};

const getWeakestTrainingTask = (
  ns: NS,
  name: string
): "Train Combat" | "Train Charisma" | "Train Hacking" => {
  let member = ns.gang.getMemberInformation(name);

  let agi = member.agi;
  let dex = member.dex;
  let str = member.str;
  let def = member.def;
  let cha = member.cha;
  let hacking = member.hack;

  let weakest = Math.min(agi, dex, str, def, cha, hacking);

  if (ns.gang.getGangInformation().faction == "Slum Snakes") {
    return "Train Combat";
  }

  if (weakest == agi || weakest == dex || weakest == str || weakest == def) {
    return "Train Combat";
  }

  if (weakest == hacking) {
    return "Train Hacking";
  }

  return "Train Charisma";
};
