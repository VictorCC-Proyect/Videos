// Short: Fibras rápidas y lentas. Parte 1: qué son y en qué se diferencian
// Del atleta a la fibra: tipo I (roja, aeróbica) vs tipo II (blanca, explosiva), IIa y IIx.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { Humano } from "../fisio/modelos/cuerpo";
import { Mitocondria } from "../fisio/modelos/musculo";
import { Glucogeno, Vaso } from "../fisio/modelos/energia";
import { Creatina, MiniATP } from "../fisio/energia/e1";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { ANTON, Chip, Dato, Destello, INTER, K, pop, ShortDef, Titular } from "./marco";
import { Atleta, Piso } from "./modelos";
import { O2Mol } from "./modelos-energia";
import { F1_COL, f1CeldaCerca, F1Fibra, F1FibraCerca, F1FilaMiosina, F1HazMixto, F1Mioglobina, F1Pastel } from "./modelos-fibras";
import { camViaje } from "./viaje";

const ROJO_TXT = "#ff5c6c"; // rojo legible para textos del tipo I
const BLANCO_TXT = F1_COL.IIx;

// ---- Medidores horizontales (HTML) ------------------------------------------------
type Fila = { t: string; v: number; color: string };
const Medidores: React.FC<{ b: number; a: number; z?: number; filas: Fila[]; y: number; ancho?: number }> = ({ b, a, z = 1.2, filas, y, ancho = 820 }) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: (1080 - ancho) / 2,
        width: ancho,
        opacity: op,
        transform: `scale(${pop(b, a)})`,
        background: "rgba(4,14,17,0.82)",
        border: "3px solid rgba(255,255,255,0.18)",
        borderRadius: 28,
        padding: "18px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {filas.map((f, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 210, fontFamily: INTER, fontWeight: 900, fontSize: 34, color: K.tinta }}>{f.t}</div>
          <div style={{ flex: 1, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ width: `${Math.max(0, Math.min(1, f.v)) * 100}%`, height: "100%", borderRadius: 20, background: f.color, boxShadow: `0 0 22px ${f.color}` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// 0 · Gancho: maratonista vs velocista -> muslo -> haz de fibras mezcladas -----------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const A = 0.42;
  const Z = 0.68;
  const fase = b < A ? 0 : b < Z ? 1 : 2;
  const t = lineal(b, A, Z) * 0.275;
  const cam =
    fase === 0
      ? camara(
          [
            { b: 0, p: [0.5, 1.25, 6.6], l: [0, 0.78, 0], fov: 36 },
            { b: A, p: [-0.4, 1.15, 6.1], l: [0, 0.78, 0], fov: 36 },
          ],
          b,
        )
      : fase === 1
        ? camViaje(t)
        : camara(
            [
              { b: Z, p: [0, 0.6, 9.5], l: [0, -0.7, 0], fov: 40 },
              { b: 1, p: [0.7, 0.4, 8.2], l: [0, -0.6, 0], fov: 40 },
            ],
            b,
          );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={fase === 2 ? [6, 20] : undefined}>
        {fase === 0 ? (
          <>
            <group position={[-0.58, 0, 0]} rotation={[0, 0.45, 0]}>
              <Humano fase={b * 14} marcha={0.6} musculo={0.8} brilla={0.35} colorBrillo={ROJO_TXT} />
              <Piso r={0.42} color={K.cian} />
            </group>
            <group position={[0.58, 0, 0]} rotation={[0, -0.45, 0]}>
              <Atleta ej="sprint" fase={b * 30} brilla={0.6} colorBrillo={K.naranja} />
              <Piso r={0.42} color={K.naranja} />
            </group>
          </>
        ) : fase === 1 ? (
          <>
            <Humano fase={b * 10} marcha={0.2} musculo={0.8} brilla={entre(t, 0.1, 0.25) * 0.8} />
            <Piso />
          </>
        ) : (
          <>
            <group position={[0, 0, 0]} rotation={[-0.55 + b * 0.15, 0.35 - b * 0.3, 0.1]} scale={0.8}>
              <F1HazMixto largo={4} />
            </group>
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[A, Z]} />
      <Titular b={b} a={0.03} z={A} y={280} tam={120} t="¿Horas o 10 s?" />
      <Chip b={b} a={0.06} z={A} t="MARATÓN · HORAS" x={300} y={1100} color={K.cian} />
      <Chip b={b} a={0.16} z={A} t="SPRINT · 10 s" x={790} y={1100} color={K.naranja} />
      <Chip b={b} a={A + 0.02} z={Z} t="MUSLO" x={540} y={330} color={K.rojo} />
      <Dato b={b} a={Z + 0.02} z={1} t="FIBRAS MUSCULARES" sub="Parte 1 · qué son" color={K.lima} y={250} tam={84} />
    </AbsoluteFill>
  );
};

// 1 · Corte transversal: mosaico de lentas (tipo I) y rapidas (tipo II) ---------------------
const ESC_C = 0.72;
const CEL_I = f1CeldaCerca("I", [-0.55, 0.45]);
const CEL_II = f1CeldaCerca("II", [0.55, -0.5]);
const esc = (p: V3, s: number): V3 => [p[0] * s, p[1] * s, p[2] * s];

const Tipos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cual: "I" | "II" | null = b < 0.44 ? null : b < 0.72 ? "I" : "II";
  const resalta = cual === "I" ? entre(b, 0.44, 0.52) : cual === "II" ? entre(b, 0.72, 0.8) : 0;
  const cam = camara(
    [
      { b: 0, p: [0.9, 0.2, 9.2], l: [0, -0.62, 0], fov: 40 },
      { b: 1, p: [-0.5, -0.1, 8.4], l: [0, -0.62, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group scale={ESC_C}>
          <F1HazMixto cual={cual} resalta={resalta} color={entre(b, 0.05, 0.3)} />
        </group>
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: esc(CEL_I, ESC_C), t: "Lenta · tipo I", a: 0.46, z: 1.2, o: [-60, -150], color: ROJO_TXT },
          { p: esc(CEL_II, ESC_C), t: "Rápida · tipo II", a: 0.74, z: 1.2, o: [50, 170], color: BLANCO_TXT },
        ]}
      />
      <Chip b={b} a={0.02} z={0.44} t="CORTE DEL MÚSCULO" x={540} y={330} color={K.rosa} />
      <Dato b={b} a={0.45} z={0.72} t="TIPO I · LENTAS" color={ROJO_TXT} y={260} tam={92} />
      <Dato b={b} a={0.73} z={1.2} t="TIPO II · RÁPIDAS" color={BLANCO_TXT} y={260} tam={92} />
    </AbsoluteFill>
  );
};

