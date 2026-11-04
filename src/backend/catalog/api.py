from flask import Flask, request, jsonify
from flask import current_app

app = Flask(__name__)

# Placeholder for product data (in a real application, this would be a database)
products = {}
product_id_counter = 1

@app.route('/products', methods=['GET'])
def get_products():
    """
    Retrieves a list of all products.
    """
    # In a real application, you would perform authorization checks here.
    # For example, verify the user's role or permissions.
    # if not authorized_to_view_products():
    #     return jsonify({'message': 'Unauthorized'}), 401

    product_list = list(products.values())
    return jsonify(product_list), 200

@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """
    Updates an existing product.
    """
    # Input validation
    if not request.json:
        return jsonify({'message': 'Invalid request. JSON data is missing.'}), 400

    name = request.json.get('name')
    description = request.json.get('description')

    if not name or not isinstance(name, str):
        return jsonify({'message': 'Product name is required and must be a string.'}), 400

    if not description or not isinstance(description, str):
        return jsonify({'message': 'Product description is required and must be a string.'}), 400
    
    # Authorization check
    # In a real application, you would perform authorization checks here.
    # For example, verify the user's role or permissions.
    # if not authorized_to_edit_product(product_id):
    #     return jsonify({'message': 'Unauthorized'}), 401

    # Check if product exists
    if product_id not in products:
        return jsonify({'message': 'Product not found.'}), 404

    # Update product details
    products[product_id]['name'] = name
    products[product_id]['description'] = description

    return jsonify(products[product_id]), 200

if __name__ == '__main__':
    app.run(debug=True)