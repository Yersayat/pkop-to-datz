import app from './app.js';
import { config } from './config/index.js';
import { logger } from './observability/logger.js';

const { PORT } = config;
app.listen(PORT, () => {
  logger.info({ port: PORT }, `NPZ API listening on ${PORT}`);
});
