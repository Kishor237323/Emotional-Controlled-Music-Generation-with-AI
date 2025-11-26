import React, { useRef, useState } from "react";
import * as faceapi from "face-api.js";

import imageCompression from "browser-image-compression";
import Navbar from "@/components/Navbar";

// ✅ Correct router for your project
import { useNavigate } from "react-router-dom";

const FaceDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const navigate = useNavigate(); // ✅ added

  const [emotion, setEmotion] = useState("Click Start Detection");
  const [isDetecting, setIsDetecting] = useState(false);

  // Load Face Model
  const loadFaceModel = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models/face");
  };

  // Start camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  // Stop camera
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) stream.getTracks().forEach((t) => t.stop());
  };

  // Compress canvas → image file
  async function compressCanvas(canvas: HTMLCanvasElement): Promise<File> {
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95)
    );

    const file = new File([blob], "frame.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    return await imageCompression(file, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 300,
      useWebWorker: true,
    });
  }

  // Main detection function
  const detectEmotion = async () => {
    setIsDetecting(true);
    setEmotion("Detecting...");

    await loadFaceModel();
    await startCamera();

    const emotionsArray: string[] = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const startTime = Date.now();

    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (Date.now() - startTime >= 6000) {
          clearInterval(interval);
          stopCamera();

          let finalEmotion = "No face detected";

          if (emotionsArray.length > 0) {
            const freq = emotionsArray.reduce((acc: any, e) => {
              acc[e] = (acc[e] || 0) + 1;
              return acc;
            }, {});

            finalEmotion = Object.keys(freq).reduce((a, b) =>
              freq[a] > freq[b] ? a : b
            );
          }

          setEmotion(finalEmotion);
          setIsDetecting(false);

     if (finalEmotion !== "No face detected") {
  setTimeout(() => {
    navigate(`/library?emotion=${finalEmotion}`);
  }, 200);
}


          resolve();
          return;
        }

        const video = videoRef.current!;
        const detection = await faceapi.detectSingleFace(
          video,
          new faceapi.TinyFaceDetectorOptions()
        );

        if (!detection) return;

        const { x, y, width, height } = detection.box;

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        ctx.drawImage(
          video,
          Math.round(x),
          Math.round(y),
          Math.round(width),
          Math.round(height),
          0,
          0,
          canvas.width,
          canvas.height
        );

        const compressedFile = await compressCanvas(canvas);
        const formData = new FormData();
        formData.append("image", compressedFile);

        try {
          const res = await fetch("http://127.0.0.1:5001/predict-emotion", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (data?.emotion) emotionsArray.push(data.emotion);
        } catch (err) {
          console.log("Backend Error", err);
        }
      }, 200);
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Invisible Camera */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute opacity-0 w-1 h-1"
      />

      <div className="flex flex-col items-center pt-20 px-4">
        <h1 className="text-3xl font-bold mb-6">Face Emotion Detection</h1>

        <div className="bg-gray-100 p-4 border rounded mb-6 text-center">
          <p>📌 Sit in good lighting</p>
          <p>📌 Keep your face centered</p>
          <p>📌 Wait 6 seconds for detection</p>
        </div>

        <button
          disabled={isDetecting}
          onClick={detectEmotion}
          className="px-8 py-3 bg-gray-800 text-white rounded shadow"
        >
          {isDetecting ? "Detecting..." : "Start Detection"}
        </button>

        <div className="mt-8 text-2xl bg-gray-100 border px-6 py-3 rounded">
          Final Emotion: <strong>{emotion}</strong>
        </div>
      </div>
    </div>
  );
};

export default FaceDetection;
