import { models, sequelize } from '../models/index.js';

export class ProcessingMonthlyRepository {
  async getByPlantAndYear(plantId, year, { limit, offset }) {
    const report = await models.ProcessingMonthlyReport.findOne({
      where: { plant_id: plantId, year },
      include: [{ model: models.ProcessingMonthlyRow, as: 'rows' }],
      order: [[{ model: models.ProcessingMonthlyRow, as: 'rows' }, 'id', 'ASC']]
    });

    if (!report) {
      return { header: { plant_id: plantId, year }, rows: [], pagination: { limit, offset } };
    }

    const rows = report.rows.slice(offset, offset + limit);
    const hasMore = report.rows.length > offset + rows.length;

    return {
      header: { plant_id: report.plant_id, year: report.year },
      rows,
      pagination: { limit, offset, total: report.rows.length, has_more: hasMore }
    };
  }

  async upsertReportWithRows(plantId, year, rows) {
    return sequelize.transaction(async (t) => {
      const [report] = await models.ProcessingMonthlyReport.findOrCreate({
        where: { plant_id: plantId, year },
        defaults: { plant_id: plantId, year },
        transaction: t
      });

      await models.ProcessingMonthlyRow.destroy({ where: { report_id: report.id }, transaction: t });

      const batch = (rows || []).map(r => ({
        report_id: report.id,
        producer_name: r.producer_name,
        jan_fact: r.months?.jan?.fact_tonnes ?? null,
        feb_fact: r.months?.feb?.fact_tonnes ?? null,
        mar_fact: r.months?.mar?.fact_tonnes ?? null,
        apr_fact: r.months?.apr?.fact_tonnes ?? null,
        may_fact: r.months?.may?.fact_tonnes ?? null,
        jun_fact: r.months?.jun?.fact_tonnes ?? null,
        jul_fact: r.months?.jul?.fact_tonnes ?? null,
        aug_fact: r.months?.aug?.fact_tonnes ?? null,
        sep_fact: r.months?.sep?.fact_tonnes ?? null,
        oct_fact: r.months?.oct?.fact_tonnes ?? null,
        nov_fact: r.months?.nov?.fact_tonnes ?? null,
        dec_fact: r.months?.dec?.fact_tonnes ?? null,
        total_fact_tonnes: r.total_fact_tonnes
      }));

      if (batch.length > 0) {
        await models.ProcessingMonthlyRow.bulkCreate(batch, { validate: true, transaction: t });
      }

      return { report, count: batch.length };
    });
  }
}
