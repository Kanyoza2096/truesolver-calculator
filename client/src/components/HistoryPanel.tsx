import React from "react";
import { X } from "lucide-react";
import { useCalculatorContext } from "@/context/CalculatorContext";
import { formatHistoryExpression } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose }) => {
  const { calculatorState, clearHistory, setCurrentInput } = useCalculatorContext();
  const { history } = calculatorState;

  const applyHistoryItem = (result: string) => {
    setCurrentInput(result);
    onClose();
  };

  return (
    <div
      className={`absolute top-0 right-0 bottom-0 left-0 bg-white dark:bg-background transform transition-transform duration-300 ease-in-out z-10 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 bg-primary dark:bg-muted">
        <h2 className="text-lg font-semibold text-white dark:text-white">
          Calculation History
        </h2>
        <button
          className="text-white"
          onClick={onClose}
          aria-label="Close history panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No history yet
          </div>
        ) : (
          history
            .slice()
            .reverse()
            .map((item, index) => (
              <div
                key={index}
                className="border-b border-gray-200 dark:border-gray-700 py-3"
                onClick={() => applyHistoryItem(item.result)}
              >
                <div className="text-gray-500 dark:text-gray-400">
                  {formatHistoryExpression(item.expression)}
                </div>
                <div className="text-xl font-medium text-foreground dark:text-white">
                  {item.result}
                </div>
              </div>
            ))
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-muted border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="destructive"
          className="w-full py-3 font-semibold"
          onClick={clearHistory}
          disabled={history.length === 0}
        >
          Clear History
        </Button>
      </div>
    </div>
  );
};

export default HistoryPanel;
