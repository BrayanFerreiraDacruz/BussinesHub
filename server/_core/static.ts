import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  let distPath = path.resolve(process.cwd(), "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    distPath = path.resolve(import.meta.dirname, "public");
  }

  if (!fs.existsSync(distPath)) {
    distPath = path.resolve(process.cwd(), "public");
  }

  if (fs.existsSync(distPath)) {
    console.log(`[Server] Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
  } else {
    console.warn(`[Server] Warning: Public directory not found.`);
  }

  app.use("*", (req, res, next) => {
    if (req.url.startsWith("/api")) {
      return next();
    }
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Frontend build not found. Please run build:frontend localmente e envie a pasta dist/public.");
    }
  });
}
