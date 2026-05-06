import * as schema from "./schema";

let db: any;
let pool: any;

async function initDb() {
  if (process.env.DATABASE_URL) {
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pg = await import("pg");
    const { Pool } = pg.default;
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
    console.log("📡 Connected to external PostgreSQL database.");
  } else {
    const { drizzle } = await import("drizzle-orm/pglite");
    const { PGlite } = await import("@electric-sql/pglite");
    // Using a persistent path in the container if possible, or just in-memory
    const client = new PGlite("memory://");
    db = drizzle(client, { schema });
    console.log("🏠 Using internal Standalone database (PGlite). Note: Data will not persist across restarts without DATABASE_URL.");
    
    // Auto-migrate/push schema for PGlite (simplified for demo)
    // In a real app, you'd use drizzle-kit migrations
  }
  return { db, pool };
}

// For synchronous exports, we might need a workaround or change how the app imports db
// However, most of the app likely expects 'db' to be exported.
// I'll use a Proxy to handle the async initialization or just export a promise.

// Let's see how 'db' is used. Usually it's db.select()...
// I'll use a proxy that waits for initialization if needed, or just initialize it immediately.

const dbProxy: any = new Proxy({}, {
  get(target, prop) {
    if (!db) {
      throw new Error("Database not initialized. Call initDb() first.");
    }
    return db[prop];
  }
});

export { dbProxy as db, pool, initDb };
export * from "./schema";
