import { Sequelize } from 'sequelize';
import { config } from '../config/index.js';
import defineCrudeSupplyReport from './crudeSupplyReport.js';
import defineCrudeSupplyRow from './crudeSupplyRow.js';
import defineStockClosingReport from './stockClosingReport.js';
import defineStockClosingRow from './stockClosingRow.js';
import defineProcessingMonthlyReport from './processingMonthlyReport.js';
import defineProcessingMonthlyRow from './processingMonthlyRow.js';
import defineUnitUtilizationReport from './unitUtilizationReport.js';
import defineUnitUtilizationRow from './unitUtilizationRow.js';

const sequelize = new Sequelize(
  config.DB.NAME,
  config.DB.USER,
  config.DB.PASSWORD,
  {
    host: config.DB.HOST,
    port: config.DB.PORT,
    dialect: 'mysql',
    logging: false
  }
);

const models = {};
models.CrudeSupplyReport = defineCrudeSupplyReport(sequelize);
models.CrudeSupplyRow = defineCrudeSupplyRow(sequelize);
models.StockClosingReport = defineStockClosingReport(sequelize);
models.StockClosingRow = defineStockClosingRow(sequelize);
models.ProcessingMonthlyReport = defineProcessingMonthlyReport(sequelize);
models.ProcessingMonthlyRow = defineProcessingMonthlyRow(sequelize);
models.UnitUtilizationReport = defineUnitUtilizationReport(sequelize);
models.UnitUtilizationRow = defineUnitUtilizationRow(sequelize);

models.CrudeSupplyReport.hasMany(models.CrudeSupplyRow, {
  as: 'rows',
  foreignKey: 'report_id',
  onDelete: 'CASCADE'
});
models.CrudeSupplyRow.belongsTo(models.CrudeSupplyReport, {
  foreignKey: 'report_id',
  as: 'report'
});
models.StockClosingReport.hasMany(models.StockClosingRow, {
  as: 'rows',
  foreignKey: 'report_id',
  onDelete: 'CASCADE'
});
models.StockClosingRow.belongsTo(models.StockClosingReport, {
  foreignKey: 'report_id',
  as: 'report'
});
models.ProcessingMonthlyReport.hasMany(models.ProcessingMonthlyRow, {
  as: 'rows', foreignKey: 'report_id', onDelete: 'CASCADE'
});
models.ProcessingMonthlyRow.belongsTo(models.ProcessingMonthlyReport, {
  as: 'report', foreignKey: 'report_id'
});
models.UnitUtilizationReport.hasMany(models.UnitUtilizationRow, {
  as: 'rows', foreignKey: 'report_id', onDelete: 'CASCADE'
});
models.UnitUtilizationRow.belongsTo(models.UnitUtilizationReport, {
  as: 'report', foreignKey: 'report_id'
});




export { sequelize, models };
