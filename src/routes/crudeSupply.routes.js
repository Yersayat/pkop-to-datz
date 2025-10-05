import express from 'express';
import { auth } from '../middlewares/auth.js';
import { requireDateParam } from '../middlewares/validateQuery.js';
import { pagination } from '../middlewares/pagination.js';
import { validateCrudeSupplyBody } from '../middlewares/validateBodySchema.js';
import { getDailyCrudeSupply, upsertDailyCrudeSupply } from '../services/crudeSupply.service.js';


const router = express.Router();

/**
 * GET /crude-supply/daily?date=YYYY-MM-DD&plant_id=ANPZ&limit=&offset=
 * Заголовки: Authorization: Bearer <token>, Content-Type: application/json, X-Correlation-Id: <uuid>
 */
router.get('/daily', auth, requireDateParam, pagination, async (req, res, next) => {
  try {
    const { date, plant_id: plantId } = req.query;
    const data = await getDailyCrudeSupply({
      plantId,
      date,
      pagination: req.pagination
    });
    return res.status(200).json(data);
  } catch (e) {
    return next(e);
  }
});

router.post('/daily', auth, validateCrudeSupplyBody, async (req, res, next) => {
  try {
    const result = await upsertDailyCrudeSupply(req.body);
    return res.status(201).json(result);
  } catch (e) { return next(e); }
});

export default router;
