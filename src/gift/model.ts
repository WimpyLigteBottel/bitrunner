export type Fragment = {
  rootX: number;
  rootY: number;
  rotation: number;
  fragmentId: number;
};

export function getHackingFragments(): Fragment[] {
  let pointA: Fragment = { rootX: 0, rootY: 0, rotation: 0, fragmentId: 6 }; // hack power
  let pointB: Fragment = { rootX: 0, rootY: 2, rotation: 0, fragmentId: 5 }; // faster h,g,w
  let pointC: Fragment = { rootX: 0, rootY: 3, rotation: 0, fragmentId: 7 }; // grow power

  let pointD: Fragment = { rootX: 1, rootY: 1, rotation: 0, fragmentId: 103 }; // CHARGE
  let pointE: Fragment = { rootX: 2, rootY: 3, rotation: 0, fragmentId: 103 }; // CHARGE
  return [pointA, pointB, pointC, pointD, pointE];
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
