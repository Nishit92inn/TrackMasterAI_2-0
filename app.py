from flask import Flask, request, jsonify, render_template
import threading
from src.image_scraper.routes import image_scraper_bp
from src.image_scraper.image_scraper import scrape_images, get_scraping_progress, rebuild_metadata
from src.Face_Detection.routes import face_detection_bp
from src.Model_Training import model_training_bp
from src.Model_Testing.routes import model_testing_bp

app = Flask(__name__)
app.register_blueprint(image_scraper_bp, url_prefix='/image_scraper')
app.register_blueprint(face_detection_bp, url_prefix='/face_detection')
app.register_blueprint(model_training_bp, url_prefix='/model_training')
app.register_blueprint(model_testing_bp, url_prefix='/model_testing')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/start_scraping', methods=['POST'])
def start_scraping():
    global scraping_progress
    scraping_progress = 0

    data = request.form
    celebrity_name = data.get('celebrity_name')
    num_images = int(data.get('num_images'))

    print(f"Starting to scrape images for {celebrity_name} with {num_images} images")

    # Start scraping in a new thread to avoid blocking the main thread
    threading.Thread(target=scrape_images, args=(celebrity_name, num_images)).start()
    
    return jsonify({'status': 'started'})

@app.route('/progress_data', methods=['GET'])
def progress_data():
    return jsonify({'progress': get_scraping_progress()})

@app.route('/image_scraper/rebuild_metadata', methods=['POST'])
def rebuild_metadata_route():
    rebuild_metadata()
    return jsonify({'message': 'Metadata rebuilt successfully'})

if __name__ == '__main__':
    app.run(debug=False)