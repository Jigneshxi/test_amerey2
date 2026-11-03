const jwt = require('jsonwebtoken');
const { getOrders } = require('../../data/order_service'); // Assuming MOD-024 is the order service

const SALES_REPORT_SECRET = process.env.SALES_REPORT_SECRET || 'default_secret';

async function generateSalesReport(startDate, endDate) {
  // Validate date range
  if (!isValidDateRange(startDate, endDate)) {
    return {
      status: 400,
      error: 'invalid date range'
    };
  }

  try {
    // Fetch orders within the date range from MOD-024
    const orders = await getOrders(startDate, endDate);

    // Calculate total sales
    const totalSales = calculateTotalSales(orders);

    return {
      status: 200,
      body: {
        orders: orders,
        total_sales: totalSales
      }
    };
  } catch (error) {
    console.error('Error generating sales report:', error);
    return {
      status: 500,
      error: 'Internal server error'
    };
  }
}

function isValidDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return start <= end;
}

function calculateTotalSales(orders) {
  return orders.reduce((total, order) => total + (order.price * order.quantity), 0);
}

async function salesReportHandler(req, res) {
  const { start_date, end_date } = req.query;

  // JWT Validation
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send('Unauthorized: No token provided');
  }

  try {
    jwt.verify(token, SALES_REPORT_SECRET);
  } catch (err) {
    return res.status(401).send('Unauthorized: Invalid token');
  }

  const report = await generateSalesReport(start_date, end_date);

  if (report.status !== 200) {
    return res.status(report.status).json({ error: report.error });
  }

  res.status(200).json(report.body);
}

module.exports = {
  salesReportHandler
};