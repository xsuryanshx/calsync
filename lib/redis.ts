import { Redis } from "@upstash/redis";
import { config } from "@/lib/config";

let _redis: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;

  if (!config.redisEnabled) {
    _redis = null;
    return _redis;
  }

  _redis = Redis.fromEnv();
  return _redis;
}
