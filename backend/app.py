from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image, ImageOps
import io

app = Flask(__name__)
CORS(app)

print("Loading model...")
model = tf.keras.models.load_model("emotion_model.h5")
print("Model loaded!")

EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

@app.route("/predict-emotion", methods=["POST"])
def predict_emotion():
    try:
        file = request.files.get("image")
        img_bytes = file.read()

        img = Image.open(io.BytesIO(img_bytes)).convert("L")
        img = ImageOps.equalize(img)
        img = img.resize((64, 64))

        img_array = np.array(img) / 255.0
        img_array = img_array.reshape(1, 64, 64, 1)

        predictions = model.predict(img_array)[0]

        idx = int(np.argmax(predictions))
        emotion = EMOTIONS[idx]

        return jsonify({
            "emotion": emotion,
            "confidence": float(np.max(predictions))
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def home():
    return "Flask backend running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
