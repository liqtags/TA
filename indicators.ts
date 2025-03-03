// Technical Analysis Functions
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
      continue;
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // Initialize with SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  ema[period - 1] = sum / period;

  // Calculate EMA
  for (let i = period; i < data.length; i++) {
    ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
  }

  // Fill in NaN for initial values
  for (let i = 0; i < period - 1; i++) {
    ema[i] = NaN;
  }

  return ema;
}

export function calculateRSI(data: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    gains.push(Math.max(0, change));
    losses.push(Math.max(0, -change));
  }

  // Calculate initial averages
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // First RSI value
  rsi.push(100 - (100 / (1 + avgGain / avgLoss)));

  // Calculate subsequent values
  for (let i = period; i < data.length - 1; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    rsi.push(100 - (100 / (1 + avgGain / avgLoss)));
  }

  return Array(period).fill(NaN).concat(rsi);
}

export function calculateStochastic(
  high: number[],
  low: number[],
  close: number[],
  period: number = 14,
  smoothK: number = 3,
  smoothD: number = 3,
): { k: number[]; d: number[] } {
  const k: number[] = [];
  const d: number[] = [];

  for (let i = period - 1; i < close.length; i++) {
    let lowestLow = Math.min(...low.slice(i - (period - 1), i + 1));
    let highestHigh = Math.max(...high.slice(i - (period - 1), i + 1));
    k[i] = ((close[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
  }

  // Smooth K values
  if (smoothK > 1) {
    const smoothedK = calculateSMA(k.filter((x) => !isNaN(x)), smoothK);
    k.splice(period - 1, k.length - (period - 1), ...smoothedK);
  }

  // Calculate D (SMA of K)
  const smoothedD = calculateSMA(k.filter((x) => !isNaN(x)), smoothD);
  d.splice(period - 1, d.length - (period - 1), ...smoothedD);

  return { k, d };
}

export function calculateBollingerBands(
  data: number[],
  period: number = 20,
  stdDev: number = 2,
): { upper: number[]; middle: number[]; lower: number[] } {
  const middle = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }

    const slice = data.slice(i - period + 1, i + 1);
    const std = Math.sqrt(
      slice.reduce((sum, val) => sum + Math.pow(val - middle[i], 2), 0) /
        period,
    );

    upper.push(middle[i] + stdDev * std);
    lower.push(middle[i] - stdDev * std);
  }

  return { upper, middle, lower };
}

export function calculateADX(
  high: number[],
  low: number[],
  close: number[],
  period: number = 14,
): number[] {
  const adx: number[] = [];
  const trueRange: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];

  // Calculate TR and DM
  for (let i = 1; i < close.length; i++) {
    const tr = Math.max(
      high[i] - low[i],
      Math.abs(high[i] - close[i - 1]),
      Math.abs(low[i] - close[i - 1]),
    );
    trueRange.push(tr);

    const highDiff = high[i] - high[i - 1];
    const lowDiff = low[i - 1] - low[i];

    plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
    minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
  }

  // Smooth TR and DM
  const smoothTR = calculateEMA(trueRange, period);
  const smoothPlusDM = calculateEMA(plusDM, period);
  const smoothMinusDM = calculateEMA(minusDM, period);

  // Calculate +DI and -DI
  const plusDI = smoothPlusDM.map((dm, i) => (dm / smoothTR[i]) * 100);
  const minusDI = smoothMinusDM.map((dm, i) => (dm / smoothTR[i]) * 100);

  // Calculate DX
  const dx = plusDI.map((plus, i) => {
    const minus = minusDI[i];
    return Math.abs(plus - minus) / (plus + minus) * 100;
  });

  // Calculate ADX
  adx[period * 2 - 2] =
    dx.slice(period - 1, period * 2 - 1).reduce((a, b) => a + b, 0) / period;
  for (let i = period * 2 - 1; i < close.length; i++) {
    adx[i] = ((adx[i - 1] * (period - 1)) + dx[i]) / period;
  }

  // Fill in NaN for initial values
  for (let i = 0; i < period * 2 - 2; i++) {
    adx[i] = NaN;
  }

  return adx;
}

