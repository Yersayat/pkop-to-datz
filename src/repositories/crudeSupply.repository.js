import { models, sequelize } from '../models/index.js';

export class CrudeSupplyRepository {
  async getByPlantAndDate(plantId, reportDate, { limit, offset }) {
    const report = await models.CrudeSupplyReport.findOne({
      where: { plant_id: plantId, report_date: reportDate },
      include: [{ model: models.CrudeSupplyRow, as: 'rows' }],
      order: [[{ model: models.CrudeSupplyRow, as: 'rows' }, 'id', 'ASC']]
    });

    if (!report) return { header: { plant_id: plantId, report_date: reportDate }, rows: [], pagination: { limit, offset } };

    const rows = report.rows.slice(offset, offset + limit);
    const hasMore = report.rows.length > offset + rows.length;

    return {
      header: { plant_id: report.plant_id, report_date: report.report_date },
      rows,
      pagination: {
        limit,
        offset,
        total: report.rows.length,
        has_more: hasMore
      }
    };
  }

  async upsertReportWithRows(plantId, reportDate, rows) {
    return sequelize.transaction(async (t) => {
      // находим/создаём шапку
      const [report] = await models.CrudeSupplyReport.findOrCreate({
        where: { plant_id: plantId, report_date: reportDate },
        defaults: { plant_id: plantId, report_date: reportDate },
        transaction: t
      });

      // удаляем старые строки
      await models.CrudeSupplyRow.destroy({
        where: { report_id: report.id },
        transaction: t
      });

      // подготавливаем батч
      const batch = rows.map(r => ({
        report_id: report.id,
        producer_name: r.producer_name,
        supplier_name: r.supplier_name,
        supply_plan_month: r.supply_plan_month,
        supply_plan_to_date: r.supply_plan_to_date,
        supply_actual_daily: r.supply_actual_daily,
        supply_actual_to_date: r.supply_actual_to_date,
        confirmed_crude_volume: r.confirmed_crude_volume,
        mne_approved_schedule: r.mne_approved_schedule,
        plan_primary: r.plan_primary,
        plan_additional: r.plan_additional ?? null,
        plan_total: r.plan_total,
        note: r.note ?? null
      }));

      // вставляем новые
      if (batch.length > 0) {
        await models.CrudeSupplyRow.bulkCreate(batch, { validate: true, transaction: t });
      }

      return { report, count: batch.length };
    });
  }
}
