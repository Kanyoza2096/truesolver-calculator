import { HistoryItem } from "./calculatorLogic";

// Generate a simple unique device ID for anonymous users
export function getDeviceId() {
  let deviceId = localStorage.getItem("calculatorDeviceId");
  if (!deviceId) {
    deviceId = `device_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("calculatorDeviceId", deviceId);
  }
  return deviceId;
}

// Simple fetch wrapper with error handling
async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return await response.json() as T;
}

// History API
export async function fetchHistory(): Promise<HistoryItem[]> {
  try {
    const deviceId = getDeviceId();
    const response = await fetchApi<any[]>(`/api/history/device/${deviceId}`);
    
    return response.map((item: any) => ({
      expression: item.expression,
      result: item.result,
      timestamp: new Date(item.timestamp).getTime()
    }));
  } catch (error) {
    console.error("Failed to fetch history:", error);
    // Fallback to local storage
    const historyString = localStorage.getItem("calculatorHistory");
    return historyString ? JSON.parse(historyString) : [];
  }
}

export async function saveHistoryItem(item: HistoryItem): Promise<void> {
  try {
    const deviceId = getDeviceId();
    await fetchApi('/api/history', {
      method: 'POST',
      body: JSON.stringify({
        deviceId,
        expression: item.expression,
        result: item.result
      }),
    });
  } catch (error) {
    console.error("Failed to save history item:", error);
    // Fallback to local storage
    const history = await fetchHistory();
    history.push(item);
    localStorage.setItem("calculatorHistory", JSON.stringify(history));
  }
}

export async function clearHistoryItems(): Promise<void> {
  try {
    const deviceId = getDeviceId();
    await fetchApi(`/api/history/device/${deviceId}`, { 
      method: 'DELETE' 
    });
  } catch (error) {
    console.error("Failed to clear history:", error);
    // Fallback to local storage
    localStorage.removeItem("calculatorHistory");
  }
}

// Settings API
export interface CalculatorSettings {
  theme: "light" | "dark";
  decimalPrecision: number;
  useScientificNotation: boolean;
  defaultCalcMode: "basic" | "scientific" | "conversion";
}

export async function fetchSettings(): Promise<CalculatorSettings | null> {
  try {
    const deviceId = getDeviceId();
    return await fetchApi<CalculatorSettings>(`/api/settings/device/${deviceId}`);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
}

export async function saveSettings(settings: Partial<CalculatorSettings>): Promise<CalculatorSettings | null> {
  try {
    const deviceId = getDeviceId();
    return await fetchApi<CalculatorSettings>('/api/settings', {
      method: 'POST',
      body: JSON.stringify({
        deviceId,
        ...settings
      }),
    });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return null;
  }
}

export async function updateSettings(id: number, settings: Partial<CalculatorSettings>): Promise<CalculatorSettings | null> {
  try {
    return await fetchApi<CalculatorSettings>(`/api/settings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  } catch (error) {
    console.error("Failed to update settings:", error);
    return null;
  }
}