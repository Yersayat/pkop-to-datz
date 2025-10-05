'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('processing_monthly_reports', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      plant_id: { type: Sequelize.STRING(16), allowNull: false },
      year: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('processing_monthly_reports', {
      unique: true, fields: ['plant_id', 'year'], name: 'uniq_processing_plant_year'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('processing_monthly_reports');
  }
};
