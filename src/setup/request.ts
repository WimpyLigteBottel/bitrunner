import { NS } from "@ns";
import { disableLogs } from "/base/debug";
import { HackRequest, RequestType } from "/models/Models";



export async function main(ns: NS): Promise<void> {
    disableLogs(ns)

    let requestTypeTemp: RequestType;

    switch (ns.args[0] as string) {
        case 'HACK':
            requestTypeTemp = 'HACK'
            break;
        case 'PREP':
            requestTypeTemp = 'PREP'
            break;
        default:
            requestTypeTemp = 'PREP'
            break;
    }



    let request: HackRequest = {
        requesterName: ns.getHostname(),
        requestType: requestTypeTemp
    }

    let jsonR = JSON.stringify(request, null, 1)
    ns.print(jsonR)

    ns.tryWritePort(1, jsonR)
}


