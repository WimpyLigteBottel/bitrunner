import { NS, Server } from "@ns";


export type RequestType = "HACK" | "PREP" | "WEAKEN"

export const BUFFER = 200


export type SCRIPT = {
    target: string;
    sleep: number;
    delayMs: number;
    threads?: number;
}

function toScript(ns: NS): SCRIPT {
    return {
        target: ns.args[0] as string,
        sleep: ns.args[1] as number,
        delayMs: ns.args[2] as number,
        threads: ns.args[3] as number
    }
}

export enum TASK_NAME {
    w = "w",
    W = "W",
    h = "h",
    g = "g",
}

export interface Task {
    time: number, // timeIt will take to execute
    delay: number, // that start delay of thread
    name: TASK_NAME, // Name of thread
    script: string,
    threads: number
    cost: number
};

export interface Batch {
    tasks: Task[]
    server: string;
    totalCost: number;
    percentage: number;
}

export function buildBatch(tasks: Task[], server: string, percentage: number): Batch {
    return {
        tasks: tasks,
        server: server,
        percentage: percentage,
        totalCost: tasks.map(x => x.cost).reduce((acc, x) => acc + x)
    }
}

export type CustomServer = {
    parent: CustomServer | undefined
} & Server

export type CleanTimes = {
    hacktimeC?: string;
    growTimeC?: string;
    weakTimeC?: string;
}

export type CustomServerV2 = {
    hostname: string;
    parent: CustomServerV2 | undefined

    // Ram
    availableRam: number;
    ramUsed: number;
    // Money Available
    maxRam: number;
    moneyAvailable: string;
    moneyMax: string;

    // security
    currentSecurity: number
    minSecurity: number;
    requiredHacking: number;

    // hacking
    backdoored: boolean;
    canHack: boolean;
    canExecuteScripts: boolean;
    hackChance: number;
    hacktime: number;
    growTime: number;
    weakTime: number;
    maxBatches?: number;
} & CleanTimes