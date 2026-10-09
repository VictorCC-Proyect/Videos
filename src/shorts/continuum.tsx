// Short: ¿Las grasas se queman solo después de 30 minutos? El continuum energético.
// Del atleta al interior de la fibra: los 3 sistemas (fosfocreatina, glucólisis y
// aeróbico) trabajan a la vez; cambia la proporción, no hay interruptor en el min 30.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { Humano } from "../fisio/modelos/cuerpo";
import { Cadena, Enlace, Esfera, GotaLipido, MitocondriaGrande, Mol } from "../fisio/modelos/energia";
import { Creatina, MiniATP } from "../fisio/energia/e1";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { ANTON, Chip, Dato, Destello, INTER, K, Sello, ShortDef, Titular } from "./marco";
import { Atleta, Huevo, InteriorFibra, Pechuga, Piso, Plato } from "./modelos";
import { EscenaCierre } from "./cierre";
import { camViaje, cortesViaje, Viaje } from "./viaje";

const VERDE = "#47d18c";
const GLUCOSA = "#ffd166";
const PIRUVATO = K.naranja;
const GRASA = "#ffd34d";
const CARBO = "#4f8dff";

// ---- Modelos propios ----------------------------------------------------------

/** Halo de color detras de un "motor" (se enciende con act). */
const Halo: React.FC<{ color: string; act: number; r?: number }> = ({ color, act, r = 0.8 }) => (
  <mesh position={[0, 0, -0.4]}>
    <sphereGeometry args={[r, 32, 24]} />
    <meshBasicMaterial color={color} transparent opacity={0.03 + 0.12 * act} depthWrite={false} />
  </mesh>
);

/** Motor 1: fosfocreatina cede su fosfato al ADP -> ATP (ciclo c 0..1). */
const MotorPCr: React.FC<{ c: number; act: number }> = ({ c, act }) => {
  const op = 0.35 + 0.65 * act;
  const viaja = entre(c, 0.15, 0.55);
  const sale = entre(c, 0.6, 1);
  const fos: V3 = mix3([0.15, -0.13, 0.05], [0.37, -0.5, 0.05], viaja);
  return (
    <group>
      <Halo color={VERDE} act={act} />
      <Creatina p={[-0.45, 0.05, 0]} fosfato={c < 0.15 ? 1 : 0} escala={3} op={op} />
      {c >= 0.15 && c < 0.58 ? <Esfera p={fos} r={0.2} color="#ff9a2e" brillo={0.6 + act} op={op} /> : null}
      {c < 0.58 ? (
        <MiniATP p={[-0.3, -0.5, 0]} n={2} escala={2.4} op={op} brillo={0.3} />
      ) : (
        <MiniATP p={[-0.3 + sale * 0.5, -0.5 + sale * 1.0, 0.2]} n={3} escala={2.4} op={op * (1 - sale * 0.8)} brillo={0.4 + act} />
      )}
    </group>
  );
};

/** Motor 2: glucosa (anillo de 6 C) -> 2 piruvato (3 C) + ATP. */
const MotorGlu: React.FC<{ c: number; act: number }> = ({ c, act }) => {
  const op = 0.35 + 0.65 * act;
  const parte = entre(c, 0.35, 0.65);
  const fade = 1 - entre(c, 0.85, 1);
  return (
    <group>
      <Halo color={GLUCOSA} act={act} />
      {parte < 0.05 ? (
        <Cadena n={6} anillo p={[0, 0, 0]} color={GLUCOSA} sep={0.22} op={op} brillo={0.3 + act * 0.4} />
      ) : (
        <>
          <Cadena n={3} p={mix3([-0.2, 0.1, 0], [-0.7, 0.3, 0], parte)} color={PIRUVATO} sep={0.22} op={op * fade} brillo={0.4} />
          <Cadena n={3} p={mix3([-0.2, -0.1, 0], [0.1, -0.45, 0], parte)} color={PIRUVATO} sep={0.22} op={op * fade} brillo={0.4} />
          <MiniATP p={mix3([0, 0, 0.1], [0.35, 0.55, 0.2], parte)} escala={2 * parte} op={op * fade} brillo={0.4 + act} />
          <MiniATP p={mix3([0, 0, 0.1], [-0.45, -0.6, 0.2], parte)} escala={2 * parte} op={op * fade} brillo={0.4 + act} />
        </>
      )}
    </group>
  );
};

