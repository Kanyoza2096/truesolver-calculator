import React from "react";
import { useCalculatorContext } from "@/context/CalculatorContext";
import { formatNumber, formatHistoryExpression } from "@/lib/utils";

const CalculatorDisplay: React.FC = () => {
  const { calculatorState } = useCalculatorContext();
  const { currentInput, previousInput, operator, history } = calculatorState;

  // Construct the calculation history display string
  let calculationHistory = "";
  if (previousInput) {
    calculationHistory = `${previousInput} ${operator} ${currentInput === '0' && operator !== '=' ? '' : currentInput}`;
  } else if (history.length > 0 && operator === '=') {
    // Show the last calculation when the equals button was pressed
    const lastEntry = history[history.length - 1];
    calculationHistory = `${formatHistoryExpression(lastEntry.expression)} = ${lastEntry.result}`;
  }

  return (
    <div className="bg-white dark:bg-muted p-4 shadow-md">
      {/* History Display */}
      <div 
        className="h-10 text-right text-gray-500 dark:text-gray-400 text-sm mb-1 overflow-x-auto whitespace-nowrap"
        aria-live="polite"
      >
        {calculationHistory}
      </div>
      
      {/* Main Display */}
      <div 
        className="text-right text-3xl font-semibold text-foreground dark:text-white overflow-x-auto overflow-y-hidden"
        aria-live="assertive"
      >
        {formatNumber(currentInput)}
      </div>
    </div>
  );
};

export default CalculatorDisplay;
