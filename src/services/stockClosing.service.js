import { StockClosingRepository } from '../repositories/stockClosing.repository.js';
import { ApiError } from '../lib/errors.js';
import { toISODate } from '../lib/date.js';

const repo = new StockClosingRepository();
const UOMS = ['t']; // синхронно с моделью

function mapRow(row) {
  return {
    row_no: row.row_no,
    supplier_name: row.supplier_name || null,
    product_code: row.product_code,
    product_name: row.product_name,
    stock_closing_qty: Number(row.stock_closing_qty),
    uom: row.uom
  };
}

function ensureDomainRules(rows) {
  for (const [i, r] of (rows || []).entries()) {
    if (r.stock_closing_qty == null || Number(r.stock_closing_qty) < 0) {
      throw new ApiError(422, 'VALIDATION_FAILED', "Field 'stock_closing_qty' must be >= 0", { row: i, field: 'stock_closing_qty' });
    }
    if (!UOMS.includes(r.uom)) {
      throw new ApiError(422, 'VALIDATION_FAILED', `Field 'uom' must be one of: ${UOMS.join(', ')}`, { row: i, field: 'uom' });
    }
  }
}

function ensureNoDuplicateKeys(rows) {
  const seen = new Set();
  for (const [i, r] of (rows || []).entries()) {
    const supplierNorm = r.supplier_name ?? ''; // null -> '' для логической уникальности
    const key = `${supplierNorm}||${r.product_code}||${r.product_name}`;
    if (seen.has(key)) {
      throw new ApiError(422, 'VALIDATION_FAILED',
        'Duplicate row for supplier_name + product_code + product_name',
        { row: i, key: { supplier_name: r.supplier_name ?? null, product_code: r.product_code, product_name: r.product_name } }
      );
    }
    seen.add(key);
  }
}

export async function getStocksClosing({ plantId, date, pagination }) {
  if (!plantId) throw new ApiError(400, 'VALIDATION_FAILED', "Query param 'plant_id' is required", { field: 'plant_id' });
  const isoDate = toISODate(date);

  const { header, rows, pagination: page } = await repo.getByPlantAndDate(plantId, isoDate, pagination);

  return {
    plant_id: header.plant_id,
    report_date: header.report_date,
    rows: rows.map(mapRow),
    pagination: page
  };
}

export async function upsertStocksClosing(body) {
  const { plant_id: plantId, report_date, rows } = body;

  if (!plantId) throw new ApiError(400, 'VALIDATION_FAILED', "Field 'plant_id' is required", { field: 'plant_id' });
  if (!report_date) throw new ApiError(400, 'VALIDATION_FAILED', "Field 'report_date' is required", { field: 'report_date' });

  const isoDate = toISODate(report_date);
  ensureDomainRules(rows);
  ensureNoDuplicateKeys(rows);

  const { count } = await repo.upsertReportWithRows(plantId, isoDate, rows || []);

  return {
    plant_id: plantId,
    report_date: isoDate,
    result: { rows_upserted: count, replaced: true }
  };
}
