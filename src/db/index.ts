import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL){
    console.log("Database url not found.")
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

const db = drizzle({ client: pool });

export default db