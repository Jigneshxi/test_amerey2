from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import pandas as pd
# Assuming MOD-026 provides data access and aggregation functions
from src.backend.distributor_reporting import reports
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@app.route('/distributor/reports', methods=['GET'])
def get_distributor_reports():
    """
    API endpoint to retrieve distributor reports.
    Handles request validation, data retrieval, and error handling.
    """
    try:
        args = request.args
        metrics = request.args.getlist('metrics')
        date_range_str = request.args.get('date_range')

        # Validate request parameters
        if not metrics or not date_range_str:
            return jsonify({'error': 'Invalid request. Metrics and date_range are required.'}), 400

        # Parse date range
        try:
            start_date_str, end_date_str = date_range_str.split(',')
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date range format. Use YYYY-MM-DD,YYYY-MM-DD'}), 400
        
        if start_date > end_date:
            return jsonify({'error': 'Start date must be before end date.'}), 400

        # Data validation to prevent injection attacks (basic example)
        if any(',' in metric for metric in metrics):
             return jsonify({'error': 'Invalid metric name. Commas are not allowed.'}), 400
        
        # Fetch and process data using the reports module
        try:
            report_data = reports.generate_distributor_report(metrics, start_date, end_date)
        except Exception as e:
            logging.error(f"Error generating report: {e}")
            return jsonify({'error': 'Failed to generate report. Please check server logs.'}), 500
        

        # Ensure data is aggregated and anonymized
        # (Implementation depends on the specifics of the data and privacy requirements)
        # This is a placeholder for actual anonymization logic
        anonymized_report_data = reports.anonymize_data(report_data) 

        return jsonify(anonymized_report_data), 200

    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        return jsonify({'error': 'An internal server error occurred.'}), 500

if __name__ == '__main__':
    app.run(debug=True)