"""
Flask API Backend for GCC Extractor Frontend
Provides REST API endpoints to control and monitor the extraction process
"""

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import threading
import os
import json
import sqlite3
from datetime import datetime
from pathlib import Path
import pandas as pd

app = Flask(__name__)
CORS(app)

# Global state management
extraction_state = {
    'is_running': False,
    'session_id': None,
    'current_field': None,
    'current_batch': None,
    'total_batches': None,
    'successful_extractions': 0,
    'failed_extractions': 0,
    'progress_percentage': 0,
    'companies_processed': 0,
    'companies_remaining': 0,
    'current_companies': []
}

extraction_thread = None
extractor_instance = None

# Configuration
config = {
    'input_file': 'solutions.xlsx',
    'output_file': 'solutions.xlsx',
    'template_file': 'template.xlsx',
    'batch_size': 3,
    'max_retries': 3,
    'response_timeout': 120
}

def update_extraction_state(updates):
    """Update the global extraction state"""
    global extraction_state
    extraction_state.update(updates)

def run_extraction():
    """Run the extraction process in a separate thread"""
    global extraction_state, extractor_instance
    
    try:
        from gcc_copilot import FinalPerfectGCCExtractor
        
        extractor = FinalPerfectGCCExtractor(
            input_file=config['input_file'],
            output_file=config['output_file'],
            template_file=config['template_file']
        )
        
        extractor_instance = extractor
        
        # Update configuration
        extractor.batch_size = config['batch_size']
        extractor.max_retries = config['max_retries']
        extractor.response_timeout = config['response_timeout']
        
        update_extraction_state({
            'is_running': True,
            'session_id': extractor.session_id
        })
        
        # Run extraction
        extractor.run_final_perfect_gcc_extraction()
        
    except Exception as e:
        print(f"Extraction error: {str(e)}")
    finally:
        update_extraction_state({
            'is_running': False
        })

@app.route('/start', methods=['POST'])
def start_extraction():
    """Start the extraction process"""
    global extraction_thread
    
    if extraction_state['is_running']:
        return jsonify({'error': 'Extraction already running'}), 400
    
    # Update config if provided (handle both JSON and empty requests)
    try:
        if request.is_json and request.json:
            config.update(request.json)
    except Exception:
        # If JSON parsing fails, continue with default config
        pass
    
    extraction_thread = threading.Thread(target=run_extraction, daemon=True)
    extraction_thread.start()
    
    return jsonify({
        'message': 'Extraction started',
        'session_id': extraction_state.get('session_id')
    })

@app.route('/stop', methods=['POST'])
def stop_extraction():
    """Stop the extraction process"""
    global extractor_instance
    
    if not extraction_state['is_running']:
        return jsonify({'error': 'No extraction running'}), 400
    
    if extractor_instance:
        extractor_instance.shutdown_event.set()
    
    update_extraction_state({'is_running': False})
    
    return jsonify({'message': 'Extraction stopped'})

@app.route('/status', methods=['GET'])
def get_status():
    """Get current extraction status"""
    return jsonify(extraction_state)

