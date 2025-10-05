import { DataTypes, Model } from 'sequelize';

const STATUSES = ['in_operation', 'idle', 'maintenance', 'down', 'standby', 'в работе'];

export default function defineUnitUtilizationRow(sequelize) {
  class UnitUtilizationRow extends Model {}
  UnitUtilizationRow.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    report_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    unit_name: { type: DataTypes.STRING(64), allowNull: false },
    design_capacity: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    achieved_capacity_max: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    achieved_capacity_min: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    spiral_load: { type: DataTypes.DECIMAL(9,4), allowNull: true }, // доля 0..1
    productivity: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    productivity_pct: { type: DataTypes.DECIMAL(9,4), allowNull: true },
    status: { type: DataTypes.STRING(32), allowNull: false }
  }, {
    sequelize,
    tableName: 'unit_utilization_rows',
    hooks: {
      beforeValidate: (row) => {
        const nonNeg = [
          ['design_capacity', row.design_capacity],
          ['achieved_capacity_max', row.achieved_capacity_max],
          ['achieved_capacity_min', row.achieved_capacity_min],
          ['spiral_load', row.spiral_load],
          ['productivity', row.productivity],
          ['productivity_pct', row.productivity_pct]
        ];
        for (const [f, v] of nonNeg) {
          if (v != null && Number(v) < 0) throw new Error(`Field '${f}' must be >= 0`);
        }
        if (!STATUSES.includes(row.status)) {
          throw new Error(`Field 'status' must be one of: ${STATUSES.join(', ')}`);
        }
        // если есть оба значения — сверим процент
        const design = Number(row.design_capacity ?? 0);
        const prod = row.productivity != null ? Number(row.productivity) : null;
        const pct = row.productivity_pct != null ? Number(row.productivity_pct) : null;
        if (design > 0 && prod != null && pct != null) {
          const expected = (prod / design) * 100;
          if (Math.abs(expected - pct) > 0.5) {
            throw new Error('Validation: productivity_pct must match productivity/design_capacity*100 ±0.5');
          }
        }
      }
    },
    indexes: [
      { fields: ['report_id'] },
      { unique: true, fields: ['report_id', 'unit_name'], name: 'uniq_report_unit' }
    ]
  });
  return UnitUtilizationRow;
}
