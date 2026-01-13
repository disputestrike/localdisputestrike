import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";

// Only import vite-related modules in development mode
// This prevents the "vite not found" error in production
export async function setupVite(app: Express, server: Server) {
  // Dynamic import to avoid loading vite in production
  const { createServer: createViteServer } = await import("vite");
  const { nanoid } = await import("nanoid");
  const viteConfig = (await import("../../vite.config")).default;
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

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
