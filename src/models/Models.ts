import { Server } from "@ns";


export type RequestType = "HACK" | "PREP"


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

export type CustomServer = {
    parent: CustomServer | undefined
} & Server