// 2 · Fibra lenta: roja, mioglobina, capilares, mitocondrias ----------------------------------
const Lenta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const vMio = entre(b, 0.28, 0.4);
  const vCap = entre(b, 0.6, 0.7);
  const vMito = entre(b, 0.76, 0.86);
  const cam = camara(
    [
      { b: 0, p: [0, 0.2, 11], l: [0, -0.9, 0], fov: 40 },
      { b: 0.3, p: [0.6, 0.3, 7.6], l: [0, -0.7, 0], fov: 40 },
      { b: 1, p: [-0.6, 0.2, 6.8], l: [0, -0.7, 0], fov: 40 },
    ],
    b,
  );
  const mioP: V3 = [0.25, 0.25, 0.75];
  const mitoP: V3 = [-0.35, -0.75, 0.6];
  const capP: V3 = [-0.98, -1.1, 0.3];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 22]}>
        <F1FibraCerca b={b} color={F1_COL.I} mito={24} mio={30} cap={5} verMio={vMio} verCap={vCap} verMito={vMito} />
        {vMio > 0 ? <F1Mioglobina p={mioP} escala={1.8 * vMio} brillo={0.5} /> : null}
        {vMito > 0 ? <Mitocondria pos={mitoP} rot={[0.3, 0, 0.3]} escala={1.5 * vMito} /> : null}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: mioP, t: "Mioglobina + O₂", a: 0.36, z: 1.2, o: [70, -90], color: ROJO_TXT },
          { p: capP, t: "Capilares", a: 0.66, z: 1.2, o: [60, 110], color: "#ff8a8a" },
          { p: mitoP, t: "Mitocondrias", a: 0.82, z: 1.2, o: [70, 110], color: K.naranja },
        ]}
      />
      <Dato b={b} a={0.03} z={1.2} t="FIBRA LENTA = ROJA" sub="tipo I" color={ROJO_TXT} y={250} tam={88} />
    </AbsoluteFill>
  );
};

