// src/config/db.config.ts
import { Pool } from 'pg';
import { config } from './env'; 

// Use the databaseUri from the config object
const pool = new Pool({
  connectionString: config.databaseUri,
});

export default pool;