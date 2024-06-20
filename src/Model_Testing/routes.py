import os
import json
import logging
import numpy as np
import tensorflow as tf
from flask import Blueprint, request, jsonify, render_template
from werkzeug.utils import secure_filename
from tensorflow.keras.preprocessing import image as keras_image
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.models import Model
from tensorflow.keras.applications import ResNet50

# Setup logging
logging.basicConfig(level=logging.INFO)

model_testing_bp = Blueprint('model_testing', __name__, template_folder='templates', static_folder='static')

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../../Trained_Models')
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../../Uploaded_Images')
LABEL_MAP_PATH = os.path.join(os.path.dirname(__file__), '../../Label_Maps/label_map.json')

# Load label map
if os.path.exists(LABEL_MAP_PATH) and os.path.getsize(LABEL_MAP_PATH) > 0:
    with open(LABEL_MAP_PATH, 'r') as f:
        label_map = json.load(f)
else:
    label_map = {}

# Function to create the ResNet50 feature extractor model
def create_feature_extractor():
    base_model = ResNet50(weights='imagenet')
    model = Model(inputs=base_model.input, outputs=base_model.get_layer('avg_pool').output)
    return model

# Load feature extractor model
feature_extractor = create_feature_extractor()

@model_testing_bp.route('/test_model')
def test_model_page():
    return render_template('test_model.html')

@model_testing_bp.route('/get_models', methods=['GET'])
def get_models():
    models = [f for f in os.listdir(MODEL_PATH) if f.endswith('.h5')]
    return jsonify({'models': models})

@model_testing_bp.route('/upload_image', methods=['POST'])
def upload_image():
    try:
        if 'model' not in request.form or 'image' not in request.files:
            return jsonify({'error': 'Model and image are required fields'}), 400
        
        # Get the selected model
        model_name = request.form['model']
        model_path = os.path.join(MODEL_PATH, model_name)
        
        # Load the model
        model = tf.keras.models.load_model(model_path)
        
        # Save the uploaded image
        file = request.files['image']
        filename = secure_filename(file.filename)
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        logging.info(f"Image uploaded and saved at {file_path}")
        
        # Load and preprocess the image
        img = keras_image.load_img(file_path, target_size=(224, 224))
        img_array = keras_image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        
        # Extract features from the image
        features = feature_extractor.predict(img_array)
        
        # Make prediction using the loaded model
        prediction = model.predict(features)
        predicted_label = np.argmax(prediction, axis=1)[0]
        
        # Map the predicted label to the celebrity name
        celebrity_name = label_map.get(str(predicted_label), "Unknown")
        
        return jsonify({'label': celebrity_name})
    except Exception as e:
        logging.error(f"An error occurred during image upload and prediction: {e}")
        return jsonify({'error': str(e)}), 500