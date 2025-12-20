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

export const globalStockList = [
  { hostname: "aerocorp",          symbol: "AERO"  },
  { hostname: "alpha-ent",         symbol: "APHE"  },
  { hostname: "blade",             symbol: "BLD"   },
  { hostname: "clarkinc",          symbol: "CLRK"  },
  { hostname: "comptek",           symbol: "CTK"   },
  { hostname: "catalyst",          symbol: "CTYS"  },
  { hostname: "defcomm",           symbol: "DCOMM" },
  { hostname: "ecorp",             symbol: "ECP"   },
  { hostname: "fulcrumassets",     symbol: "FLCM"  },
  { hostname: "foodnstuff",        symbol: "FNS"   },
  { hostname: "4sigma",            symbol: "FSIG"  },
  { hostname: "global-pharm",      symbol: "GPH"   },
  { hostname: "helios",            symbol: "HLS"   },
  { hostname: "icarus",            symbol: "ICRS"  },
  { hostname: "joesguns",          symbol: "JGN"   },
  { hostname: "kuai-gong",         symbol: "KGI"   },
  { hostname: "lexo-corp",         symbol: "LXO"   },
  { hostname: "microdyne",         symbol: "MDYN"  },
  { hostname: "megacorp",          symbol: "MGCP"  },
  { hostname: "netlink",           symbol: "NTLK"  },
  { hostname: "nova-med",          symbol: "NVMD"  },
  { hostname: "omega-net",         symbol: "OMGA"  },
  { hostname: "omnia",             symbol: "OMN"   },
  { hostname: "stormtech",         symbol: "STM"   },
];


export function isTrendingUp(ns: NS, hostname: string): Boolean {
  let result = globalStockList.find((x) => x.hostname == hostname);

  if (result == undefined) return false;

  let forecast = simpleForecastPricePoint(ns, result.symbol, 10, readState(ns));

  switch (forecast.trend) {
    case "VERY_STRONG":
    case "STRONG":
    case "SAME":
      return true;
    case "WEAK":
    case "VERY_WEAK":
    default:
      return false;
  }
}
