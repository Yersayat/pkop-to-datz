import { models, sequelize } from '../models/index.js';

export class UnitUtilizationRepository {
  async getByPlantAndPeriod(plantId, periodStart, periodEnd, { limit, offset }) {
    const report = await models.UnitUtilizationReport.findOne({
      where: { plant_id: plantId, period_start: periodStart, period_end: periodEnd },
      include: [{ model: models.UnitUtilizationRow, as: 'rows' }],
      order: [[{ model: models.UnitUtilizationRow, as: 'rows' }, 'unit_name', 'ASC']]
    });

    if (!report) {
      return { header: { plant_id: plantId, period_start: periodStart, period_end: periodEnd }, rows: [], pagination: { limit, offset } };
    }

    const rows = report.rows.slice(offset, offset + limit);
    const hasMore = report.rows.length > offset + rows.length;

    return {
      header: { plant_id: report.plant_id, period_start: report.period_start, period_end: report.period_end },
      rows,
      pagination: { limit, offset, total: report.rows.length, has_more: hasMore }
    };
  }

  async upsertReportWithRows(plantId, periodStart, periodEnd, rows) {
    return sequelize.transaction(async (t) => {
      const [report] = await models.UnitUtilizationReport.findOrCreate({
        where: { plant_id: plantId, period_start: periodStart, period_end: periodEnd },
        defaults: { plant_id: plantId, period_start: periodStart, period_end: periodEnd },
        transaction: t
      });

      await models.UnitUtilizationRow.destroy({ where: { report_id: report.id }, transaction: t });

      const batch = (rows || []).map(r => ({
        report_id: report.id,
        unit_name: r.unit_name,
        design_capacity: r.design_capacity ?? 0,
        achieved_capacity_max: r.achieved_capacity_max ?? null,
        achieved_capacity_min: r.achieved_capacity_min ?? null,
        spiral_load: r.spiral_load ?? null,
        productivity: r.productivity ?? null,
        productivity_pct: r.productivity_pct ?? null,
        status: r.status
      }));

      if (batch.length > 0) {
        await models.UnitUtilizationRow.bulkCreate(batch, { validate: true, transaction: t });
      }

      return { report, count: batch.length };
    });
  }
}
