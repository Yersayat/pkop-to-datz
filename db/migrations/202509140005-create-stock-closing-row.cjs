'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_closing_rows', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      report_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'stock_closing_reports', key: 'id' },
        onDelete: 'CASCADE'
      },

      row_no: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      supplier_name: { type: Sequelize.STRING(255), allowNull: true },
      product_code: { type: Sequelize.STRING(64), allowNull: false },
      product_name: { type: Sequelize.STRING(255), allowNull: false },
      stock_closing_qty: { type: Sequelize.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
      uom: { type: Sequelize.STRING(16), allowNull: false },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('stock_closing_rows', { fields: ['report_id'] });
    await queryInterface.addIndex('stock_closing_rows', { fields: ['product_code'] });
    await queryInterface.addIndex('stock_closing_rows', {
      unique: true,
      fields: ['report_id', 'supplier_name', 'product_code', 'product_name'],
      name: 'uniq_stock_key'
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('stock_closing_rows');
  }
};
