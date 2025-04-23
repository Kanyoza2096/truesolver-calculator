import * as math from 'mathjs';

// Calculator state type
export interface CalculatorState {
  currentInput: string;
  previousInput: string;
  operator: string;
  waitingForOperand: boolean;
  memory: number;
  history: HistoryItem[];
}

// History item type
export interface HistoryItem {
  expression: string;
  result: string;
  timestamp: number;
}

// Initialize default calculator state
export const initialCalculatorState: CalculatorState = {
  currentInput: '0',
  previousInput: '',
  operator: '',
  waitingForOperand: false,
  memory: 0,
  history: [],
};

// Calculator operations
export const operations = {
  '/': (prevValue: number, nextValue: number) => prevValue / nextValue,
  '*': (prevValue: number, nextValue: number) => prevValue * nextValue,
  '+': (prevValue: number, nextValue: number) => prevValue + nextValue,
  '-': (prevValue: number, nextValue: number) => prevValue - nextValue,
  '=': (prevValue: number, nextValue: number) => nextValue,
};

// Scientific operations
export const scientificOperations = {
  sin: (value: number) => Math.sin(value * (Math.PI / 180)),
  cos: (value: number) => Math.cos(value * (Math.PI / 180)),
  tan: (value: number) => Math.tan(value * (Math.PI / 180)),
  log: (value: number) => Math.log10(value),
  ln: (value: number) => Math.log(value),
  sqrt: (value: number) => Math.sqrt(value),
  square: (value: number) => value * value,
  cube: (value: number) => value * value * value,
  exp: (value: number) => Math.exp(value),
  pow: (base: number, exponent: number) => Math.pow(base, exponent),
  pi: () => Math.PI,
  e: () => Math.E,
};

// Parser for mathematical expressions using mathjs
export function parseExpression(expression: string): number {
  try {
    return math.evaluate(expression);
  } catch (error) {
    console.error('Error parsing expression:', error);
    return NaN;
  }
}

// Load calculator history from localStorage
export function loadHistory(): HistoryItem[] {
  try {
    const historyJson = localStorage.getItem('calculatorHistory');
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error loading calculator history:', error);
    return [];
  }
}