export function calculateCMF(
  high: number[],
  low: number[],
  close: number[],
  volume: number[],
  period: number = 20,
): number[] {
  const cmf: number[] = [];
  const mfv: number[] = []; // Money Flow Volume

  // Calculate Money Flow Multiplier and Money Flow Volume
  for (let i = 0; i < close.length; i++) {
    const range = high[i] - low[i];
    const mfm = range === 0
      ? 0
      : ((close[i] - low[i]) - (high[i] - close[i])) / range;
    mfv.push(mfm * volume[i]);
  }

  // Calculate CMF using rolling sums
  for (let i = period - 1; i < close.length; i++) {
    const sumMFV = mfv.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    const sumVolume = volume.slice(i - period + 1, i + 1).reduce(
      (a, b) => a + b,
      0,
    );
    cmf[i] = sumVolume === 0 ? 0 : sumMFV / sumVolume;
  }

  // Fill in NaN for initial values
  for (let i = 0; i < period - 1; i++) {
    cmf[i] = NaN;
  }

  return cmf;
}

export function calculateCCI(
  high: number[],
  low: number[],
  close: number[],
  period: number = 20,
): number[] {
  const cci: number[] = [];
  const tp: number[] = []; // Typical Price

  // Calculate Typical Price
  for (let i = 0; i < close.length; i++) {
    tp[i] = (high[i] + low[i] + close[i]) / 3;
  }

  const smaTP = calculateSMA(tp, period);

  for (let i = period - 1; i < close.length; i++) {
    let meanDeviation = 0;
    for (let j = i - period + 1; j <= i; j++) {
      meanDeviation += Math.abs(tp[j] - smaTP[i]);
    }
    meanDeviation /= period;

    cci[i] = meanDeviation === 0
      ? 0
      : (tp[i] - smaTP[i]) / (0.015 * meanDeviation);
  }

  // Fill in NaN for initial values
  for (let i = 0; i < period - 1; i++) {
    cci[i] = NaN;
  }

  return cci;
}

export function calculateLinearRegressionSlope(
  data: number[],
  period: number = 14,
): number[] {
  const slope: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      slope[i] = NaN;
      continue;
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let j = 0; j < period; j++) {
      const x = j;
      const y = data[i - (period - 1) + j];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    const n = period;
    const denominator = n * sumXX - sumX * sumX;
    slope[i] = Math.abs(denominator) < 1e-12
      ? 0
      : (n * sumXY - sumX * sumY) / denominator;
  }

  return slope;
}

export function calculateAroon(
  high: number[],
  low: number[],
  period: number = 14,
): {
  up: number[];
  down: number[];
  oscillator: number[];
} {
  const up: number[] = [];
  const down: number[] = [];
  const oscillator: number[] = [];

  for (let i = 0; i < high.length; i++) {
    if (i < period - 1) {
      up[i] = down[i] = oscillator[i] = NaN;
      continue;
    }

    let highestIndex = i;
    let lowestIndex = i;
    let highestHigh = high[i];
    let lowestLow = low[i];

    for (let j = i - (period - 1); j <= i; j++) {
      if (high[j] > highestHigh) {
        highestHigh = high[j];
        highestIndex = j;
      }
      if (low[j] < lowestLow) {
        lowestLow = low[j];
        lowestIndex = j;
      }
    }

    up[i] = ((period - (i - highestIndex)) / period) * 100;
    down[i] = ((period - (i - lowestIndex)) / period) * 100;
    oscillator[i] = up[i] - down[i];
  }

  return { up, down, oscillator };
}

