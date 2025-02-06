import { NS } from "@ns";
import { print } from "/util/HackConstants";

export function recruitMembers(ns: NS) {
    while (ns.gang.canRecruitMember()) {
        let myuuid = crypto.randomUUID().slice(0, 8);
        let result = ns.gang.recruitMember(myuuid)
        if (result) {
            print(ns, `Recruited ${myuuid}`, true)
        }
    }
}
