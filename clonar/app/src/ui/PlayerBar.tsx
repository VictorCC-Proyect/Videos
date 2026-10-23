import { useEffect, useRef, useState } from "react";
import { downloadBlob } from "../audio";
import { useApp } from "../state";
import { AudioPlayer } from "./AudioPlayer";

// Reproductor fijo abajo. Un solo <audio> para toda la app.
export function PlayerBar() {
  const { playing } = useApp();
  const audio = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (playing && audio.current) {
      audio.current.src = playing.url;
      audio.current.play().catch(() => setIsPlaying(false));
    }
  }, [playing]);

  return (
    <>
      <audio
        ref={audio}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setTotal(e.currentTarget.duration || 0)}
      />
      {playing && (
        <div className="border-t border-line bg-bg p-2">
          <AudioPlayer
            title={playing.title}
            playing={isPlaying}
            onToggle={() => (audio.current?.paused ? audio.current.play() : audio.current?.pause())}
            current={time}
            total={total}
            onSeek={(s) => audio.current && (audio.current.currentTime = s)}
            onDownload={() => downloadBlob(playing.blob, playing.filename)}
          />
        </div>
      )}
    </>
  );
}
