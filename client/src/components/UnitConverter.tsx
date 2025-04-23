import React, { useState, useEffect } from "react";
import { conversionCategories, convertUnits } from "@/lib/calculatorLogic";
import { formatNumber } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp10, CalculatorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<string>("length");
  const [fromUnit, setFromUnit] = useState<string>("meter");
  const [toUnit, setToUnit] = useState<string>("kilometer");
  const [inputValue, setInputValue] = useState<string>("1");
  const [result, setResult] = useState<string>("");

  // Calculate conversion result
  const calculateConversion = () => {
    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue)) {
      setResult("Invalid input");
      return;
    }

    const convertedValue = convertUnits(numericValue, fromUnit, toUnit, category);
    if (isNaN(convertedValue)) {
      setResult("Conversion error");
    } else {
      setResult(`${formatNumber(convertedValue)} ${conversionCategories[category].units[toUnit].name}`);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Swap from and to units
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  // Update the result whenever inputs change
  useEffect(() => {
    calculateConversion();
  }, [category, fromUnit, toUnit, inputValue]);

  return (
    <div className="p-3 bg-background dark:bg-background">
      {/* Conversion Category */}
      <div className="mb-3">
        <Label className="block text-foreground dark:text-gray-300 mb-2 font-medium">
          Category
        </Label>
        <Select 
          value={category} 
          onValueChange={(value) => {
            setCategory(value);
            // Reset to default units for the new category
            const defaultBaseUnit = conversionCategories[value].baseUnit;
            const availableUnits = Object.keys(conversionCategories[value].units);
            const defaultToUnit = availableUnits.find(unit => unit !== defaultBaseUnit) || availableUnits[0];
            setFromUnit(defaultBaseUnit);
            setToUnit(defaultToUnit);
          }}
        >
          <SelectTrigger className="bg-white dark:bg-muted text-foreground dark:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(conversionCategories).map((categoryKey) => (
              <SelectItem key={categoryKey} value={categoryKey}>
                {conversionCategories[categoryKey].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* From/To Unit Selection */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label className="block text-foreground dark:text-gray-300 mb-2 font-medium">
            From
          </Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger className="bg-white dark:bg-muted text-foreground dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(conversionCategories[category].units).map((unitKey) => (
                <SelectItem key={unitKey} value={unitKey}>
                  {conversionCategories[category].units[unitKey].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-foreground dark:text-gray-300 mb-2 font-medium">
            To
          </Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger className="bg-white dark:bg-muted text-foreground dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(conversionCategories[category].units).map((unitKey) => (
                <SelectItem key={unitKey} value={unitKey}>
                  {conversionCategories[category].units[unitKey].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Input Value */}
      <div className="mb-4">
        <Label className="block text-foreground dark:text-gray-300 mb-2 font-medium">
          Enter Value
        </Label>
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full p-3 rounded-lg bg-white dark:bg-muted text-foreground dark:text-white border border-gray-300 dark:border-gray-700 text-lg"
        />
      </div>

      {/* Result */}
      <div className="mb-4">
        <Label className="block text-foreground dark:text-gray-300 mb-2 font-medium">
          Result
        </Label>
        <div className="w-full p-3 rounded-lg bg-white dark:bg-muted text-foreground dark:text-white border border-gray-300 dark:border-gray-700 text-lg">
          {result}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="destructive"
          className="py-3 font-semibold calculator-button-press flex items-center justify-center"
          onClick={swapUnits}
        >
          <ArrowUp10 className="mr-2" size={16} />
          Swap
        </Button>
        <Button
          variant="default"
          className="py-3 bg-accent text-foreground hover:bg-yellow-500 font-semibold calculator-button-press flex items-center justify-center"
          onClick={calculateConversion}
        >
          <CalculatorIcon className="mr-2" size={16} />
          Convert
        </Button>
      </div>
    </div>
  );
};

export default UnitConverter;
