# src/Face_Detection/routes.py
import os
from flask import Blueprint, render_template, jsonify, request
import threading
from .face_detection import process_celebrity_folder, process_all_folders, get_face_detection_progress
from .feature_extraction import extract_features_for_all_celebrities, get_feature_extraction_progress
from .label_map import create_label_map
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

face_detection_bp = Blueprint('face_detection', __name__, template_folder='templates', static_folder='static')

@face_detection_bp.route('/')
def face_detection():
    return render_template('face_detection.html')

@face_detection_bp.route('/get_celebrity_folders')
def get_celebrity_folders():
    raw_dataset_path = os.path.join(os.path.dirname(__file__), '../../Raw_DataSet')
    celebrities = [f for f in os.listdir(raw_dataset_path) if not f.startswith('.')]  # Exclude hidden files
    return jsonify({'folders': celebrities})

@face_detection_bp.route('/check_processed')
def check_processed():
    celebrity = request.args.get('celebrity')
    processed_path = os.path.join(os.path.dirname(__file__), '../../Processed_Images', celebrity)
    processed = os.path.exists(processed_path) and len(os.listdir(processed_path)) > 0
    return jsonify({'processed': processed})

@face_detection_bp.route('/start_face_detection', methods=['POST'])
def start_face_detection():
    celebrity_name = request.json['celebrity_name']
    reprocess = request.json.get('reprocess', False)
    print(f"Starting face detection for {celebrity_name}, reprocess={reprocess}")

    # Start the face detection in a separate thread
    threading.Thread(target=process_celebrity_folder, args=(celebrity_name, reprocess)).start()
    
    return jsonify({'status': 'started'})

@face_detection_bp.route('/start_face_detection_all', methods=['POST'])
def start_face_detection_all():
    print("Starting face detection for all celebrities")
    threading.Thread(target=process_all_folders).start()
    return jsonify({'status': 'started'})

@face_detection_bp.route('/progress_data')
def progress_data_route():
    return jsonify(get_face_detection_progress())

@face_detection_bp.route('/feature_extraction')
def feature_extraction():
    logging.info("Rendering feature_extraction.html")
    return render_template('feature_extraction.html')

@face_detection_bp.route('/start_feature_extraction', methods=['POST'])
def start_feature_extraction():
    logging.info("Received request to start feature extraction")
    threading.Thread(target=extract_features_for_all_celebrities).start()
    return jsonify({'status': 'started'})

@face_detection_bp.route('/feature_extraction_progress', methods=['GET'])
def feature_extraction_progress():
    logging.info("Received request for feature extraction progress")
    return jsonify(get_feature_extraction_progress())

@face_detection_bp.route('/create_label_map', methods=['POST'])
def create_label_map_route():
    logging.info("Received request to create label map")
    create_label_map()
    return jsonify({'status': 'Label map created'})