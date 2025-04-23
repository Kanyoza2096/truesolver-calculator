import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertHistorySchema, insertSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Calculator history routes
  app.get("/api/history/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const history = await storage.getHistoryByUser(userId);
      return res.json(history);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.get("/api/history/device/:deviceId", async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params;
      console.log(`Fetching history for device: ${deviceId}`);
      const history = await storage.getHistoryByDevice(deviceId);
      return res.json(history);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      return res.status(500).json({ 
        error: "Failed to fetch history", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/history", async (req: Request, res: Response) => {
    try {
      const parsed = insertHistorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json(parsed.error);
      }
      const historyItem = await storage.addHistoryItem(parsed.data);
      return res.status(201).json(historyItem);
    } catch (error) {
      return res.status(500).json({ error: "Failed to create history item" });
    }
  });

  app.delete("/api/history/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      await storage.clearHistoryByUser(userId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: "Failed to clear history" });
    }
  });

  app.delete("/api/history/device/:deviceId", async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params;
      await storage.clearHistoryByDevice(deviceId);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: "Failed to clear history" });
    }
  });

  // Calculator settings routes
  app.get("/api/settings/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const settings = await storage.getSettingsByUser(userId);
      if (!settings) {
        return res.status(404).json({ error: "Settings not found" });
      }
      return res.json(settings);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/device/:deviceId", async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.params;
      console.log(`Fetching settings for device: ${deviceId}`);
      const settings = await storage.getSettingsByDevice(deviceId);
      if (!settings) {
        console.log(`No settings found for device: ${deviceId}`);
        return res.status(404).json({ 
          message: "Settings not found",
          deviceId
        });
      }
      console.log(`Found settings for device: ${deviceId}`, settings);
      return res.json(settings);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      return res.status(500).json({ 
        error: "Failed to fetch settings",
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      console.log("Received settings data:", req.body);
      const parsed = insertSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        console.error("Validation error:", parsed.error);
        return res.status(400).json(parsed.error);
      }
      console.log("Parsed settings data:", parsed.data);
      const settings = await storage.saveSettings(parsed.data);
      return res.status(201).json(settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
      return res.status(500).json({ 
        error: "Failed to save settings",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.patch("/api/settings/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      // Partial schema validation could be added here
      const settings = await storage.updateSettings(id, req.body);
      return res.json(settings);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
