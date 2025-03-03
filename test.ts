import { calculateRSI } from './ta/calculateRSI.ts';

const mockPrices = [1000, 101, 102, 103, 10455, 105, 106, 107, 108, 109];
const mockPeriod = 5;
const rsi = calculateRSI(mockPrices, mockPeriod);
console.log(rsi);