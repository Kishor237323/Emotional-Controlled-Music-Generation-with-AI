import { useState } from "react";
import Navbar from "@/components/Navbar";
import MusicCard from "@/components/MusicCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Library = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generated");

  // Mock data for demonstration
  const generatedMusic = [
    {
      id: 1,
      title: "Happy Melody",
      emotion: "Joy",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Calm Waters",
      emotion: "Peaceful",
      date: "2024-01-14",
    },
    {
      id: 3,
      title: "Energetic Beats",
      emotion: "Excited",
      date: "2024-01-13",
    },
  ];

  const uploadedMusic = [
    {
      id: 1,
      title: "My Favorite Song.mp3",
      date: "2024-01-10",
    },
    {
      id: 2,
      title: "Workout Mix.mp3",
      date: "2024-01-09",
    },
  ];

  const handlePlay = (title: string) => {
    toast({
      title: "Now Playing",
      description: title,
    });
  };

  const handleDownload = (title: string) => {
    toast({
      title: "Downloaded",
      description: `${title} has been downloaded`,
    });
  };

  const handleDelete = (title: string) => {
    toast({
      title: "Deleted",
      description: `${title} has been removed`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">My Library</h1>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Upload className="mr-2 h-4 w-4" />
            Upload Music
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="generated">Generated Music</TabsTrigger>
            <TabsTrigger value="uploaded">My Uploads</TabsTrigger>
          </TabsList>

          <TabsContent value="generated" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {generatedMusic.map((music) => (
                <MusicCard
                  key={music.id}
                  title={music.title}
                  emotion={music.emotion}
                  date={music.date}
                  type="generated"
                  onPlay={() => handlePlay(music.title)}
                  onDownload={() => handleDownload(music.title)}
                />
              ))}
            </div>
            {generatedMusic.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No generated music yet. Start by detecting your emotion!
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="uploaded" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {uploadedMusic.map((music) => (
                <MusicCard
                  key={music.id}
                  title={music.title}
                  date={music.date}
                  type="uploaded"
                  onPlay={() => handlePlay(music.title)}
                  onDelete={() => handleDelete(music.title)}
                />
              ))}
            </div>
            {uploadedMusic.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  No uploaded music yet. Click the upload button to add your
                  music!
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Library;
