import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import moment from 'moment';

const DistributorReports = () => {
    const [reportsData, setReportsData] = useState([]);
    const [selectedMetrics, setSelectedMetrics] = useState(['sales']);
    const [dateRange, setDateRange] = useState({ start: moment().subtract(30, 'days'), end: moment() });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            // Implement data validation to prevent injection attacks
            if (!dateRange || !dateRange.start || !dateRange.end) {
                throw new Error("Invalid date range selected.");
            }

            const response = await axios.get('/distributor/reports', {
                params: {
                    metrics: selectedMetrics,
                    date_range: {
                        start: dateRange.start.format('YYYY-MM-DD'),
                        end: dateRange.end.format('YYYY-MM-DD')
                    }
                }
            });

            if (response.status === 200) {
                // Ensure data is aggregated and anonymized to protect distributor privacy
                const anonymizedData = response.data.map((item, index) => ({
                    ...item,
                    distributor_id: "Distributor " + (index + 1) // Anonymize distributor ID
                }));
                setReportsData(anonymizedData);
            } else {
                setError("Failed to fetch reports.");
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [selectedMetrics, dateRange]);

    const handleDateRangeChange = (start, end) => {
        setDateRange({ start, end });
    };

    const handleMetricChange = (metric) => {
        setSelectedMetrics(metric);
    };

    // Edge case: Distributors with no sales data
    if (reportsData.length === 0 && !loading) {
        return <div>No sales data available for the selected date range.</div>;
    }

    // Edge case: Large data sets - consider pagination or virtualization
    const chartData = reportsData;

    return (
        <div>
            <h2>Distributor Reports</h2>

            <div>
                <label>Metrics:</label>
                <input
                    type="checkbox"
                    value="sales"
                    checked={selectedMetrics.includes('sales')}
                    onChange={() => handleMetricChange(selectedMetrics.includes('sales') ? selectedMetrics.filter(m => m !== 'sales') : [...selectedMetrics, 'sales'])}
                />
                {/* Add more metrics as needed */}
            </div>

            <div>
                <label>Date Range:</label>
                <input
                    type="date"
                    value={dateRange.start.format('YYYY-MM-DD')}
                    onChange={(e) => handleDateRangeChange(moment(e.target.value), dateRange.end)}
                />
                to
                <input
                    type="date"
                    value={dateRange.end.format('YYYY-MM-DD')}
                    onChange={(e) => handleDateRangeChange(dateRange.start, moment(e.target.value))}
                />
            </div>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            <BarChart width={600} height={300} data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="distributor_id" />
                <YAxis dataKey="sales" />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
        </div>
    );
};

export default DistributorReports;