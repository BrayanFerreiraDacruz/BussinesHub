import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";
import { initWhatsApp } from "../whatsapp";
import { startScheduledJobs } from "../jobs";
import { getDb } from "../db";
import { handleAbacatepayWebhook } from "../webhooks";

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Webhook for Abacatepay
  app.post("/api/webhooks/abacatepay", handleAbacatepayWebhook);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Hostinger and most cloud providers provide the port via process.env.PORT
  const port = parseInt(process.env.PORT || "3001"); // Mudando o padrão para 3001 para evitar conflito com a 3000 da Hostinger

  server.listen(port, "0.0.0.0", () => {
    console.log(`[Server] BusinessHub is running on port ${port}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
  }).on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[Error] Port ${port} is already in use. Please change the PORT in your .env file.`);
    } else {
      console.error(`[Error] Failed to start server:`, err);
    }
    process.exit(1);
  });

  // Inicializar WhatsApp e jobs agendados
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_JOBS === "true") {
    try {
      await initWhatsApp();
      startScheduledJobs();
      console.log("[Server] WhatsApp and scheduled jobs initialized");
    } catch (error) {
      console.warn("[Server] Failed to initialize WhatsApp/jobs:", error);
    }
  }
}

startServer().catch(console.error);
