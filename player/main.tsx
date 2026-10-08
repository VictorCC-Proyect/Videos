// Reproductor web: dibuja el video en vivo en el navegador (sin renderizar MP4).
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@remotion/player";
import { FPS } from "../src/fisio/motor";
import { CAPITULOS, CapituloView, durCapitulo, VideoCompleto } from "../src/fisio/Video";

const TODO = "todo";

const App: React.FC = () => {
  const [sel, setSel] = useState<string>(CAPITULOS[1]?.id ?? TODO);
  const cap = CAPITULOS.find((c) => c.id === sel);
  const total = CAPITULOS.reduce((a, c) => a + durCapitulo(c), 0);
  const minutos = (f: number) => `${Math.round(f / FPS / 60)} min`;
  return (
    <>
      <nav className="caps" aria-label="Capítulos">
        <button type="button" className={sel === TODO ? "cap on" : "cap"} onClick={() => setSel(TODO)}>
          <span className="n">Completo</span>
          <span className="d">{minutos(total)}</span>
        </button>
        {CAPITULOS.map((c) => (
          <button key={c.id} type="button" className={sel === c.id ? "cap on" : "cap"} onClick={() => setSel(c.id)}>
            <span className="n">{c.titulo}</span>
            <span className="d">{minutos(durCapitulo(c))}</span>
          </button>
        ))}
      </nav>
      <div className="marco">
        {cap ? (
          <Player
            key={cap.id}
            component={CapituloView}
            inputProps={{ capId: cap.id }}
            durationInFrames={durCapitulo(cap)}
            fps={FPS}
            compositionWidth={1920}
            compositionHeight={1080}
            controls
            allowFullscreen
            clickToPlay
            doubleClickToFullscreen
            showVolumeControls
            acknowledgeRemotionLicense
            style={{ width: "100%" }}
          />
        ) : (
          <Player
            key={TODO}
            component={VideoCompleto}
            durationInFrames={total}
            fps={FPS}
            compositionWidth={1920}
            compositionHeight={1080}
            controls
            allowFullscreen
            clickToPlay
            doubleClickToFullscreen
            showVolumeControls
            acknowledgeRemotionLicense
            style={{ width: "100%" }}
          />
        )}
      </div>
    </>
  );
};

createRoot(document.getElementById("app")!).render(<App />);
