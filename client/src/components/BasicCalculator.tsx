import React from "react";
import { useCalculatorContext } from "@/context/CalculatorContext";
import { parseExpression } from "@/lib/calculatorLogic";
import { Delete } from "lucide-react";

const BasicCalculator: React.FC = () => {
  const {
    calculatorState,
    setCurrentInput,
    setPreviousInput,
    setOperator,
    setWaitingForOperand,
    setMemory,
    addToHistory,
  } = useCalculatorContext();

  const {
    currentInput,
    previousInput,
    operator,
    waitingForOperand,
    memory,
  } = calculatorState;

  // Input digit handler
  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setCurrentInput(digit);
      setWaitingForOperand(false);
    } else {
      setCurrentInput(currentInput === '0' ? digit : currentInput + digit);
    }
  };

  // Decimal point handler
  const inputDecimal = () => {
    if (waitingForOperand) {
      setCurrentInput('0.');
      setWaitingForOperand(false);
    } else if (currentInput.indexOf('.') === -1) {
      setCurrentInput(currentInput + '.');
    }
  };

  // Clear handler
  const clearAll = () => {
    setCurrentInput('0');
    setPreviousInput('');
    setOperator('');
    setWaitingForOperand(false);
  };

  // Delete handler
  const handleBackspace = () => {
    if (waitingForOperand) return;
    setCurrentInput(
      currentInput.length === 1 ? '0' : currentInput.slice(0, -1)
    );
  };

  // Toggle sign handler
  const toggleSign = () => {
    setCurrentInput(
      currentInput.charAt(0) === '-' ? currentInput.slice(1) : '-' + currentInput
    );
  };

  // Percentage handler
  const percentage = () => {
    const value = parseFloat(currentInput);
    setCurrentInput(String(value / 100));
  };

  // Operation handler
  const handleOperation = (nextOperator: string) => {
    const inputValue = parseFloat(currentInput);

    if (previousInput === '' && !isNaN(inputValue)) {
      setPreviousInput(currentInput);
    } else if (operator) {
      const result = calculate();
      setPreviousInput(String(result));
      setCurrentInput(String(result));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  // Calculate the result
  const calculate = () => {
    if (operator === '' || previousInput === '') return parseFloat(currentInput);

    const prevValue = parseFloat(previousInput);
    const currentValue = parseFloat(currentInput);
    let result: number;

    // Use parseExpression for safety, but this can be expanded
    try {
      const expression = `${prevValue} ${operator.replace('×', '*').replace('÷', '/')} ${currentValue}`;
      result = parseExpression(expression);

      const historyItem = {
        expression,
        result: String(result),
        timestamp: Date.now(),
      };
      
      addToHistory(historyItem);
    } catch (e) {
      result = NaN;
    }

    return result;
  };

  // Equals handler
  const handleEquals = () => {
    if (operator === '') return;

    const result = calculate();
    setCurrentInput(String(result));
    setPreviousInput('');
    setOperator('=');
    setWaitingForOperand(true);
  };

  // Memory handlers
  const memoryClear = () => {
    setMemory(0);
  };

  const memoryRecall = () => {
    setCurrentInput(String(memory));
    setWaitingForOperand(false);
  };

  const memoryAdd = () => {
    const value = memory + parseFloat(currentInput);
    setMemory(value);
    setWaitingForOperand(true);
  };

  const memorySubtract = () => {
    const value = memory - parseFloat(currentInput);
    setMemory(value);
    setWaitingForOperand(true);
  };

  return (
    <div className="p-2 grid grid-cols-4 gap-2 bg-background dark:bg-background">
      {/* Memory Row */}
      <button className="calculator-memory-button" onClick={memoryClear}>
        MC
      </button>
      <button className="calculator-memory-button" onClick={memoryRecall}>
        MR
      </button>
      <button className="calculator-memory-button" onClick={memoryAdd}>
        M+
      </button>
      <button className="calculator-memory-button" onClick={memorySubtract}>
        M-
      </button>

      {/* Clear, Delete and Basic Operators */}
      <button className="calculator-clear-button" onClick={clearAll}>
        C
      </button>
      <button className="calculator-clear-button" onClick={handleBackspace}>
        <Delete className="mx-auto" size={20} />
      </button>
      <button className="calculator-clear-button" onClick={percentage}>
        %
      </button>
      <button className="calculator-operator-button" onClick={() => handleOperation('/')}>
        ÷
      </button>

      {/* Number Row 7-9 and Multiply */}
      <button className="calculator-number-button" onClick={() => inputDigit('7')}>
        7
      </button>
      <button className="calculator-number-button" onClick={() => inputDigit('8')}>
        8
      </button>
      <button className="calculator-number-button" onClick={() => inputDigit('9')}>
        9
      </button>
      <button className="calculator-operator-button" onClick={() => handleOperation('*')}>
        ×
      </button>

      {/* Number Row 4-6 and Subtract */}
      <button className="calculator-number-button" onClick={() => inputDigit('4')}>
        4
      </button>
      <button className="calculator-number-button" onClick={() => inputDigit('5')}>
        5
      </button>
      <button className="calculator-number-button" onClick={() => inputDigit('6')}>
        6
      </button>
      <button className="calculator-operator-button" onClick={() => handleOperation('-')}>
        −
      </button>

      {/* Number Row 1-3 and Add */}
      <button className="calculator-number-button" onClick={() => inputDigit('1')}>
        1
      </button>
      <button className="calculator-number-button" onClick={() => inputDigit('2')}>
        2
      </button>
      <button className="calculator-number-button" onClick={() => inputDigit('3')}>
        3
      </button>
      <button className="calculator-operator-button" onClick={() => handleOperation('+')}>
        +
      </button>

      {/* Number Row 0, Decimal and Equals */}
      <button className="calculator-number-button" onClick={toggleSign}>
        ±
      </button>
      <button className="calculator-number-button" onClick={() => inputDigit('0')}>
        0
      </button>
      <button className="calculator-number-button" onClick={inputDecimal}>
        .
      </button>
      <button className="calculator-equals-button" onClick={handleEquals}>
        =
      </button>
    </div>
  );
};

export default BasicCalculator;
