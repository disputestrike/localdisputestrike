// This file is ONLY imported in development mode
// It contains all vite-related imports that should not be bundled for production
import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { nanoid } from "nanoid";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

export async function setupVite(app: Express, server: Server) {
  const plugins = [
    react({
      exclude: [/node_modules/, /sonner\.tsx$/],
    }),
    tailwindcss(),
    jsxLocPlugin(),
    vitePluginManusRuntime(),
  ];
  
  const viteConfig = {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "../..", "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "../..", "shared"),
        "@assets": path.resolve(import.meta.dirname, "../..", "attached_assets"),
      },
    },
    envDir: path.resolve(import.meta.dirname, "../.."),
    root: path.resolve(import.meta.dirname, "../..", "client"),
    publicDir: path.resolve(import.meta.dirname, "../..", "client", "public"),
    build: {
      outDir: path.resolve(import.meta.dirname, "../..", "dist/public"),
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
      minify: 'esbuild' as const,
      target: 'es2020',
      sourcemap: false,
    },
    server: {
      host: true,
      allowedHosts: [
        ".manuspre.computer",
        ".manus.computer",
        ".manus-asia.computer",
        ".manuscomputer.ai",
        ".manusvm.computer",
        "localhost",
        "127.0.0.1",
      ],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
  
  const devPort = parseInt(process.env.PORT || "3001", 10);
  const serverOptions = {
    middlewareMode: true,
    hmr: {
      server,
      protocol: "ws",
      host: "localhost",
      port: devPort,
      clientPort: devPort,
    },
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
