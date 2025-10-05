import { DataTypes, Model } from 'sequelize';

export default function defineUnitUtilizationReport(sequelize) {
  class UnitUtilizationReport extends Model {}
  UnitUtilizationReport.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    plant_id: { type: DataTypes.STRING(16), allowNull: false },
    period_start: { type: DataTypes.STRING(35), allowNull: false }, // ISO-8601 с TZ
    period_end: { type: DataTypes.STRING(35), allowNull: false }
  }, {
    sequelize,
    tableName: 'unit_utilization_reports',
    indexes: [
      { unique: true, fields: ['plant_id', 'period_start', 'period_end'], name: 'uniq_units_period' }
    ]
  });
  return UnitUtilizationReport;
}