/** Motor 3: mitocondria pequena con acidos grasos (de una gota de lipido) y piruvato entrando. */
const MotorMito: React.FC<{ c: number; act: number }> = ({ c, act }) => {
  const op = 0.35 + 0.65 * act;
  const f1 = c;
  const f2 = (c + 0.5) % 1;
  return (
    <group>
      <Halo color={K.naranja} act={act} r={1.1} />
      <group scale={0.42}>
        <MitocondriaGrande op={op} brillo={act * 0.3} />
      </group>
      <GotaLipido p={[-1.15, 0.2, 0.2]} r={0.24} op={op} />
      <Cadena n={6} p={mix3([-1.2, 0.1, 0.3], [-0.55, 0, 0.3], f1)} color={GRASA} sep={0.1} op={op * (1 - f1 * 0.7)} brillo={0.4} />
      <Cadena n={3} p={mix3([1.0, 0.45, 0.3], [0.35, 0.05, 0.3], f2)} color={PIRUVATO} sep={0.12} op={op * (1 - f2 * 0.7)} brillo={0.4} />
      <MiniATP p={[0.2 + c * 0.3, 0.3 + c * 0.6, 0.4]} escala={1.8} op={op * (1 - c)} brillo={0.4 + act} />
    </group>
  );
};

/** Posiciones de los 3 motores (escenas 1-3). */
const M_PCR: V3 = [-0.85, 0.4, 0];
const M_GLU: V3 = [0.85, 0.4, 0];
const M_MITO: V3 = [0, -1.2, 0];

const Motores: React.FC<{ b: number; act: [number, number, number]; vel?: number; aparece?: number }> = ({ b, act, vel = 3, aparece = 1 }) => {
  const c = (b * vel) % 1;
  if (aparece <= 0) return null;
  return (
    <group scale={aparece}>
      <group position={M_PCR}>
        <MotorPCr c={c} act={act[0]} />
      </group>
      <group position={M_GLU}>
        <MotorGlu c={(c + 0.33) % 1} act={act[1]} />
      </group>
      <group position={M_MITO}>
        <MotorMito c={(c + 0.66) % 1} act={act[2]} />
      </group>
    </group>
  );
};

/** Balanza de dos platos: inclina > 0 baja el plato derecho. */
const Balanza: React.FC<{ inclina: number; izq: React.ReactNode; der: React.ReactNode }> = ({ inclina, izq, der }) => {
  const L = 1.0;
  const a = -0.2 * inclina;
  const pivote: V3 = [0, 0.7, 0];
  const extR: V3 = [L * Math.cos(a), pivote[1] + L * Math.sin(a), 0];
  const extL: V3 = [-L * Math.cos(a), pivote[1] - L * Math.sin(a), 0];
  const cuelga = 0.75;
  const plato = (e: V3, hijos: React.ReactNode, k: string) => (
    <group key={k}>
      <Enlace a={e} b={[e[0] - 0.35, e[1] - cuelga, 0]} r={0.012} color="#cfd8dc" />
      <Enlace a={e} b={[e[0] + 0.35, e[1] - cuelga, 0]} r={0.012} color="#cfd8dc" />
      <group position={[e[0], e[1] - cuelga, 0]}>
        <Plato p={[0, 0, 0]} escala={0.85} />
        <group position={[0, 0.04, 0]}>{hijos}</group>
      </group>
    </group>
  );
  return (
    <group>
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[0.45, 0.6, 0.12, 40]} />
        <meshPhysicalMaterial color="#2a4a50" clearcoat={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 1.9, 20]} />
        <meshPhysicalMaterial color="#9fb8b4" clearcoat={0.8} roughness={0.2} metalness={0.4} />
      </mesh>
      <Esfera p={pivote} r={0.1} color={K.lima} brillo={0.4} />
      <Enlace a={extL} b={extR} r={0.04} color="#e8eef0" />
      {plato(extL, izq, "i")}
      {plato(extR, der, "d")}
    </group>
  );
};

