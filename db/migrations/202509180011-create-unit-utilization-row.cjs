'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('unit_utilization_rows', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      report_id: {
        type: Sequelize.BIGINT.UNSIGNED, allowNull: false,
        references: { model: 'unit_utilization_reports', key: 'id' },
        onDelete: 'CASCADE'
      },

      unit_name: { type: Sequelize.STRING(64), allowNull: false },
      design_capacity: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
      achieved_capacity_max: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      achieved_capacity_min: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      spiral_load: { type: Sequelize.DECIMAL(9,4), allowNull: true },
      productivity: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      productivity_pct: { type: Sequelize.DECIMAL(9,4), allowNull: true },
      status: { type: Sequelize.STRING(32), allowNull: false },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('unit_utilization_rows', { fields: ['report_id'] });
    await queryInterface.addIndex('unit_utilization_rows', {
      unique: true, fields: ['report_id','unit_name'], name: 'uniq_report_unit'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('unit_utilization_rows');
  }
};
