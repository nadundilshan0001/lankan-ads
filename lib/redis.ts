




import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;



export const redis = new Redis({
  url: redisUrl || "https://localhost",
  token: redisToken || "dummy_token",
});

if (!redisUrl || !redisToken) {
  console.warn("⚠️ Warning: Upstash Redis environment variables (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN) are missing in the current environment.");
}
