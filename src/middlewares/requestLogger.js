import pinoHttp from 'pino-http';
import { logger } from '../observability/logger.js';

export const requestLogger = pinoHttp({
  logger,
  // генерим id запроса из уже проставленного correlationId
  genReqId: (req) => req.correlationId,
  customProps: (req, res) => ({
    correlation_id: req.correlationId
  })
});
