import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// This file only contains production code (serveStatic)
// Development code (setupVite) is in vite-dev.ts and imported dynamically

export function serveStatic(app: Express) {
  // In production, dist/index.js runs from /app/dist/
  // and public files are in /app/dist/public/
  let distPath = path.resolve(import.meta.dirname, "public");
  
  console.log(`[Static] Attempting to serve from: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    console.warn(`[Static] Path not found: ${distPath}`);
    // Try alternative paths
    const alternatives = [
      path.resolve(process.cwd(), "dist", "public"),
      path.resolve(import.meta.dirname, "..", "public"),
      "/app/dist/public"
    ];
    
    for (const altPath of alternatives) {
      console.log(`[Static] Trying: ${altPath}`);
      if (fs.existsSync(altPath)) {
        distPath = altPath;
        console.log(`[Static] Found at: ${distPath}`);
        break;
      }
    }
  }
  
  if (!fs.existsSync(distPath)) {
    console.error(`[Static] Could not find build directory. Checked paths above.`);
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