// 0 · Gancho -------------------------------------------------------------------------
const Reloj: React.FC<{ b: number; seg: number; x: number; y: number; color: string }> = ({ b, seg, x, y, color }) => {
  const op = visible(b, 0.02, 1, 0.08);
  const mm = String(Math.floor(seg / 60)).padStart(2, "0");
  const ss = String(Math.floor(seg % 60)).padStart(2, "0");
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: op, transform: "translate(-50%, -50%)", textAlign: "center" }}>
      <div
        style={{
          width: 250,
          height: 250,
          borderRadius: "50%",
          border: `10px solid ${color}`,
          background: "rgba(4,14,17,0.82)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 50px ${color}66`,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: -34, width: 50, height: 26, borderRadius: 8, background: color }} />
        <div style={{ fontFamily: ANTON, fontSize: 82, color: K.tinta }}>
          {mm}:{ss}
        </div>
      </div>
    </div>
  );
};

const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [3.4, 1.5, 6.2], l: [0.3, 0.6, 0], fov: 36 },
      { b: 1, p: [-2.4, 1.4, 6.0], l: [0.3, 0.65, 0], fov: 36 },
    ],
    b,
  );
  const seg = Math.round(entre(b, 0.05, 0.6) * 1800);
  const en30 = seg >= 1800;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <Atleta ej="sprint" fase={b * 24} brilla={0.3 + 0.4 * entre(b, 0.55, 0.65)} colorBrillo={GRASA} />
        <Piso color={GRASA} />
      </Escena3D>
      <Titular b={b} a={0.02} z={1} y={250} tam={120} t={<>¿Grasa solo<br />tras <span style={{ color: GRASA }}>30 min</span>?</>} />
      <Reloj b={b} seg={seg} x={250} y={760} color={en30 ? GRASA : K.cian} />
      <Sello b={b} a={0.84} z={1} t="FALSO" y={560} />
    </AbsoluteFill>
  );
};

// 1 · Viaje a la fibra: los 3 sistemas a la vez -----------------------------------------
const Sistemas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.45);
  const dentro = t >= 1;
  const cam = dentro
    ? camara(
        [
          { b: 0.45, p: [0, 0.3, 10.5], l: [0, -0.9, 0], fov: 40 },
          { b: 0.6, p: [0, -0.1, 10.0], l: [0, -0.95, 0], fov: 40 },
          { b: 1, p: [0.5, -0.2, 9.4], l: [0, -0.95, 0], fov: 40 },
        ],
        b,
      )
    : camViaje(t);
  const aparece = entre(b, 0.48, 0.58);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={dentro ? [9, 19] : t > 0.72 ? [10, 34] : undefined}>
        {dentro ? (
          <>
            <group position={[0, 0, -6]}>
              <InteriorFibra b={b} pcr={0} brillo={0.05} />
            </group>
            <Motores b={b} act={[1, 1, 1]} aparece={aparece} />
            <Polvo b={b} radio={5} />
          </>
        ) : (
          <Viaje t={t} b={b} ej="sprint" fase={b * 24} colorBrillo={K.lima} interior={{ pcr: 0 }} />
        )}
      </Escena3D>
      <Destello b={b} en={cortesViaje(0, 0.45)} />
      {!dentro ? <Chip b={b} a={0.02} z={0.3} t="AL INTERIOR DEL MÚSCULO" x={540} y={330} color={K.rosa} /> : null}
      {dentro ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [M_PCR[0] - 0.3, M_PCR[1] - 0.5, 0], t: "Fosfocreatina", a: 0.52, z: 1, o: [-20, 150], color: VERDE },
            { p: [M_GLU[0] + 0.1, M_GLU[1] - 0.4, 0], t: "Glucólisis", a: 0.55, z: 1, o: [20, 150], color: GLUCOSA },
            { p: [M_MITO[0] + 0.6, M_MITO[1] - 0.3, 0], t: "Aeróbico", a: 0.58, z: 1, o: [40, 90], color: K.naranja },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.66} z={1} t="Continuum energético" sub="los 3 sistemas a la vez" color={K.lima} y={250} tam={84} />
    </AbsoluteFill>
  );
};

