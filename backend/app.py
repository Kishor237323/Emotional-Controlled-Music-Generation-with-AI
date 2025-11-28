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
import os
os.environ["PATH"] += os.pathsep + r"C:\Users\kisho\Downloads\ffmpeg-8.0.1-essentials_build\ffmpeg-8.0.1-essentials_build\bin"

app = Flask(__name__, static_folder="static")


CORS(app, resources={
    r"/*": {
        "origins": ["*", "http://localhost:5173", "https://*.ngrok-free.dev"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})


@app.after_request
def add_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response



MONGO_URI = "mongodb+srv://kishorcheduri2_db_user:L3ZdEw7pkT7MiGLo@cluster1.pdmfku1.mongodb.net/musicgen?retryWrites=true&w=majority&appName=Cluster1"

try:
    client = MongoClient(MONGO_URI, tls=True)
    db = client["musicgen"]
    tracks_collection = db["tracks"]
    print("MongoDB Connected Successfully")
except Exception as e:
    print("MongoDB CONNECTION ERROR:", e)



COLAB_API = "https://breedable-semisomnolently-abdullah.ngrok-free.dev/generate"




print("Loading Emotion Model...")
model = tf.keras.models.load_model("emotion_model.h5", compile=False)
print("Emotion Model Loaded!")

EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]


mood_prompts = {
    "Angry": "aggressive electronic music with heavy drums and dark distorted synths",
    "Disgust": "gritty uneasy soundscape with rough textures and dissonant tones",
    "Fear": "dark ambient track with tense drones and slow pulses",
    "Happy": "bright upbeat pop melody with cheerful chords and energetic drums",
    "Sad": "emotional soft piano with gentle strings and a sentimental tone",
    "Surprise": "playful melody with quick transitions and quirky instruments",
    "Neutral": "smooth neutral ambient melody with soft balanced tones"
}


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


def save_audio(base64_string):
    out_dir = os.path.join("static", "generated")
    os.makedirs(out_dir, exist_ok=True)

    filename = f"track_{uuid.uuid4().hex}.wav"
    file_path = os.path.join(out_dir, filename)

    with open(file_path, "wb") as f:
        f.write(base64.b64decode(base64_string))

    return filename


COLAB_URL = "https://breedable-semisomnolently-abdullah.ngrok-free.dev/generate"

@app.route("/generate-music", methods=["POST"])
def generate_music_route():
    try:
        data = request.get_json()
        emotion = data.get("emotion")

        if emotion not in mood_prompts:
            return jsonify({"error": "Invalid emotion"}), 400

        prompt = mood_prompts[emotion]

        print("Sending prompt to Colab:", prompt)
        response = requests.post(
            COLAB_URL,
            json={"prompt": prompt},
            timeout=60
        )

        result = response.json()

        if "audio_base64" not in result:
            return jsonify({"error": "Colab generation failed"}), 500

        audio_base64 = result["audio_base64"]

     
        audio_bytes = base64.b64decode(audio_base64)
        filename = f"track_{uuid.uuid4().hex}.wav"
        save_path = os.path.join("static", "generated", filename)

        with open(save_path, "wb") as f:
            f.write(audio_bytes)

        audio_url = f"/static/generated/{filename}"

       
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



@app.route("/regenerate-music", methods=["POST"])
def regenerate_music():
    try:
        data = request.get_json()
        emotion = data.get("emotion")
        variation = int(data.get("variation", 1))

        if not emotion:
            return jsonify({"error": "Missing emotion"}), 400
        variation_suffix = [
    "",  
    # Variation 1
    " with deeper atmospheric layers, warm bass, and enriched harmonic textures",

    # Variation 2 
    " with expanded melody, expressive instruments, richer dynamics, and emotional progression",

    # Variation 3 
    " with cinematic depth, wide stereo imaging, detailed instrumentation, and professional studio mixing"
        ]

        prompt = f"{emotion} music{variation_suffix[min(variation, 3)]}"
        print("Sending prompt:", prompt)

        response = requests.post(
            COLAB_API,
            json={"prompt": prompt},
            timeout=120
        )

        
        print("== RAW COLAB RESPONSE ==")
        print("Status:", response.status_code)
        print("Body:", response.text)

       
        if response.status_code != 200:
            return jsonify({"error": "Colab error", "details": response.text}), 500
        
        try:
            result = response.json()
        except:
            return jsonify({"error": "Invalid JSON from Colab", "raw": response.text}), 500

        if "audio_base64" not in result:
            return jsonify({"error": "Missing audio", "raw": result}), 500

        filename = save_audio(result["audio_base64"])
        audio_url = f"/static/generated/{filename}"

        tracks_collection.insert_one({
            "emotion": emotion,
            "variation": variation,
            "prompt": prompt,
            "audio_url": audio_url,
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

@app.route("/get-tracks", methods=["GET"])
def get_tracks():
    try:
        
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


import whisper
import librosa
import numpy as np
import soundfile as sf
import torch

print("Loading Whisper tiny model...")
whisper_model = whisper.load_model("tiny")



def load_audio_16k(path):
    try:
        audio, sr = sf.read(path)
        if sr != 16000:
            audio = librosa.resample(np.array(audio), sr, 16000)
        return audio, 16000
    except Exception:
        audio, sr = librosa.load(path, sr=16000)
        return audio, sr

def detect_text_emotion(text):
    text = text.lower()

    keywords = {
        "happy": [
            "happy", "joy", "excited", "glad", "good", "wonderful", "great",
            "awesome", "fantastic", "feeling positive", "delighted"
        ],
        "sad": [
            "sad", "down", "upset", "unhappy", "depressed", "bad", "tired",
            "hurt", "feeling low", "heartbroken"
        ],
        "angry": [
            "angry", "mad", "furious", "irritated", "annoyed",
            "frustrated", "pissed"
        ],
        "fearful": [
            "scared", "afraid", "nervous", "anxious", "terrified",
            "worried", "tense"
        ],
        "surprise": [
            "wow", "shocked", "surprised", "unexpected", "no way",
            "unbelievable"
        ],
        "disgust": [
            "disgusting", "gross", "nasty", "horrible", "terrible",
            "yuck"
        ],
        "neutral": [
            "okay", "fine", "normal", "neutral", "alright", "nothing",
            "whatever", "just talking"
        ]
    }

    for emotion, words in keywords.items():
        if any(w in text for w in words):
            return emotion

    return "neutral"


@app.route("/predict-voice-emotion", methods=["POST"])
def predict_voice():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]

        upload_path = os.path.join(os.path.dirname(__file__), "temp_audio.wav")
        file.save(upload_path)

        print("Transcribing audio with Whisper...")
        whisper_result = whisper_model.transcribe(upload_path)
        text = whisper_result.get("text", "")

       
        final_emotion = detect_text_emotion(text)

        return jsonify({
            "speech_text": text,
            "final_emotion": final_emotion
        })

    except Exception as e:
        print("Voice Emotion Error:", e)
        return jsonify({"error": str(e)}), 500



@app.route("/")
def home():
    return "Flask backend running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False, use_reloader=False)
