import { getRedis } from "@/lib/redis";

const USER_LOCK_SECONDS = 90;
const ACCOUNT_LOCK_SECONDS = 90;
const MANUAL_SYNC_RATE_LIMIT_SECONDS = 15;

export class SyncLockedError extends Error {
  constructor(message = "sync already in progress") {
    super(message);
    this.name = "SyncLockedError";
  }
}

export class SyncRateLimitedError extends Error {
  constructor(message = "sync rate limited") {
    super(message);
    this.name = "SyncRateLimitedError";
  }
}

export async function enforceManualSyncRateLimit(userId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const key = `calsync:sync:manual:${userId}`;
  const result = await redis.set(key, Date.now(), {
    ex: MANUAL_SYNC_RATE_LIMIT_SECONDS,
    nx: true,
  });
  if (result !== "OK") {
    throw new SyncRateLimitedError();
  }
}

export async function withUserSyncLock<T>(
  userId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const redis = getRedis();
  if (!redis) return fn();

  const key = `calsync:sync:user:${userId}`;
  const result = await redis.set(key, "1", {
    ex: USER_LOCK_SECONDS,
    nx: true,
  });
  if (result !== "OK") {
    throw new SyncLockedError();
  }

  try {
    return await fn();
  } finally {
    await redis.del(key);
  }
}

export async function withAccountSyncLock<T>(
  accountId: string,
  fn: () => Promise<T>,
): Promise<T> {
  const redis = getRedis();
  if (!redis) return fn();

  const key = `calsync:sync:account:${accountId}`;
  const result = await redis.set(key, "1", {
    ex: ACCOUNT_LOCK_SECONDS,
    nx: true,
  });
  if (result !== "OK") {
    throw new SyncLockedError();
  }

  try {
    return await fn();
  } finally {
    await redis.del(key);
  }
}
