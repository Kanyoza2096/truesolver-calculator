import React, { useState } from "react";
import { useCalculatorContext } from "@/context/CalculatorContext";
import { parseExpression, scientificOperations } from "@/lib/calculatorLogic";
import { Delete } from "lucide-react";

const ScientificCalculator: React.FC = () => {
  const {
    calculatorState,
    setCurrentInput,
    setPreviousInput,
    setOperator,
    setWaitingForOperand,
    addToHistory,
  } = useCalculatorContext();

  const {
    currentInput,
    previousInput,
    operator,
    waitingForOperand,
  } = calculatorState;

  const [angleMode, setAngleMode] = useState<"DEG" | "RAD">("DEG");

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

  // Toggle angle mode
  const toggleAngleMode = () => {
    setAngleMode(prevMode => (prevMode === "DEG" ? "RAD" : "DEG"));
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

  // Scientific operation handler
  const handleScientificOperation = (operation: keyof typeof scientificOperations) => {
    let value = parseFloat(currentInput);
    let result: number;

    try {
      if (angleMode === "DEG" && (operation === "sin" || operation === "cos" || operation === "tan")) {
        // In DEG mode, convert degrees to radians for the calculation
        result = scientificOperations[operation](value);
      } else if (operation === "pi") {
        result = scientificOperations.pi();
      } else if (operation === "e") {
        result = scientificOperations.e();
      } else {
        result = scientificOperations[operation](value);
      }

      setCurrentInput(String(result));
      setWaitingForOperand(true);

      // Add to history
      const expression = `${operation}(${value})`;
      addToHistory({
        expression,
        result: String(result),
        timestamp: Date.now(),
      });
    } catch (error) {
      setCurrentInput("Error");
      setWaitingForOperand(true);
    }
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

  // Parentheses handlers
  const addLeftParenthesis = () => {
    if (waitingForOperand || currentInput === '0') {
      setCurrentInput('(');
      setWaitingForOperand(false);
    } else {
      setCurrentInput(currentInput + '(');
    }
  };

  const addRightParenthesis = () => {
    if (currentInput.indexOf('(') !== -1) {
      setCurrentInput(currentInput + ')');
    }
  };

  // Power function
  const handlePower = () => {
    if (previousInput === '') {
      setPreviousInput(currentInput);
      setOperator('^');
      setWaitingForOperand(true);
    }
  };

  return (
    <div className="p-2 grid grid-cols-4 gap-2 bg-background dark:bg-background">
      {/* Scientific Functions Row 1 */}
      <button className="calculator-function-button" onClick={() => handleScientificOperation('sin')}>
        sin
      </button>
      <button className="calculator-function-button" onClick={() => handleScientificOperation('cos')}>
        cos
      </button>
      <button className="calculator-function-button" onClick={() => handleScientificOperation('tan')}>
        tan
      </button>
      <button 
        className="calculator-operator-button text-sm" 
        onClick={toggleAngleMode}
      >
        {angleMode}
      </button>

      {/* Scientific Functions Row 2 */}
      <button className="calculator-function-button" onClick={() => handleScientificOperation('log')}>
        log
      </button>
      <button className="calculator-function-button" onClick={() => handleScientificOperation('ln')}>
        ln
      </button>
      <button className="calculator-function-button" onClick={() => handleScientificOperation('pi')}>
        π
      </button>
      <button className="calculator-function-button" onClick={() => handleScientificOperation('e')}>
        e
      </button>

      {/* Clear, Parentheses and Operators */}
      <button className="calculator-clear-button" onClick={clearAll}>
        C
      </button>
      <button className="calculator-function-button" onClick={addLeftParenthesis}>
        (
      </button>
      <button className="calculator-function-button" onClick={addRightParenthesis}>
        )
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
      <button className="calculator-number-button" onClick={() => inputDigit('0')}>
        0
      </button>
      <button className="calculator-number-button" onClick={inputDecimal}>
        .
      </button>
      <button className="calculator-function-button flex items-center justify-center" onClick={handlePower}>
        x<sup>y</sup>
      </button>
      <button className="calculator-equals-button" onClick={handleEquals}>
        =
      </button>
    </div>
  );
};

export default ScientificCalculator;
