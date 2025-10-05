import express from 'express';
import crudeSupplyRoutes from './crudeSupply.routes.js';
import stocksRoutes from './stocks.routes.js';
import processingRoutes from './processing.routes.js';
import unitsRoutes from "./units.routes.js";

const router = express.Router();

router.use('/crude-supply', crudeSupplyRoutes);
router.use('/stocks', stocksRoutes);
router.use('/processing', processingRoutes);
router.use('/units', unitsRoutes);

export default router;
