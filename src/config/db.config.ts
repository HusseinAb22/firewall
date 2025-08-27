import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Use environment variables for production
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432')
});

export default pool;