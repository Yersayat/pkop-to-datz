import { randomUUID } from 'crypto';

export function correlationId(req, res, next) {
  const id = req.header('X-Correlation-Id') || randomUUID();
  req.correlationId = id;
  res.setHeader('X-Correlation-Id', id);
  next();
}