// 2 · Primeros segundos: fosfocreatina ------------------------------------------------
const Fosfocreatina: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.3;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [4.4, 1.3, 5.2], l: [0, 0.65, 0], fov: 36 },
          { b: 0.3, p: [3.2, 1.1, 4.6], l: [0, 0.65, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.3, p: [-0.6, 0.1, 6.8], l: [-0.8, -0.35, 0], fov: 40 },
          { b: 1, p: [-1.1, 0.2, 5.9], l: [-0.85, -0.3, 0], fov: 40 },
        ],
        b,
      );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [6, 14]}>
        {fuera ? (
          <>
            <Atleta ej="sprint" fase={b * 30} brilla={0.7} colorBrillo={VERDE} />
            <Piso color={VERDE} />
          </>
        ) : (
          <>
            <group position={[0, 0, -6]}>
              <InteriorFibra b={b} pcr={0} brillo={0.05} />
            </group>
            <Motores b={b} act={[1, 0.15, 0.15]} vel={4} />
            <Polvo b={b} radio={4} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.3]} />
      <Chip b={b} a={0.03} z={0.3} t="ESFUERZO MÁXIMO" x={540} y={1100} color={K.naranja} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [M_PCR[0] - 0.45, M_PCR[1] + 0.25, 0], t: "Fosfocreatina", a: 0.36, z: 1, o: [40, -150], color: VERDE },
            { p: [M_PCR[0] - 0.3, M_PCR[1] - 0.5, 0], t: "ADP + fosfato → ATP", a: 0.45, z: 1, o: [20, 170], color: K.naranja },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.32} z={1} t="0–10 s" sub="domina la fosfocreatina" color={VERDE} y={250} tam={120} />
    </AbsoluteFill>
  );
};

// 3 · Hasta 1-2 min: glucolisis ---------------------------------------------------------
const Glucolisis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.0, 11.0], l: [0.1, -1.0, 0], fov: 40 },
      { b: 0.3, p: [0.9, 0.3, 7.2], l: [0.8, -0.4, 0], fov: 40 },
      { b: 1, p: [1.1, 0.4, 6.4], l: [0.85, -0.35, 0], fov: 40 },
    ],
    b,
  );
  const cambia = entre(b, 0.15, 0.35);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 16]}>
        <group position={[0, 0, -6]}>
          <InteriorFibra b={b} pcr={0} brillo={0.1} />
        </group>
        <Motores b={b} act={[mix(0.6, 0.1, cambia), mix(0.3, 1, cambia), 0.2]} vel={3} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [M_GLU[0], M_GLU[1] + 0.25, 0], t: "Glucosa (6 C)", a: 0.35, z: 1, o: [20, -150], color: GLUCOSA },
          { p: [M_GLU[0] - 0.5, M_GLU[1] - 0.2, 0], t: "2 piruvato + ATP", a: 0.5, z: 1, o: [-10, 170], color: PIRUVATO },
        ]}
      />
      <Dato b={b} a={0.25} z={1} t="~10 s – 2 min" sub="manda la glucólisis" color={GLUCOSA} y={250} tam={110} />
    </AbsoluteFill>
  );
};

