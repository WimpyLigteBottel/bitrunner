import { NS } from "@ns";
import { findAllServers } from "./FindAllServers";
import { buildConnectScript } from "./connect";
import { maxProfitWithKTransactions, solveStockTrader } from "/contract/stocktrader-4";

export async function main(ns: NS) {
    ns.clearLog();
    ns.tail();

    const servers = findAllServers(ns, true, false)
    const contracts = servers.flatMap((server) => {
        let files = ns.ls(server.host)
        let tempContracts = files.filter((file) => file.endsWith(".cct"))

        return tempContracts.map((file) => {
            return {
                file: file,
                host: server.host,
                // connect: buildConnectScript(server)
            }
        })
    });


    contracts.forEach(x => {
        solveStockTrader(ns, x.file)
    })

    ns.tprint("INFO \n", JSON.stringify(contracts, null, 2))
}


