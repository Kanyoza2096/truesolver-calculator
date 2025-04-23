import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Calculator history table
export const calculatorHistory = pgTable("calculator_history", {
  id: serial("id").primaryKey(),
  expression: text("expression").notNull(),
  result: text("result").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: integer("user_id").references(() => users.id),
  deviceId: text("device_id"), // For anonymous users
});

export const insertHistorySchema = createInsertSchema(calculatorHistory).pick({
  expression: true,
  result: true,
  userId: true,
  deviceId: true,
});

export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type History = typeof calculatorHistory.$inferSelect;

// User settings table
export const calculatorSettings = pgTable("calculator_settings", {
  id: serial("id").primaryKey(),
  theme: text("theme").default("light").notNull(),
  decimalPrecision: integer("decimal_precision").default(4).notNull(),
  useScientificNotation: boolean("use_scientific_notation").default(false).notNull(),
  defaultCalcMode: text("default_calc_mode").default("basic").notNull(),
  userId: integer("user_id").references(() => users.id),
  deviceId: text("device_id"), // For anonymous users
});

export const insertSettingsSchema = createInsertSchema(calculatorSettings).pick({
  theme: true,
  decimalPrecision: true,
  useScientificNotation: true,
  defaultCalcMode: true,
  userId: true,
  deviceId: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type CalculatorSettings = typeof calculatorSettings.$inferSelect;