// 4 · Despues: aerobico en la mitocondria (grasa + glucosa) ------------------------------
const Aerobico: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.4, 0.3, 9.6], l: [0, -0.6, 0], fov: 40 },
      { b: 1, p: [-0.6, 0.2, 8.6], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  const grasa = entre(b, 0.55, 0.75);
  const ciclo = (k: number, vel: number) => (b * vel + k) % 1;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 24]}>
        <group rotation={[0.2, 0.3 + b * 0.3, Math.PI / 2 - 0.2]} scale={0.68}>
          <MitocondriaGrande brillo={0.15 + 0.2 * Math.sin(b * 14) ** 2} />
        </group>
        {/* gota de lipido: de ahi salen los acidos grasos */}
        <GotaLipido p={[-1.25, 1.0, 0.2]} r={0.38} />
        {[0, 1, 2].map((i) => {
          const f = ciclo(i / 3, 2.4);
          return (
            <Cadena key={`g${i}`} n={8} p={mix3([-1.45, 0.9 - i * 0.08, 0.6], [-0.45, 0.3 - i * 0.25, 0.4], f)} color={GRASA} sep={0.11} op={(0.3 + 0.7 * grasa) * (1 - f * 0.6)} brillo={0.3 + grasa * 0.6} />
          );
        })}
        {[0, 1].map((i) => {
          const f = ciclo(i / 2 + 0.25, 2.4);
          return <Cadena key={`p${i}`} n={3} p={mix3([1.2, 1.3 - i * 0.2, 0.6], [0.25, 0.4 - i * 0.3, 0.4], f)} color={PIRUVATO} sep={0.15} op={1 - f * 0.6} brillo={0.4} />;
        })}
        {[0, 1, 2].map((i) => {
          const f = ciclo(i / 3 + 0.1, 2);
          return <Mol key={`o${i}`} p={mix3([(i - 1) * 0.5, -2.4, 0.6], [(i - 1) * 0.2, -0.9, 0.3], f)} color={K.cian} r={0.1} op={1 - f * 0.5} />;
        })}
        {[0, 1, 2, 3].map((i) => {
          const f = ciclo(i / 4, 2.2);
          const lado = i % 2 ? 1 : -1;
          return <MiniATP key={`a${i}`} p={mix3([lado * 0.3, -0.2 + i * 0.1, 0.5], [lado * 1.5, -1.3 + i * 0.25, 0.8], f)} escala={2} op={1 - f} brillo={0.7} />;
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, 0.6, 0], t: "Mitocondria", a: 0.1, z: 1, o: [60, -60], color: K.naranja },
          { p: [-1.25, 1.0, 0.2], t: "Ácidos grasos", a: 0.55, z: 1, o: [-10, -120], color: GRASA },
          { p: [1.0, 1.15, 0.6], t: "Piruvato (glucosa)", a: 0.45, z: 1, o: [0, -110], color: PIRUVATO },
          { p: [0, -1.8, 0.6], t: "O₂", a: 0.25, z: 1, o: [-60, 50], color: K.cian },
        ]}
      />
      <Dato b={b} a={0.05} z={1} t="Aeróbico" sub="grasa + glucosa → mucho ATP" color={K.naranja} y={250} tam={110} />
    </AbsoluteFill>
  );
};

// 5 · La proporcion cambia con la intensidad ------------------------------------------------
const Proporcion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const a0 = 0.5;
  const a1 = 0.8;
  const i = lineal(b, a0, a1);
  // fase = integral de la velocidad (camina -> corre) para que no salte
  const integ = b < a0 ? 0 : b < a1 ? (b - a0) ** 2 / (2 * (a1 - a0)) : (a1 - a0) / 2 + (b - a1);
  const fase = b * 12 + integ * 22;
  const pctGrasa = Math.round(mix(60, 15, i));
  const cam = camara(
    [
      { b: 0, p: [3.2, 1.4, 7.4], l: [0, 0.85, 0], fov: 36 },
      { b: 1, p: [-2.6, 1.3, 7.2], l: [0, 0.85, 0], fov: 36 },
    ],
    b,
  );
  const alta = i > 0.5;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Humano fase={fase} marcha={mix(0.55, 1.7, i)} musculo={0.8} brilla={0.35} colorBrillo={alta ? CARBO : GRASA} />
        <Piso color={alta ? CARBO : GRASA} />
      </Escena3D>
      <div style={{ position: "absolute", left: 90, right: 90, top: 470, opacity: visible(b, 0.03, 1, 0.08) }}>
        <div style={{ display: "flex", height: 84, borderRadius: 42, overflow: "hidden", border: "4px solid rgba(255,255,255,0.35)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
          <div style={{ width: `${pctGrasa}%`, background: GRASA, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 46, color: "#061317" }}>
            {pctGrasa}%
          </div>
          <div style={{ flex: 1, background: CARBO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 46, color: "#fff" }}>
            {100 - pctGrasa}%
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: INTER, fontWeight: 900, fontSize: 32 }}>
          <span style={{ color: GRASA }}>GRASA</span>
          <span style={{ color: CARBO }}>CARBOHIDRATO</span>
        </div>
      </div>
      <Dato b={b} a={0.03} z={0.5} t="Grasa desde el inicio" sub="se oxida desde el minuto 0" color={GRASA} y={250} tam={84} />
      {!alta ? (
        <Dato b={b} a={0.5} z={1} t="Baja intensidad" sub="+ grasa" color={GRASA} y={250} tam={90} />
      ) : (
        <Dato b={b} a={0.65} z={1} t="Alta intensidad" sub="+ carbohidrato" color={CARBO} y={250} tam={90} />
      )}
      <Chip b={b} a={0.5} z={1} t={alta ? "CORRER RÁPIDO" : "CAMINAR"} x={540} y={1100} color={alta ? CARBO : GRASA} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 562, textAlign: "center", fontFamily: INTER, fontWeight: 700, fontSize: 24, color: K.suave, opacity: visible(b, 0.1, 1) }}>
        valores ilustrativos
      </div>
    </AbsoluteFill>
  );
};

