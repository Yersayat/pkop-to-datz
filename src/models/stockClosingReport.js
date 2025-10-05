import { DataTypes, Model } from 'sequelize';

export default function defineStockClosingReport(sequelize) {
  class StockClosingReport extends Model {}
  StockClosingReport.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    plant_id: { type: DataTypes.STRING(16), allowNull: false },
    report_date: { type: DataTypes.DATEONLY, allowNull: false }
  }, {
    sequelize,
    tableName: 'stock_closing_reports',
    indexes: [{ unique: true, fields: ['plant_id', 'report_date'] }]
  });
  return StockClosingReport;
}
