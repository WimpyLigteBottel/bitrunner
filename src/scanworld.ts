import { NS } from "@ns";
import { openTail } from "./models/debug";

export async function main(ns: NS): Promise<void> {
  openTail(ns, true);
  playNote()
}


function playNote(frequency = 440, duration = 500) {
    const audioCtx = new (window.AudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine'; // 'sine', 'square', 'triangle', 'sawtooth'
    oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.2; // volume

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration / 1000);
}