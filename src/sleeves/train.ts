import { NS, SleevePerson } from "@ns";

export const trainAllSleeves = (ns: NS) => {
  let all = ns.sleeve.getNumSleeves();
  for (let x = 0; x < all; x++) {
    const sleeve = ns.sleeve.getSleeve(x);
    if (sleeve.shock == 0 && sleeve.sync == 100) {
      let skill = findWeakestStat(sleeve, ns);

      ns.print(`${x} sleeve lowest skill is ${skill}`);
      if (skill == "hack") {
        ns.sleeve.setToUniversityCourse(x, "Rothman University", "Algorithms");
      } else {
        ns.sleeve.setToGymWorkout(x, "Powerhouse Gym", skill);
      }
    }
  }
};

const findWeakestStat = (
  sleeve: SleevePerson,
  ns: NS
): "agi" | "str" | "def" | "dex" | "hack" => {
  let agi = sleeve.skills.agility;
  let str = sleeve.skills.strength;
  let def = sleeve.skills.defense;
  let dex = sleeve.skills.dexterity;
  let hack = sleeve.skills.hacking;

  let weakest = Math.min(agi, str, def, dex, hack);

  if (weakest == agi) return "agi";
  if (weakest == str) return "str";
  if (weakest == def) return "def";
  if (weakest == dex) return "dex";

  ns.print(`[${[agi, str, def, dex, hack]}]`);

  return "hack";
};
