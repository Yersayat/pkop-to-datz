import { UnitUtilizationRepository } from '../repositories/unitUtilization.repository.js';
import { ApiError } from '../lib/errors.js';
import { toISODate } from '../lib/date.js';

const repo = new UnitUtilizationRepository();
const STATUSES = ['in_operation', 'idle', 'maintenance', 'down', 'standby', 'в работе'];

function parseDailyPeriod(dateStr) {
  // вход: YYYY-MM-DD, вывод: [start,end] в формате "2025-08-28T00:00:00+05:00" и "…23:59:59+05:00"
  const iso = toISODate(dateStr); // отдаёт 'YYYY-MM-DD'
  // таймзону берём из ENV или по умолчанию +05:00 (как в ТЗ)
  const tz = process.env.DEFAULT_TZ_OFFSET || '+05:00';
  return [`${iso}T00:00:00${tz}`, `${iso}T23:59:59${tz}`];
}

function ensurePeriodValid(start, end) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(start)) {
    throw new ApiError(422, 'VALIDATION_FAILED', "Field 'period_start' must be ISO-8601 with timezone");
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(end)) {
    throw new ApiError(422, 'VALIDATION_FAILED', "Field 'period_end' must be ISO-8601 with timezone");
  }
  if (new Date(start).getTime() >= new Date(end).getTime()) {
    throw new ApiError(422, 'VALIDATION_FAILED', 'period_start must be < period_end');
  }
}

function ensureNoDuplicateKeys(rows) {
  const seen = new Set();
  for (const [i, r] of (rows || []).entries()) {
    const key = r.unit_name;
    if (seen.has(key)) {
      throw new ApiError(422, 'VALIDATION_FAILED', 'Duplicate row for unit_name', { row: i, key: { unit_name: r.unit_name } });
    }
    seen.add(key);
  }
}

function ensureDomainRules(rows) {
  for (const [i, r] of (rows || []).entries()) {
    if (!r.unit_name) throw new ApiError(422, 'VALIDATION_FAILED', "Field 'unit_name' is required", { row: i });
    if (!STATUSES.includes(r.status)) throw new ApiError(422, 'VALIDATION_FAILED', `Field 'status' must be one of: ${STATUSES.join(', ')}`, { row: i });

    const nn = [
      ['design_capacity', r.design_capacity ?? 0],
      ['achieved_capacity_max', r.achieved_capacity_max],
      ['achieved_capacity_min', r.achieved_capacity_min],
      ['spiral_load', r.spiral_load],
      ['productivity', r.productivity],
      ['productivity_pct', r.productivity_pct]
    ];
    for (const [f, v] of nn) {
      if (v != null && Number(v) < 0) throw new ApiError(422, 'VALIDATION_FAILED', `Field '${f}' must be >= 0`, { row: i, field: f });
    }

    const design = Number(r.design_capacity ?? 0);
    if (design < 0) throw new ApiError(422, 'VALIDATION_FAILED', "Field 'design_capacity' must be >= 0", { row: i });
    // if (design > 0 && r.productivity != null && r.productivity_pct != null) {
    //   const expected = (Number(r.productivity) / design) * 100;
    //   if (Math.abs(expected - Number(r.productivity_pct)) > 0.5) {
    //     throw new ApiError(422, 'VALIDATION_FAILED',
    //       'Validation: productivity_pct must match productivity/design_capacity*100 ±0.5',
    //       { row: i, expected: expected.toFixed(3), actual: Number(r.productivity_pct) });
    //   }
    // }
  }
}

function mapRow(row) {
  return {
    unit_name: row.unit_name,
    design_capacity: Number(row.design_capacity),
    achieved_capacity_max: row.achieved_capacity_max != null ? Number(row.achieved_capacity_max) : null,
    achieved_capacity_min: row.achieved_capacity_min != null ? Number(row.achieved_capacity_min) : null,
    spiral_load: row.spiral_load != null ? Number(row.spiral_load) : null,
    productivity: row.productivity != null ? Number(row.productivity) : null,
    productivity_pct: row.productivity_pct != null ? Number(row.productivity_pct) : null,
    status: row.status
  };
}

export async function getUnitsUtilization({ plantId, date, pagination }) {
  if (!plantId) throw new ApiError(400, 'VALIDATION_FAILED', "Query param 'plant_id' is required", { field: 'plant_id' });
  const [periodStart, periodEnd] = parseDailyPeriod(date);
  const { header, rows, pagination: page } = await repo.getByPlantAndPeriod(plantId, periodStart, periodEnd, pagination);
  return { plant_id: header.plant_id, period_start: header.period_start, period_end: header.period_end, rows: rows.map(mapRow), pagination: page };
}

export async function upsertUnitsUtilization(body) {
  const { plant_id: plantId, report_date, rows } = body;
  if (!plantId) throw new ApiError(400, 'VALIDATION_FAILED', "Field 'plant_id' is required", { field: 'plant_id' });
  if (!report_date) throw new ApiError(400, 'VALIDATION_FAILED', "Field 'report_date' is required", { field: 'report_date' });

  // период одних суток по TZ
  const [period_start, period_end] = parseDailyPeriod(report_date);

  ensureNoDuplicateKeys(rows);
  ensureDomainRules(rows);

  const { count } = await repo.upsertReportWithRows(plantId, period_start, period_end, rows || []);
  return { plant_id: plantId, report_date, period_start, period_end, result: { rows_upserted: count, replaced: true } };
}
