export let DEBUG = false;
import { NS } from "@ns";
// NOT ALLOWED TO IMPORTING ANYTHING ELSE!

export function printDone(ns: NS, name: string, target: string) {
  if (DEBUG) {
    ns.tprint(`${name} - ${new Date().toISOString()} - ${target}`);
  }
}

export function pTime(ns:NS,time:number): string {
  return ns.tFormat(time).replaceAll(" minute ","m").replaceAll(" seconds","s")
}

export function openTail(ns: NS, override: boolean = false) {
  if (override || DEBUG) {
    ns.ui.openTail();
  }
}

export function disableLogs(ns: NS) {
  ns.disableLog("run");
  ns.disableLog("getServerMaxRam");
  ns.disableLog("getServerUsedRam");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("scan");
  ns.disableLog("sleep");
  ns.disableLog("getServerMaxMoney");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("exec");
  ns.disableLog("killall");
  ns.disableLog("gang.setMemberTask");
  ns.disableLog("gang.purchaseEquipment");
  ns.disableLog("gang.setTerritoryWarfare");
  ns.clearLog();
}
