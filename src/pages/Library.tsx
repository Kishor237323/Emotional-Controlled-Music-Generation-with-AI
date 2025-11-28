import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import MusicCard from "@/components/MusicCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import Waveform from "@/components/Waveform";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

const Library = () => {
  const location = useLocation();
  const emotion = new URLSearchParams(location.search).get("emotion");

  const { toast } = useToast();

  const [generatedMusic, setGeneratedMusic] = useState<any[]>([]);
  const [uploadedMusic, setUploadedMusic] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("generated");
  const [isGenerating, setIsGenerating] = useState(false);

  const waveformRefs = useRef<Record<string, any>>({});


  useEffect(() => {
    fetchGeneratedTracks();
    fetchLikedTracks();
  }, []);


  useEffect(() => {
    if (emotion) generateMusicFromEmotion(emotion);
  }, [emotion]);


  const fetchGeneratedTracks = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-tracks`);
      const data = await res.json();

      if (!Array.isArray(data)) return;

      const cleaned = data.map((t) => ({
        ...t,
        audio_url: t.audio_url.startsWith("http")
          ? t.audio_url
          : `${API_BASE}${t.audio_url}`,
      }));

      setGeneratedMusic(cleaned);
    } catch (err) {
      console.log("Get tracks error", err);
    }
  };


  const fetchLikedTracks = async () => {
    try {
      const res = await fetch(`${API_BASE}/get-liked-tracks`);
      const data = await res.json();

      const cleaned = data.map((t: any) => ({
        ...t,
        audio_url: t.audio_url.startsWith("http")
          ? t.audio_url
          : `${API_BASE}${t.audio_url}`,
      }));

      setUploadedMusic(cleaned);
    } catch (err) {
      console.log("Liked fetch error", err);
    }
  };


  const generateMusicFromEmotion = async (emotion: string) => {
    try {
      setIsGenerating(true);

      toast({
        title: "Generating Music 🎶",
        description: `Emotion: ${emotion}`,
      });

      const res = await fetch(`${API_BASE}/generate-music`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion }),
      });

      const data = await res.json();
      console.log("POST /generate-music:", data);

      if (!data.audio_url) {
        toast({ title: "Error generating track", variant: "destructive" });
        return;
      }

      const newTrack = {
        id: Date.now(),
        title: `${emotion} Track`,
        emotion,
        timestamp: new Date().toISOString(),
        audio_url: `${API_BASE}${data.audio_url}`,
      };

      setGeneratedMusic((p) => [newTrack, ...p]);
    } catch (err) {
      console.log("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };


  const deleteTrack = async (track: any, type: string) => {
    try {
      let cleanUrl = track.audio_url.replace(API_BASE, "");

      // Ensure URL starts with /static...
      if (!cleanUrl.startsWith("/")) {
        cleanUrl = "/" + cleanUrl;
      }

      // Remove duplicate slashes (//static → /static)
      cleanUrl = cleanUrl.replace(/\/+/g, "/");

      console.log("Deleting:", cleanUrl);

      const res = await fetch(`${API_BASE}/delete-track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio_url: cleanUrl }),
      });

      const data = await res.json();

      if (data.status === "deleted") {
        toast({
          title: "Deleted",
          description: `${track.title} removed.`,
        });

        type === "generated"
          ? fetchGeneratedTracks()
          : fetchLikedTracks();
      } else {
        toast({
          title: "Not Found",
          description: "Track not present in database",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error deleting track",
        variant: "destructive",
      });
    }
  };



  const regenerateMusic = async (track: any) => {
    try {
      toast({
        title: "Improving Track…",
        description: `Generating better version of ${track.title}`,
      });

      const res = await fetch(`${API_BASE}/regenerate-music`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion: track.emotion,
          variation: (track.variation || 0) + 1,
        }),
      });

      const data = await res.json();

      if (!data?.audio_url) {
        toast({
          title: "Error",
          description: "Regeneration failed",
          variant: "destructive",
        });
        return;
      }

      setGeneratedMusic((prev: any) => [
        {
          ...track,
          audio_url: `${API_BASE}${data.audio_url}`,
          title: `${track.emotion} Track (Improved)`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);

      toast({
        title: "Improved Version Ready 🎶",
        description: "Track regenerated successfully",
      });
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };



  const likeTrack = async (track: any) => {
    try {
      const payload = {
        track: {
          title: track.title || "Liked Track",
          emotion: track.emotion,
          audio_url: track.audio_url,
          timestamp: new Date().toISOString(),
        },
      };

      await fetch(`${API_BASE}/save-liked-track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast({
        title: "Added to ❤️",
        description: track.title,
      });

      fetchLikedTracks(); // reload uploads
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-8">My Library</h1>

        {isGenerating && (
          <div className="p-4 bg-yellow-100 border rounded mb-4">
            Generating track… please wait ⏳
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="generated">Generated</TabsTrigger>
            <TabsTrigger value="uploaded">My Uploads</TabsTrigger>
          </TabsList>

          {/* --------------------- GENERATED --------------------- */}
          <TabsContent value="generated">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {generatedMusic.map((track: any) => {
                const id =
                  track._id ??
                  `${track.audio_url}-${track.timestamp}-${Math.random().toString(36).slice(2)}`;


                if (!waveformRefs.current[id]) {
                  waveformRefs.current[id] = React.createRef();
                }

                return (
                  <div key={id} className="p-4 rounded border shadow bg-white">
                    <MusicCard
                      title={track.title}
                      emotion={track.emotion}
                      date={
                        new Date(new Date(track.timestamp).toLocaleString()
                        ).toLocaleDateString() +
                        " • " +
                        new Date(new Date(track.timestamp).toLocaleString()
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      }


                      type="generated"
                      onPlay={() =>
                        waveformRefs.current[id]?.current?.playPause()
                      }
                      onDownload={() => window.open(track.audio_url, "_blank")}
                      onDelete={() => deleteTrack(track, "generated")}
                    />

                    <Waveform
                      ref={waveformRefs.current[id]}
                      audioUrl={track.audio_url}
                    />

                    <div className="flex gap-3 mt-3">
                      <button
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded font-medium"
                        onClick={() => likeTrack(track)}
                      >
                        ❤️ Like
                      </button>

                      <button
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded font-medium"
                        onClick={() => regenerateMusic(track)}
                      >
                        👎 Dislike
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="uploaded">
            <div className="text-center text-muted-foreground py-20 text-lg">
              No uploads yet
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Library;
