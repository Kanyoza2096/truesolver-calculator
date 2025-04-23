import React, { useState } from "react";
import CalculatorDisplay from "./CalculatorDisplay";
import CalculatorTabs from "./CalculatorTabs";
import BasicCalculator from "./BasicCalculator";
import ScientificCalculator from "./ScientificCalculator";
import UnitConverter from "./UnitConverter";
import HistoryPanel from "./HistoryPanel";
import ThemeToggle from "./ThemeToggle";
import { useCalculatorContext } from "@/context/CalculatorContext";
import { History, Settings as SettingsIcon, Info, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

const Calculator: React.FC = () => {
  const { 
    activeTab, 
    isHistoryOpen, 
    setIsHistoryOpen,
    clearHistory
  } = useCalculatorContext();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="relative mx-auto max-w-md w-full min-h-screen bg-background dark:bg-background shadow-lg">
      {/* Header */}
      <header className="px-4 py-3 bg-white dark:bg-muted shadow-sm flex justify-between items-center">
        <h1 className="text-lg font-semibold text-foreground dark:text-white">
          Truesolver
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent"
            aria-label="History"
          >
            <History size={18} />
          </button>
          <button
            onClick={() => setIsAboutOpen(true)}
            className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent"
            aria-label="About"
          >
            <Info size={18} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent"
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </header>

      {/* Calculator Display */}
      <CalculatorDisplay />

      {/* Calculator Tabs */}
      <CalculatorTabs />

      {/* Calculator Panels */}
      {activeTab === "basic" && <BasicCalculator />}
      {activeTab === "scientific" && <ScientificCalculator />}
      {activeTab === "conversion" && <UnitConverter />}

      {/* History Panel */}
      <HistoryPanel isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      
      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Customize your calculator experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Clear calculation history</span>
              <button 
                onClick={() => {
                  clearHistory();
                  setIsSettingsOpen(false);
                }}
                className="px-3 py-1 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90"
              >
                Clear
              </button>
            </div>
          </div>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
      
      {/* About Dialog */}
      <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About Truesolver</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Truesolver is a modern offline multipurpose calculator with a sleek, clean design
              optimized for Android phones. It features basic calculations, scientific functions,
              and unit conversions.
            </p>
            <p className="text-sm text-muted-foreground">
              Version 1.0.0
            </p>
            <p className="text-sm font-medium text-foreground">
              Made by Kanyoza
            </p>
          </div>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calculator;
