import React, { useState, useEffect } from 'react';
import { fetchAffiliatePerformance } from '../api/affiliateReporting';

const AffiliatePerformanceReport = () => {
  const [reportData, setReportData] = useState({
    revenue: 0,
    totalSales: 0,
    inventoryTurnover: 0,
    topSellingProduct: 'N/A',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const response = await fetchAffiliatePerformance();

        if (response && response.status === 200 && response.body) {
          setReportData({
            revenue: response.body.revenue || 0,
            totalSales: response.body.totalSales || 0,
            inventoryTurnover: response.body.inventoryTurnover || 0,
            topSellingProduct: response.body.topSellingProduct || 'N/A',
          });
        } else {
          // Handle cases where the response is invalid or missing data
          setReportData({
            revenue: 0,
            totalSales: 0,
            inventoryTurnover: 0,
            topSellingProduct: 'N/A',
          });
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  if (loading) {
    return <div>Loading performance report...</div>;
  }

  if (error) {
    return <div>Error loading report: {error.message}</div>;
  }

  return (
    <div>
      <h2>Affiliate Performance Report</h2>
      {reportData.revenue === 0 && reportData.totalSales === 0 && reportData.inventoryTurnover === 0 && reportData.topSellingProduct === 'N/A' ? (
        <p>No data available for the selected period.</p>
      ) : (
        <>
          <p><strong>Revenue:</strong> ${reportData.revenue.toFixed(2)}</p>
          <p><strong>Total Sales:</strong> {reportData.totalSales}</p>
          <p><strong>Inventory Turnover:</strong> {reportData.inventoryTurnover.toFixed(2)}</p>
          <p><strong>Top Selling Product:</strong> {reportData.topSellingProduct}</p>
        </>
      )}
    </div>
  );
};

export default AffiliatePerformanceReport;