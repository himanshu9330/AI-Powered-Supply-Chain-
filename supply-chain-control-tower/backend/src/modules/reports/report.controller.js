const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const db = require('../../config/db');

const BRAND_COLOR = '1565C0';
const BRAND_ACCENT = '00BCD4';

const generateInventoryExcel = async (res) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Supply Chain Control Tower';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Inventory Status', {
    pageSetup: { paperSize: 9, orientation: 'landscape' },
  });

  // Header style
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${BRAND_COLOR}` } },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } },
  };

  sheet.columns = [
    { header: 'Product', key: 'product_name', width: 30 },
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Category', key: 'category_name', width: 18 },
    { header: 'Warehouse', key: 'warehouse_name', width: 22 },
    { header: 'On Hand', key: 'quantity_on_hand', width: 12 },
    { header: 'Reserved', key: 'quantity_reserved', width: 12 },
    { header: 'Available', key: 'quantity_available', width: 12 },
    { header: 'Reorder Point', key: 'reorder_point', width: 14 },
    { header: 'Safety Stock', key: 'safety_stock', width: 13 },
    { header: 'Inventory Value (USD)', key: 'inventory_value', width: 20 },
    { header: 'Status', key: 'stock_status', width: 12 },
    { header: 'ABC Class', key: 'abc_class', width: 10 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 30;
  sheet.columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    Object.assign(cell, headerStyle);
  });

  const { rows } = await db.query(`SELECT * FROM vw_inventory_status ORDER BY product_name, warehouse_name`);

  const statusColors = { stockout: 'FFEF5350', critical: 'FFFF7043', low: 'FFFFA726', overstock: 'FF7E57C2', optimal: 'FF66BB6A' };
  rows.forEach((row, i) => {
    const dataRow = sheet.addRow(row);
    dataRow.height = 20;
    if (i % 2 === 0) {
      dataRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } };
    }
    const statusCell = dataRow.getCell('stock_status');
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: statusColors[row.stock_status] || 'FFFFFFFF' } };
    statusCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    const valueCell = dataRow.getCell('inventory_value');
    valueCell.numFmt = '$#,##0.00';
  });

  // Summary sheet
  const summary = workbook.addWorksheet('Summary');
  const { rows: kpis } = await db.query(`SELECT * FROM vw_kpi_summary`);
  summary.addRow(['Metric', 'Value']);
  summary.addRow(['Total Inventory Value', `$${parseFloat(kpis[0].total_inventory_value).toLocaleString()}`]);
  summary.addRow(['Total Products', kpis[0].total_products]);
  summary.addRow(['Stockout Count', kpis[0].stockout_count]);
  summary.addRow(['Fill Rate %', `${kpis[0].fill_rate_pct}%`]);
  summary.addRow(['Report Generated', new Date().toISOString()]);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="inventory_report_${Date.now()}.xlsx"`);
  await workbook.xlsx.write(res);
};

