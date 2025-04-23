import React from "react";
import { useCalculatorContext } from "@/context/CalculatorContext";
import { cn } from "@/lib/utils";

const CalculatorTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useCalculatorContext();

  return (
    <div className="bg-white dark:bg-muted p-2 flex justify-around border-b border-gray-200 dark:border-gray-700">
      <button
        className={cn(
          "flex-1 py-2 px-3 text-center font-medium border-b-2",
          activeTab === "basic" 
            ? "calculator-tab-active" 
            : "calculator-tab-inactive"
        )}
        onClick={() => setActiveTab("basic")}
        aria-selected={activeTab === "basic"}
        role="tab"
      >
        Basic
      </button>
      <button
        className={cn(
          "flex-1 py-2 px-3 text-center font-medium border-b-2",
          activeTab === "scientific" 
            ? "calculator-tab-active" 
            : "calculator-tab-inactive"
        )}
        onClick={() => setActiveTab("scientific")}
        aria-selected={activeTab === "scientific"}
        role="tab"
      >
        Scientific
      </button>
      <button
        className={cn(
          "flex-1 py-2 px-3 text-center font-medium border-b-2",
          activeTab === "conversion" 
            ? "calculator-tab-active" 
            : "calculator-tab-inactive"
        )}
        onClick={() => setActiveTab("conversion")}
        aria-selected={activeTab === "conversion"}
        role="tab"
      >
        Converter
      </button>
    </div>
  );
};

export default CalculatorTabs;
