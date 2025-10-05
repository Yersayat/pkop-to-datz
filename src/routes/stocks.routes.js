import express from 'express';
import { auth } from '../middlewares/auth.js';
import { requireDateParam } from '../middlewares/validateQuery.js';
import { pagination } from '../middlewares/pagination.js';
import { validateStocksClosingBody } from '../middlewares/validateBodySchemaStocks.js';
import { getStocksClosing, upsertStocksClosing } from '../services/stockClosing.service.js';

const router = express.Router();

/** GET /stocks/closing?date=YYYY-MM-DD&plant_id=ID */
router.get('/closing', auth, requireDateParam, pagination, async (req, res, next) => {
  try {
    const { date, plant_id: plantId } = req.query;
    const data = await getStocksClosing({ plantId, date, pagination: req.pagination });
    return res.status(200).json(data);
  } catch (e) { return next(e); }
});

/** POST /stocks/closing  (идемпотентная замена набора строк) */
router.post('/closing', auth, validateStocksClosingBody, async (req, res, next) => {
  try {
    const result = await upsertStocksClosing(req.body);
    return res.status(201).json(result);
  } catch (e) { return next(e); }
});

export default router;
