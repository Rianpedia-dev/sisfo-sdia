/**
 * Rate Limiter sederhana berbasis sliding-window in-memory.
 * Sangat efisien dan cukup untuk memproteksi server dari brute force login / API abuse
 * tanpa memerlukan dependensi eksternal. Dapat dialihkan ke Redis jika menggunakan multi-server cluster.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Bersihkan rekaman usang setiap 5 menit agar tidak memakan memori
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  for (const [key, record] of rateLimitMap.entries()) {
    const valid = record.timestamps.filter((t) => t > threshold);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      record.timestamps = valid;
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Memeriksa apakah suatu identitas (IP / email / token) melebihi batas request.
 *
 * @param identifier String unik, misalnya "login:192.168.1.1" atau "api:user@email.com"
 * @param limit Jumlah maksimal request dalam jangka waktu
 * @param windowSeconds Rentang waktu dalam detik (default 60 detik)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): RateLimitResult {
  // Jika rate limiting dimatikan lewat env (misal untuk testing lokal)
  if (process.env.RATE_LIMIT_ENABLED === "false") {
    return {
      success: true,
      limit,
      remaining: limit,
      resetSeconds: 0,
    };
  }

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  cleanupExpired(windowMs);

  const record = rateLimitMap.get(identifier) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  validTimestamps.push(now);
  rateLimitMap.set(identifier, { timestamps: validTimestamps });

  return {
    success: true,
    limit,
    remaining: limit - validTimestamps.length,
    resetSeconds: windowSeconds,
  };
}