// 3 · Fibra lenta trabajando: O2 -> mitocondrias -> ATP constante; poca fuerza, casi sin fatiga -----
const MITOS: V3[] = [
  [0.55, 0.95, 0],
  [0.95, -0.15, -0.3],
  [0.45, -1.25, 0.2],
];
const Aerobica: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.2, 11.2], l: [-0.1, -0.55, 0], fov: 40 },
      { b: 1, p: [-0.5, 0.1, 10.4], l: [-0.1, -0.55, 0], fov: 40 },
    ],
    b,
  );
  const latido = 0.5 + 0.5 * Math.sin(b * Math.PI * 2 * 5);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 22]}>
        <Vaso desde={[-1.3, -3, 0]} hasta={[-1.3, 3, 0]} t={b * 1.6} radio={0.38} />
        {[-0.9, 0.1, 1.0].map((y, i) => (
          <F1Mioglobina key={i} p={[-0.45, y, 0.3]} escala={1.5} o2={0.6 + 0.4 * Math.sin(b * 9 + i)} giro={i} />
        ))}
        {MITOS.map((p, i) => (
          <Mitocondria key={i} pos={p} rot={[0.2, 0.3, Math.PI / 2 + 0.3 * (i - 1)]} escala={2.2} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => {
          const u = (b * 2.4 + i / 10) % 1;
          const m = MITOS[i % 3];
          const ini: V3 = [-1.15, m[1] + (i % 2 ? 0.4 : -0.4), 0.2];
          const p = mix3(ini, [m[0] - 0.2, m[1], m[2] + 0.35], u);
          return <O2Mol key={i} p={p} escala={1.2} op={Math.min(1, (1 - u) * 4)} giro={u * 3} />;
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const u = (b * 2.0 + i / 12) % 1;
          const m = MITOS[i % 3];
          const p = mix3([m[0] + 0.3, m[1], m[2] + 0.4], [m[0] + 1.4, m[1] + 0.6 * ((i % 3) - 1) + 0.3, 0.6], u);
          return <MiniATP key={i} p={p} escala={1.7} op={Math.min(1, u * 5, (1 - u) * 3)} brillo={0.6} />;
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.3, 1.6, 0.3], t: "Capilar → O₂", a: 0.05, z: 0.6, o: [40, -90], color: K.cian },
          { p: MITOS[0], t: "Mitocondria", a: 0.12, z: 0.6, o: [30, -110], color: K.naranja },
          { p: [MITOS[2][0] + 1.0, MITOS[2][1] + 0.1, 0.6], t: "ATP constante", a: 0.22, z: 0.6, o: [-40, 120], color: K.amarillo },
        ]}
      />
      <Chip b={b} a={0.02} z={0.5} t="SISTEMA AERÓBICO" x={540} y={330} color={K.cian} />
      <Medidores
        b={b}
        a={0.5}
        y={250}
        filas={[
          { t: "FUERZA", v: 0.3 + 0.05 * latido * entre(b, 0.5, 0.6), color: K.naranja },
          { t: "FATIGA", v: 0.06 * entre(b, 0.6, 1), color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.8} z={1.2} t="TIPO I · RESISTENTE" sub="casi no se cansa" color={K.lima} y={960} tam={80} />
    </AbsoluteFill>
  );
};

