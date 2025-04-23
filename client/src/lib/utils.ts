import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a number for display in the calculator
export function formatNumber(num: number | string): string {
  if (typeof num === 'string') {
    return num;
  }
  
  // Convert to string with exponential notation for very large/small numbers
  if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-10 && num !== 0)) {
    return num.toExponential(6);
  }

  // Convert to string and remove trailing zeros after decimal point
  const strNum = num.toString();
  
  // For integers, return as is
  if (!strNum.includes('.')) {
    return strNum;
  }

  // For decimals, format correctly
  const maxLength = 10;
  
  if (strNum.length > maxLength) {
    const parts = strNum.split('.');
    const integerPart = parts[0];
    
    // If the integer part is already too long
    if (integerPart.length >= maxLength) {
      return num.toExponential(6);
    }
    
    // Otherwise truncate the decimal part
    const decimalDigits = maxLength - integerPart.length - 1;
    return num.toFixed(decimalDigits).replace(/\.?0+$/, '');
  }
  
  // Remove trailing zeros
  return strNum.replace(/\.?0+$/, '');
}

// Format the calculation history for display
export function formatHistoryExpression(expression: string): string {
  // Replace operators with their display equivalents
  return expression
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/-/g, ' − ')
    .replace(/\(/g, ' ( ')
    .replace(/\)/g, ' ) ')
    .replace(/  +/g, ' ') // Remove double spaces
    .trim();
}
