'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('crude_supply_reports', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      plant_id: { type: Sequelize.STRING(16), allowNull: false },
      report_date: { type: Sequelize.DATEONLY, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('crude_supply_reports', {
      unique: true,
      fields: ['plant_id', 'report_date'],
      name: 'uniq_plant_date'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('crude_supply_reports');
  }
};
