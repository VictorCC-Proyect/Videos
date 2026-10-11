// Escena final comun: atleta en pose de fuerza + nombre del canal + SIGUEME.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, useBeat } from "../fisio/motor";
import { Escena3D } from "../fisio/ui";
import { Cierre, INTER, K, Titular } from "./marco";
import { Atleta, Piso } from "./modelos";

export const CTA = "Sígueme para más **nutrición explicada con ciencia**.";

export const EscenaCierre: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara([{ b: 0, p: [0, 1.1, 6.4], l: [0, 1.05, 0], fov: 36 }], b);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, -0.5 + b * 1.2, 0]}>
          <Atleta ej="flex" k={Math.sin(b * 8) * 0.5 + 0.5} brilla={0.5} colorBrillo={K.lima} />
          <Piso />
        </group>
      </Escena3D>
      <Cierre b={b} />
    </AbsoluteFill>
  );
};

/**
 * Cierre que pide comentarios: pregunta grande, caja de comentario que "se escribe",
 * sugerencias que aparecen y luego el canal + SIGUEME. Usar con un texto narrado que
 * invite a comentar (ej. "¿Qué suplemento quieres que explique? Escríbelo en los comentarios.").
 */
export const EscenaComentarios: React.FC<{
  textos: string[];
  pregunta: React.ReactNode;
  escribe: string;
  ideas: string[];
}> = ({ textos, pregunta, escribe, ideas }) => {
  const b = useBeat(textos);
  const cam = camara([{ b: 0, p: [0, 1.0, 7.4], l: [0, 1.25, 0], fov: 36 }], b);
  const letras = Math.round(escribe.length * entre(b, 0.2, 0.5));
  const cursor = Math.floor(b * 30) % 2 === 0;
  const caja = entre(b, 0.1, 0.18);
  const final = entre(b, 0.72, 0.8);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, -0.4 + b * 1.0, 0]} position={[0, -0.25 - 0.75 * (1 - final), 0]}>
          <Atleta ej="flex" k={Math.sin(b * 8) * 0.5 + 0.5} brilla={0.5} colorBrillo={K.lima} />
          <Piso />
        </group>
      </Escena3D>
      <div style={{ opacity: 1 - final }}>
        <Titular b={b} a={0.02} z={1.2} y={250} tam={104} t={pregunta} />
        <div
          style={{
            position: "absolute",
            top: 560,
            left: 90,
            right: 90,
            opacity: caja,
            transform: `translateY(${(1 - caja) * 40}px)`,
            background: "rgba(244,247,242,0.96)",
            borderRadius: 34,
            padding: "26px 34px",
            display: "flex",
            alignItems: "center",
            gap: 22,
            boxShadow: `0 0 0 5px ${K.lima}, 0 20px 60px rgba(0,0,0,0.5)`,
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24">
            <path d="M4 4h16v11H8l-4 4z" fill={K.lima} stroke="#071316" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 46, color: letras ? "#071316" : "#7a8b88" }}>
            {letras ? escribe.slice(0, letras) : "Escribe un comentario…"}
            <span style={{ opacity: cursor && caja > 0.9 ? 1 : 0, color: K.lima }}>|</span>
          </div>
        </div>
        <div style={{ position: "absolute", top: 760, left: 60, right: 60, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
          {ideas.map((t, i) => {
            const a = 0.5 + i * 0.04;
            const op = entre(b, a, a + 0.04);
            return (
              <div
                key={t}
                style={{
                  opacity: op,
                  transform: `scale(${0.7 + 0.3 * op})`,
                  fontFamily: INTER,
                  fontWeight: 900,
                  fontSize: 36,
                  color: "#061317",
                  background: [K.cian, K.naranja, K.rosa, K.morado, K.amarillo][i % 5],
                  padding: "10px 24px",
                  borderRadius: 999,
                }}
              >
                {t}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", top: 940, left: 0, right: 0, textAlign: "center", opacity: entre(b, 0.3, 0.38) }}>
          <svg width="90" height="90" viewBox="0 0 24 24" style={{ transform: `translateY(${Math.sin(b * 30) * 10}px)` }}>
            <path d="M12 3v15M5 12l7 7 7-7" fill="none" stroke={K.lima} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 44, color: K.tinta }}>EN LOS COMENTARIOS</div>
        </div>
      </div>
      {final > 0 ? (
        <div style={{ opacity: final }}>
          <Cierre b={(b - 0.72) / 0.28} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
