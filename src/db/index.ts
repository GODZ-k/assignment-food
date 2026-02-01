import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema  from './schema'
if (!process.env.DATABASE_URL){
    console.log("Database url not found.")
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
  });

const db = drizzle({ client: pool ,schema});

export default db