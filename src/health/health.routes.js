import express from 'express';
import { sequelize } from '../models/index.js';

const router = express.Router();

router.get('/', (_req, res) => res.status(200).json({ status: 'ok' }));
router.get('/ready', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ready' });
  } catch (e) {
    res.status(503).json({ status: 'not_ready', error: e.message });
  }
});

export default router;
