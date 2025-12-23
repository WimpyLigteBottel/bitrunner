import { NS } from "@ns";


export const hireAllGangMembers = (ns: NS) => {
  while (ns.gang.canRecruitMember()) {
    ns.gang.recruitMember(crypto.randomUUID().toString());
  }
};