export function calculateChoppinessIndex(
  high: number[],
  low: number[],
  close: number[],
  period: number = 14,
): number[] {
  const chop: number[] = [];

  for (let i = 0; i < close.length; i++) {
    if (i < period) {
      chop[i] = NaN;
      continue;
    }

    let sumTR = 0;
    let highest = high[i];
    let lowest = low[i];

    for (let j = i - period + 1; j <= i; j++) {
      const tr = Math.max(
        high[j] - low[j],
        Math.abs(high[j] - close[j - 1]),
        Math.abs(low[j] - close[j - 1]),
      );
      sumTR += tr;

      highest = Math.max(highest, high[j]);
      lowest = Math.min(lowest, low[j]);
    }

    const range = highest - lowest;
    if (range < 1e-10) {
      chop[i] = 100;
    } else {
      chop[i] = 100 * Math.log10(sumTR / range) / Math.log10(period);
    }
  }

  return chop;
}

export function calculatePivotPoints(
  high: number[],
  low: number[],
  close: number[],
): {
  r1: number[];
  r2: number[];
  r3: number[];
  s1: number[];
  s2: number[];
  s3: number[];
} {
  const r1: number[] = [];
  const r2: number[] = [];
  const r3: number[] = [];
  const s1: number[] = [];
  const s2: number[] = [];
  const s3: number[] = [];

  for (let i = 1; i < close.length; i++) {
    const prevHigh = high[i - 1];
    const prevLow = low[i - 1];
    const prevClose = close[i - 1];
    const pivot = (prevHigh + prevLow + prevClose) / 3;

    r1[i] = 2 * pivot - prevLow;
    s1[i] = 2 * pivot - prevHigh;

    r2[i] = pivot + (prevHigh - prevLow);
    s2[i] = pivot - (prevHigh - prevLow);

    r3[i] = prevHigh + 2 * (pivot - prevLow);
    s3[i] = prevLow - 2 * (prevHigh - pivot);
  }

  // First bar has no previous data
  r1[0] =
    r2[0] =
    r3[0] =
    s1[0] =
    s2[0] =
    s3[0] =
      NaN;

  return { r1, r2, r3, s1, s2, s3 };
}

export function calculateFibonacciRetracements(
  high: number[],
  low: number[],
  period: number = 20,
): {
  fib236: number[];
  fib382: number[];
  fib500: number[];
  fib618: number[];
} {
  const fib236: number[] = [];
  const fib382: number[] = [];
  const fib500: number[] = [];
  const fib618: number[] = [];

  for (let i = 0; i < high.length; i++) {
    if (i < period - 1) {
      fib236[i] =
        fib382[i] =
        fib500[i] =
        fib618[i] =
          NaN;
      continue;
    }

    let localHigh = -Infinity;
    let localLow = Infinity;
    for (let j = i - (period - 1); j <= i; j++) {
      localHigh = Math.max(localHigh, high[j]);
      localLow = Math.min(localLow, low[j]);
    }

    const diff = localHigh - localLow;
    fib236[i] = localHigh - 0.236 * diff;
    fib382[i] = localHigh - 0.382 * diff;
    fib500[i] = localHigh - 0.50 * diff;
    fib618[i] = localHigh - 0.618 * diff;
  }

  return { fib236, fib382, fib500, fib618 };
}

// Candlestick pattern detection functions
export function isBullishEngulfing(
  open1: number,
  close1: number,
  open2: number,
  close2: number,
): boolean {
  return (
    close1 < open1 && // First candle is bearish
    close2 > open2 && // Second candle is bullish
    open2 < close1 && // Second candle opens below first close
    close2 > open1 // Second candle closes above first open
  );
}

export function isBearishEngulfing(
  open1: number,
  close1: number,
  open2: number,
  close2: number,
): boolean {
  return (
    close1 > open1 && // First candle is bullish
    close2 < open2 && // Second candle is bearish
    open2 > close1 && // Second candle opens above first close
    close2 < open1 // Second candle closes below first open
  );
}

