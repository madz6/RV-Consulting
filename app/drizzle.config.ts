import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.PSW_DATA_DIR ? `${process.env.PSW_DATA_DIR}/psw.db` : "./data/psw.db",
  },
});
