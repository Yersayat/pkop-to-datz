import { DataTypes, Model } from 'sequelize';

export default function defineCrudeSupplyReport(sequelize) {
  class CrudeSupplyReport extends Model {}
  CrudeSupplyReport.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    plant_id: { type: DataTypes.STRING(16), allowNull: false },
    report_date: { type: DataTypes.DATEONLY, allowNull: false }
  }, {
    sequelize,
    tableName: 'crude_supply_reports',
    indexes: [
      { unique: true, fields: ['plant_id', 'report_date'] }
    ]
  });
  return CrudeSupplyReport;
}
