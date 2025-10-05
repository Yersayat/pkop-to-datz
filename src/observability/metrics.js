import client from 'prom-client';

export const registerMetrics = new client.Registry();
client.collectDefaultMetrics({ register: registerMetrics });

export function metricsMiddleware(req, res, next) {
  next();
}
