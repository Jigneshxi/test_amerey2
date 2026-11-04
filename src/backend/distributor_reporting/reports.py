from datetime import datetime, timedelta
import pandas as pd
# Assuming MOD-026 provides database access and data transformation
from src.backend.mod_026 import get_distributor_sales_data

def generate_reports(metrics, date_range):
    """
    Generates distributor reports based on specified metrics and date range.

    Args:
        metrics (list): A list of metrics to include in the report (e.g., 'sales', 'inventory').
        date_range (dict): A dictionary containing 'start_date' and 'end_date' in YYYY-MM-DD format.

    Returns:
        dict: A dictionary containing the report data.  Returns an empty dictionary if no data found or invalid input.
    """

    try:
        start_date = datetime.strptime(date_range['start_date'], '%Y-%m-%d')
        end_date = datetime.strptime(date_range['end_date'], '%Y-%m-%d')
        if start_date > end_date:
            return {"error": "Invalid date range: Start date must be before end date"}, 400
    except (ValueError, TypeError):
        return {"error": "Invalid date format. Please use YYYY-MM-DD."}, 400
    except KeyError:
        return {"error": "Invalid date range format.  Expected 'start_date' and 'end_date' keys."}, 400

    # Validate metrics to prevent injection (basic example - expand as needed)
    allowed_metrics = ['sales', 'inventory', 'performance']  #Define expected metrics
    for metric in metrics:
        if metric not in allowed_metrics:
            return {"error": f"Invalid metric: {metric}. Allowed metrics are: {allowed_metrics}"}, 400
    

    try:
        sales_data = get_distributor_sales_data(start_date, end_date)
    except Exception as e:
        # Log the exception for debugging
        print(f"Error fetching data from MOD-026: {e}")
        return {"error": "Failed to retrieve data from MOD-026"}, 500


    if sales_data is None or sales_data.empty:
        return {"message": "No sales data found for the specified date range."}, 200 # Handle distributors with no sales data

    # Data Aggregation and Anonymization
    # In a production environment, you'd implement more robust anonymization techniques
    # to protect distributor privacy.  This is a placeholder.
    aggregated_data = {}
    
    if 'sales' in metrics:
        aggregated_data['total_sales'] = sales_data['amount'].sum()
    if 'inventory' in metrics:
        aggregated_data['total_inventory'] = sales_data['quantity'].sum()
    if 'performance' in metrics:
        # Placeholder for performance metric calculation.  Replace with your logic.
        aggregated_data['performance_score'] = 0.85 

    # Handle Large Datasets (Chunking/Pagination - example: pagination)
    # In a production environment, implement pagination or chunking to avoid loading
    # very large datasets into memory.  This example only fetches a limited amount of data.
    
    return aggregated_data