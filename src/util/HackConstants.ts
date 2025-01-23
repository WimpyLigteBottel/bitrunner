import { NS } from "@ns"

export const hackScriptName = "../v2/hack.js"
export const weakenScriptName = "../v2/weak.js"
export const growScriptName = "../v2/grow.js"


export const KILL_ALL = "../util/killall.js"
export const AUTOMATE = "../util/automate.js"
export const PROFITS = "../util/profits.js"
export const FIND = "../util/Find.js"
export const CONNECT = "../util/connect.js"
export const UPGRADE = "../util/upgrade.js"
export const FindAllServersName = "../util/FindAllServers.js"
export const HackThreadUtilName = "../util/HackThreadUtil.js"
export const HackConstantsName = "../util/HackConstants.js"
export const BACKDOOR = "../util/backdoor.js"

export const singleBatcherName = "../v2/single-batch.js"
export const batcherName = "../v2/batcher.js"
export const CONTRACTS = "../v2/contract/contracts.js"
export const SINGLE_PREP_V2 = "../v2/single-prep.js"
export const PREP_MANAGER = "../v2/manager-prep.js"
export const MASS_PREP = "../v2/mass-prep.js"
export const PREP = "../v2/prep.js"


export const BATCHER_V3 = "../v3/batcher.js"
export const PREP_V3 = "../v3/prep.js"
export const SINGLE_BATCH_V3 = "../v3/single-batch.js"
export const SINGLE_PREP_V3 = "../v3/single-prep.js"
export const PREP_MANAGER_V3 = "../v3/manager-prep.js"
export const MASS_PREP_V3 = "../v3/mass-prep.js"
export const CLIENT_HACK = "../v3/client-hack-request.js"
export const HOST_HACK_V3 = "../v3/host-hacking-calculator.js"

export const ALL_SCRIPTS_TO_COPY = [
    hackScriptName,
    weakenScriptName,
    growScriptName,
    singleBatcherName,
    batcherName,
    FindAllServersName,
    HackThreadUtilName,
    HackConstantsName,
    SINGLE_PREP_V2,
    PREP_MANAGER,
    KILL_ALL,
    PREP,
    PROFITS,
    FIND,
    CONNECT,
    UPGRADE,
    MASS_PREP,
    BACKDOOR,
    CONTRACTS,
    AUTOMATE,
    SINGLE_PREP_V3,
    SINGLE_BATCH_V3,
    BATCHER_V3,
    PREP_MANAGER_V3,
    PREP_V3,
    CLIENT_HACK,
    HOST_HACK_V3,
    MASS_PREP_V3
]

export const BATCH_DELAY = 300 as number

const DEBUG = true

export const print = (ns: NS, message: string, disable: boolean = false) => {
    if(disable)
        return

    if (DEBUG)
        ns.print(message)
}
