import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {

  let knownServers: string[] = []

  let servers: string[] = ns.scan().map(x=> x);



  while(servers.length != 0){

    let server = servers.pop()

    ns.tprint(server)

  }

}