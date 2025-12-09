import os
import subprocess
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for React

# Configuration
UPLOAD_FOLDER = 'static/uploads'
CHART_FOLDER = 'static/charts'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CHART_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save file with unique name
    filename = str(uuid.uuid4()) + "_" + file.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Detect file type
    ext = filename.rsplit('.', 1)[1].lower()

    # --- OCR PIPELINE ---
    if ext in ['png', 'jpg', 'jpeg']:
        import pytesseract
        from PIL import Image
        
        # PROACTIVE TESSERACT CONFIG
        # Windows usually needs explicit path. Try common ones.
        tesseract_cmds = [
            r'C:\Program Files\Tesseract-OCR\tesseract.exe',
            r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
            r'D:\Software\Tesseract-OCR\tesseract.exe' # Just in case
        ]
        for cmd in tesseract_cmds:
            if os.path.exists(cmd):
                pytesseract.pytesseract.tesseract_cmd = cmd
                print(f"Found Tesseract at: {cmd}")
                break
        
        try:
            print("Attempting OCR on image...")
            image = Image.open(filepath)
            extracted_text = pytesseract.image_to_string(image)
            
            # Simple validation: Does it look like CSV?
            if ',' in extracted_text or '\t' in extracted_text:
                print("OCR Success. Text detected:")
                print("--- START EXTRACTED TEXT ---")
                print(extracted_text)
                print("--- END EXTRACTED TEXT ---")
                
                # Convert to clean CSV
                # Replace Tesseract's pipes or spaces if necessary, but assume simple CSV for now
                # Save as .csv for the R script
                new_filename = filename + '.csv'
                csv_filepath = os.path.join(UPLOAD_FOLDER, new_filename)
                
                with open(csv_filepath, 'w') as f:
                    f.write(extracted_text)
                
                # Switch pipeline to CSV mode
                filepath = csv_filepath
                ext = 'csv' 
            else:
                print("OCR Warning: No suitable text found.")
                # If no text, maybe fallback? But user wants charts.
                # Let's let it fall through to "Unsupported" or "Image" if we revert ext
                pass
                
        except Exception as e:
            print(f"OCR Failed: {e}")
            if "tesseract is not installed" in str(e).lower() or "file not found" in str(e).lower():
                 return jsonify({
                     "error": "OCR Error: Tesseract is not installed on the server. Please install Tesseract-OCR."
                 }), 500

    if ext == 'csv':
        # --- EXECUTE R SCRIPT ---
        try:
            # Clear old charts (optional, maybe we accept multiple?)
            # for f in os.listdir(CHART_FOLDER):
            #    os.remove(os.path.join(CHART_FOLDER, f))
            
            # Run R script
            print("Running R script...")
            result = subprocess.run(
                ['Rscript', 'analysis.R', filepath], 
                capture_output=True, text=True, check=True
            )
            print(result.stdout)
            
            # Collect generated images
            import time
            timestamp = int(time.time())
            charts = sorted([f for f in os.listdir(CHART_FOLDER) if f.endswith('.png')])
            chart_urls = [f"http://localhost:5000/static/charts/{c}?t={timestamp}" for c in charts]
            
            return jsonify({
                "type": "csv",
                "message": "Analysis Complete (OCR Source)" if filename.endswith(('.png', '.jpg', '.jpeg')) else "Analysis Complete",
                "data": chart_urls
            })
            
        except subprocess.CalledProcessError as e:
            return jsonify({"error": f"R Script Failed or OCR produced bad data: {e.stderr}"}), 500

    elif ext in ['gif']:
        return jsonify({
            "type": "image",
            "url": f"http://localhost:5000/static/uploads/{filename}"
        })

    elif ext in ['mp3', 'wav']:
        return jsonify({
            "type": "audio",
            "url": f"http://localhost:5000/static/uploads/{filename}"
        })

    return jsonify({"error": "Unsupported file type or OCR failed to extract text"}), 400

# Route to serve static files (images/audio)
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)