export function isBullishHarami(
  open1: number,
  close1: number,
  high1: number,
  low1: number,
  open2: number,
  close2: number,
  high2: number,
  low2: number,
): boolean {
  const firstBearish = close1 < open1;
  const secondBullish = close2 > open2;
  const insidePrevBody = high2 < open1 && low2 > close1;
  const smallerBody = Math.abs(close2 - open2) < Math.abs(close1 - open1) * 0.6;

  return firstBearish && secondBullish && insidePrevBody && smallerBody;
}

export function isBearishHarami(
  open1: number,
  close1: number,
  high1: number,
  low1: number,
  open2: number,
  close2: number,
  high2: number,
  low2: number,
): boolean {
  const firstBullish = close1 > open1;
  const secondBearish = close2 < open2;
  const insidePrevBody = high2 < close1 && low2 > open1;
  const smallerBody = Math.abs(close2 - open2) < Math.abs(close1 - open1) * 0.6;

  return firstBullish && secondBearish && insidePrevBody && smallerBody;
}

export function isDoji(
  bar: { open: number; close: number; high: number; low: number },
): boolean {
  return Math.abs(bar.close - bar.open) < (bar.high - bar.low) * 0.1;
}

export function isHammer(
  bar: { open: number; close: number; high: number; low: number },
): boolean {
  return (
    bar.close > bar.open &&
    bar.close === bar.high &&
    bar.close - bar.open > (bar.high - bar.low) * 0.6 &&
    bar.open - bar.low < (bar.high - bar.low) * 0.1
  );
}

export function isShootingStar(bar: {
  open: number;
  close: number;
  high: number;
  low: number;
}): boolean {
  return (
    bar.close < bar.open &&
    bar.close === bar.low &&
    bar.open - bar.close > (bar.high - bar.low) * 0.6 &&
    bar.high - bar.open < (bar.high - bar.low) * 0.1
  );
}

export function isMorningStar(
  bar1: { open: number; close: number; high: number; low: number },
  bar2: { open: number; close: number; high: number; low: number },
  bar3: { open: number; close: number; high: number; low: number },
): boolean {
  const firstBearish = bar1.close < bar1.open;
  const smallMiddle =
    Math.abs(bar2.close - bar2.open) < Math.abs(bar1.close - bar1.open) * 0.3;
  const lastBullish = bar3.close > bar3.open;
  const gap = bar2.high < bar1.low && bar2.high < bar3.low;

  return firstBearish && smallMiddle && lastBullish && gap;
}

export function isEveningStar(
  bar1: { open: number; close: number; high: number; low: number },
  bar2: { open: number; close: number; high: number; low: number },
  bar3: { open: number; close: number; high: number; low: number },
): boolean {
  const firstBullish = bar1.close > bar1.open;
  const smallMiddle =
    Math.abs(bar2.close - bar2.open) < Math.abs(bar1.close - bar1.open) * 0.3;
  const lastBearish = bar3.close < bar3.open;
  const gap = bar2.low > bar1.high && bar2.low > bar3.high;

  return firstBullish && smallMiddle && lastBearish && gap;
}

export function isThreeWhiteSoldiers(
  bar1: { open: number; close: number; high: number },
  bar2: { open: number; close: number; high: number },
  bar3: { open: number; close: number; high: number },
): boolean {
  const allBullish = bar1.close > bar1.open && bar2.close > bar2.open &&
    bar3.close > bar3.open;

  const progressivelyHigher = bar2.close > bar1.close &&
    bar3.close > bar2.close;

  const smallUpperShadows =
    bar1.high - bar1.close <= (bar1.close - bar1.open) * 0.1 &&
    bar2.high - bar2.close <= (bar2.close - bar2.open) * 0.1 &&
    bar3.high - bar3.close <= (bar3.close - bar3.open) * 0.1;

  return allBullish && progressivelyHigher && smallUpperShadows;
}

