import { defineConfig } from "vite";
// top-level await in src/main.js needs a modern target
export default defineConfig({ build: { target: "es2022" } });