const generateInventoryPDF = async (res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="inventory_report_${Date.now()}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).fillColor('#1565C0').text('Supply Chain Control Tower', { align: 'center' });
  doc.fontSize(14).fillColor('#555').text('Inventory Status Report', { align: 'center' });
  doc.fontSize(10).fillColor('#888').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown();

  // KPI summary box
  const { rows: kpis } = await db.query(`SELECT * FROM vw_kpi_summary`);
  const kpi = kpis[0];
  doc.rect(40, doc.y, 515, 80).fillColor('#EFF6FF').fill();
  doc.fillColor('#1565C0').fontSize(12).text('Executive Summary', 50, doc.y - 70);
  doc.fillColor('#333').fontSize(10)
    .text(`Total Inventory Value: $${parseFloat(kpi.total_inventory_value).toLocaleString()}`, 50, doc.y - 50)
    .text(`Total Products: ${kpi.total_products}  |  Warehouses: ${kpi.total_warehouses}`, 50, doc.y - 35)
    .text(`Fill Rate: ${kpi.fill_rate_pct}%  |  Stockouts: ${kpi.stockout_count}  |  Critical: ${kpi.critical_stock_count}`, 50, doc.y - 20);

  doc.moveDown(2);
  doc.fillColor('#1565C0').fontSize(12).text('Top 20 Products by Inventory Value');
  doc.moveDown(0.5);

  const { rows } = await db.query(
    `SELECT product_name, sku, warehouse_name, quantity_on_hand, inventory_value, stock_status
     FROM vw_inventory_status ORDER BY inventory_value DESC LIMIT 20`
  );

  // Table headers
  const cols = [40, 180, 250, 340, 400, 480];
  const headers = ['Product', 'SKU', 'Warehouse', 'On Hand', 'Value (USD)', 'Status'];
  doc.fillColor('#1565C0').fontSize(9);
  headers.forEach((h, i) => doc.text(h, cols[i], doc.y, { width: cols[i + 1] - cols[i] - 5 || 80 }));
  doc.moveDown(0.5);
  doc.fillColor('#333').fontSize(8);

  rows.forEach((row, i) => {
    const y = doc.y;
    if (i % 2 === 0) doc.rect(40, y - 2, 515, 16).fillColor('#F8F9FA').fill();
    doc.fillColor('#333')
      .text(row.product_name.substring(0, 22), cols[0], y)
      .text(row.sku, cols[1], y)
      .text(row.warehouse_name.substring(0, 16), cols[2], y)
      .text(row.quantity_on_hand, cols[3], y)
      .text(`$${parseFloat(row.inventory_value).toLocaleString()}`, cols[4], y)
      .text(row.stock_status, cols[5], y);
    doc.moveDown(0.7);
  });

  doc.end();
};

const reportController = {
  inventory: async (req, res, next) => {
    try {
      const { format = 'xlsx' } = req.query;
      if (format === 'pdf') return generateInventoryPDF(res);
      return generateInventoryExcel(res);
    } catch (err) { next(err); }
  },

  warehouse: async (req, res, next) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Warehouse Utilization');
      sheet.columns = [
        { header: 'Warehouse', key: 'warehouse_name', width: 25 },
        { header: 'Code', key: 'code', width: 12 },
        { header: 'City', key: 'city', width: 15 },
        { header: 'Country', key: 'country', width: 12 },
        { header: 'Capacity', key: 'capacity_units', width: 12 },
        { header: 'Units In Stock', key: 'units_in_stock', width: 15 },
        { header: 'Utilization %', key: 'utilization_pct', width: 14 },
        { header: 'Inventory Value', key: 'inventory_value', width: 18 },
        { header: 'Products', key: 'distinct_products', width: 10 },
      ];
      const { rows } = await db.query(`SELECT * FROM vw_warehouse_utilization ORDER BY utilization_pct DESC`);
      rows.forEach(row => sheet.addRow(row));
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="warehouse_report_${Date.now()}.xlsx"`);
      await workbook.xlsx.write(res);
    } catch (err) { next(err); }
  },

  forecast: async (req, res, next) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Forecast History');
      sheet.columns = [
        { header: 'Product', key: 'product_name', width: 28 },
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Warehouse', key: 'warehouse_name', width: 22 },
        { header: 'Model', key: 'model_type', width: 14 },
        { header: 'Forecast Date', key: 'forecast_date', width: 14 },
        { header: 'Horizon (Days)', key: 'horizon_days', width: 15 },
        { header: 'Predicted Qty', key: 'predicted_quantity', width: 14 },
        { header: 'Conf. Lower', key: 'confidence_lower', width: 13 },
        { header: 'Conf. Upper', key: 'confidence_upper', width: 13 },
        { header: 'MAE', key: 'accuracy_mae', width: 10 },
        { header: 'RMSE', key: 'accuracy_rmse', width: 10 },
      ];
      const { rows } = await db.query(
        `SELECT f.*, p.name as product_name, p.sku, w.name as warehouse_name
         FROM forecasts f JOIN products p ON p.id = f.product_id
         LEFT JOIN warehouses w ON w.id = f.warehouse_id
         ORDER BY f.created_at DESC LIMIT 200`
      );
      rows.forEach(row => sheet.addRow(row));
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="forecast_report_${Date.now()}.xlsx"`);
      await workbook.xlsx.write(res);
    } catch (err) { next(err); }
  },
};

module.exports = reportController;