// Save calculator history to localStorage
export function saveHistory(history: HistoryItem[]): void {
  try {
    // Limit history to last 50 items to prevent storage issues
    const limitedHistory = history.slice(-50);
    localStorage.setItem('calculatorHistory', JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving calculator history:', error);
  }
}

// Clear calculator history from localStorage
export function clearHistory(): void {
  try {
    localStorage.removeItem('calculatorHistory');
  } catch (error) {
    console.error('Error clearing calculator history:', error);
  }
}

// Save calculator memory to localStorage
export function saveMemory(memory: number): void {
  try {
    localStorage.setItem('calculatorMemory', memory.toString());
  } catch (error) {
    console.error('Error saving calculator memory:', error);
  }
}

// Load calculator memory from localStorage
export function loadMemory(): number {
  try {
    const memoryStr = localStorage.getItem('calculatorMemory');
    return memoryStr ? parseFloat(memoryStr) : 0;
  } catch (error) {
    console.error('Error loading calculator memory:', error);
    return 0;
  }
}

// Generate a simple unique device ID for anonymous users
export function getDeviceId(): string {
  try {
    let deviceId = localStorage.getItem("calculatorDeviceId");
    if (!deviceId) {
      deviceId = `device_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("calculatorDeviceId", deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return `device_${Math.random().toString(36).substring(2, 15)}`;
  }
}

// Conversion units and factors
export interface ConversionCategory {
  name: string;
  units: {
    [key: string]: {
      name: string;
      factor: number; // Conversion factor relative to the base unit
    };
  };
  baseUnit: string;
}

export const conversionCategories: { [key: string]: ConversionCategory } = {
  length: {
    name: 'Length',
    units: {
      meter: { name: 'Meters', factor: 1 },
      kilometer: { name: 'Kilometers', factor: 1000 },
      centimeter: { name: 'Centimeters', factor: 0.01 },
      millimeter: { name: 'Millimeters', factor: 0.001 },
      mile: { name: 'Miles', factor: 1609.344 },
      yard: { name: 'Yards', factor: 0.9144 },
      foot: { name: 'Feet', factor: 0.3048 },
      inch: { name: 'Inches', factor: 0.0254 },
    },
    baseUnit: 'meter',
  },
  weight: {
    name: 'Weight',
    units: {
      kilogram: { name: 'Kilograms', factor: 1 },
      gram: { name: 'Grams', factor: 0.001 },
      milligram: { name: 'Milligrams', factor: 0.000001 },
      pound: { name: 'Pounds', factor: 0.45359237 },
      ounce: { name: 'Ounces', factor: 0.028349523125 },
      ton: { name: 'Tons', factor: 1000 },
    },
    baseUnit: 'kilogram',
  },
  temperature: {
    name: 'Temperature',
    units: {
      celsius: { name: 'Celsius', factor: 1 },
      fahrenheit: { name: 'Fahrenheit', factor: 1 },
      kelvin: { name: 'Kelvin', factor: 1 },
    },
    baseUnit: 'celsius',
  },
  volume: {
    name: 'Volume',
    units: {
      liter: { name: 'Liters', factor: 1 },
      milliliter: { name: 'Milliliters', factor: 0.001 },
      cubicMeter: { name: 'Cubic Meters', factor: 1000 },
      gallon: { name: 'Gallons (US)', factor: 3.78541 },
      quart: { name: 'Quarts (US)', factor: 0.946353 },
      pint: { name: 'Pints (US)', factor: 0.473176 },
      cup: { name: 'Cups (US)', factor: 0.236588 },
    },
    baseUnit: 'liter',
  },
  area: {
    name: 'Area',
    units: {
      squareMeter: { name: 'Square Meters', factor: 1 },
      squareKilometer: { name: 'Square Kilometers', factor: 1000000 },
      squareCentimeter: { name: 'Square Centimeters', factor: 0.0001 },
      squareMillimeter: { name: 'Square Millimeters', factor: 0.000001 },
      squareMile: { name: 'Square Miles', factor: 2589988.11 },
      acre: { name: 'Acres', factor: 4046.86 },
      hectare: { name: 'Hectares', factor: 10000 },
    },
    baseUnit: 'squareMeter',
  },
  speed: {
    name: 'Speed',
    units: {
      meterPerSecond: { name: 'Meters per Second', factor: 1 },
      kilometerPerHour: { name: 'Kilometers per Hour', factor: 0.277778 },
      milePerHour: { name: 'Miles per Hour', factor: 0.44704 },
      knot: { name: 'Knots', factor: 0.514444 },
    },
    baseUnit: 'meterPerSecond',
  },
};

// Special case for temperature conversion
export function convertTemperature(value: number, fromUnit: string, toUnit: string): number {
  // Convert from input unit to Celsius (base unit)
  let celsius;
  if (fromUnit === 'celsius') {
    celsius = value;
  } else if (fromUnit === 'fahrenheit') {
    celsius = (value - 32) * (5 / 9);
  } else if (fromUnit === 'kelvin') {
    celsius = value - 273.15;
  } else {
    return NaN;
  }

  // Convert from Celsius to output unit
  if (toUnit === 'celsius') {
    return celsius;
  } else if (toUnit === 'fahrenheit') {
    return (celsius * (9 / 5)) + 32;
  } else if (toUnit === 'kelvin') {
    return celsius + 273.15;
  } else {
    return NaN;
  }
}

// Convert between units
export function convertUnits(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: string
): number {
  // Special case for temperature which doesn't use simple factors
  if (category === 'temperature') {
    return convertTemperature(value, fromUnit, toUnit);
  }

  // For other categories, use conversion factors
  const categoryData = conversionCategories[category];
  if (!categoryData) {
    return NaN;
  }

  const fromUnitData = categoryData.units[fromUnit];
  const toUnitData = categoryData.units[toUnit];
  
  if (!fromUnitData || !toUnitData) {
    return NaN;
  }

  // Convert from the input unit to the base unit, then to the output unit
  const valueInBaseUnit = value * fromUnitData.factor;
  return valueInBaseUnit / toUnitData.factor;
}
