import express from 'express';
import { auth } from '../middlewares/auth.js';
import { requireDateParam } from '../middlewares/validateQuery.js';
import { pagination } from '../middlewares/pagination.js';
import { validateUnitsUtilizationBody } from '../middlewares/validateBodySchemaUnits.js';
import { getUnitsUtilization, upsertUnitsUtilization } from '../services/unitUtilization.service.js';

const router = express.Router();

/** GET /units/utilization?date=YYYY-MM-DD&plant_id=ID */
router.get('/utilization', auth, requireDateParam, pagination, async (req, res, next) => {
  try {
    const { date, plant_id: plantId } = req.query;
    const data = await getUnitsUtilization({ plantId, date, pagination: req.pagination });
    return res.status(200).json(data);
  } catch (e) { return next(e); }
});

/** POST /units/utilization */
router.post('/utilization', auth, validateUnitsUtilizationBody, async (req, res, next) => {
  try {
    const result = await upsertUnitsUtilization(req.body);
    return res.status(201).json(result);
  } catch (e) { return next(e); }
});

export default router;
