import { GangMemberInfo, NS } from "@ns";
import { print } from "/util/HackConstants";


let tasks = [
    "Unassigned",
    "Mug People",
    "Deal Drugs",
    "Strongarm Civilians",
    "Run a Con",
    "Armed Robbery",
    "Traffick Illegal Arms",
    "Threaten & Blackmail",
    "Human Trafficking",
    "Terrorism",
    "Vigilante Justice",
    "Train Combat",
    "Train Hacking",
    "Train Charisma",
    "Territory Warfare"
]

let gangNames = ['Speakers for the Dead'
    , 'The Black Hand'
    , 'Tetrads'
    , 'NiteSec'
    , 'The Dark Army'
    , 'The Syndicate']

export function activateWareFare(ns: NS) {
    let timeToFight: boolean[] = []

    for (const name of gangNames) {
        let result = ns.gang.getChanceToWinClash(name) > 0.70
        timeToFight.push(result)
    }

    ns.gang.setTerritoryWarfare(timeToFight.filter(x => x).length > 5)
}

export function makeMoney(ns: NS) {
    for (const name of ns.gang.getMemberNames()) {
        let highestMoneyEarner = "Mug People"
        let highestEarnedPerSecond = 0

        for (const task of tasks) {
            ns.gang.setMemberTask(name, task)
            let member = ns.gang.getMemberInformation(name)

            if (member.moneyGain > highestEarnedPerSecond) {
                highestMoneyEarner = task
                highestEarnedPerSecond = member.moneyGain
            } else {
                ns.gang.setMemberTask(name, highestMoneyEarner)
            }
        }

    }
}


export function assignJobs(ns: NS) {
    if (ns.gang.getGangInformation().wantedPenalty < 1) {
        makeMoney(ns)
    } else {
        for (const name of ns.gang.getMemberNames()) {
            ns.gang.setMemberTask(name, `Vigilante Justice`)
        }
    }

    trainWeakestMembers(ns)
}

export function trainWeakestMembers(ns: NS) {
    if (ns.gang.getMemberNames().length == 0) {
        return
    }

    let allMembers = ns.gang.getMemberNames().map(x => ns.gang.getMemberInformation(x))
    allMembers = allMembers.sort((a, b) => getWinningStatCount(a, b) - getWinningStatCount(b, a))

   

    let countToTrain = 2
    for(const member of allMembers){
        if(countToTrain < 1){
            break;
        }
        ns.gang.setMemberTask(member.name, "Train Combat")
        countToTrain--
    }

    
}


function isStronger(a: GangMemberInfo, b: GangMemberInfo) {
    let aIsStronger = []

    aIsStronger.push(a.agi > b.agi)
    aIsStronger.push(a.cha > b.cha)
    aIsStronger.push(a.dex > b.dex)
    aIsStronger.push(a.str > b.str)
    aIsStronger.push(a.hack > b.hack)

    let aWinningCount = aIsStronger.filter(x => x).length
    let bWinningCount = aIsStronger.filter(x => !x).length

    return aWinningCount > bWinningCount

}

function getWinningStatCount(a: GangMemberInfo, b: GangMemberInfo) {
    let aIsStronger = []

    aIsStronger.push(a.agi > b.agi)
    aIsStronger.push(a.cha > b.cha)
    aIsStronger.push(a.dex > b.dex)
    aIsStronger.push(a.str > b.str)
    aIsStronger.push(a.hack > b.hack)

    return aIsStronger.filter(x => x).length
}