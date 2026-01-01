export type Fragment = {
  rootX: number;
  rootY: number;
  rotation: number;
  fragmentId: number;
};

/*
  {"id":6,"x":2,"y":4,"highestCharge":0,"numCharge":0,"rotation":0,"shape":[[true,true,true,true]],"type":4,"power":2,"limit":1,"effect":"+x% hack() power"}
  {"id":0,"x":0,"y":3,"highestCharge":0,"numCharge":0,"rotation":0,"shape":[[false,true,true],[true,true,false]],"type":6,"power":1,"limit":1,"effect":"+x% hacking experience and skill level"}
  {"id":1,"x":0,"y":1,"highestCharge":0,"numCharge":0,"rotation":1,"shape":[[true,true,false],[false,true,true]],"type":6,"power":1,"limit":1,"effect":"+x% hacking experience and skill level"}
  {"id":1,"x":2,"y":1,"highestCharge":0,"numCharge":0,"rotation":1,"shape":[[false,true,false],[true,true,true],[false,true,false]],"type":18,"power":1.1,"limit":99,"effect":"1.1x adjacent fragment power"}
{"id":107,"x":0,"y":0,"highestCharge":0,"numCharge":0,"rotation":2,"shape":[[true,false,false],[true,true,true]],"type":5,"power":0.5,"limit":1,"effect":"+x% grow() power"}
  {"id":5,"x":3,"y":0,"highestCharge":0,"numCharge":0,"rotation":0,"shape":[[true,true,true],[false,true,false]],"type":3,"power":1.3,"limit":1,"effect":"+x% faster hack(), grow(), and weaken()"}
 {"id":25,"x":4,"y":1,"highestCharge":0,"numCharge":0,"rotation":3,"shape":[[true,false,false],[true,true,true]],"type":14,"power":0.5,"limit":1,"effect":"+x% reputation from factions and companies"}
*/
export function getHackingFragments(): Fragment[] {
  let A: Fragment = { rootX: 2, rootY: 4, rotation: 0, fragmentId: 6 };
  let B: Fragment = { rootX: 0, rootY: 3, rotation: 0, fragmentId: 0 };
  let C: Fragment = { rootX: 0, rootY: 1, rotation: 1, fragmentId: 1 };
  let E: Fragment = { rootX: 2, rootY: 1, rotation: 1, fragmentId: 107 };
  let G: Fragment = { rootX: 0, rootY: 0, rotation: 2, fragmentId: 7 };
  let F: Fragment = { rootX: 3, rootY: 0, rotation: 0, fragmentId: 5 };
  let D: Fragment = { rootX: 4, rootY: 1, rotation: 3, fragmentId: 25 };

  return [A, B, C, D, E, F, G];
}

export function getTrainingFragment(): Fragment[] {
  let pointA: Fragment = { rootX: 0, rootY: 0, rotation: 0, fragmentId: 10 }; // STR
  let pointB: Fragment = { rootX: 3, rootY: 3, rotation: 0, fragmentId: 18 }; // CHA
  let pointC: Fragment = { rootX: 0, rootY: 3, rotation: 0, fragmentId: 14 }; // DEX
  let pointD: Fragment = { rootX: 2, rootY: 0, rotation: 0, fragmentId: 16 }; // AGI
  let pointE: Fragment = { rootX: 0, rootY: 1, rotation: 1, fragmentId: 12 }; // DEF

  let pointF: Fragment = { rootX: 1, rootY: 1, rotation: 2, fragmentId: 101 }; // CHARGE

  return [pointA, pointB, pointC, pointD, pointE, pointF];
}
