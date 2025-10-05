import { DataTypes, Model } from 'sequelize';

export default function defineCrudeSupplyRow(sequelize) {
  class CrudeSupplyRow extends Model {}
  CrudeSupplyRow.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    report_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    producer_name: { type: DataTypes.STRING(255), allowNull: false },
    supplier_name: { type: DataTypes.STRING(255), allowNull: false },

    supply_plan_month: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    supply_plan_to_date: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    supply_actual_daily: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    supply_actual_to_date: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },

    confirmed_crude_volume: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    mne_approved_schedule: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },

    plan_primary: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    plan_additional: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    plan_total: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },

    note: { type: DataTypes.STRING(1024), allowNull: true }
  }, {
    sequelize,
    tableName: 'crude_supply_rows',
    hooks: {
      beforeValidate: (row) => {
        const fields = [
          'supply_plan_month','supply_plan_to_date','supply_actual_daily','supply_actual_to_date',
          'confirmed_crude_volume','mne_approved_schedule','plan_primary','plan_total'
        ];
        for (const f of fields) {
          if (row[f] == null || Number(row[f]) < 0) {
            throw new Error(`Field '${f}' must be >= 0`);
          }
        }
        if (row.plan_additional != null && Number(row.plan_additional) < 0) {
          throw new Error("Field 'plan_additional' must be >= 0");
        }
        if (row.plan_additional != null) {
          const sum = Number(row.plan_primary) + Number(row.plan_additional);
          if (Number(row.plan_total) !== +sum) {
            throw new Error("Validation: plan_primary + plan_additional must equal plan_total");
          }
        }
      }
    },
    indexes: [
      { fields: ['report_id'] },
      { unique: true, fields: ['report_id', 'producer_name', 'supplier_name'], name: 'uniq_report_producer_supplier' }
    ]
  });
  return CrudeSupplyRow;
}
