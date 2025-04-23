import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CalculatorState, 
  initialCalculatorState,
  loadHistory,
  saveHistory,
  loadMemory,
  saveMemory,
  getDeviceId,
  HistoryItem,
} from '@/lib/calculatorLogic';

interface CalculatorContextType {
  calculatorState: CalculatorState;
  setCurrentInput: (input: string) => void;
  setPreviousInput: (input: string) => void;
  setOperator: (operator: string) => void;
  setWaitingForOperand: (waiting: boolean) => void;
  setMemory: (memory: number) => void;
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  activeTab: 'basic' | 'scientific' | 'conversion';
  setActiveTab: (tab: 'basic' | 'scientific' | 'conversion') => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    ...initialCalculatorState,
    history: loadHistory(), // Use local history initially, will be updated from API
    memory: loadMemory(),
  });
  
  const [activeTab, setActiveTab] = useState<'basic' | 'scientific' | 'conversion'>('basic');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to fetch history from server
  const fetchHistory = async (): Promise<HistoryItem[]> => {
    try {
      const deviceId = getDeviceId();
      const response = await fetch(`/api/history/device/${deviceId}`);
      if (!response.ok) {
        throw new Error(`Error fetching history: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch history:", error);
      return loadHistory(); // Fall back to local storage if API fails
    }
  };

  // Function to save history item to server
  const saveHistoryItem = async (item: HistoryItem): Promise<void> => {
    try {
      const deviceId = getDeviceId();
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          expression: item.expression,
          result: item.result,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error saving history: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to save history item to database:", error);
    }
  };

  // Function to clear history on server
  const clearHistoryItems = async (): Promise<void> => {
    try {
      const deviceId = getDeviceId();
      const response = await fetch(`/api/history/device/${deviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error clearing history: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to clear history from database:", error);
    }
  };

  // Function to fetch settings from server
  const fetchSettings = async () => {
    try {
      const deviceId = getDeviceId();
      const response = await fetch(`/api/settings/device/${deviceId}`);
      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error(`Error fetching settings: ${response.statusText}`);
        }
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      return null;
    }
  };

  // Function to save settings to server
  const saveSettings = async (settings: any): Promise<void> => {
    try {
      const deviceId = getDeviceId();
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          ...settings
        }),
      });

      if (!response.ok) {
        throw new Error(`Error saving settings: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  // Load calculator history from the database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch calculation history
        const historyItems = await fetchHistory();
        if (historyItems && historyItems.length > 0) {
          setCalculatorState(prev => ({ ...prev, history: historyItems }));
        }

        // Fetch settings
        const settings = await fetchSettings();
        if (settings) {
          if (settings.defaultCalcMode) {
            setActiveTab(settings.defaultCalcMode as 'basic' | 'scientific' | 'conversion');
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize calculator:", error);
        setIsInitialized(true);
      }
    };

    loadData();
  }, []);

  // Save calculator settings when active tab changes
  useEffect(() => {
    if (isInitialized) {
      saveSettings({ defaultCalcMode: activeTab });
    }
  }, [activeTab, isInitialized]);

  // Update calculator state
  const setCurrentInput = (input: string) => {
    setCalculatorState(prev => ({ ...prev, currentInput: input }));
  };

  const setPreviousInput = (input: string) => {
    setCalculatorState(prev => ({ ...prev, previousInput: input }));
  };

  const setOperator = (operator: string) => {
    setCalculatorState(prev => ({ ...prev, operator }));
  };

  const setWaitingForOperand = (waiting: boolean) => {
    setCalculatorState(prev => ({ ...prev, waitingForOperand: waiting }));
  };

  const setMemory = (memory: number) => {
    setCalculatorState(prev => ({ ...prev, memory }));
    saveMemory(memory);
  };

  const addToHistory = (item: HistoryItem) => {
    const updatedHistory = [...calculatorState.history, item];
    setCalculatorState(prev => ({ ...prev, history: updatedHistory }));
    
    // Save to local storage as a fallback
    saveHistory(updatedHistory);
    
    // Save to database
    saveHistoryItem(item).catch(error => {
      console.error("Failed to save history item to database:", error);
    });
  };

  const clearHistory = () => {
    setCalculatorState(prev => ({ ...prev, history: [] }));
    
    // Clear from local storage
    localStorage.removeItem('calculatorHistory');
    
    // Clear from database
    clearHistoryItems().catch(error => {
      console.error("Failed to clear history from database:", error);
    });
  };

  const value = {
    calculatorState,
    setCurrentInput,
    setPreviousInput,
    setOperator,
    setWaitingForOperand,
    setMemory,
    addToHistory,
    clearHistory,
    activeTab,
    setActiveTab,
    isHistoryOpen,
    setIsHistoryOpen,
  };

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculatorContext = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculatorContext must be used within a CalculatorProvider');
  }
  return context;
};
