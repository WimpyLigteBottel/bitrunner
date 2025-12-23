import { NS } from "@ns";

export const figureOutTask = (ns: NS, task: string) => {
  if (task == "Money") {
    for (const name of ns.gang.getMemberNames()) {
      const bestJob = findBestTask(ns, name);
      ns.gang.setMemberTask(name, bestJob.task);
    }
    return;
  }

  for (const name of ns.gang.getMemberNames()) {
    ns.gang.setMemberTask(name, task);
  }
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
