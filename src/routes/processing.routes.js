import express from 'express';
import { auth } from '../middlewares/auth.js';
import { requireDateParam } from '../middlewares/validateQuery.js';
import { pagination } from '../middlewares/pagination.js';
import { validateProcessingMonthlyBody } from '../middlewares/validateBodySchemaProcessing.js';
import { getProcessingMonthly, upsertProcessingMonthly } from '../services/processingMonthly.service.js';

const router = express.Router();

/** GET /processing/monthly?date=YYYY-MM-DD&plant_id=ID */
router.get('/monthly', auth, requireDateParam, pagination, async (req, res, next) => {
  try {
    const { date, plant_id: plantId } = req.query;
    const data = await getProcessingMonthly({ plantId, date, pagination: req.pagination });
    return res.status(200).json(data);
  } catch (e) { return next(e); }
});

/** POST /processing/monthly */
router.post('/monthly', auth, validateProcessingMonthlyBody, async (req, res, next) => {
  try {
    const result = await upsertProcessingMonthly(req.body);
    return res.status(201).json(result);
  } catch (e) { return next(e); }
});

export default router;
