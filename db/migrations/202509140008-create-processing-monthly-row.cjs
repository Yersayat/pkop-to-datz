'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('processing_monthly_rows', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      report_id: {
        type: Sequelize.BIGINT.UNSIGNED, allowNull: false,
        references: { model: 'processing_monthly_reports', key: 'id' },
        onDelete: 'CASCADE'
      },
      producer_name: { type: Sequelize.STRING(255), allowNull: false },

      jan_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      feb_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      mar_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      apr_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      may_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      jun_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      jul_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      aug_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      sep_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      oct_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      nov_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },
      dec_fact: { type: Sequelize.DECIMAL(18,3), allowNull: true },

      total_fact_tonnes: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('processing_monthly_rows', { fields: ['report_id'] });
    await queryInterface.addIndex('processing_monthly_rows', {
      unique: true,
      fields: ['report_id', 'producer_name'],
      name: 'uniq_processing_producer'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('processing_monthly_rows');
  }
};