// 6 · Grafica 0-60 min: la grasa sube poco a poco, sin interruptor ---------------------------
const grasaMin = (m: number) => 32 + 26 * (1 - Math.exp(-m / 28));

const Grafica: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const dibuja = entre(b, 0.06, 0.55);
  const tacha = entre(b, 0.68, 0.76);
  const cam = camara(
    [
      { b: 0, p: [0, 0.3, 9], l: [0, -0.6, 0], fov: 40 },
      { b: 1, p: [0.8, 0.3, 8], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  // area de la grafica (px)
  const X0 = 150;
  const X1 = 990;
  const Y0 = 1090; // 0 %
  const Y1 = 590; // 100 %
  const px = (m: number) => X0 + ((X1 - X0) * m) / 60;
  const py = (v: number) => Y0 - ((Y0 - Y1) * v) / 100;
  const mFin = 60 * dibuja;
  const pts = (f: (m: number) => number) =>
    Array.from({ length: 61 })
      .map((_, k) => k)
      .filter((m) => m <= mFin)
      .map((m) => `${px(m).toFixed(1)},${py(f(m)).toFixed(1)}`)
      .join(" ");
  const x30 = px(30);
  const op = visible(b, 0.02, 1, 0.06);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 20]} luz={0.6}>
        <group rotation={[0.2, b * 0.5, Math.PI / 2 - 0.2]} scale={0.7}>
          <MitocondriaGrande op={0.5} brillo={0.1} />
        </group>
        <Polvo b={b} radio={5} />
      </Escena3D>
      <AbsoluteFill style={{ background: "rgba(4,12,15,0.55)", opacity: op }} />
      <svg width={1080} height={1920} style={{ position: "absolute", opacity: op }}>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={py(v)} y2={py(v)} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
            <text x={X0 - 16} y={py(v) + 10} textAnchor="end" fontFamily={INTER} fontWeight={700} fontSize={28} fill={K.suave}>
              {v}%
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40, 50, 60].map((m) => (
          <text key={m} x={px(m)} y={Y0 + 44} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={30} fill={m === 30 ? K.rojo : K.suave}>
            {m}
          </text>
        ))}
        <text x={(X0 + X1) / 2} y={Y0 + 92} textAnchor="middle" fontFamily={INTER} fontWeight={800} fontSize={30} fill={K.tinta}>
          minutos de ejercicio
        </text>
        <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
        <line x1={x30} x2={x30} y1={Y0} y2={Y1 - 20} stroke={K.rojo} strokeWidth={4} strokeDasharray="14 12" opacity={visible(b, 0.55, 1)} />
        <polyline points={pts((m) => 100 - grasaMin(m))} fill="none" stroke={CARBO} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pts(grasaMin)} fill="none" stroke={GRASA} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        {dibuja > 0 ? <circle cx={px(mFin)} cy={py(grasaMin(mFin))} r={16} fill={GRASA} /> : null}
        {dibuja > 0.15 ? (
          <>
            <text x={px(mFin) - 10} y={py(grasaMin(mFin)) - 30} textAnchor="end" fontFamily={ANTON} fontSize={44} fill={GRASA}>
              GRASA
            </text>
            <text x={px(mFin) - 10} y={py(100 - grasaMin(mFin)) + 58} textAnchor="end" fontFamily={ANTON} fontSize={44} fill={CARBO}>
              CARBOHIDRATO
            </text>
          </>
        ) : null}
        {/* interruptor en el minuto 30, tachado */}
        <g opacity={visible(b, 0.58, 1)} transform={`translate(${x30}, ${Y1 - 60}) scale(1.35)`}>
          <rect x={-70} y={-36} width={140} height={72} rx={36} fill="rgba(4,14,17,0.9)" stroke={K.tinta} strokeWidth={5} />
          <circle cx={mix(-34, 34, entre(b, 0.6, 0.66))} cy={0} r={26} fill={K.tinta} />
          <line x1={-90 * tacha} y1={-60 * tacha} x2={90 * tacha} y2={60 * tacha} stroke={K.rojo} strokeWidth={14} strokeLinecap="round" />
          <line x1={-90 * tacha} y1={60 * tacha} x2={90 * tacha} y2={-60 * tacha} stroke={K.rojo} strokeWidth={14} strokeLinecap="round" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1185, textAlign: "center", fontFamily: INTER, fontWeight: 700, fontSize: 24, color: K.suave, opacity: op }}>
        esquema ilustrativo · intensidad moderada constante
      </div>
      <Dato b={b} a={0.04} z={0.62} t="Grasa ↑ poco a poco" sub="% de la energía que aporta" color={GRASA} y={250} tam={84} />
      <Dato b={b} a={0.66} z={1} t="Sin interruptor" sub="nada se “enciende” en el min 30" color={K.rojo} y={250} tam={96} />
    </AbsoluteFill>
  );
};

