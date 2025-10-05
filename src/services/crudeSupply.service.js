import { CrudeSupplyRepository } from '../repositories/crudeSupply.repository.js';
import { ApiError } from '../lib/errors.js';
import { toISODate } from '../lib/date.js';

const repo = new CrudeSupplyRepository();

function ensureDomainRules(rows) {
  for (const [i, r] of rows.entries()) {
    const path = `rows[${i}]`;
    const fields = [
      'supply_plan_month','supply_plan_to_date','supply_actual_daily','supply_actual_to_date',
      'confirmed_crude_volume','mne_approved_schedule','plan_primary','plan_total'
    ];
    for (const f of fields) {
      if (r[f] == null || Number(r[f]) < 0) {
        throw new ApiError(422, 'VALIDATION_FAILED', `Field '${f}' must be >= 0`, { row: i, field: f });
      }
    }
    if (r.plan_additional != null && Number(r.plan_additional) < 0) {
      throw new ApiError(422, 'VALIDATION_FAILED', "Field 'plan_additional' must be >= 0", { row: i, field: 'plan_additional' });
    }
    if (r.plan_additional != null) {
      const sum = Number(r.plan_primary) + Number(r.plan_additional);
      if (Number(r.plan_total) !== sum) {
        throw new ApiError(422, 'VALIDATION_FAILED',
          "Validation: plan_primary + plan_additional must equal plan_total",
          { row: i, expected: sum, actual: Number(r.plan_total) }
        );
      }
    }
  }
}

function ensureNoDuplicateKeys(rows) {
  const seen = new Set();
  rows.forEach((r, i) => {
    const key = `${r.producer_name}||${r.supplier_name}`;
    if (seen.has(key)) {
      throw new ApiError(422, 'VALIDATION_FAILED', 'Duplicate row for producer_name + supplier_name', {
        row: i, key: { producer_name: r.producer_name, supplier_name: r.supplier_name }
      });
    }
    seen.add(key);
  });
}

export async function getDailyCrudeSupply({ plantId, date, pagination }) {
  if (!plantId) throw new ApiError(400, 'VALIDATION_FAILED', "Query param 'plant_id' is required", { field: 'plant_id' });
  const isoDate = toISODate(date);
  const { header, rows, pagination: page } = await repo.getByPlantAndDate(plantId, isoDate, pagination);
  return { plant_id: header.plant_id, report_date: header.report_date, rows: rows.map(mapRow), pagination: page };
}

export async function upsertDailyCrudeSupply(body) {
  const { plant_id: plantId, report_date, rows } = body;

  if (!plantId) throw new ApiError(400, 'VALIDATION_FAILED', "Field 'plant_id' is required", { field: 'plant_id' });
  if (!report_date) throw new ApiError(400, 'VALIDATION_FAILED', "Field 'report_date' is required", { field: 'report_date' });

  const isoDate = toISODate(report_date);

  // доменные проверки до записи (раньше, чем hooks моделей)
  ensureDomainRules(rows || []);
  ensureNoDuplicateKeys(rows || []);

  const { count } = await repo.upsertReportWithRows(plantId, isoDate, rows || []);

  return {
    plant_id: plantId,
    report_date: isoDate,
    result: { rows_upserted: count, replaced: true }
  };
}

// вспомогательная
function mapRow(row) {
  return {
    producer_name: row.producer_name,
    supplier_name: row.supplier_name,
    supply_plan_month: Number(row.supply_plan_month),
    supply_plan_to_date: Number(row.supply_plan_to_date),
    supply_actual_daily: Number(row.supply_actual_daily),
    supply_actual_to_date: Number(row.supply_actual_to_date),
    confirmed_crude_volume: Number(row.confirmed_crude_volume),
    mne_approved_schedule: Number(row.mne_approved_schedule),
    plan_primary: Number(row.plan_primary),
    plan_additional: row.plan_additional != null ? Number(row.plan_additional) : null,
    plan_total: Number(row.plan_total),
    note: row.note || null
  };
}
