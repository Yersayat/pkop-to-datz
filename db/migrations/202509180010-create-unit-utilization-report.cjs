'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('unit_utilization_reports', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      plant_id: { type: Sequelize.STRING(16), allowNull: false },
      period_start: { type: Sequelize.STRING(35), allowNull: false },
      period_end: { type: Sequelize.STRING(35), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('unit_utilization_reports', {
      unique: true, fields: ['plant_id','period_start','period_end'], name: 'uniq_units_period'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('unit_utilization_reports');
  }
};
