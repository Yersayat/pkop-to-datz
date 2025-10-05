import { DataTypes, Model } from 'sequelize';

export default function defineProcessingMonthlyRow(sequelize) {
  class ProcessingMonthlyRow extends Model {}
  ProcessingMonthlyRow.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    report_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },

    producer_name: { type: DataTypes.STRING(255), allowNull: false },

    // помесячные факты (тонны)
    jan_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    feb_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    mar_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    apr_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    may_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    jun_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    jul_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    aug_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    sep_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    oct_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    nov_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },
    dec_fact: { type: DataTypes.DECIMAL(18,3), allowNull: true },

    total_fact_tonnes: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 }
  }, {
    sequelize,
    tableName: 'processing_monthly_rows',
    hooks: {
      beforeValidate: (row) => {
        const all = [
          row.jan_fact,row.feb_fact,row.mar_fact,row.apr_fact,row.may_fact,row.jun_fact,
          row.jul_fact,row.aug_fact,row.sep_fact,row.oct_fact,row.nov_fact,row.dec_fact
        ].filter(v => v != null).map(Number);

        if (row.total_fact_tonnes == null || Number(row.total_fact_tonnes) < 0) {
          throw new Error("Field 'total_fact_tonnes' must be >= 0");
        }
        for (const v of all) {
          if (v < 0) throw new Error("Monthly 'fact_tonnes' must be >= 0");
        }
        if (all.length > 0) {
          const sum = all.reduce((a,b)=>a+b,0);
          if (Math.abs(Number(row.total_fact_tonnes) - sum) > 0.0005) {
            throw new Error("Validation: sum(months.fact_tonnes) must equal total_fact_tonnes");
          }
        }
      }
    },
    indexes: [
      { fields: ['report_id'] },
      { unique: true, fields: ['report_id', 'producer_name'], name: 'uniq_processing_producer' }
    ]
  });
  return ProcessingMonthlyRow;
}
