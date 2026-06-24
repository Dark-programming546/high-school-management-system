const requests = new Map();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 10;

export const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requests.has(ip)) {
    requests.set(ip, { count: 1, startTime: now });
    return next();
  }

  const entry = requests.get(ip);

  if (now - entry.startTime > WINDOW_MS) {
    requests.set(ip, { count: 1, startTime: now });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Please try again after 15 minutes.",
    });
  }

  entry.count += 1;
  return next();
};
