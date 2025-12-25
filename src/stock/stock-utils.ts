import { NS } from "@ns";
import { StockMarketSimplified, Trend, TrendType } from "./Models";
import { readState } from "./state";

export function getSpread(ns: NS, symbol: string): number {
  let bid = ns.stock.getBidPrice(symbol);
  let ask = ns.stock.getAskPrice(symbol);

  return ((ask - bid) / ask) * 100;
}

export function getVolatility(
  symbol: string,
  stats: Record<string, StockMarketSimplified[]>
) {
  const prices = stats[symbol].map((x) => x.price);

  if (prices.length < 2) return 0;

  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const squaredDiffs = prices.map((price) => Math.pow(price - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  // Return as percentage of mean
  return (stdDev / mean) * 100;
}

export async function waitForStockTick(ns: NS, symbol = "WDS") {
  let lastPrice = ns.stock.getPrice(symbol);

  while (true) {
    await ns.sleep(200);
    const price = ns.stock.getPrice(symbol);

    if (price !== lastPrice) {
      return;
    }
  }
}

function simpleForecast(priceHistory: number[], slice = 100): Trend {
  const recent = priceHistory.slice(-slice);
  let inc = 0;
  let dec = 0;

  for (let i = 1; i < recent.length; i++) {
    if (recent[i] > recent[i - 1]) inc++;
    if (recent[i] < recent[i - 1]) dec++;
  }
  return { up: inc, down: dec, trend: "UNKOWN" };
}

export function simpleForecastPricePoint(
  ns: NS,
  sym: string,
  slice: number,
  stats: Record<string, StockMarketSimplified[]> | undefined
): Trend {
  let state = stats ?? readState(ns);

  const priceHistory = state[sym].map((x) => x.price);

  const result = simpleForecast(priceHistory, slice + 1);

  let trendType: TrendType = "SAME";

  if (result.up > result.down) {
    if (result.up > result.down * 2) {
      trendType = "VERY_STRONG";
    } else if (result.up > result.down * 1.2) {
      trendType = "STRONG";
    } else {
      trendType = "SAME";
    }
  } else {
    if (result.down > result.up * 2) {
      trendType = "VERY_WEAK";
    } else if (result.down > result.up * 1.2) {
      trendType = "WEAK";
    } else {
      trendType = "SAME";
    }
  }

  return { ...result, trend: trendType! };
}

export let globalStockList = [
  {
    hostname: "aerocorp",
    symbol: "AERO",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "alpha-ent",
    symbol: "APHE",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "blade",
    symbol: "BLD",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "clarkinc",
    symbol: "CLRK",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "comptek",
    symbol: "CTK",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "catalyst",
    symbol: "CTYS",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "defcomm",
    symbol: "DCOMM",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "ecorp",
    symbol: "ECP",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "fulcrumassets",
    symbol: "FLCM",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "foodnstuff",
    symbol: "FNS",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "4sigma",
    symbol: "FSIG",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "global-pharm",
    symbol: "GPH",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "helios",
    symbol: "HLS",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "icarus",
    symbol: "ICRS",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "joesguns",
    symbol: "JGN",
    highest: {
      high: -1,
      low: 11,
    },
  },
  {
    hostname: "kuai-gong",
    symbol: "KGI",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "lexo-corp",
    symbol: "LXO",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "microdyne",
    symbol: "MDYN",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "megacorp",
    symbol: "MGCP",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "netlink",
    symbol: "NTLK",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "nova-med",
    symbol: "NVMD",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "omega-net",
    symbol: "OMGA",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "omnia",
    symbol: "OMN",
    highest: {
      high: 0,
      low: 1,
    },
  },
  {
    hostname: "stormtech",
    symbol: "STM",
    highest: {
      high: 0,
      low: 1,
    },
  },
];

export function isTrendingUp(ns: NS, hostname: string): Boolean | undefined {
  if (!ns.stock.has4SDataTIXAPI()) return undefined;

  let result = globalStockList.find((x) => x.hostname == hostname);

  if (result == undefined) return false;

  const forecast = ns.stock.getForecast(result.symbol);

  if (hostname == result.hostname) {
    result.highest.high = 0;
    result.highest.low = 1;
    result.highest.high = parseFloat(
      Math.max(result.highest.high, forecast).toFixed(3)
    );
    result.highest.low = parseFloat(
      Math.min(result.highest.low, 1 - forecast).toFixed(3)
    );
  }

  ns.print(`${JSON.stringify(result)}`);

  if (forecast > 0.9 || forecast < 0.1) {
    return undefined;
  }

  return forecast > 0.5;
}
