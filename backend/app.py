from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image, ImageOps
import io
import os
import base64
import uuid
from datetime import datetime
import requests
from pymongo import MongoClient

import uuid

app = Flask(__name__, static_folder="static")

# Enable full CORS support
CORS(app, resources={
    r"/*": {
        "origins": ["*", "http://localhost:5173", "https://*.ngrok-free.dev"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Also ensure every response includes Access-Control headers
@app.after_request
def add_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


# -------------------------
# MONGODB CONNECTION
# -------------------------
MONGO_URI = "mongodb+srv://kishorcheduri2_db_user:L3ZdEw7pkT7MiGLo@cluster1.pdmfku1.mongodb.net/musicgen?retryWrites=true&w=majority&appName=Cluster1"

try:
    client = MongoClient(MONGO_URI, tls=True)
    db = client["musicgen"]
    tracks_collection = db["tracks"]
    print("MongoDB Connected Successfully")
except Exception as e:
    print("MongoDB CONNECTION ERROR:", e)


# -------------------------
# COLAB MUSICGEN GPU API
# -------------------------
COLAB_API = "https://breedable-semisomnolently-abdullah.ngrok-free.dev/generate"


# -------------------------
# FLASK APP INITIALIZATION
# -------------------------




print("Loading Emotion Model...")
model = tf.keras.models.load_model("emotion_model.h5", compile=False)
print("Emotion Model Loaded!")

EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]


# -------------------------
# Mood → Prompt Mapping
# -------------------------
mood_prompts = {
    "Angry": "aggressive electronic music with heavy drums and dark distorted synths",
    "Disgust": "gritty uneasy soundscape with rough textures and dissonant tones",
    "Fear": "dark ambient track with tense drones and slow pulses",
    "Happy": "bright upbeat pop melody with cheerful chords and energetic drums",
    "Sad": "emotional soft piano with gentle strings and a sentimental tone",
    "Surprise": "playful melody with quick transitions and quirky instruments",
    "Neutral": "smooth neutral ambient melody with soft balanced tones"
}


# -------------------------
# EMOTION PREDICTION
# -------------------------
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


# ----------------------------------------------
# CONTACT COLAB → GET MUSIC (BASE64 WAV)
# ----------------------------------------------
def generate_music_from_colab(prompt: str):
    try:
        response = requests.post(COLAB_API, json={"prompt": prompt}, timeout=600)
        data = response.json()

        if "audio_base64" not in data:
            print("Colab Error:", data)
            return None

        return data["audio_base64"]

    except Exception as e:
        print("Error contacting Colab:", e)
        return None


# ----------------------------------------------
# SAVE BASE64 → WAV FILE
# ----------------------------------------------
def save_audio(base64_string):
    out_dir = os.path.join("static", "generated")
    os.makedirs(out_dir, exist_ok=True)

    filename = f"track_{uuid.uuid4().hex}.wav"
    file_path = os.path.join(out_dir, filename)

    with open(file_path, "wb") as f:
        f.write(base64.b64decode(base64_string))

    return filename


# ----------------------------------------------
# GENERATE MUSIC ROUTE
# ----------------------------------------------
COLAB_URL = "https://breedable-semisomnolently-abdullah.ngrok-free.dev/generate"

@app.route("/generate-music", methods=["POST"])
def generate_music_route():
    try:
        data = request.get_json()
        emotion = data.get("emotion")

        if emotion not in mood_prompts:
            return jsonify({"error": "Invalid emotion"}), 400

        prompt = mood_prompts[emotion]

        # Send request to Colab GPU MusicGen
        response = requests.post(
            COLAB_URL,
            json={"prompt": prompt},
            timeout=60
        )

        result = response.json()

        if "audio_base64" not in result:
            return jsonify({"error": "Colab generation failed"}), 500

        audio_base64 = result["audio_base64"]

        # Save WAV file locally
        audio_bytes = base64.b64decode(audio_base64)
        filename = f"track_{uuid.uuid4().hex}.wav"
        save_path = os.path.join("static", "generated", filename)

        with open(save_path, "wb") as f:
            f.write(audio_bytes)

        audio_url = f"/static/generated/{filename}"

        # Save to MongoDB
        tracks_collection.insert_one({
            "emotion": emotion,
            "variation": 0,
            "prompt": prompt,
            "audio_url": audio_url,
            "timestamp": datetime.utcnow().isoformat()
        })

        return jsonify({
            "emotion": emotion,
            "prompt": prompt,
            "audio_url": audio_url
        })

    except Exception as e:
        print("❌ Backend error:", e)
        return jsonify({"error": str(e)}), 500




# ----------------------------------------------
# REGENERATE MUSIC
# ----------------------------------------------
@app.route("/regenerate-music", methods=["POST"])
def regenerate_music():
    try:
        data = request.get_json()
        emotion = data.get("emotion")
        variation = int(data.get("variation", 1))

        if not emotion:
            return jsonify({"error": "Missing emotion"}), 400

        # Improved prompts
        variation_suffix = [
            "",
            " with deeper instruments",
            " with more melody and richness",
            " professionally mixed and enhanced"
        ]

        final_prompt = f"{emotion} music{variation_suffix[min(variation, 3)]}"

        # Send request to Colab for regeneration
        response = requests.post(
            COLAB_API,  # SAME as generate!
            json={"prompt": final_prompt},
            timeout=120
        )

        result = response.json()

        if "audio_base64" not in result:
            return jsonify({"error": "Colab error"}), 500

        # Save regenerated audio
        filename = save_audio(result["audio_base64"])
        audio_url = f"/static/generated/{filename}"

        # Save in DB
        tracks_collection.insert_one({
            "emotion": emotion,
            "variation": variation,
            "audio_url": audio_url,
            "prompt": final_prompt,
            "timestamp": datetime.utcnow().isoformat(),
            "type": "generated"
        })

        return jsonify({
            "emotion": emotion,
            "variation": variation,
            "audio_url": audio_url
        })

    except Exception as e:
        print("Regenerate Error:", e)
        return jsonify({"error": str(e)}), 500






@app.route("/save-liked-track", methods=["POST"])
def save_liked_track():
    try:
        data = request.get_json()
        track = data.get("track")

        if not track:
            return jsonify({"error": "Invalid track data"}), 400

        like_doc = {
            "title": track.get("title"),
            "emotion": track.get("emotion"),
            "audio_url": track.get("audio_url"),
            "timestamp": datetime.utcnow().isoformat(),
            "type": "liked"
        }

        tracks_collection.insert_one(like_doc)

        return jsonify({"status": "saved"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/get-liked-tracks", methods=["GET"])
def get_liked_tracks():
    try:
        tracks = list(tracks_collection.find({"type": "liked"}, {"_id": 0}))
        return jsonify(tracks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------------
# GET TRACKS
# ----------------------------------------------
@app.route("/get-tracks", methods=["GET"])
def get_tracks():
    try:
        # fetch only generated / regenerated (NOT liked)
        tracks = list(tracks_collection.find(
            {"type": {"$ne": "liked"}},
            {"_id": 0}
        ))

        tracks.sort(key=lambda x: x["timestamp"], reverse=True)
        return jsonify(tracks)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/delete-track", methods=["POST"])
def delete_track():
    try:
        data = request.get_json()
        audio_url = data.get("audio_url")

        # FIX: Normalize URL
        if audio_url.startswith("http"):
            audio_url = audio_url.split("/static")[-1]
            audio_url = "/static" + audio_url

        result = tracks_collection.delete_one({"audio_url": audio_url})

        if result.deleted_count == 1:
            return jsonify({"status": "deleted"}), 200
        else:
            return jsonify({"status": "not_found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# HOME
@app.route("/")
def home():
    return "Flask backend running!"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
