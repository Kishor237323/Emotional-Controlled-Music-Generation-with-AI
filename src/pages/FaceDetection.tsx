import React, { useRef, useState } from "react";
import * as faceapi from "face-api.js";
import imageCompression from "browser-image-compression";
import Navbar from "@/components/Navbar";

const FaceDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [emotion, setEmotion] = useState("Click Start Detection");
  const [isDetecting, setIsDetecting] = useState(false);

  // Load Model
  const loadFaceModel = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models/face");
  };

  const startSilentCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
    return stream;
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  };

  async function compressCanvas(canvas: HTMLCanvasElement): Promise<File> {
    const blob: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
    );

    const file = new File([blob], "capture.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    return await imageCompression(file, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 300,
      useWebWorker: true,
    });
  }

  // MAIN LOGIC (unchanged)
  const detectEmotion = async () => {
    setIsDetecting(true);
    setEmotion("Detecting...");
    await loadFaceModel();

    await startSilentCamera();
    const video = videoRef.current!;
    video.play();

    const emotionsArray: string[] = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const startTime = Date.now();

    return new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        if (Date.now() - startTime >= 6000) {
          clearInterval(interval);
          stopCamera();

          if (emotionsArray.length === 0) {
            setEmotion("No face detected");
          } else {
            const freq = emotionsArray.reduce((acc: any, e) => {
              acc[e] = (acc[e] || 0) + 1;
              return acc;
            }, {});

            const finalEmotion = Object.keys(freq).reduce((a, b) =>
              freq[a] > freq[b] ? a : b
            );

            setEmotion(finalEmotion);
          }

          setIsDetecting(false);
          resolve();
          return;
        }

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
        formData.append("image", compressedFile, "face.jpg");

        try {
          const res = await fetch("http://127.0.0.1:5001/predict-emotion", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (data?.emotion) emotionsArray.push(data.emotion);
        } catch (err) {
          console.error(err);
        }
      }, 200);
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Hidden video */}
      <video ref={videoRef} className="hidden" autoPlay muted playsInline />

      <div className="flex flex-col items-center pt-20 px-4">

        <h1 className="text-4xl font-bold mb-6 text-center">
          Face Emotion Detection
        </h1>

        {/* Instructions Section (NEUTRAL THEME) */}
        <div className="max-w-lg text-center text-gray-700 bg-gray-100 p-4 rounded-lg border border-gray-300 mb-8">
          <p className="font-semibold">📌 Instructions</p>
          <p className="mt-2">
            • Sit in a well-lit area. <br />
            • Keep your face straight and centered. <br />
            • The camera will capture your face automatically. <br />
            • Wait for 6 seconds while detection happens. <br />
          </p>
        </div>

        {/* Button (Neutral Grey, No Blue) */}
        <button
          disabled={isDetecting}
          onClick={detectEmotion}
          className="px-8 py-3 bg-gray-800 text-white rounded-xl shadow-md hover:bg-black transition disabled:opacity-40"
        >
          {isDetecting ? "Detecting..." : "Start Detection"}
        </button>

        {/* Result */}
        <div className="mt-10 text-2xl bg-gray-100 border border-gray-300 px-8 py-4 rounded-xl">
          Final Emotion: <strong>{emotion}</strong>
        </div>
      </div>
    </div>
  );
};

export default FaceDetection;
