# TA

[Join the DAO](https://dexlens.io) 

A comprehensive technical analysis library for financial markets that provides a wide range of technical indicators and pattern recognition tools.

## Installation

```bash
deno add jsr:@liquid/ta
```

```javascript
import * as ta from "@liquid/ta";
```

## Overview

The `@liquid/ta` module includes implementations of popular technical indicators, candlestick pattern recognition, and signal generation capabilities.

## Features

- **Technical Indicators**: Moving averages, oscillators, volatility measures, and more
- **Candlestick Pattern Recognition**: Identify common candlestick patterns
- **Signal Generation**: Create and filter trading signals based on indicator conditions

## Usage

### Basic Example

```typescript
import { calculateEMA, calculateRSI, isBullishEngulfing } from "@liquid/ta";

// Calculate EMA using price data
const prices = [10, 11, 12, 11, 10, 11, 13, 15];
const emaPeriod = 5;
const emaValues = calculateEMA(prices, emaPeriod);

// Calculate RSI
const rsiPeriod = 14;
const rsiValues = calculateRSI(prices, rsiPeriod);

// Check for bullish engulfing pattern
const open = [10, 11, 12, 11];
const close = [11, 10, 11, 13];
const high = [12, 11, 12, 14];
const low = [9, 9, 10, 10];
const isBullish = isBullishEngulfing(open, high, low, close, 3); // Check at index 3
```

### Signal Generation

```typescript
import { generateSignals, getSignalsForCategory } from "@liquid/ta";

// Generate all signals from your price data
const signals = generateSignals({
  open: openPrices,
  high: highPrices,
  low: lowPrices,
  close: closePrices,
  volume: volumeData
});

// Get trend-related signals only
const trendSignals = getSignalsForCategory("trend");
```

## API Reference

### Technical Indicators

| Function | Description |
|----------|-------------|
| `calculateSMA(data, period)` | Simple Moving Average |
| `calculateEMA(data, period)` | Exponential Moving Average |
| `calculateRSI(data, period)` | Relative Strength Index |
| `calculateMACD(data, fastPeriod, slowPeriod, signalPeriod)` | Moving Average Convergence Divergence |
| `calculateBollingerBands(data, period, stdDev)` | Bollinger Bands |
| `calculateStochastic(high, low, close, period, smoothK, smoothD)` | Stochastic Oscillator |
| `calculateADX(high, low, close, period)` | Average Directional Index |
| `calculateATR(high, low, close, period)` | Average True Range |
| `calculateCCI(high, low, close, period)` | Commodity Channel Index |
| `calculateAroon(high, low, period)` | Aroon Indicator |
| `calculateChoppinessIndex(high, low, close, period)` | Choppiness Index |
| `calculateCMF(high, low, close, volume, period)` | Chaikin Money Flow |
| `calculateFibonacciRetracements(high, low)` | Fibonacci Retracement Levels |
| `calculatePivotPoints(high, low, close)` | Pivot Points |
| `calculateLinearRegressionSlope(data, period)` | Linear Regression Slope |
| `calculateFibonacci(high, low)` | Fibonacci Levels |
| `calculateIchimoku(high, low, conversionPeriod, basePeriod, spanPeriod, displacement)` | Ichimoku Cloud |
| `calculateMFI(high, low, close, volume, period)` | Money Flow Index |
| `calculateSmoothedAverage(data, period)` | Smoothed Average |
| `calculateStandardDeviation(data, period)` | Standard Deviation |
| `calculateSupertrend(high, low, close, period, multiplier)` | Supertrend Indicator |
| `calculateVWAP(high, low, close, volume)` | Volume Weighted Average Price |
| `calculateWilliamsR(high, low, close, period)` | Williams %R |

### Candlestick Pattern Recognition

| Function | Description |
|----------|-------------|
| `isBullishEngulfing(open, high, low, close, index)` | Bullish Engulfing Pattern |
| `isBearishEngulfing(open, high, low, close, index)` | Bearish Engulfing Pattern |
| `isBullishHarami(open, high, low, close, index)` | Bullish Harami Pattern |
| `isBearishHarami(open, high, low, close, index)` | Bearish Harami Pattern |
| `isDoji(open, high, low, close, index)` | Doji Pattern |
| `isHammer(open, high, low, close, index)` | Hammer Pattern |
| `isShootingStar(open, high, low, close, index)` | Shooting Star Pattern |
| `isMorningStar(open, high, low, close, index)` | Morning Star Pattern |
| `isEveningStar(open, high, low, close, index)` | Evening Star Pattern |
| `isThreeWhiteSoldiers(open, high, low, close, index)` | Three White Soldiers Pattern |
| `isThreeBlackCrows(open, high, low, close, index)` | Three Black Crows Pattern |

### Signal Generation

| Function | Description |
|----------|-------------|
| `generateSignals(data)` | Generate trading signals based on indicators |
| `getSignalsForCategory(category)` | Get signals filtered by category |

## Advanced Usage

### Custom Signal Generation

```typescript
import { calculateRSI, calculateEMA } from "@liquid/ta";

function createCustomSignal(prices) {
  const rsi = calculateRSI(prices, 14);
  const ema20 = calculateEMA(prices, 20);
  const ema50 = calculateEMA(prices, 50);
  
  const signals = [];
  
  for (let i = 50; i < prices.length; i++) {
    // RSI oversold and EMA crossover
    if (rsi[i] < 30 && ema20[i-1] < ema50[i-1] && ema20[i] > ema50[i]) {
      signals.push({
        type: 'BUY',
        index: i,
        price: prices[i],
        reason: 'RSI oversold with EMA crossover'
      });
    }
    
    // RSI overbought and EMA crossunder
    if (rsi[i] > 70 && ema20[i-1] > ema50[i-1] && ema20[i] < ema50[i]) {
      signals.push({
        type: 'SELL',
        index: i,
        price: prices[i],
        reason: 'RSI overbought with EMA crossunder'
      });
    }
  }
  
  return signals;
}
```