export function isThreeBlackCrows(
  bar1: { open: number; close: number; low: number },
  bar2: { open: number; close: number; low: number },
  bar3: { open: number; close: number; low: number },
): boolean {
  const allBearish = bar1.close < bar1.open && bar2.close < bar2.open &&
    bar3.close < bar3.open;

  const progressivelyLower = bar2.close < bar1.close && bar3.close < bar2.close;

  const smallLowerShadows =
    bar1.close - bar1.low <= (bar1.open - bar1.close) * 0.1 &&
    bar2.close - bar2.low <= (bar2.open - bar2.close) * 0.1 &&
    bar3.close - bar3.low <= (bar3.open - bar3.close) * 0.1;

  return allBearish && progressivelyLower && smallLowerShadows;
}

export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod) {
        return {
            macdLine: [],
            signalLine: [],
            histogram: []
        };
    }

    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    const macdLine = fastEMA.map((fast, i) => 
        fast - (slowEMA[i] || 0)
    ).slice(slowPeriod - 1);

    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    
    const histogram = macdLine.map((macd, i) => 
        macd - (signalLine[i] || 0)
    );

    return {
        macdLine,
        signalLine,
        histogram
    };
}

export function calculateATR(highs, lows, closes, period = 14) {
    if (highs.length < 2) return [];

    const trueRanges = [Math.abs(highs[0] - lows[0])];
    
    for (let i = 1; i < highs.length; i++) {
        const tr1 = Math.abs(highs[i] - lows[i]);
        const tr2 = Math.abs(highs[i] - closes[i - 1]);
        const tr3 = Math.abs(lows[i] - closes[i - 1]);
        trueRanges.push(Math.max(tr1, tr2, tr3));
    }

    return this.calculateSmoothedAverage(trueRanges, period);
}

export function calculateVWAP(prices, volumes) {
    if (prices.length !== volumes.length || prices.length === 0) return [];

    let cumVolume = 0;
    let cumPV = 0;
    return prices.map((price, i) => {
        cumVolume += volumes[i];
        cumPV += price * volumes[i];
        return cumPV / cumVolume;
    });
}

export function calculateWilliamsR(highs, lows, closes, period = 14) {
    if (closes.length < period) return [];

    const result = [];
    
    for (let i = period - 1; i < closes.length; i++) {
        const highInPeriod = Math.max(...highs.slice(i - period + 1, i + 1));
        const lowInPeriod = Math.min(...lows.slice(i - period + 1, i + 1));
        const close = closes[i];
        
        const wr = ((highInPeriod - close) / (highInPeriod - lowInPeriod)) * -100;
        result.push(wr);
    }

    return result;
}

export function calculateMFI(highs, lows, closes, volumes, period = 14) {
    if (closes.length < period + 1) return [];

    const typicalPrices = closes.map((close, i) => 
        (highs[i] + lows[i] + close) / 3
    );

    const moneyFlow = typicalPrices.map((tp, i) => tp * volumes[i]);
    const positiveFlow = [];
    const negativeFlow = [];

    for (let i = 1; i < typicalPrices.length; i++) {
        if (typicalPrices[i] > typicalPrices[i - 1]) {
            positiveFlow.push(moneyFlow[i]);
            negativeFlow.push(0);
        } else if (typicalPrices[i] < typicalPrices[i - 1]) {
            positiveFlow.push(0);
            negativeFlow.push(moneyFlow[i]);
        } else {
            positiveFlow.push(0);
            negativeFlow.push(0);
        }
    }

    const result = [];
    
    for (let i = period - 1; i < positiveFlow.length; i++) {
        const positiveSum = positiveFlow.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        const negativeSum = negativeFlow.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        
        const mfi = 100 - (100 / (1 + (positiveSum / (negativeSum || 1))));
        result.push(mfi);
    }

    return result;
}

