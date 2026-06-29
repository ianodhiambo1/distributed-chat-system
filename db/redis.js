import { createClient } from "redis";
import "dotenv/config"
export const redis = createClient()

await redis.connect();