import { NS } from "@ns";
import { print } from "/util/HackConstants";



function recruitMembers(ns: NS) {
    while (ns.gang.canRecruitMember()) {
        let myuuid = crypto.randomUUID();
        let result = ns.gang.recruitMember(myuuid)
        if (result) {
            print(ns, `Recruited ${myuuid}`)
        }
    }
}
