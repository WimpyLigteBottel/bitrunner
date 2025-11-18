import { NS } from "@ns";
import { disableLogs } from "/base/debug";


export async function main(ns: NS): Promise<void> {
    disableLogs(ns)
    ns.ui.openTail()

    await analyze(ns)
}


async function analyze(ns: NS) {
    let hostname = ns.args[0] as string | undefined
    if (hostname == undefined || hostname == "") {
        hostname = await ns.prompt('What server would you like to analyze?', {
            type: 'text'
        }) as string
    }

    while (true) {
        ns.clearLog()
        let s = serverCustomStats(ns, hostname)

        ns.print(JSON.stringify(s, null, 2))
        await ns.sleep(50)
    }
}


function serverCustomStats(ns: NS, hostname: string) {
    let s = ns.getServer(hostname)
    let player = ns.getPlayer()


    return {
        hostname: s.hostname,

        // Ram
        availableRam: s.maxRam - s.ramUsed,
        ramUsed: s.ramUsed,
        // Money Available
        maxRam: s.maxRam,
        moneyAvailable: ns.formatNumber(s.moneyAvailable || 0),
        moneyMax: ns.formatNumber(s.moneyMax || 0),

        // security
        currentSecurity: s.hackDifficulty,
        minSecurity: s.minDifficulty,

        // hacking
        backdoored: s.backdoorInstalled,
        canHack: player.skills.hacking >= (s.requiredHackingSkill || 999999),
        canExecuteScripts: s.hasAdminRights,
        hackChance: ns.formulas.hacking.hackChance(s, player) * 100 + '%',
        hacktime: ns.getHackTime(s.hostname),
        growTime: ns.getGrowTime(s.hostname),
        weakTime: ns.getWeakenTime(s.hostname),
    }
} 