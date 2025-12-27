import { NS } from "@ns";
import { readState, saveState } from "./state";
import { openTail } from "/models/debug";

const CYCLE_LENGTH = 1024;
const PATTERN_MATCH_LENGTH = 24;
const PREDICTION_LENGTH = 1000;

let headButton;
let tailButton;

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog("sleep");
  openTail(ns, true);

  // for speed improvement
  headButton = findButton("Head!");
  tailButton = findButton("Tail!");

  setBetAmount(1);

  // Setup the state
  let recording: string[] = [];
  saveState(ns, recording);
  if (readState(ns).length == 0) {
    ns.print("Recording initial sequence...");
    recording = await getTheSequence(ns);
    saveState(ns, recording);
    ns.print("Sequence recorded and saved!");
  } else {
    recording = readState(ns);
    ns.print("Loaded existing sequence");
  }

  while (true) {
    setBetAmount(1);
    // Collect current pattern
    ns.print("Collecting current pattern...");
    let currentPattern: string[] = [];
    for (let i = 0; i < PATTERN_MATCH_LENGTH; i++) {
      clickElement(headButton);
      currentPattern.push(getResult());
    }

    // Find matching pattern in recording
    let matchIndex = findPatternMatch(recording, currentPattern);

    if (matchIndex === -1) {
      ns.print("ERROR: Pattern not found in recorded sequence!");
      ns.print(
        "This might mean the RNG has changed or recording is incomplete."
      );
      return;
    }

    ns.print(`Pattern found at index: ${matchIndex}`);

    // Predict next outcomes
    let predictions: string[] = [];
    for (let i = 0; i < PREDICTION_LENGTH; i++) {
      let nextIndex =
        (matchIndex + PATTERN_MATCH_LENGTH + i) % recording.length;
      predictions.push(recording[nextIndex]);
    }
    setBetAmount(100000);

    while (predictions.length > 0) {
      let r = predictions.shift();

      if (r == "W") {
        clickElement(headButton);
      } else {
        clickElement(tailButton);
      }
    }
    await ns.sleep(0);
  }
}

function setBetAmount(amount: number) {
  const doc = getDocument();
  const input = doc.querySelector('input[type="number"]');
  if (input) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )!.set!;
    nativeInputValueSetter.call(input, amount);

    // Trigger change event
    const event = new Event("input", { bubbles: true });
    input.dispatchEvent(event);
  }
}

/**
 * Finds the starting index of the pattern in the recording
 * Returns -1 if not found
 */
function findPatternMatch(recording: string[], pattern: string[]): number {
  const patternStr = pattern.join("");

  // Search through the recording for a match
  for (let i = 0; i <= recording.length - pattern.length; i++) {
    let match = true;
    for (let j = 0; j < pattern.length; j++) {
      if (recording[i + j] !== pattern[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return i;
    }
  }

  return -1;
}

async function getTheSequence(ns: NS): Promise<string[]> {
  let recording: string[] = [];
  for (let i = 0; i < CYCLE_LENGTH; i++) {
    clickElement(headButton!);
    await ns.sleep(0);
    recording.push(getResult());

    if (i % 100 === 0) {
      ns.print(`Recording progress: ${i}/${CYCLE_LENGTH}`);
    }
  }
  return recording;
}

/*
Gets the current document
*/
function getDocument() {
  return eval("document");
}

//Performs the click
function clickElement(element: any) {
  const handler = Object.keys(element)[1];
  if (element[handler] && element[handler].onClick) {
    element[handler].onClick({
      target: element,
      isTrusted: true,
      preventDefault: () => {},
      stopPropagation: () => {},
    });
    return true;
  }
  return false;
}

// Finds the buttons
function findButton(searchText: string) {
  const doc = getDocument();
  const buttons = Array.from(doc.querySelectorAll("button"));
  return buttons.find((btn: any) =>
    btn.innerText.toLowerCase().includes(searchText.toLowerCase())
  );
}

function getResult(): "W" | "L" {
  const doc: HTMLElement = getDocument();
  const buttons = Array.from(doc.querySelectorAll("h3")); // Fixed syntax error
  let win = buttons.find((btn: any) =>
    btn.innerText.toLowerCase().includes("win!".toLowerCase())
  );
  let lose = buttons.find((btn: any) =>
    btn.innerText.toLowerCase().includes("lose!".toLowerCase())
  );
  if (win) return "W";
  if (lose) return "L";
  throw Error("Failed.... Should have seen win or lose somewhere");
}