@app.route('/data', methods=['GET'])
def get_data():
    """Get extracted data"""
    try:
        if not os.path.exists(config['output_file']):
            return jsonify([])
        
        df = pd.read_excel(config['output_file'], engine='openpyxl')
        
        # Convert to list of dictionaries
        data = []
        for _, row in df.iterrows():
            company_data = {
                'company_name': str(row.iloc[1]) if pd.notna(row.iloc[1]) else '',
                'industries': str(row.iloc[2]) if pd.notna(row.iloc[2]) else 'NA',
                'revenue': str(row.iloc[3]) if pd.notna(row.iloc[3]) else 'NA',
                'gbs': str(row.iloc[4]) if pd.notna(row.iloc[4]) else 'NA',
                'global_gcc_units': str(row.iloc[5]) if pd.notna(row.iloc[5]) else 'NA',
                'global_gcc_locations': str(row.iloc[6]) if pd.notna(row.iloc[6]) else 'NA',
                'global_gcc_headcount': str(row.iloc[7]) if pd.notna(row.iloc[7]) else 'NA',
                'india_gcc_units': str(row.iloc[8]) if pd.notna(row.iloc[8]) else 'NA',
                'gcc_locations_india': str(row.iloc[9]) if pd.notna(row.iloc[9]) else 'NA',
            }
            if company_data['company_name']:
                data.append(company_data)
        
        return jsonify(data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/logs', methods=['GET'])
def get_logs():
    """Get recent logs"""
    try:
        limit = request.args.get('limit', 100, type=int)
        
        # Find the latest log file
        logs_dir = Path('storage/logs')
        if not logs_dir.exists():
            return jsonify([])
        
        log_files = list(logs_dir.glob('*.log'))
        if not log_files:
            return jsonify([])
        
        latest_log = max(log_files, key=lambda p: p.stat().st_mtime)
        
        logs = []
        with open(latest_log, 'r', encoding='utf-8') as f:
            lines = f.readlines()[-limit:]
            for line in lines:
                parts = line.strip().split(' - ', 2)
                if len(parts) == 3:
                    logs.append({
                        'timestamp': parts[0],
                        'level': parts[1],
                        'message': parts[2]
                    })
        
        return jsonify(logs)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/config', methods=['GET', 'POST'])
def handle_config():
    """Get or update configuration"""
    global config
    
    if request.method == 'GET':
        return jsonify(config)
    
    if request.method == 'POST':
        if extraction_state['is_running']:
            return jsonify({'error': 'Cannot update config while extraction is running'}), 400
        
        config.update(request.json)
        return jsonify({'message': 'Configuration updated', 'config': config})

@app.route('/download', methods=['GET'])
def download_results():
    """Download results file"""
    try:
        if not os.path.exists(config['output_file']):
            return jsonify({'error': 'No results file available'}), 404
        
        return send_file(
            config['output_file'],
            as_attachment=True,
            download_name='gcc_results.xlsx'
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload template or input file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        file_type = request.form.get('type', 'input')
        
        if file_type == 'template':
            file.save(config['template_file'])
        else:
            file.save(config['input_file'])
        
        return jsonify({'message': f'{file_type} file uploaded successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/field-progress', methods=['GET'])
def get_field_progress():
    """Get progress for each field"""
    try:
        # This would query the database for field-specific progress
        # For now, return a simple structure
        return jsonify({
            'fields': [
                {'name': 'industries', 'completed': 50, 'total': 100},
                {'name': 'revenue', 'completed': 45, 'total': 100},
                {'name': 'gbs', 'completed': 48, 'total': 100},
            ]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

# RAG Chat Endpoints - Using FAISS (lightweight) instead of ChromaDB
try:
    from rag_engine_faiss import get_rag_engine, is_rag_available
    RAG_ENABLED = is_rag_available()
    print("Using FAISS-based RAG engine (lightweight, memory-efficient)")
except ImportError:
    RAG_ENABLED = False
    print("Warning: RAG functionality not available. Install requirements: pip install langchain langchain-community ollama faiss-cpu sentence-transformers")

rag_engine = None

def get_or_create_rag():
    """Get or create RAG engine"""
    global rag_engine
    if not RAG_ENABLED:
        return None
    if rag_engine is None:
        try:
            rag_engine = get_rag_engine()
        except Exception as e:
            print(f"Error initializing RAG: {e}")
            return None
    return rag_engine

@app.route('/chat/ask', methods=['POST'])
def chat_ask():
    """Ask a question to the RAG chatbot"""
    if not RAG_ENABLED:
        return jsonify({
            'error': 'RAG functionality not available. Please install required packages: pip install langchain langchain-community ollama chromadb sentence-transformers'
        }), 503
    
    try:
        data = request.json
        question = data.get('question', '')
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        rag = get_or_create_rag()
        if not rag:
            return jsonify({'error': 'RAG engine not initialized'}), 500
        
        result = rag.ask(question)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e), 'answer': 'An error occurred processing your question.'}), 500

@app.route('/chat/company/<company_name>', methods=['GET'])
def chat_company_summary(company_name):
    """Get AI summary for a specific company"""
    if not RAG_ENABLED:
        return jsonify({
            'error': 'RAG functionality not available'
        }), 503
    
    try:
        rag = get_or_create_rag()
        if not rag:
            return jsonify({'error': 'RAG engine not initialized'}), 500
        
        result = rag.get_company_summary(company_name)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/compare', methods=['POST'])
def chat_compare():
    """Compare multiple companies"""
    if not RAG_ENABLED:
        return jsonify({
            'error': 'RAG functionality not available'
        }), 503
    
    try:
        data = request.json
        companies = data.get('companies', [])
        
        if not companies or len(companies) < 2:
            return jsonify({'error': 'At least 2 companies required'}), 400
        
        rag = get_or_create_rag()
        if not rag:
            return jsonify({'error': 'RAG engine not initialized'}), 500
        
        result = rag.compare_companies(companies)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/refresh', methods=['POST'])
def chat_refresh():
    """Refresh the RAG index with latest data"""
    if not RAG_ENABLED:
        return jsonify({
            'error': 'RAG functionality not available'
        }), 503
    
    try:
        rag = get_or_create_rag()
        if not rag:
            return jsonify({'error': 'RAG engine not initialized'}), 500
        
        result = rag.refresh_index()
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat/suggestions', methods=['GET'])
def chat_suggestions():
    """Get suggested questions"""
    suggestions = [
        "Which companies have GCC operations in Bangalore?",
        "Compare the GCC headcount of top 3 technology companies",
        "List all companies with R&D functions in their GCCs",
        "What is the average revenue of companies with GBS?",
        "Which companies have the most global GCC locations?",
        "Show me companies in the healthcare industry with India operations",
        "What functions are most common in Indian GCCs?",
        "Which cities are most popular for GCC locations?",
        "Tell me about companies with more than 5000 employees in India",
        "Which companies have GCC presence in both Bangalore and Hyderabad?"
    ]
    return jsonify({'suggestions': suggestions})

@app.route('/chat/status', methods=['GET'])
def chat_status():
    """Get RAG system status"""
    return jsonify({
        'enabled': RAG_ENABLED,
        'initialized': rag_engine is not None,
        'message': 'RAG system ready' if RAG_ENABLED and rag_engine else 'RAG system not available'
    })

if __name__ == '__main__':
    print("=" * 80)
    print("GCC Extractor API Server")
    print("=" * 80)
    print("Starting Flask server on http://localhost:5000")
    print("Frontend should be running on http://localhost:3000")
    print(f"RAG Chat: {'Enabled' if RAG_ENABLED else 'Disabled (install dependencies)'}")
    print("=" * 80)
    # Disable reloader to prevent interruptions during RAG initialization
    app.run(debug=True, port=5000, host='0.0.0.0', use_reloader=False)

