# app.py - Flask backend for grievance management
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage (replace with actual database in production)
grievances = []
grievance_counter = 1

# Load existing data if file exists
DATA_FILE = 'grievances.json'
if os.path.exists(DATA_FILE):
    try:
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
            grievances = data.get('grievances', [])
            grievance_counter = data.get('counter', 1)
    except Exception as e:
        print(f"Error loading data: {e}")

def save_data():
    """Save data to file"""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump({
                'grievances': grievances,
                'counter': grievance_counter
            }, f, indent=2, default=str)
    except Exception as e:
        print(f"Error saving data: {e}")

@app.route('/')
def home():
    return jsonify({
        "message": "Consumer Grievance API Server",
        "version": "1.0.0",
        "endpoints": {
            "save_grievance": "POST /save_grievance",
            "get_latest_grievance": "GET /api/get-latest-grievance",
            "get_grievance": "GET /get_grievance/<user_id>",
            "update_status": "POST /api/update-grievance-status",
            "list_grievances": "GET /api/grievances"
        }
    })

@app.route('/save_grievance', methods=['POST'])
def save_grievance():
    """Save a new grievance"""
    try:
        global grievance_counter
        data = request.json
        
        grievance = {
            'id': f"GRV_{grievance_counter:04d}",
            '_id': f"GRV_{grievance_counter:04d}",
            'user_id': data.get('user_id', 'UNKNOWN'),
            'state': data.get('state'),
            'city': data.get('city'),
            'sector': data.get('sector'),
            'category': data.get('category'),
            'company': data.get('company'),
            'grievance': data.get('grievance'),
            'productValue': data.get('productValue'),
            'dealerInfo': data.get('dealerInfo'),
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        grievances.append(grievance)
        grievance_counter += 1
        save_data()
        
        return jsonify({
            'status': 'success',
            'message': 'Grievance saved successfully',
            'grievance_id': grievance['id']
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error saving grievance: {str(e)}'
        }), 500

@app.route('/api/get-latest-grievance', methods=['GET'])
def get_latest_grievance():
    """Get the latest pending grievance"""
    try:
        # Find the latest pending grievance
        pending_grievances = [g for g in grievances if g.get('status') == 'pending']
        
        if not pending_grievances:
            return jsonify({
                'status': 'error',
                'message': 'No pending grievances found'
            }), 404
        
        # Sort by created_at and get the latest
        latest_grievance = max(pending_grievances, key=lambda x: x.get('created_at', ''))
        
        return jsonify({
            'status': 'success',
            'data': latest_grievance
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error fetching grievance: {str(e)}'
        }), 500

@app.route('/get_grievance/<user_id>', methods=['GET'])
def get_grievance(user_id):
    """Get grievance by user ID (legacy endpoint)"""
    try:
        # Find the latest grievance for this user
        user_grievances = [g for g in grievances if g.get('user_id') == user_id and g.get('status') == 'pending']
        
        if not user_grievances:
            return jsonify({})
        
        # Return the latest grievance
        latest_grievance = max(user_grievances, key=lambda x: x.get('created_at', ''))
        
        # Return in legacy format
        return jsonify({
            'state': latest_grievance.get('state'),
            'city': latest_grievance.get('city'),
            'sector': latest_grievance.get('sector'),
            'category': latest_grievance.get('category'),
            'company': latest_grievance.get('company'),
            'grievance': latest_grievance.get('grievance'),
            'productValue': latest_grievance.get('productValue'),
            'dealerInfo': latest_grievance.get('dealerInfo')
        })
        
    except Exception as e:
        return jsonify({}), 500

@app.route('/api/update-grievance-status', methods=['POST'])
def update_grievance_status():
    """Update grievance status"""
    try:
        data = request.json
        grievance_id = data.get('grievance_id')
        new_status = data.get('status')
        submission_data = data.get('submission_data', {})
        
        # Find and update the grievance
        for grievance in grievances:
            if grievance.get('id') == grievance_id or grievance.get('_id') == grievance_id:
                grievance['status'] = new_status
                grievance['updated_at'] = datetime.now().isoformat()
                grievance['submission_data'] = submission_data
                break
        else:
            return jsonify({
                'status': 'error',
                'message': 'Grievance not found'
            }), 404
        
        save_data()
        
        return jsonify({
            'status': 'success',
            'message': 'Grievance status updated'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error updating status: {str(e)}'
        }), 500

@app.route('/api/grievances', methods=['GET'])
def list_grievances():
    """List all grievances with optional filtering"""
    try:
        status_filter = request.args.get('status')
        user_filter = request.args.get('user_id')
        
        filtered_grievances = grievances.copy()
        
        if status_filter:
            filtered_grievances = [g for g in filtered_grievances if g.get('status') == status_filter]
        
        if user_filter:
            filtered_grievances = [g for g in filtered_grievances if g.get('user_id') == user_filter]
        
        # Sort by created_at descending
        filtered_grievances.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return jsonify({
            'status': 'success',
            'count': len(filtered_grievances),
            'grievances': filtered_grievances
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error listing grievances: {str(e)}'
        }), 500

@app.route('/api/test-data', methods=['POST'])
def create_test_data():
    """Create test grievance data"""
    try:
        global grievance_counter
        
        test_grievances = [
            {
                'id': f"GRV_{grievance_counter:04d}",
                '_id': f"GRV_{grievance_counter:04d}",
                'user_id': 'USER123',
                'state': 'Karnataka',
                'city': 'Bangalore',
                'sector': 'E-Commerce',
                'category': 'Defective Product',
                'company': 'ABC Electronics',
                'grievance': 'Product received was damaged and company is not responding to refund requests. The smartphone I ordered had a cracked screen and the seller is avoiding my calls.',
                'productValue': '10000-25000',
                'dealerInfo': 'XYZ Electronics Store, MG Road, Bangalore - 560001. Contact: 9876543210',
                'status': 'pending',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
        ]
        
        for grievance in test_grievances:
            grievances.append(grievance)
            grievance_counter += 1
        
        save_data()
        
        return jsonify({
            'status': 'success',
            'message': f'Created {len(test_grievances)} test grievances'
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error creating test data: {str(e)}'
        }), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'total_grievances': len(grievances),
        'pending_grievances': len([g for g in grievances if g.get('status') == 'pending'])
    })

if __name__ == '__main__':
    print("Starting Consumer Grievance API Server...")
    print("Available endpoints:")
    print("  - GET  /                           - API info")
    print("  - POST /save_grievance             - Save new grievance")
    print("  - GET  /api/get-latest-grievance   - Get latest pending grievance")
    print("  - GET  /get_grievance/<user_id>    - Get grievance by user ID")
    print("  - POST /api/update-grievance-status - Update grievance status")
    print("  - GET  /api/grievances             - List all grievances")
    print("  - POST /api/test-data              - Create test data")
    print("  - GET  /health                     - Health check")
    print("\nStarting server on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)