// 4 · Fibra rapida: blanca, gruesa, pocas mitocondrias, mucha PCr y glucogeno -----------------
const Rapida: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const C1 = 0.34;
  const fuera = b < C1;
  const vMito = entre(b, 0.42, 0.52);
  const vPcr = entre(b, 0.64, 0.76);
  const vGluc = entre(b, 0.82, 0.92);
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [0, 0.4, 9.8], l: [0, -0.3, 0], fov: 38 },
          { b: C1, p: [0.5, 0.5, 9.2], l: [0, -0.3, 0], fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: C1, p: [0, 0.3, 10.5], l: [0, -0.8, 0], fov: 40 },
          { b: 1, p: [0.6, 0.2, 8.8], l: [0, -0.7, 0], fov: 40 },
        ],
        b,
      );
  const mitoP: V3 = [0.55, 1.0, 1.0];
  const pcrP: V3 = [-0.55, 0.15, 1.15];
  const glucP: V3 = [0.4, -1.0, 1.05];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [6, 22]}>
        {fuera ? (
          <group rotation={[0.3, b * 0.6, 0]}>
            <F1Fibra p={[-0.75, 0, 0]} tipo="I" radio={0.36} largo={2.0} />
            <F1Fibra p={[0.7, 0, 0]} tipo="II" radio={0.6} largo={2.0} brillo={0.2} />
          </group>
        ) : (
          <>
            <F1FibraCerca b={b} color={F1_COL.II} radio={1.3} mito={4} mio={3} pcr={30} gluc={14} cap={0} verMito={vMito} verPcr={vPcr} verGluc={vGluc} />
            {vMito > 0 ? <Mitocondria pos={mitoP} rot={[0.3, 0, 0.4]} escala={1.6 * vMito} /> : null}
            {vPcr > 0 ? <Creatina p={pcrP} fosfato={1} escala={3 * vPcr} /> : null}
            {vGluc > 0 ? <Glucogeno p={glucP} escala={2 * vGluc} /> : null}
          </>
        )}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Destello b={b} en={[C1]} />
      {fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.75, 1.0, 0], t: "Lenta", a: 0.04, z: C1, o: [-30, -90], color: ROJO_TXT },
            { p: [0.7, 1.0, 0], t: "Rápida: más gruesa", a: 0.14, z: C1, o: [-60, -90], color: BLANCO_TXT },
          ]}
        />
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: mitoP, t: "Pocas mitocondrias", a: 0.48, z: 1.2, o: [-40, -120], color: K.naranja },
            { p: pcrP, t: "Fosfocreatina (PCr)", a: 0.7, z: 1.2, o: [40, 140], color: "#47d18c" },
            { p: glucP, t: "Glucógeno", a: 0.88, z: 1.2, o: [60, 100], color: "#a58bff" },
          ]}
        />
      )}
      <Dato b={b} a={0.02} z={1.2} t="FIBRA RÁPIDA = BLANCA" sub="tipo II" color={BLANCO_TXT} y={250} tam={84} />
    </AbsoluteFill>
  );
};

// 5 · Miosina rapida: gasta ATP mas rapido -> mas golpes, mas fuerza, fatiga en segundos ---------
const Miosina: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fatiga = entre(b, 0.55, 0.95);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.2, 9.4], l: [0, -0.29, 0], fov: 40 },
      { b: 1, p: [-0.3, 0.1, 9.0], l: [0, -0.29, 0], fov: 40 },
    ],
    b,
  );
  // la rapida se frena al final (fatiga)
  const faseR = b * 7.2 - Math.max(0, b - 0.8) * 5;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <F1FilaMiosina p={[0, 0.45, 0]} fase={b * 2.4} color={ROJO_TXT} paso={0.06} />
        <F1FilaMiosina p={[0, -0.85, 0]} fase={faseR} color={K.amarillo} paso={0.07} />
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.6, 0.45, 0], t: "Miosina lenta · tipo I", a: 0.03, z: 1.2, o: [20, 60], color: ROJO_TXT },
          { p: [-0.6, -0.85, 0], t: "Miosina rápida · tipo II", a: 0.08, z: 1.2, o: [20, 50], color: K.amarillo },
        ]}
      />
      <Dato b={b} a={0.03} z={0.5} t="ATP → GOLPE" sub="cada golpe de miosina gasta 1 ATP" color={K.naranja} y={250} tam={88} />
      <Medidores
        b={b}
        a={0.52}
        z={0.84}
        y={250}
        filas={[
          { t: "FATIGA I", v: 0.04 * fatiga, color: ROJO_TXT },
          { t: "FATIGA II", v: 0.95 * fatiga, color: K.amarillo },
        ]}
      />
      <Dato b={b} a={0.85} z={1.2} t="TIPO II · EXPLOSIVA" sub="más rápida y fuerte, se cansa pronto" color={K.amarillo} y={250} tam={84} />
    </AbsoluteFill>
  );
};

