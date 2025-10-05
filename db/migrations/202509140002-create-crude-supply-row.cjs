'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('crude_supply_rows', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      report_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'crude_supply_reports', key: 'id' },
        onDelete: 'CASCADE'
      },

      producer_name: { type: Sequelize.STRING(255), allowNull: false },
      supplier_name: { type: Sequelize.STRING(255), allowNull: false },

      supply_plan_month: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
      supply_plan_to_date: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
      supply_actual_daily: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
      supply_actual_to_date: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },

      confirmed_crude_volume: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
      mne_approved_schedule: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },

      plan_primary: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
      plan_additional: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      plan_total: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },

      note: { type: Sequelize.STRING(1024), allowNull: true },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('crude_supply_rows', { fields: ['report_id'] });
    await queryInterface.addIndex('crude_supply_rows', {
      unique: true,
      fields: ['report_id', 'producer_name', 'supplier_name'],
      name: 'uniq_report_producer_supplier'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('crude_supply_rows');
  }
};
