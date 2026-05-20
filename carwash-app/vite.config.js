import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/carwash-record/",

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
        "icon-192.png",
        "icon-512.png",
      ],

      manifest: {
        name: "Car Wash Record",
        short_name: "CarWash",

        start_url: "/carwash-record/",
        scope: "/carwash-record/",

        display: "standalone",
        orientation: "portrait",

        background_color: "#050816",
        theme_color: "#050816",

        icons: [
          {
            src: "/carwash-record/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/carwash-record/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});