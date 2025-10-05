import express from 'express';
import helmet from 'helmet';
import { config } from './config/index.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { correlationId } from './middlewares/correlationId.js';
import { errorHandler } from './middlewares/errorHandler.js';
import routes from './routes/index.js';
import healthRoutes from './health/health.routes.js';
import { registerMetrics, metricsMiddleware } from './observability/metrics.js';
import cors from 'cors';

const app = express();

app.use(cors())
app.use(
  helmet({
    crossOriginResourcePolicy: false, // отключаем заголовок CORP
    crossOriginEmbedderPolicy: false, // отключаем COEP (если нужно)
  })
);
app.use(express.json({ limit: '2mb' }));

app.use(correlationId);
app.use(requestLogger);

app.use('/_health', healthRoutes);
app.get('/_metrics', metricsMiddleware, async (req, res) => {
  res.set('Content-Type', registerMetrics.contentType);
  res.end(await registerMetrics.metrics());
});

app.use(config.API_PREFIX, routes);

app.use(errorHandler);

export default app;
