// Reproductor web: dibuja los videos en vivo en el navegador (sin renderizar MP4).
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { FPS } from "../src/fisio/motor";
import {
  Capitulo,
  CAPITULOS,
  CAPITULOS_ENERGIA,
  CapituloView,
  durCapitulo,
  VideoCompleto,
  VideoEnergia,
} from "../src/fisio/Video";

const VIDEOS: { id: string; titulo: string; caps: Capitulo[]; Completo: React.FC }[] = [
  { id: "energia", titulo: "Unidad 2 · Sistemas energéticos", caps: CAPITULOS_ENERGIA, Completo: VideoEnergia },
  { id: "locomotor", titulo: "Aparato locomotor", caps: CAPITULOS, Completo: VideoCompleto },
];

const TODO = "todo";
const minutos = (f: number) => `${Math.round(f / FPS / 60)} min`;

const App: React.FC = () => {
  const [vid, setVid] = useState(VIDEOS[0].id);
  const video = VIDEOS.find((v) => v.id === vid) ?? VIDEOS[0];
  const [sel, setSel] = useState<string>(video.caps[0].id);
  const cap = video.caps.find((c) => c.id === sel);
  const total = video.caps.reduce((a, c) => a + durCapitulo(c), 0);
  const cambiaVideo = (id: string) => {
    const v = VIDEOS.find((x) => x.id === id) ?? VIDEOS[0];
    setVid(id);
    setSel(v.caps[0].id);
  };
  const comunes = {
    fps: FPS,
    compositionWidth: 1920,
    compositionHeight: 1080,
    controls: true,
    allowFullscreen: true,
    clickToPlay: true,
    doubleClickToFullscreen: true,
    showVolumeControls: true,
    acknowledgeRemotionLicense: true,
    style: { width: "100%" },
  } as const;
  return (
    <>
      <nav className="videos" aria-label="Videos">
        {VIDEOS.map((v) => (
          <button key={v.id} type="button" className={v.id === vid ? "vid on" : "vid"} onClick={() => cambiaVideo(v.id)}>
            {v.titulo}
          </button>
        ))}
      </nav>
      <nav className="caps" aria-label="Capítulos">
        <button type="button" className={sel === TODO ? "cap on" : "cap"} onClick={() => setSel(TODO)}>
          <span className="n">Completo</span>
          <span className="d">{minutos(total)}</span>
        </button>
        {video.caps.map((c) => (
          <button key={c.id} type="button" className={sel === c.id ? "cap on" : "cap"} onClick={() => setSel(c.id)}>
            <span className="n">{c.titulo}</span>
            <span className="d">{minutos(durCapitulo(c))}</span>
          </button>
        ))}
      </nav>
      <div className="marco">
        {cap ? (
          <Player key={cap.id} component={CapituloView} inputProps={{ capId: cap.id }} durationInFrames={durCapitulo(cap)} {...comunes} />
        ) : (
          <Player key={`${vid}-todo`} component={video.Completo} durationInFrames={total} {...comunes} />
        )}
      </div>
    </>
  );
};

createRoot(document.getElementById("app")!).render(<App />);
