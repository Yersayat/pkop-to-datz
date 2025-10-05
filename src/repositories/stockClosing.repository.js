import { models, sequelize } from '../models/index.js';

export class StockClosingRepository {
  async getByPlantAndDate(plantId, reportDate, { limit, offset }) {
    const report = await models.StockClosingReport.findOne({
      where: { plant_id: plantId, report_date: reportDate },
      include: [{ model: models.StockClosingRow, as: 'rows' }],
      order: [[{ model: models.StockClosingRow, as: 'rows' }, 'row_no', 'ASC']]
    });

    if (!report) {
      return { header: { plant_id: plantId, report_date: reportDate }, rows: [], pagination: { limit, offset } };
    }

    const rows = report.rows.slice(offset, offset + limit);
    const hasMore = report.rows.length > offset + rows.length;

    return {
      header: { plant_id: report.plant_id, report_date: report.report_date },
      rows,
      pagination: { limit, offset, total: report.rows.length, has_more: hasMore }
    };
  }

  async upsertReportWithRows(plantId, reportDate, rows) {
    return sequelize.transaction(async (t) => {
      const [report] = await models.StockClosingReport.findOrCreate({
        where: { plant_id: plantId, report_date: reportDate },
        defaults: { plant_id: plantId, report_date: reportDate },
        transaction: t
      });

      await models.StockClosingRow.destroy({ where: { report_id: report.id }, transaction: t });

      const batch = (rows || []).map(r => ({
        report_id: report.id,
        row_no: r.row_no,
        supplier_name: r.supplier_name ?? null,
        product_code: r.product_code,
        product_name: r.product_name,
        stock_closing_qty: r.stock_closing_qty,
        uom: r.uom
      }));

      if (batch.length > 0) {
        await models.StockClosingRow.bulkCreate(batch, { validate: true, transaction: t });
      }

      return { report, count: batch.length };
    });
  }
}