// 7 · Balance de energia del dia ---------------------------------------------------------
const Balance: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const inclina = Math.sin(b * 9) * 0.12 * (1 - entre(b, 0.45, 0.6)) + entre(b, 0.55, 0.8) * 0.9;
  const cam = camara(
    [
      { b: 0, p: [0.4, 0.6, 10.8], l: [0, -0.75, 0], fov: 38 },
      { b: 1, p: [-0.5, 0.5, 10.4], l: [0, -0.75, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Balanza
          inclina={inclina}
          izq={
            <>
              <Pechuga p={[-0.12, 0.08, 0]} escala={0.8} />
              <Huevo p={[0.25, 0.05, 0.15]} escala={0.8} />
            </>
          }
          der={
            <>
              <group scale={0.42}>
                <Humano fase={b * 20} marcha={0.7} musculo={0.8} brilla={0.4} colorBrillo={K.naranja} />
              </group>
              {[0, 1, 2].map((i) => {
                const f = (b * 2 + i / 3) % 1;
                return <MiniATP key={i} p={[0.3, 0.2 + f * 0.6, 0.1]} escala={1.3} op={1 - f} brillo={0.6} />;
              })}
            </>
          }
        />
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.0, 0.0 + 0.2 * inclina, 0], t: "Lo que comes", a: 0.12, z: 1, o: [20, 150], color: K.lima },
          { p: [1.0, 0.0 - 0.2 * inclina, 0], t: "Lo que gastas", a: 0.2, z: 1, o: [-20, 150], color: K.naranja },
        ]}
      />
      <Dato b={b} a={0.03} z={1} t="Balance de energía" sub="de todo el día" color={K.lima} y={250} tam={96} />
      <Chip b={b} a={0.6} z={1} t="LA SESIÓN = SOLO UNA PARTE" x={540} y={1100} color={K.naranja} />
    </AbsoluteFill>
  );
};

const T = [
  "¿Las grasas solo se empiezan a quemar después de **30 minutos** de ejercicio? **Falso**.",
  "Tus tres sistemas de energía trabajan **al mismo tiempo**, desde el primer segundo. A esto se le llama **continuum energético**.",
  "En los primeros segundos de un esfuerzo máximo domina la **fosfocreatina**.",
  "Si el esfuerzo sigue muy intenso hasta uno o dos minutos, toma el mando la **glucólisis**.",
  "Y a partir de ahí predomina el sistema **aeróbico**, que quema glucosa y **grasas** dentro de la mitocondria.",
  "La grasa se oxida **desde el inicio**. Lo que cambia es la **proporción**: a baja intensidad, más grasa; a alta intensidad, más carbohidrato.",
  "Conforme pasan los minutos, la grasa aporta un porcentaje mayor, pero **no hay un interruptor** que se encienda en el minuto 30.",
  "Y para perder grasa, lo que más cuenta es tu **balance de energía** de todo el día, no solo lo que quemas en la sesión.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Sistemas, Fosfocreatina, Glucolisis, Aerobico, Proporcion, Grafica, Balance, EscenaCierre];

export const CONTINUUM: ShortDef = {
  id: "Short-Continuum",
  titulo: "¿Las grasas se queman solo después de 30 minutos? El continuum energético",
  planos: ESCENAS.map((Escena, i) => ({ id: `continuum-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
