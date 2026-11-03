from flask import Flask, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.backend.distributor_contract.models import Contract
import os
import uuid

app = Flask(__name__)

# Configure JWT (replace with your actual secret key)
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Replace this!
from flask_jwt_extended import JWTManager
jwt = JWTManager(app)

# Mock database (replace with actual database interaction)
contracts = {}

@app.route('/distributor/contracts', methods=['GET'])
@jwt_required
def get_contracts():
    """
    Retrieves a list of all contracts.
    """
    user_id = get_jwt_identity()

    # Authorization check: Ensure user is authorized to view contracts
    # In a real application, this would involve checking user roles or permissions
    # For now, we assume all authenticated users can view all contracts
    
    contract_list = []
    for contract_id, contract in contracts.items():
        contract_list.append(contract)

    return jsonify(contract_list), 200

@app.route('/distributor/contracts/<string:contractId>', methods=['GET'])
@jwt_required
def get_contract(contractId):
    """
    Retrieves details for a specific contract.
    """
    user_id = get_jwt_identity()

    # Authorization check: Ensure user is authorized to view this contract
    # In a real application, this would involve checking user roles or permissions
    # For now, we assume all authenticated users can view all contracts

    if contractId not in contracts:
        return jsonify({'message': 'Contract not found'}), 404

    contract = contracts[contractId]
    return jsonify(contract), 200

if __name__ == '__main__':
    app.run(debug=True)