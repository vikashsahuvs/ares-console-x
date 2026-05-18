import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@styles": path.resolve(__dirname, "./src/styles"),
    },
  },

  server: {
    port: 3000,
    open: true,
    host: true, // expose to LAN / WebView APK
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    target: "es2015",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  preview: {
    port: 4173,
    open: true,
  },

  // Optimize deps for faster cold starts
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
