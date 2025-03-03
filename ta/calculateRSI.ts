const INITAL_RSI = [50];

/**
 * This function calculates the average of a given array
 * @param calcuationArray 
 * @param period 
 * @returns 
 */
function calculateAverage(calcuationArray, period) {
    return calcuationArray.slice(0, period).reduce((a, b) => a + b) / period
}

/**
 * This calculates the gains and losses of a given price series
 * @param prices 
 * @returns 
 */
function calculatePriceChanges(prices) {
    let gains = [];
    let losses = [];
    for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? -change : 0);
    }
    return {
        gains,
        losses
    }
}

/**
 * This function calculates the RSI values of a given price series
 * @param prices 
 * @param period 
 * @param avgGain 
 * @param avgLoss 
 * @param gains 
 * @param losses 
 * @returns 
 */
function calculateRSIValues(prices, period, avgGain, avgLoss, gains, losses) {
    const rsi = INITAL_RSI;
    for (let i = period; i < prices.length; i++) {
        avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
        avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;

        const rs = avgGain / (avgLoss || 1); // Avoid division by zero
        rsi.push(100 - (100 / (1 + rs)));
    }
    return rsi;
}
    
/**
 * This function calculates the RSI (Relative Strength Index) of a given price series
 * @param prices 
 * @param period 
 * @returns number[]
 */
export async function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) {
        return Array(prices.length).fill(50);
    }

    const { gains, losses } = calculatePriceChanges(prices);
    const avgGain = calculateAverage(gains, period);
    const avgLoss = calculateAverage(losses, period);
    const rsi = calculateRSIValues(prices, period, avgGain, avgLoss, gains, losses);

    return rsi;
}