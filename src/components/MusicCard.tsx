import { Download, Trash2, Play } from "lucide-react";

interface MusicCardProps {
  title: string;
  emotion: string;
  date: string;
  type: string;
  onPlay: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

const MusicCard = ({ title, emotion, date, onPlay, onDownload, onDelete }: MusicCardProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-gray-700">{emotion}</p>
        <p className="text-gray-500">{date}</p>

        <div className="flex gap-4 mt-4">
          <button onClick={onPlay} className="btn btn-primary flex items-center gap-2">
            <Play size={18} /> Play
          </button>

          <button onClick={onDownload} className="btn btn-secondary flex items-center gap-2">
            <Download size={18} /> Download
          </button>

          <button onClick={onDelete} className="btn btn-danger flex items-center gap-2">
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicCard;