// 6 · Tres fibras: I, IIa, IIx --------------------------------------------------------------
const TRES: { tipo: "I" | "IIa" | "IIx"; x: number; r: number; vel: number; val: [number, number, number]; col: string; a: number }[] = [
  { tipo: "I", x: -1.3, r: 0.36, vel: 2, val: [0.3, 0.3, 1], col: ROJO_TXT, a: 0.06 },
  { tipo: "IIa", x: 0, r: 0.46, vel: 4.5, val: [0.65, 0.65, 0.65], col: F1_COL.IIa, a: 0.34 },
  { tipo: "IIx", x: 1.3, r: 0.54, vel: 8, val: [1, 1, 0.15], col: F1_COL.IIx, a: 0.64 },
];
const Tres: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.4, 0.9, 12.2], l: [0, -1.25, 0], fov: 38 },
      { b: 1, p: [-0.4, 0.8, 11.8], l: [0, -1.25, 0], fov: 38 },
    ],
    b,
  );
  const foco = b < 0.34 ? -1 : b < 0.64 ? 1 : 2;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0.28, 0, 0]}>
          {TRES.map((f, i) => (
            <F1Fibra key={i} p={[f.x, 0, 0]} tipo={f.tipo} radio={f.r} largo={1.8} contrae={0.5 + 0.5 * Math.sin(b * Math.PI * 2 * f.vel)} brillo={foco === i ? 0.6 : 0} />
          ))}
        </group>
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Dato b={b} a={0.02} z={0.34} t="RÁPIDAS: 2 TIPOS" color={K.tinta} y={250} tam={88} />
      <Dato b={b} a={0.35} z={0.64} t="IIa" sub="rápida pero resistente" color={F1_COL.IIa} y={250} tam={88} />
      <Dato b={b} a={0.65} z={1.2} t="IIx" sub="la más explosiva · la que antes se cansa" color={BLANCO_TXT} y={250} tam={88} />
      {TRES.map((f, i) => {
        const op = visible(b, f.a, 1.2, 0.08);
        if (op <= 0) return null;
        const g = entre(b, f.a, f.a + 0.15);
        return (
          <div key={i} style={{ position: "absolute", top: 905, left: 20 + i * 350, width: 340, opacity: op, transform: `scale(${pop(b, f.a)})` }}>
            <div style={{ textAlign: "center", fontFamily: ANTON, fontSize: 56, color: f.col, lineHeight: 1, WebkitTextStroke: "6px #04090b", paintOrder: "stroke fill" }}>
              {f.tipo === "I" ? "TIPO I" : f.tipo}
            </div>
            <div style={{ marginTop: 8, background: "rgba(4,14,17,0.82)", borderRadius: 18, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              {["Velocidad", "Fuerza", "Resistencia"].map((et, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 130, fontFamily: INTER, fontWeight: 800, fontSize: 22, color: K.tinta }}>{et}</div>
                  <div style={{ flex: 1, height: 20, borderRadius: 10, background: "rgba(255,255,255,0.1)" }}>
                    <div style={{ width: `${f.val[j] * g * 100}%`, height: "100%", borderRadius: 10, background: f.col }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// 7 · Proporciones: promedio ~50 %, maratonista ~80 %, velocista ~25 % ---------------------------
const GRUPOS: { n: string; frac: number; a: number; x: number }[] = [
  { n: "PROMEDIO", frac: 0.5, a: 0.1, x: -1.3 },
  { n: "MARATONISTA", frac: 0.8, a: 0.42, x: 0 },
  { n: "VELOCISTA", frac: 0.25, a: 0.76, x: 1.3 },
];
const Proporcion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.9, 10.2], l: [0, -0.15, 0], fov: 38 },
      { b: 1, p: [-0.3, 0.8, 9.8], l: [0, -0.15, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {GRUPOS.map((g, i) => {
          const f = entre(b, g.a, g.a + 0.14);
          return (
            <group key={i} position={[g.x, 0, 0]}>
              <group position={[0, 0.62, 0]} scale={0.7}>
                {i === 0 ? <Atleta ej="parado" brilla={0.2} /> : i === 1 ? <Humano fase={b * 14} marcha={0.6} musculo={0.8} brilla={0.3 * f} colorBrillo={ROJO_TXT} /> : <Atleta ej="sprint" fase={b * 28} brilla={0.5 * f} colorBrillo={K.amarillo} />}
                <Piso r={0.5} color={i === 1 ? K.cian : i === 2 ? K.naranja : K.lima} />
              </group>
              <F1Pastel p={[0, 0, 0]} frac={g.frac * f} />
            </group>
          );
        })}
      </Escena3D>
      <Chip b={b} a={0.02} z={1.2} t="LENTAS · TIPO I" x={290} y={290} color={ROJO_TXT} />
      <Chip b={b} a={0.06} z={1.2} t="RÁPIDAS · TIPO II" x={790} y={290} color={BLANCO_TXT} />
      {GRUPOS.map((g, i) => {
        const op = visible(b, g.a, 1.2, 0.08);
        if (op <= 0) return null;
        const f = entre(b, g.a, g.a + 0.14);
        return (
          <div key={i} style={{ position: "absolute", top: 1062, left: 20 + i * 350, width: 340, textAlign: "center", opacity: op, transform: `scale(${pop(b, g.a)})` }}>
            <div style={{ fontFamily: ANTON, fontSize: 66, lineHeight: 1, whiteSpace: "nowrap", color: ROJO_TXT, WebkitTextStroke: "8px #04090b", paintOrder: "stroke fill" }}>
              {i === 0 ? "~" : i === 1 ? "hasta " : "~"}
              {Math.round(g.frac * f * 100)}%
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 30, color: K.tinta, marginTop: 4, textShadow: "0 3px 12px #000" }}>{g.n}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Eres más de fibras <span style={{ color: K.lima }}>rápidas</span> o lentas?</>}
    escribe="Yo soy más de…"
    ideas={["LENTAS · RESISTENCIA", "RÁPIDAS · FUERZA", "MITAD Y MITAD"]}
  />
);

const T = [
  "¿Por qué un maratonista puede correr horas y un velocista explota en diez segundos? Gran parte de la respuesta está en sus **fibras musculares**.",
  "Cada músculo mezcla dos grandes tipos de fibras: las **lentas**, o tipo uno, y las **rápidas**, o tipo dos.",
  "Las fibras lentas son **rojas**: tienen mucha **mioglobina**, que guarda oxígeno, muchos capilares y muchas **mitocondrias**.",
  "Por eso usan sobre todo el **sistema aeróbico**. Se contraen con menos fuerza, pero casi **no se cansan**.",
  "Las fibras rápidas son más **blancas** y gruesas: tienen menos mitocondrias, pero mucha **fosfocreatina** y **glucógeno**.",
  "Su miosina gasta ATP mucho más rápido, así que se contraen **más rápido y con más fuerza**, pero se fatigan en segundos.",
  "Y las rápidas son de dos tipos: las **dos A**, rápidas pero resistentes, y las **dos X**, las más explosivas y las que antes se cansan.",
  "En el muslo de una persona promedio, cerca de la **mitad** son lentas. En maratonistas de élite pueden llegar al **ochenta por ciento**, y en velocistas, a apenas una **cuarta parte**.",
  "En la **parte dos**: cómo decide tu cerebro qué fibras usar, y si el entrenamiento puede cambiarlas. ¿Tú eres más de fibras rápidas o lentas? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Tipos, Lenta, Aerobica, Rapida, Miosina, Tres, Proporcion, Final];

export const FIBRAS1: ShortDef = {
  id: "Short-Fibras1",
  titulo: "Fibras rápidas y lentas. Parte 1: qué son",
  planos: ESCENAS.map((Escena, i) => ({ id: `fibras1-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
