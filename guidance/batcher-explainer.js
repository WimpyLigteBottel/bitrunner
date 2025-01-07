/** @param {NS} ns **/
export async function main(ns) {
    ns.clearLog();
    ns.disableLog("ALL");
    ns.tail();

    // Simulation values for task durations
    let hackTime = 10; // Simulated hack time
    let growTime = 15; // Simulated grow time
    let weakenTime = 25; // Simulated weaken time
    let delay = 1; // Delay between batches

    let batches = [];

    let largestDelay = delay
    // Generate 3 batches
    for (let i = 0; i < 5; i++) {
        let batch = constructBatch(hackTime, growTime, weakenTime, largestDelay, delay);
        batches.push(batch);

        largestDelay += delay * 4
    }

    // Print batches for visualization
    for (const batch of batches) {
        for (const task of batch) {
            ns.print(createRepresentation(task));
        }
        ns.print(""); // Separate each batch visually
    }
}

// Visualize a task in the log
function createRepresentation(task) {
    let string = "";

    for (let i = 0; i < task.delay; i++) {
        string += "-";
    }

    for (let i = 0; i < task.time; i++) {
        string += task.name;
    }

    return string;
}

// Create a task with proper delay and timing
function createTask(duration, name, startDelay) {
    return {
        time: duration,
        delay: startDelay,
        name: name,
    };
}


// Construct a batch of tasks with proper delays
function constructBatch(hackTime, growTime, weakenTime, delay, defaultDelay = 1) {


    let hack = createTask(hackTime, "h", weakenTime - hackTime + delay - defaultDelay - defaultDelay);
    let weaken1 = createTask(weakenTime, "w", delay - defaultDelay);
    let grow = createTask(growTime, "g", weakenTime - growTime + delay);
    let weaken2 = createTask(weakenTime, "W", delay + defaultDelay);



    return [hack, weaken1, grow, weaken2];
}
/*

It should generate as follows


BATCH 1
--------------hhhhhhhhhh
wwwwwwwwwwwwwwwwwwwwwwwww
-----------ggggggggggggggg
--WWWWWWWWWWWWWWWWWWWWWWWWW

BATCH 2
------------------hhhhhhhhhh
----wwwwwwwwwwwwwwwwwwwwwwwww
---------------ggggggggggggggg
------WWWWWWWWWWWWWWWWWWWWWWWWW

BATCH 3
----------------------hhhhhhhhhh
--------wwwwwwwwwwwwwwwwwwwwwwwww
-------------------ggggggggggggggg
----------WWWWWWWWWWWWWWWWWWWWWWWWW

BATCH 4
--------------------------hhhhhhhhhh
------------wwwwwwwwwwwwwwwwwwwwwwwww
-----------------------ggggggggggggggg
--------------WWWWWWWWWWWWWWWWWWWWWWWWW

BATCH 5
------------------------------hhhhhhhhhh
----------------wwwwwwwwwwwwwwwwwwwwwwwww
---------------------------ggggggggggggggg
------------------WWWWWWWWWWWWWWWWWWWWWWWWW

*/