import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { config } from '../config/index.js';

export function auth(req, _res, next) {
  if (config.AUTH_MODE === 'none') return next();

  const header = req.header('Authorization') || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return next(createError(401, 'Missing or invalid Authorization header'));

  try {
    const payload = jwt.verify(m[1], config.JWT.SECRET, {
      algorithms: [config.JWT.ALG],
      audience: config.JWT.AUD,
      issuer: config.JWT.ISS
    });
    req.user = { sub: payload.sub, scopes: payload.scopes || [] };
    return next();
  } catch (e) {
    return next(createError(401, 'Invalid token'));
  }
}
