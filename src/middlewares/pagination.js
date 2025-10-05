import createError from 'http-errors';

export function pagination(req, _res, next) {
  const { limit, offset, cursor } = req.query;

  if (cursor && (limit || offset)) {
    return next(createError(400, "Use either cursor or limit/offset, not both"));
  }
  let lim = parseInt(limit ?? '1000', 10);
  if (isNaN(lim) || lim <= 0) return next(createError(422, "Invalid 'limit'"));
  if (lim > 10000) lim = 10000;

  let off = parseInt(offset ?? '0', 10);
  if (isNaN(off) || off < 0) return next(createError(422, "Invalid 'offset'"));

  req.pagination = { limit: lim, offset: off, cursor: cursor || null };
  next();
}
