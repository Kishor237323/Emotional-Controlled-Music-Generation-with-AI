import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Video, VideoOff, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FaceDetection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);

  const handleStartCamera = () => {
    setIsActive(true);
    // Simulate emotion detection after a delay
    setTimeout(() => {
      const emotions = ["Happy", "Sad", "Angry", "Peaceful", "Excited"];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const randomConfidence = Math.floor(Math.random() * 30) + 70;
      setEmotion(randomEmotion);
      setConfidence(randomConfidence);
    }, 2000);
  };

  const handleStopCamera = () => {
    setIsActive(false);
    setEmotion(null);
    setConfidence(0);
  };

  const handleGenerateMusic = () => {
    toast({
      title: "Generating Music",
      description: `Creating a ${emotion?.toLowerCase()} melody for you...`,
    });
    setTimeout(() => {
      toast({
        title: "Music Generated!",
        description: "Your emotion-based track is ready in the library.",
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
              Face Emotion Detection
            </h1>
            <p className="text-muted-foreground text-lg">
              Let AI analyze your facial expressions to detect your current emotion
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-2 border-border">
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                {isActive ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                ) : (
                  <Camera className="h-24 w-24 text-muted-foreground" />
                )}
                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-primary rounded-lg animate-pulse" />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!isActive ? (
                  <Button
                    onClick={handleStartCamera}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    <Video className="mr-2 h-5 w-5" />
                    Start Camera
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopCamera}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <VideoOff className="mr-2 h-5 w-5" />
                    Stop Camera
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
                        Detected Emotion
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
                    Start the camera to begin emotion detection
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

export default FaceDetection;
