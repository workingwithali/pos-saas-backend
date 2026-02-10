import { defineConfig } from "@prisma/define-config";

export default defineConfig({
  datasources: {
    db: {
      adapter: "postgresql",
      url: process.env.DATABASE_URL, // Neon URL from .env
    },
  },
});
