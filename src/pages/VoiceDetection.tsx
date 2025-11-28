import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VoiceDetection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Convert Float32 PCM → WAV Blob
  const convertToWav = async (blob: Blob): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const pcm = audioBuffer.getChannelData(0);
    const wavBuffer = encodeWAV(pcm, audioBuffer.sampleRate);

    return new Blob([wavBuffer], { type: "audio/wav" });
  };

  // WAV Encoder
  const encodeWAV = (samples: Float32Array, sampleRate: number): ArrayBuffer => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s * 0x7fff, true);
    }
    return buffer;
  };


  // =======================
  // START RECORDING
  // =======================
  const handleStartListening = async () => {
    setIsListening(true);

    toast({
      title: "Listening…",
      description: "Speak naturally to detect emotion.",
    });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    audioChunksRef.current = [];
    recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const wavBlob = await convertToWav(audioBlob);
      sendToBackend(wavBlob);
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
  };

  // =======================
  // STOP RECORDING
  // =======================
  const handleStopListening = () => {
    setIsListening(false);
    mediaRecorderRef.current?.stop();
  };

  // =======================
  // SEND TO BACKEND
  // =======================
  const sendToBackend = async (wavBlob: Blob) => {
    const form = new FormData();
    form.append("file", wavBlob, "voice.wav");

    const response = await fetch("http://127.0.0.1:5001/predict-voice-emotion", {
      method: "POST",
      body: form,
    });

    const data = await response.json();
    console.log("Backend:", data);

    if (data.error) {
      toast({ title: "Error", description: data.error });
      return;
    }

    setEmotion(data.final_emotion);
    setConfidence(Math.round(data.tone_confidence * 100));
  };

  // =======================
  // GENERATE MUSIC
  // =======================
  const handleGenerateMusic = async () => {
    if (!emotion) return;

    const emotionMap: Record<string, string> = {
      happy: "Happy",
      sad: "Sad",
      angry: "Angry",
      fearful: "Fear",
      neutral: "Neutral",
    };

    const mappedEmotion = emotionMap[emotion.toLowerCase()] || "Neutral";

    toast({
      title: "Generating track… please wait ⏳",
      description: `Creating a ${mappedEmotion} track…`,
    });

    const res = await fetch("http://127.0.0.1:5001/generate-music", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emotion: mappedEmotion }),
    });

    const data = await res.json();
    console.log("MusicGen Response:", data);

    if (data.error) {
      toast({
        title: "Error",
        description: data.error,
      });
      return;
    }

    toast({
      title: "Music Ready!",
      description: "Check your library.",
    });

    navigate("/library");
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Voice Emotion Detection</h1>
            <p className="text-muted-foreground text-lg">
              Let AI analyze your voice and mood
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-2">
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                <Mic className={`h-32 w-32 ${isListening ? "animate-pulse text-primary" : "text-foreground"}`} />
              </div>

              <div className="flex gap-3">
                {!isListening ? (
                  <Button className="flex-1" onClick={handleStartListening} size="lg">
                    <Mic className="mr-2 h-5 w-5" /> Start Listening
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={handleStopListening}
                    size="lg"
                  >
                    <MicOff className="mr-2 h-5 w-5" /> Stop
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-6 border-2">
              <h3 className="text-xl font-semibold mb-4">Detection Results</h3>

              {emotion ? (
                <div className="space-y-4">
                  <p className="text-xl font-bold">Emotion: {emotion}</p>
                  <Button className="w-full" onClick={handleGenerateMusic} size="lg">
                    <Music className="mr-2 h-5 w-5" /> Generate Music
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-10">
                  Speak to detect emotion.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceDetection;
