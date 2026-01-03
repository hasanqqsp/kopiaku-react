import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";
import fs from "fs";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    // Custom plugin to handle landingpage route
    {
      name: "landingpage-middleware",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          console.log(
            "🌐 Plugin middleware - All requests:",
            req.method,
            req.url
          );

          if (req.url === "/landingpage" || req.url === "/landingpage/") {
            console.log(
              "✅ Plugin intercepted landingpage request, serving HTML..."
            );

            const htmlPath = path.join(
              __dirname,
              "public",
              "landingpage",
              "index.html"
            );

            try {
              if (fs.existsSync(htmlPath)) {
                const html = fs.readFileSync(htmlPath, "utf-8");
                res.setHeader("Content-Type", "text/html");
                res.end(html);
                return;
              }
            } catch (error) {
              console.error("Error reading landing page:", error);
            }

            res.statusCode = 404;
            res.end("Landing page not found");
            return;
          }

          next();
        });
      },
    },
  ],

  publicDir: "public",

  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        landingpage: fileURLToPath(
          new URL("./public/landingpage/index.html", import.meta.url)
        ),
      },
    },
  },
});
