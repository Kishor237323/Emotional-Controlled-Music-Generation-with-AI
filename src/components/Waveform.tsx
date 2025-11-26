import React, {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformProps {
  audioUrl: string;
}

const Waveform = forwardRef((props: WaveformProps, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<any>(null);

  // Expose playPause() to parent
  useImperativeHandle(ref, () => ({
    playPause() {
      wavesurferRef.current?.playPause();
    },
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Create WaveSurfer instance
    wavesurferRef.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#999",
      progressColor: "#4F46E5",
      cursorColor: "#333",
      barWidth: 2,
      height: 70,
      responsive: true,
    });

    wavesurferRef.current.load(props.audioUrl);

    return () => {
      // Prevent AbortError
      try {
        wavesurferRef.current?.destroy();
      } catch (e) {
        console.warn("WaveSurfer destroy warning:", e);
      }
    };
  }, [props.audioUrl]);

  return <div ref={containerRef} className="w-full"></div>;
});

export default Waveform;
