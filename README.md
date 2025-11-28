🎵 Emotion-Controlled Music Generation with AI
A Deep Learning System That Detects Emotion & Generates Music Using MusicGen + CV + Voice
🚀 Project Overview

This project is an AI-powered music generation system that automatically creates personalized music based on user emotion.
The system captures emotion using either:

Face emotion detection (camera input)

Voice emotion detection (audio input)

Once the emotion is detected, the app uses Meta’s MusicGen model running on GPU (Colab/Cloud) to generate a custom music track.
Tracks are saved, played, regenerated, liked, and downloaded through a responsive React + Vite UI with MongoDB backend.

✨ Features
🎭 Emotion Detection

Face-based emotion classification using a CNN (TensorFlow/Keras).

Supports emotions: Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral.

🎶 AI Music Generation

Uses MusicGen-Small model from Facebook AI.

Generates 20-second high-quality music based on emotion → text prompt mapping.

Supports variation/regeneration of tracks.

📁 Music Library

View all generated tracks

Play music with waveform using Wavesurfer.js

Like, save, delete, and download tracks

Tracks stored in MongoDB Atlas

🔥 Backend: Flask + Colab GPU

Flask REST API

MusicGen running on external Colab GPU over ngrok

Full CORS-enabled architecture

Saves audio files under /static/generated/

🎨 Frontend: React + Vite

Modern UI

Beautiful music cards

Tabs: Generated Music and My Uploads

Toast notifications

Audio waveform + Play/Pause control

🧠 Tech Stack
Frontend

React + TypeScript

Vite

ShadCN/UI

Wavesurfer.js

Backend

Python Flask

TensorFlow/Keras (Emotion detection)

MusicGen (HuggingFace Transformers)

Pyngrok (Colab Tunnel)

MongoDB Atlas

Requests, NumPy, PIL, etc.

📦 Project Architecture
frontend/
 ├── src/
 │   ├── components/
 │   │   ├── MusicCard.tsx
 │   │   ├── Waveform.tsx
 │   │   ├── Navbar.tsx
 │   ├── pages/
 │   │   ├── FaceDetection.tsx
 │   │   ├── VoiceDetection.tsx
 │   │   ├── Library.tsx
 │   ├── App.tsx
 │   └── main.tsx

backend/
 ├── app.py
 ├── emotion_model.h5
 ├── static/
 │   └── generated/
 ├── requirements.txt

🔧 Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/Kishor237323/Emotional-Controlled-Music-Generation-with-AI.git
cd Emotional-Controlled-Music-Generation-with-AI

2️⃣ Install Backend Dependencies
cd backend
pip install -r requirements.txt

3️⃣ Start Flask Server
python app.py

4️⃣ Enable GPU MusicGen (Colab)

Run the provided Colab notebook → copy ngrok URL → paste into Flask COLAB_URL.

5️⃣ Start Frontend
cd frontend
npm install
npm run dev

🎧 How Music Generation Works

Emotion is detected from face/voice input

Emotion → Prompt mapping (e.g., “Happy” → “bright upbeat pop melody…”)

Prompt sent to MusicGen running on GPU

Audio is generated → sent back as Base64 → saved as WAV

Track is stored in MongoDB and displayed in the UI

🛢 Database Schema (MongoDB)
Generated Tracks
{
  emotion: "Happy",
  variation: 0,
  prompt: "bright upbeat pop melody...",
  audio_url: "/static/generated/track_xyz.wav",
  timestamp: "2025-11-26T12:22:45"
}

Liked Tracks
{
  title: "Happy Track",
  emotion: "Happy",
  audio_url: "...",
  timestamp: "2025-11-26T12:23:10",
  type: "liked"
}

🚀 Future Enhancements

Full voice-based emotion detection

User login system

Playlist creation

Multi-emotion blending

Faster MusicGen inference using ONNX


🤝 Contributors

C H Prabhu Kishor
Sai Sunil 
Sai Akhil V
