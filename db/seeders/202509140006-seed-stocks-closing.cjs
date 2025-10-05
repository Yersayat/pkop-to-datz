'use strict';

module.exports = {
  async up(queryInterface) {
    const plantId = 'ANPZ';
    const reportDate = '2025-08-28';
    const now = new Date();

    await queryInterface.sequelize.transaction(async (t) => {
      // найти или создать шапку
      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM stock_closing_reports WHERE plant_id = ? AND report_date = ? LIMIT 1',
        { replacements: [plantId, reportDate], transaction: t }
      );
      let rid = existing && existing[0] && existing[0].id;

      if (!rid) {
        await queryInterface.bulkInsert('stock_closing_reports', [{
          plant_id: plantId, report_date: reportDate, createdAt: now, updatedAt: now
        }], { transaction: t });

        const [rows] = await queryInterface.sequelize.query(
          'SELECT id FROM stock_closing_reports WHERE plant_id = ? AND report_date = ? ORDER BY id DESC LIMIT 1',
          { replacements: [plantId, reportDate], transaction: t }
        );
        rid = rows && rows[0] && rows[0].id;
        if (!rid) throw new Error('Seed failed: cannot fetch stock report id');
      }

      // очистить строки и залить новые
      await queryInterface.bulkDelete('stock_closing_rows', { report_id: rid }, { transaction: t });

      await queryInterface.bulkInsert('stock_closing_rows', [{
        report_id: rid,
        row_no: 1,
        supplier_name: null,
        product_code: 'A92',
        product_name: 'Бензин АИ-92',
        stock_closing_qty: 1234.5,
        uom: 't',
        createdAt: now, updatedAt: now
      }], { transaction: t });
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('stock_closing_rows', null, {});
    await queryInterface.bulkDelete('stock_closing_reports', null, {});
  }
};
