import { ApiError, errorBody } from '../lib/errors.js';
import { logger } from '../observability/logger.js';

export function errorHandler(err, req, res, _next) {
  const status = err instanceof ApiError ? err.status : 500;
  const code = err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'UNKNOWN_ERROR');
  const message = err.message || 'Internal server error';

  logger.error({
    msg: 'request_error',
    status, code, message,
    details: err.details,
    correlation_id: req.correlationId,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });

  res.status(status).json(errorBody(code, message, err.details));
}
