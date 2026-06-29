import { Pool } from "pg";
import "dotenv/config"

console.log("Connecting to the database...")
export const client = new Pool({
    host : process.env.PGHOST,
    password : process.env.PGPASSWORD,
    database : process.env.PGDATABASE,
    user : process.env.PGUSER,
    port : process.env.PGHOSTPORT,
})