export function calculateIchimoku(highs, lows, closes, conversionPeriod = 9, basePeriod = 26, spanBPeriod = 52, displacement = 26) {
    if (!Array.isArray(highs) || !Array.isArray(lows) || !Array.isArray(closes) ||
        highs.length < spanBPeriod || lows.length < spanBPeriod || closes.length < spanBPeriod) {
        return {
            tenkan: null,
            kijun: null,
            senkouA: null,
            senkouB: null,
            currentPrice: null,
            cloudTop: null,
            cloudBottom: null,
            cloud: 'NEUTRAL'
        };
    }

    try {
        // Calculate Tenkan-sen (Conversion Line)
        const tenkanPeriodHigh = Math.max(...highs.slice(-conversionPeriod));
        const tenkanPeriodLow = Math.min(...lows.slice(-conversionPeriod));
        const tenkan = (tenkanPeriodHigh + tenkanPeriodLow) / 2;

        // Calculate Kijun-sen (Base Line)
        const kijunPeriodHigh = Math.max(...highs.slice(-basePeriod));
        const kijunPeriodLow = Math.min(...lows.slice(-basePeriod));
        const kijun = (kijunPeriodHigh + kijunPeriodLow) / 2;

        // Calculate Senkou Span A (Leading Span A)
        const senkouA = (tenkan + kijun) / 2;

        // Calculate Senkou Span B (Leading Span B)
        const senkouPeriodHigh = Math.max(...highs.slice(-spanBPeriod));
        const senkouPeriodLow = Math.min(...lows.slice(-spanBPeriod));
        const senkouB = (senkouPeriodHigh + senkouPeriodLow) / 2;

        const currentPrice = closes[closes.length - 1];
        const cloudTop = Math.max(senkouA, senkouB);
        const cloudBottom = Math.min(senkouA, senkouB);

        if (isNaN(cloudTop) || isNaN(cloudBottom) || isNaN(currentPrice)) {
            throw new Error('Invalid Ichimoku calculation results');
        }

        return {
            tenkan,
            kijun,
            senkouA,
            senkouB,
            currentPrice,
            cloudTop,
            cloudBottom,
            cloud: currentPrice > cloudTop ? 'BULLISH' : currentPrice < cloudBottom ? 'BEARISH' : 'NEUTRAL'
        };
    } catch (error) {
        console.error('Error in Ichimoku calculation:', error);
        return {
            tenkan: null,
            kijun: null,
            senkouA: null,
            senkouB: null,
            currentPrice: null,
            cloudTop: null,
            cloudBottom: null,
            cloud: 'NEUTRAL'
        };
    }
}

export function calculateFibonacci(highs, lows, closes) {
    if (!Array.isArray(highs) || !Array.isArray(lows) || !Array.isArray(closes) ||
        highs.length === 0 || lows.length === 0 || closes.length === 0) {
        return {
            levels: {},
            currentLevel: '0',
            retracement: 0,
            currentPrice: null
        };
    }

    try {
        // Get the recent high and low
        const validHighs = highs.filter(h => !isNaN(h) && h !== null);
        const validLows = lows.filter(l => !isNaN(l) && l !== null);
        
        if (validHighs.length === 0 || validLows.length === 0) {
            throw new Error('No valid high/low values');
        }

        const high = Math.max(...validHighs);
        const low = Math.min(...validLows);
        const currentPrice = closes[closes.length - 1];

        if (isNaN(high) || isNaN(low) || isNaN(currentPrice)) {
            throw new Error('Invalid price values');
        }

        const diff = high - low;
        const levels = {
            '0': low,
            '0.236': parseFloat((low + diff * 0.236).toFixed(2)),
            '0.382': parseFloat((low + diff * 0.382).toFixed(2)),
            '0.5': parseFloat((low + diff * 0.5).toFixed(2)),
            '0.618': parseFloat((low + diff * 0.618).toFixed(2)),
            '0.786': parseFloat((low + diff * 0.786).toFixed(2)),
            '1': high
        };

        // Find current retracement level
        let currentLevel = '0';
        let retracement = 0;
        
        Object.entries(levels).forEach(([level, price]) => {
            if (currentPrice >= price) {
                currentLevel = level;
                retracement = parseFloat(level);
            }
        });

        return {
            levels,
            currentLevel,
            retracement,
            currentPrice: parseFloat(currentPrice.toFixed(2))
        };
    } catch (error) {
        console.error('Error in Fibonacci calculation:', error);
        return {
            levels: {},
            currentLevel: '0',
            retracement: 0,
            currentPrice: null
        };
    }
}

