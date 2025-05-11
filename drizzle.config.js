/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./lib/db/schema.ts",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  }
};