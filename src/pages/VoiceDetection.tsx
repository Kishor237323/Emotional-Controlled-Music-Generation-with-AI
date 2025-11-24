import { useState } from "react";
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

  const handleStartListening = () => {
    setIsListening(true);
    toast({
      title: "Listening...",
      description: "Speak naturally to detect your voice emotion",
    });

    // Simulate emotion detection after a delay
    setTimeout(() => {
      const emotions = ["Joyful", "Calm", "Anxious", "Confident", "Melancholic"];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomConfidence = Math.floor(Math.random() * 25) + 75;
      setEmotion(randomEmotion);
      setConfidence(randomConfidence);
    }, 3000);
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  const handleGenerateMusic = () => {
    toast({
      title: "Generating Music",
      description: `Creating a ${emotion?.toLowerCase()} composition for you...`,
    });
    setTimeout(() => {
      toast({
        title: "Music Generated!",
        description: "Your voice-based track is ready in the library.",
      });
      navigate("/library");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Voice Emotion Detection
            </h1>
            <p className="text-muted-foreground text-lg">
              Let AI analyze your voice patterns to detect emotional tone
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-2 border-border">
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                <div
                  className={`relative ${
                    isListening ? "animate-pulse" : ""
                  }`}
                >
                  <Mic className="h-32 w-32 text-primary" />
                  {isListening && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                      <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse" />
                    </>
                  )}
                </div>

                {isListening && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex gap-1 justify-center items-end h-16">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 bg-primary rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!isListening ? (
                  <Button
                    onClick={handleStartListening}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Start Voice Detection
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopListening}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <MicOff className="mr-2 h-5 w-5" />
                    Stop Listening
                  </Button>
                )}
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-6 border-2 border-border">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  Detection Results
                </h3>

                {emotion ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Detected Voice Emotion
                      </label>
                      <p className="text-3xl font-bold text-primary mt-1">
                        {emotion}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">
                        Confidence Level
                      </label>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${confidence}%` }}
                          />
                        </div>
                        <span className="text-lg font-semibold text-foreground">
                          {confidence}%
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateMusic}
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground mt-4"
                      size="lg"
                    >
                      <Music className="mr-2 h-5 w-5" />
                      Generate Music Based on Emotion
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Start listening to begin voice emotion detection
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceDetection;
