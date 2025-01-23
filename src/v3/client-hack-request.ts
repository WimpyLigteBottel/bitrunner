import { NS } from "@ns";
import { print } from "../util/HackConstants"
import { HackWeakGrowTask, HOST_LISTENER, LISTENER_PORT, NULL_VALUE, RespondThreads } from "./host-hacking-calculator";
import { getAvailiableRam } from "/util/HackThreadUtil";


export async function requestAndReadResponse(ns: NS, target: string, currentHost: string): Promise<RespondThreads> {
    let request = requestBatch(ns, target, currentHost)
    return await readOnlyMyResponse(ns, currentHost)
}


export function requestBatch(ns: NS, target: string, currentHost: string): string {
    let request = new HackWeakGrowTask()

    request.host = currentHost
    request.target = target
    request.ramLimit = getAvailiableRam(ns, currentHost, 3)

    return ns.writePort(HOST_LISTENER, JSON.stringify(request))
}

export async function readOnlyMyResponse(ns: NS, currentHost: string): Promise<RespondThreads> {
    // Sleep on empty ports
    print(ns, `STEP 1`, true)
    while (ns.peek(LISTENER_PORT) == NULL_VALUE) {
        print(ns, `STEP 2`, true)
        await ns.sleep(100)
    }

    print(ns, `STEP 3`, true)
    //read the data... If its not for you sleep till its yours
    let peek: RespondThreads = JSON.parse(ns.peek(LISTENER_PORT))
    while (peek.intededServer != currentHost) {
        peek = JSON.parse(ns.peek(LISTENER_PORT))
        await ns.sleep(100)
        print(ns, `STEP 4`, true)
    }

    let data = JSON.parse(ns.readPort(LISTENER_PORT)) as RespondThreads
    print(ns, `STEP 5: ${JSON.stringify(data, undefined, 1)}`, true)

    return data
}