export function calculateSupertrend(highs, lows, closes, period = 10, multiplier = 3) {
    if (!highs.length || !lows.length || !closes.length || highs.length < period) {
        return {
            trend: 'NEUTRAL',
            value: null,
            upperBand: null,
            lowerBand: null
        };
    }

    try {
        const atr = this.calculateATR(highs, lows, closes, period);
        if (!atr.length) {
            return {
                trend: 'NEUTRAL',
                value: null,
                upperBand: null,
                lowerBand: null
            };
        }

        const basicUpperBand = closes.map((close, i) => {
            const value = (highs[i] + lows[i]) / 2 + multiplier * (atr[i] || atr[atr.length - 1]);
            return isNaN(value) ? null : value;
        });

        const basicLowerBand = closes.map((close, i) => {
            const value = (highs[i] + lows[i]) / 2 - multiplier * (atr[i] || atr[atr.length - 1]);
            return isNaN(value) ? null : value;
        });

        let upperBand = [...basicUpperBand];
        let lowerBand = [...basicLowerBand];
        let trend = 'NEUTRAL';
        let supertrendValue = closes[closes.length - 1];

        for (let i = 1; i < closes.length; i++) {
            if (basicUpperBand[i] === null || upperBand[i - 1] === null || closes[i - 1] === null) {
                upperBand[i] = basicUpperBand[i];
            } else if (basicUpperBand[i] < upperBand[i - 1] || closes[i - 1] > upperBand[i - 1]) {
                upperBand[i] = basicUpperBand[i];
            } else {
                upperBand[i] = upperBand[i - 1];
            }

            if (basicLowerBand[i] === null || lowerBand[i - 1] === null || closes[i - 1] === null) {
                lowerBand[i] = basicLowerBand[i];
            } else if (basicLowerBand[i] > lowerBand[i - 1] || closes[i - 1] < lowerBand[i - 1]) {
                lowerBand[i] = basicLowerBand[i];
            } else {
                lowerBand[i] = lowerBand[i - 1];
            }
        }

        const lastClose = closes[closes.length - 1];
        const lastUpper = upperBand[upperBand.length - 1];
        const lastLower = lowerBand[lowerBand.length - 1];

        if (lastClose !== null && lastUpper !== null && lastLower !== null) {
            if (lastClose > lastUpper) {
                trend = 'BULLISH';
                supertrendValue = lastLower;
            } else if (lastClose < lastLower) {
                trend = 'BEARISH';
                supertrendValue = lastUpper;
            }
        }

        return {
            trend,
            value: supertrendValue,
            upperBand: lastUpper,
            lowerBand: lastLower
        };
    } catch (error) {
        console.error('Error calculating Supertrend:', error);
        return {
            trend: 'NEUTRAL',
            value: null,
            upperBand: null,
            lowerBand: null
        };
    }
}

export function calculateSmoothedAverage(data, period) {
    if (data.length < period) return [];

    const result = [data.slice(0, period).reduce((a, b) => a + b) / period];
    
    for (let i = period; i < data.length; i++) {
        result.push(((result[result.length - 1] * (period - 1)) + data[i]) / period);
    }

    return result;
}

export function calculateStandardDeviation(data) {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b) / data.length;
    return Math.sqrt(variance);
}