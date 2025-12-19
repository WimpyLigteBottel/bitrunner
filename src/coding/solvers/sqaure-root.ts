export function solve(n: bigint): bigint {
  if (n < 0n) throw new Error("Negative numbers not supported");
  if (n < 2n) return n;

  let low = 1n;
  let high = n;
  let mid: bigint;

  while (low <= high) {
    mid = (low + high) / 2n;
    const midSquared = mid * mid;

    if (midSquared === n) {
      return mid; // exact square root
    } else if (midSquared < n) {
      low = mid + 1n;
    } else {
      high = mid - 1n;
    }
  }

  // high < low now
  // high^2 <= n < low^2
  // pick whichever is closer
  const highDiff = n - high * high;
  const lowDiff = low * low - n;

  return highDiff <= lowDiff ? high : low;
}
