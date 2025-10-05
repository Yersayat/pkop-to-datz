import { ProcessingMonthlyRepository } from '../repositories/processingMonthly.repository.js';
import { ApiError } from '../lib/errors.js';

const repo = new ProcessingMonthlyRepository();

function yearFromDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) throw new ApiError(422, 'VALIDATION_FAILED', "Invalid 'date'/'report_date'");
  return d.getUTCFullYear(); // год по UTC, чтобы однозначно
}

function mapRow(row) {
  return {
    producer_name: row.producer_name,
    months: {
      jan: row.jan_fact != null ? { fact_tonnes: Number(row.jan_fact) } : undefined,
      feb: row.feb_fact != null ? { fact_tonnes: Number(row.feb_fact) } : undefined,
      mar: row.mar_fact != null ? { fact_tonnes: Number(row.mar_fact) } : undefined,
      apr: row.apr_fact != null ? { fact_tonnes: Number(row.apr_fact) } : undefined,
      may: row.may_fact != null ? { fact_tonnes: Number(row.may_fact) } : undefined,
      jun: row.jun_fact != null ? { fact_tonnes: Number(row.jun_fact) } : undefined,
      jul: row.jul_fact != null ? { fact_tonnes: Number(row.jul_fact) } : undefined,
      aug: row.aug_fact != null ? { fact_tonnes: Number(row.aug_fact) } : undefined,
      sep: row.sep_fact != null ? { fact_tonnes: Number(row.sep_fact) } : undefined,
      oct: row.oct_fact != null ? { fact_tonnes: Number(row.oct_fact) } : undefined,
      nov: row.nov_fact != null ? { fact_tonnes: Number(row.nov_fact) } : undefined,
      dec: row.dec_fact != null ? { fact_tonnes: Number(row.dec_fact) } : undefined
    },
    total_fact_tonnes: Number(row.total_fact_tonnes)
  };
}

function ensureDomainRules(rows) {
  for (const [i, r] of (rows || []).entries()) {
    if (!r.producer_name) throw new ApiError(422, 'VALIDATION_FAILED', "Field 'producer_name' is required", { row: i });
    if (r.total_fact_tonnes == null || Number(r.total_fact_tonnes) < 0) {
      throw new ApiError(422, 'VALIDATION_FAILED', "Field 'total_fact_tonnes' must be >= 0", { row: i });
    }
    const months = r.months || {};
    const vals = Object.values(months).map(m => m?.fact_tonnes).filter(v => v != null).map(Number);
    for (const v of vals) if (v < 0) {
      throw new ApiError(422, 'VALIDATION_FAILED', "Monthly 'fact_tonnes' must be >= 0", { row: i });
    }
    if (vals.length > 0) {
      const sum = vals.reduce((a,b)=>a+b,0);
      if (Math.abs(sum - Number(r.total_fact_tonnes)) > 0.0005) {
        throw new ApiError(422, 'VALIDATION_FAILED',
          "Validation: sum(months.fact_tonnes) must equal total_fact_tonnes",
          { row: i, expected: sum, actual: Number(r.total_fact_tonnes) });
      }
    }
  }
}

function ensureNoDuplicateKeys(rows) {
  const seen = new Set();
  for (const [i, r] of (rows || []).entries()) {
    const key = r.producer_name;
    if (seen.has(key)) {
      throw new ApiError(422, 'VALIDATION_FAILED', 'Duplicate row for producer_name', {
        row: i, key: { producer_name: r.producer_name }
      });
    }
    seen.add(key);
  }
}

export async function getProcessingMonthly({ plantId, date, pagination }) {
  if (!plantId) throw new ApiError(400, 'VALIDATION_FAILED', "Query param 'plant_id' is required", { field: 'plant_id' });
  const year = yearFromDate(date);
  const { header, rows, pagination: page } = await repo.getByPlantAndYear(plantId, year, pagination);
  return { plant_id: header.plant_id, year: header.year, rows: rows.map(mapRow), pagination: page };
}

export async function upsertProcessingMonthly(body) {
  const { plant_id: plantId, report_date, year: yearExplicit, rows } = body;
  if (!plantId) throw new ApiError(400, 'VALIDATION_FAILED', "Field 'plant_id' is required", { field: 'plant_id' });
  const year = yearExplicit ?? yearFromDate(report_date);
  ensureDomainRules(rows);
  ensureNoDuplicateKeys(rows);
  const { count } = await repo.upsertReportWithRows(plantId, year, rows || []);
  return { plant_id: plantId, year, result: { rows_upserted: count, replaced: true } };
}
