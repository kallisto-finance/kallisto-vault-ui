import Redis from "ioredis";

const host = process.env.REDIS_SERVER_URL;
const port = process.env.REDIS_SERVER_PORT;
const password = process.env.REDIS_SERVER_PASSWORD;
const db = 0;

export const getAPY = async () => {
  const redis = new Redis({
    port,
    host,
    password,
    db,
  });

  const apy = await redis.get("APY");

  redis.quit();

  return apy;
};
