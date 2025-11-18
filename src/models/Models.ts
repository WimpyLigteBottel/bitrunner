import { Server } from "@ns";


export type RequestType = "HACK" | "PREP" | "WEAKEN"


export type HackRequest = {
    requesterName: string,
    requestType: RequestType;
}


export type HackResponse = {} & Batch

export enum TASK_NAME {
    w = "w",
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