import createError from 'http-errors';
import { parseISO } from '../lib/date.js';

export function requireDateParam(req, _res, next) {
  const { date } = req.query;
  if (!date) return next(createError(400, "Query param 'date' is required"));
  try {
    parseISO(date); // бросит при невалидной дате
    return next();
  } catch {
    return next(createError(422, "Invalid 'date' format, expected ISO-8601 (YYYY-MM-DD or full datetime)"));
  }
}
