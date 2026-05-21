import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./server-app";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  // Vite integration for dev/prod serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server is listening on port ${PORT}`);
  });
}

// Import express dynamically for production check in server.ts
import express from "express";

startServer();
