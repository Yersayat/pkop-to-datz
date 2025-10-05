import { DataTypes, Model } from 'sequelize';

const UOMS = ['t']; // можно расширить конфигом

export default function defineStockClosingRow(sequelize) {
  class StockClosingRow extends Model {}
  StockClosingRow.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    report_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    row_no: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    supplier_name: { type: DataTypes.STRING(255), allowNull: true },
    product_code: { type: DataTypes.STRING(64), allowNull: false },
    product_name: { type: DataTypes.STRING(255), allowNull: false },
    stock_closing_qty: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    uom: { type: DataTypes.STRING(16), allowNull: false }
  }, {
    sequelize,
    tableName: 'stock_closing_rows',
    hooks: {
      beforeValidate: (row) => {
        if (row.stock_closing_qty == null || Number(row.stock_closing_qty) < 0) {
          throw new Error("Field 'stock_closing_qty' must be >= 0");
        }
        if (!UOMS.includes(row.uom)) {
          throw new Error(`Field 'uom' must be one of: ${UOMS.join(', ')}`);
        }
      }
    },
    indexes: [
      { fields: ['report_id'] },
      { fields: ['product_code'] },
      { unique: true, fields: ['report_id', 'supplier_name', 'product_code', 'product_name'], name: 'uniq_stock_key' }
    ]
  });
  return StockClosingRow;
}
