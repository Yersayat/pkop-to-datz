import { DataTypes, Model } from 'sequelize';

export default function defineProcessingMonthlyReport(sequelize) {
  class ProcessingMonthlyReport extends Model {}
  ProcessingMonthlyReport.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    plant_id: { type: DataTypes.STRING(16), allowNull: false },
    year: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }
  }, {
    sequelize,
    tableName: 'processing_monthly_reports',
    indexes: [{ unique: true, fields: ['plant_id', 'year'] }]
  });
  return ProcessingMonthlyReport;
}
