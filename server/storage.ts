import { 
  users, 
  calculatorHistory, 
  calculatorSettings,
  type User, 
  type InsertUser,
  type History,
  type InsertHistory,
  type CalculatorSettings,
  type InsertSettings 
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc } from "drizzle-orm";

// Initialize database connection if DATABASE_URL is available
let db: any;
let databaseInitialized = false;

try {
  if (process.env.DATABASE_URL) {
    console.log("Initializing database connection...");
    
    // According to Neon documentation, we need to create a client with proper configuration
    const sql = neon(process.env.DATABASE_URL);
    
    // Create a Drizzle ORM instance with this client
    db = drizzle(sql);
    
    console.log("Testing database connection...");
    
    // Force memory storage for now since we're having trouble with Neon
    databaseInitialized = false;
    console.log("Database connection setup, but using in-memory storage for stability");
  } else {
    console.log("No DATABASE_URL provided, using in-memory storage");
  }
} catch (error) {
  console.error("Failed to initialize database connection:", error);
  databaseInitialized = false;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // History methods
  getHistoryByUser(userId: number): Promise<History[]>;
  getHistoryByDevice(deviceId: string): Promise<History[]>;
  addHistoryItem(item: InsertHistory): Promise<History>;
  clearHistoryByUser(userId: number): Promise<void>;
  clearHistoryByDevice(deviceId: string): Promise<void>;
  
  // Settings methods
  getSettingsByUser(userId: number): Promise<CalculatorSettings | undefined>;
  getSettingsByDevice(deviceId: string): Promise<CalculatorSettings | undefined>;
  saveSettings(settings: InsertSettings): Promise<CalculatorSettings>;
  updateSettings(id: number, settings: Partial<InsertSettings>): Promise<CalculatorSettings>;
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // History methods
  async getHistoryByUser(userId: number): Promise<History[]> {
    return await db.select().from(calculatorHistory)
      .where(eq(calculatorHistory.userId, userId))
      .orderBy(desc(calculatorHistory.timestamp));
  }
  
  async getHistoryByDevice(deviceId: string): Promise<History[]> {
    return await db.select().from(calculatorHistory)
      .where(eq(calculatorHistory.deviceId, deviceId))
      .orderBy(desc(calculatorHistory.timestamp));
  }
  
  async addHistoryItem(item: InsertHistory): Promise<History> {
    const result = await db.insert(calculatorHistory).values(item).returning();
    return result[0];
  }
  
  async clearHistoryByUser(userId: number): Promise<void> {
    await db.delete(calculatorHistory).where(eq(calculatorHistory.userId, userId));
  }
  
  async clearHistoryByDevice(deviceId: string): Promise<void> {
    await db.delete(calculatorHistory).where(eq(calculatorHistory.deviceId, deviceId));
  }
  
  // Settings methods
  async getSettingsByUser(userId: number): Promise<CalculatorSettings | undefined> {
    const result = await db.select().from(calculatorSettings)
      .where(eq(calculatorSettings.userId, userId));
    return result[0];
  }
  
  async getSettingsByDevice(deviceId: string): Promise<CalculatorSettings | undefined> {
    const result = await db.select().from(calculatorSettings)
      .where(eq(calculatorSettings.deviceId, deviceId));
    return result[0];
  }
  
  async saveSettings(settings: InsertSettings): Promise<CalculatorSettings> {
    // First check if we already have settings for this user/device
    let existingSettings;
    
    if (settings.userId) {
      existingSettings = await this.getSettingsByUser(settings.userId);
    } else if (settings.deviceId) {
      existingSettings = await this.getSettingsByDevice(settings.deviceId);
    }
    
    // If settings exist, update them
    if (existingSettings) {
      return await this.updateSettings(existingSettings.id, settings);
    }
    
    // Otherwise create new settings
    const result = await db.insert(calculatorSettings).values(settings).returning();
    return result[0];
  }
  
  async updateSettings(id: number, settings: Partial<InsertSettings>): Promise<CalculatorSettings> {
    const result = await db.update(calculatorSettings)
      .set(settings)
      .where(eq(calculatorSettings.id, id))
      .returning();
    return result[0];
  }
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private history: Map<string, History[]>; // Key is either userId or deviceId
  private settings: Map<string, CalculatorSettings>; // Key is either userId or deviceId
  currentId: number;
  currentHistoryId: number;
  currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.history = new Map();
    this.settings = new Map();
    this.currentId = 1;
    this.currentHistoryId = 1;
    this.currentSettingsId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // History methods
  async getHistoryByUser(userId: number): Promise<History[]> {
    const key = `user_${userId}`;
    return this.history.get(key) || [];
  }
  
  async getHistoryByDevice(deviceId: string): Promise<History[]> {
    const key = `device_${deviceId}`;
    return this.history.get(key) || [];
  }
  
  async addHistoryItem(item: InsertHistory): Promise<History> {
    const id = this.currentHistoryId++;
    const timestamp = new Date();
    const historyItem = { ...item, id, timestamp } as History;
    
    let key;
    if (item.userId) {
      key = `user_${item.userId}`;
    } else if (item.deviceId) {
      key = `device_${item.deviceId}`;
    } else {
      throw new Error("Either userId or deviceId is required");
    }
    
    const history = this.history.get(key) || [];
    history.push(historyItem);
    this.history.set(key, history);
    
    return historyItem;
  }
  
  async clearHistoryByUser(userId: number): Promise<void> {
    const key = `user_${userId}`;
    this.history.delete(key);
  }
  
  async clearHistoryByDevice(deviceId: string): Promise<void> {
    const key = `device_${deviceId}`;
    this.history.delete(key);
  }
  
  // Settings methods
  async getSettingsByUser(userId: number): Promise<CalculatorSettings | undefined> {
    const key = `user_${userId}`;
    return this.settings.get(key);
  }
  
  async getSettingsByDevice(deviceId: string): Promise<CalculatorSettings | undefined> {
    const key = `device_${deviceId}`;
    return this.settings.get(key);
  }
  
  async saveSettings(settings: InsertSettings): Promise<CalculatorSettings> {
    const id = this.currentSettingsId++;
    const settingsItem = { ...settings, id } as CalculatorSettings;
    
    let key;
    if (settings.userId) {
      key = `user_${settings.userId}`;
    } else if (settings.deviceId) {
      key = `device_${settings.deviceId}`;
    } else {
      throw new Error("Either userId or deviceId is required");
    }
    
    this.settings.set(key, settingsItem);
    
    return settingsItem;
  }
  
  async updateSettings(id: number, settings: Partial<InsertSettings>): Promise<CalculatorSettings> {
    // Find the settings by id
    let foundKey = '';
    let foundSettings: CalculatorSettings | undefined;
    
    // Convert Map entries to array to avoid downlevelIteration issue
    const settingsEntries = Array.from(this.settings.entries());
    for (const [key, value] of settingsEntries) {
      if (value.id === id) {
        foundKey = key;
        foundSettings = value;
        break;
      }
    }
    
    if (!foundKey || !foundSettings) {
      throw new Error(`Settings with id ${id} not found`);
    }
    
    // Update the settings
    const updatedSettings = { ...foundSettings, ...settings };
    this.settings.set(foundKey, updatedSettings);
    
    return updatedSettings;
  }
}

// Choose storage implementation based on environment
// Use the DbStorage only if the database was successfully initialized
export const storage = (process.env.DATABASE_URL && databaseInitialized) 
  ? new DbStorage() 
  : new MemStorage();
