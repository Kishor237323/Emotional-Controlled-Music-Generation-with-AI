import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Trash2 } from "lucide-react";

interface MusicCardProps {
  title: string;
  emotion?: string;
  date?: string;
  type: "generated" | "uploaded";
  onPlay: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

const MusicCard = ({
  title,
  emotion,
  date,
  type,
  onPlay,
  onDownload,
  onDelete,
}: MusicCardProps) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-300 border border-border hover:border-primary group">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPlay}
          className="rounded-full w-12 h-12 border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group-hover:scale-110"
        >
          <Play className="h-5 w-5 fill-current" />
        </Button>

        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          {emotion && (
            <p className="text-sm text-muted-foreground">Emotion: {emotion}</p>
          )}
          {date && (
            <p className="text-xs text-muted-foreground mt-1">{date}</p>
          )}
        </div>

        <div className="flex gap-2">
          {type === "generated" && onDownload && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDownload}
              className="hover:bg-muted hover:text-primary transition-colors"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {type === "uploaded" && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MusicCard;
