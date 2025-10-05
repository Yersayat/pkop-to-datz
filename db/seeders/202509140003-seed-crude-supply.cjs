'use strict';

module.exports = {
  async up(queryInterface) {
    const plantId = 'ANPZ';
    const reportDate = '2025-08-28';
    const now = new Date();

    await queryInterface.sequelize.transaction(async (t) => {
      // 1) Пытаемся найти существующий отчёт
      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM crude_supply_reports WHERE plant_id = ? AND report_date = ? LIMIT 1',
        { replacements: [plantId, reportDate], transaction: t }
      );

      let rid = existing && existing[0] && existing[0].id;

      // 2) Если нет — создаём
      if (!rid) {
        await queryInterface.bulkInsert('crude_supply_reports', [{
          plant_id: plantId,
          report_date: reportDate,
          createdAt: now,
          updatedAt: now
        }], { transaction: t });

        const [rows] = await queryInterface.sequelize.query(
          'SELECT id FROM crude_supply_reports WHERE plant_id = ? AND report_date = ? ORDER BY id DESC LIMIT 1',
          { replacements: [plantId, reportDate], transaction: t }
        );
        rid = rows && rows[0] && rows[0].id;
        if (!rid) throw new Error('Seed failed: cannot fetch report id after insert');
      }

      // 3) Чистим строки отчёта (чтобы сид был идемпотентным)
      await queryInterface.bulkDelete('crude_supply_rows', { report_id: rid }, { transaction: t });

      // 4) Вставляем строки
      await queryInterface.bulkInsert('crude_supply_rows', [{
        report_id: rid,
        producer_name: 'Недропользователь А',
        supplier_name: 'Поставщик 1',
        supply_plan_month: 120000.0,
        supply_plan_to_date: 36000.0,
        supply_actual_daily: 1500.0,
        supply_actual_to_date: 35500.0,
        confirmed_crude_volume: 1500.0,
        mne_approved_schedule: 110000.0,
        plan_primary: 100000.0,
        plan_additional: 10000.0,
        plan_total: 110000.0,
        note: '-',
        createdAt: now,
        updatedAt: now
      }], { transaction: t });
    });
  },

  async down(queryInterface) {
    // Полная очистка набора сидера
    await queryInterface.bulkDelete('crude_supply_rows', null, {});
    await queryInterface.bulkDelete('crude_supply_reports', null, {});
  }
};
