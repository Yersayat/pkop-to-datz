'use strict';

module.exports = {
  async up(queryInterface) {
    const plantId = 'ANPZ';
    const year = 2025;
    const now = new Date();

    await queryInterface.sequelize.transaction(async (t) => {
      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM processing_monthly_reports WHERE plant_id = ? AND year = ? LIMIT 1',
        { replacements: [plantId, year], transaction: t }
      );
      let rid = existing && existing[0] && existing[0].id;

      if (!rid) {
        await queryInterface.bulkInsert('processing_monthly_reports', [{
          plant_id: plantId, year, createdAt: now, updatedAt: now
        }], { transaction: t });

        const [rows] = await queryInterface.sequelize.query(
          'SELECT id FROM processing_monthly_reports WHERE plant_id = ? AND year = ? ORDER BY id DESC LIMIT 1',
          { replacements: [plantId, year], transaction: t }
        );
        rid = rows && rows[0] && rows[0].id;
        if (!rid) throw new Error('Seed failed: cannot fetch processing report id');
      }

      await queryInterface.bulkDelete('processing_monthly_rows', { report_id: rid }, { transaction: t });

      await queryInterface.bulkInsert('processing_monthly_rows', [{
        report_id: rid,
        producer_name: 'Недропользователь А',
        jan_fact: 10000.0,
        feb_fact: 11000.0,
        total_fact_tonnes: 21000.0,
        createdAt: now, updatedAt: now
      }], { transaction: t });
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('processing_monthly_rows', null, {});
    await queryInterface.bulkDelete('processing_monthly_reports', null, {});
  }
};
