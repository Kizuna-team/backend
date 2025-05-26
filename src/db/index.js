const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool);

module.exports = db;