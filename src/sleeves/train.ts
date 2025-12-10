import { GymLocationName, GymType, NS, SleevePerson } from "@ns";

export const trainAllSleeves = (ns: NS) => {
  ns.tprint("Training all sleeves")
  let all = ns.sleeve.getNumSleeves();

  for (let x = 0; x < all; x++) {
    const sleeve = ns.sleeve.getSleeve(x);
    let skill = findWeakestStat(sleeve);
    ns.sleeve.setToGymWorkout(x, GymLocationName.Sector12PowerhouseGym, skill);
  }
};


export const trainAllSleevesForMugging = (ns: NS) => {
  ns.tprint("Training all sleeves")
  let all = ns.sleeve.getNumSleeves();

  for (let x = 0; x < all; x++) {
    const sleeve = ns.sleeve.getSleeve(x);
    let skill = findWeakestStatMug(sleeve);
    ns.sleeve.setToGymWorkout(x, GymLocationName.Sector12PowerhouseGym, skill);
  }
};

const findWeakestStat = (sleeve: SleevePerson): GymType => {
  let agi = sleeve.skills.agility;
  let str = sleeve.skills.strength;
  let def = sleeve.skills.defense;
  let dex = sleeve.skills.dexterity;

  let weakest = Math.min(agi, str, def, dex);

  if (weakest == agi) return GymType.agility;
  if (weakest == str) return GymType.strength;
  if (weakest == def) return GymType.defense;
  if (weakest == dex) return GymType.dexterity;

  return GymType.strength;
};

const findWeakestStatMug = (sleeve: SleevePerson): GymType => {
  let agi = sleeve.skills.agility;
  let str = sleeve.skills.strength;
  let dex = sleeve.skills.dexterity;

  let weakest = Math.min(agi, str, dex);

  if (weakest == agi) return GymType.agility;
  if (weakest == str) return GymType.strength;
  if (weakest == dex) return GymType.dexterity;

  return GymType.strength;
};
