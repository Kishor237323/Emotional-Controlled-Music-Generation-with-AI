import { useNavigate } from "react-router-dom";
import { Camera, Mic } from "lucide-react";
import Navbar from "@/components/Navbar";
import DetectionCard from "@/components/DetectionCard";
import heroBackground from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

    {/* Hero Section */}
<section
  className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
  style={{
    backgroundImage: `url(${heroBackground})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* MUCH LIGHTER OVERLAY (so background shows clearly) */}
  <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/10 to-background/40" />

  <div className="container mx-auto px-4 relative z-10 pt-24 pb-12">
    <div className="text-center mb-20 animate-fade-in">
      <h1 className="text-6xl md:text-7xl font-extrabold mb-6 text-foreground drop-shadow-xl">
        Emotion-Based Music Generator
      </h1>

      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto drop-shadow">
        Detect your emotion through face or voice and generate music automatically
      </p>
    </div>

    {/* Detection Cards */}
    <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto mt-10">
      <DetectionCard
        icon={Camera}
        title="Face Emotion Detection"
        description="Use your camera to detect emotions from your facial expressions in real-time"
        buttonText="Detect Through Face"
        onClick={() => navigate("/face-detection")}
        gradient="bg-white/80 backdrop-blur-xl shadow-2xl"
      />

      <DetectionCard
        icon={Mic}
        title="Voice Emotion Detection"
        description="Analyze your voice patterns to understand emotional tone and sentiment"
        buttonText="Detect Through Voice"
        onClick={() => navigate("/voice-detection")}
        gradient="bg-white/80 backdrop-blur-xl shadow-2xl"
      />
    </div>
  </div>

    


       {/* Soft fade at bottom */}
  <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background/70 to-transparent" />
</section>
<section className="mt-32 max-w-6xl mx-auto px-6 pb-24">

  <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
    Emotion to Music Mapping
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

    {/* Happy */}
    <div className="bg-white/60 backdrop-blur-xl border border-black/10 rounded-2xl p-6 shadow-xl hover:scale-[1.02] transition-transform">
      <div className="text-5xl mb-3">😊</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">Happy</h3>
      <p className="text-gray-700 text-sm">
        Upbeat Pop • EDM • Dance tracks that match high-energy moods.
      </p>
    </div>

    {/* Sad */}
    <div className="bg-white/60 backdrop-blur-xl border border-black/10 rounded-2xl p-6 shadow-xl hover:scale-[1.02] transition-transform">
      <div className="text-5xl mb-3">😢</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">Sad</h3>
      <p className="text-gray-700 text-sm">
        Soft Piano • Lo-fi • Emotional soundtracks for low moods.
      </p>
    </div>

    {/* Angry */}
    <div className="bg-white/60 backdrop-blur-xl border border-black/10 rounded-2xl p-6 shadow-xl hover:scale-[1.02] transition-transform">
      <div className="text-5xl mb-3">😡</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">Angry</h3>
      <p className="text-gray-700 text-sm">
        Rock • Heavy Bass • Intense beats to channel high tension.
      </p>
    </div>

    {/* Calm */}
    <div className="bg-white/60 backdrop-blur-xl border border-black/10 rounded-2xl p-6 shadow-xl hover:scale-[1.02] transition-transform">
      <div className="text-5xl mb-3">😌</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">Calm</h3>
      <p className="text-gray-700 text-sm">
        Ambient • Chillhop • Relaxing tracks for peaceful moods.
      </p>
    </div>

  </div>
</section>


    </div>
  );

};

export default Index;
