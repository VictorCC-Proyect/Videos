// Short: ¿Por qué tu amigo come de todo y no engorda? El NEAT (termogénesis por actividad sin ejercicio).
// Fuentes: Levine et al. 1999 (Science), Levine y Kotz 2005 (Acta Physiol Scand).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { rnd } from "../fisio/modelos/comun";
import { GotaLipido } from "../fisio/modelos/energia";
import { Humano } from "../fisio/modelos/cuerpo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Piso } from "./modelos";
import { Refresco } from "./modelos-glucosa";
import { Personita, Tache } from "./modelos-fructosa";
import { Semanas, Tarjeta3D } from "./modelos-ventana";
import { Barra3D, Celular, Rotulos } from "./modelos-sueno";
import { BalanzaPlatos, BarraApilada, Bloque, LlamaGasto, platilloBalanza, Reloj3D, Velocimetro } from "./modelos-ayunas";
import { Chispa } from "./modelos-agujetas";
import { camViaje, cortesViaje, Viaje } from "./viaje";
import {
  ADN,
  BASAL_C,
  EJER_C,
  Escalones,
  Hamburguesa,
  Huella,
  MesaLarga,
  NEAT_C,
  Pastel,
  PersonaGesto,
  PersonaSentada,
  Pizza,
  PlatoComida,
  Silla,
  SILLA_Z,
  TEF_C,
} from "./modelos-neat";

const GRASA = "#ffd34d";
const KCAL = K.naranja;

const Nota: React.FC<{ b: number; t: string; a?: number; y?: number }> = ({ b, t, a = 0.1, y = 1150 }) => (
  <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: INTER, fontWeight: 700, fontSize: 28, color: K.suave, opacity: visible(b, a, 1.2) }}>{t}</div>
);

// 0 · Gancho: el amigo come de todo en la mesa y sigue igual -----------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.4, 1.9, 7.4], l: [0, 0.42, 0], fov: 36 },
      { b: 0.5, p: [0.2, 1.75, 6.6], l: [-0.1, 0.47, 0], fov: 36 },
      { b: 1, p: [-0.4, 1.5, 5.0], l: [-0.42, 0.6, 0], fov: 36 },
    ],
    b,
  );
  const ciclo = b * 26;
  const come = 0.5 - 0.5 * Math.cos(ciclo);
  const mesaZ = 0.3;
  const top = 0.765;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <Silla p={[-0.55, 0, SILLA_Z]} color="#3c6670" />
        <Silla p={[0.55, 0, SILLA_Z]} color="#3c6670" />
        <group position={[-0.55, 0, 0]}>
          <PersonaSentada come={come} brilla={0.25} colorBrillo={K.lima} />
        </group>
        <group position={[0.55, 0, 0]}>
          <PersonaSentada gesto={0} />
        </group>
        <MesaLarga p={[0, 0, mesaZ]} ancho={2.1} />
        <Pizza p={[-0.6, top, mesaZ + 0.05]} escala={1.15} come={entre(b, 0.05, 0.9)} giro={0.4} />
        <Hamburguesa p={[-0.15, top, mesaZ + 0.18]} escala={1.1} giro={0.3} />
        <Pastel p={[0.18, top, mesaZ + 0.05]} escala={0.9} giro={1.1} />
        <Refresco p={[-0.95, top, mesaZ - 0.15]} escala={0.55} />
        <PlatoComida p={[0.6, top + 0.02, mesaZ + 0.05]} escala={0.75} cantidad={0.35} />
        <Piso color={K.lima} r={1.6} brillo={0.25} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [0.55, 1.62, 0], t: "¿?", a: 0.3, z: 1.2, color: K.amarillo, tam: 90, anton: true },
          { p: [-0.95, 1.2, 0.3], t: "+ kcal", a: 0.18, z: 1.2, color: KCAL, tam: 52, anton: true },
        ]}
      />
      <Etiquetas cam={cam} b={b} items={[{ p: [-0.55, 1.3, 0], t: "Tu amigo", a: 0.08, z: 1.2, o: [-30, -120], color: K.lima }]} />
      <Titular b={b} a={0.02} z={1.2} y={260} tam={124} t={<>¿Cómo <span style={{ color: K.amarillo }}>no engorda</span>?</>} />
      <Chip b={b} a={0.5} z={1.2} t="ETIQUÉTALO 👇" x={540} y={1100} color={K.rosa} />
    </AbsoluteFill>
  );
};

// 1 · Gasto diario apilado: basal, digestion, ejercicio y NEAT ---------------------------
const Gasto: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.35, 1.3, 6.9], l: [0.45, 0.55, 0], fov: 36 },
      { b: 1, p: [0.75, 1.2, 6.3], l: [0.55, 0.58, 0], fov: 36 },
    ],
    b,
  );
  const X = 0.45;
  const basal = 0.95 * entre(b, 0.2, 0.36);
  const tef = 0.15 * entre(b, 0.4, 0.5);
  const ejer = 0.13 * entre(b, 0.5, 0.6);
  const neatOn = entre(b, 0.82, 0.92);
  const neat = (0.25 + 0.025 * Math.sin(b * 40)) * neatOn;
  const y0 = 0.08;
  const yc = (a: number, h: number) => y0 + a + h / 2;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[-0.35, 0, 0]}>
          <Atleta ej="parado" brilla={0.15 + 0.35 * neatOn} colorBrillo={NEAT_C} />
          <Piso r={0.55} />
        </group>
        <BarraApilada
          p={[X, 0, 0]}
          r={0.27}
          alto={1.6}
          segs={[
            { v: basal, color: BASAL_C },
            { v: tef, color: TEF_C },
            { v: ejer, color: EJER_C },
            { v: neat, color: NEAT_C },
          ]}
        />
        {neatOn > 0.01 ? (
          <mesh position={[X, yc(1.23, 0.25), 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.3, 32]} />
            <meshBasicMaterial color={NEAT_C} transparent opacity={0.18 * neatOn * (0.7 + 0.3 * Math.sin(b * 30))} depthWrite={false} />
          </mesh>
        ) : null}
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [X + 0.4, yc(0, 0.95), 0], t: "Metabolismo basal", a: 0.24, z: 1.2, color: BASAL_C, ancla: "izq", tam: 38 },
          { p: [X + 0.4, yc(0, 0.95) - 0.14, 0], t: "≈ 60–70 %", a: 0.3, z: 1.2, color: K.tinta, ancla: "izq", tam: 32 },
          { p: [X + 0.4, yc(0.95, 0.15), 0], t: "Digestión ≈ 10 %", a: 0.44, z: 1.2, color: TEF_C, ancla: "izq", tam: 36 },
          { p: [X + 0.4, yc(1.1, 0.13), 0], t: "Ejercicio", a: 0.54, z: 1.2, color: EJER_C, ancla: "izq", tam: 36 },
          { p: [X + 0.4, yc(1.23, 0.25) + 0.05, 0], t: "NEAT ?", a: 0.84, z: 1.2, color: NEAT_C, ancla: "izq", tam: 64, anton: true },
        ]}
      />
      <Titular b={b} a={0.02} z={0.84} y={260} tam={104} t={<>Tu gasto <span style={{ color: K.amarillo }}>diario</span></>} />
      <Dato b={b} a={0.86} z={1.2} t="NEAT" sub="la parte que casi nadie conoce" y={260} />
    </AbsoluteFill>
  );
};

// 2 · NEAT en accion: caminar, de pie, escaleras, gesticular, mover la pierna ---------------
const SEP = 1.75;
const ACC = [
  { t: "CAMINAR", b: 0.43 },
  { t: "ESTAR DE PIE", b: 0.5 },
  { t: "ESCALERAS", b: 0.58 },
  { t: "GESTICULAR", b: 0.7 },
  { t: "MOVER LA PIERNA", b: 0.8 },
];

const Accion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const k = (x: number, bb: number) => ({ b: bb, p: [x + 0.4, 1.4, 6.0] as V3, l: [x, 0.5, 0] as V3, fov: 36 });
  const cam = camara(
    [
      { b: 0, p: [0.9, 1.6, 6.6], l: [0, 0.5, 0], fov: 36 },
      k(0, 0.4),
      k(SEP, 0.47),
      k(SEP, 0.53),
      { b: 0.57, p: [SEP * 2 + 0.7, 1.6, 6.9], l: [SEP * 2 + 0.3, 0.75, 0], fov: 36 },
      { b: 0.65, p: [SEP * 2 + 0.7, 1.6, 6.9], l: [SEP * 2 + 0.3, 0.75, 0], fov: 36 },
      k(SEP * 3, 0.69),
      k(SEP * 3, 0.75),
      k(SEP * 4, 0.79),
      { b: 1, p: [SEP * 4 + 0.6, 1.3, 5.4], l: [SEP * 4, 0.45, 0], fov: 36 },
    ],
    b,
  );
  const f = b * 45;
  const on = ACC.map((a) => entre(b, a.b - 0.02, a.b + 0.04));
  const x0 = SEP * 2 - 0.5;
  const sube = lineal(b, 0.55, 0.7);
  const px = mix(x0 - 0.2, x0 + 1.1, sube);
  const py = Math.min(4, Math.max(0, (px - x0 + 0.12) / 0.32)) * 0.18;
  const llamas: V3[] = [
    [0.45, 1.2, 0.2],
    [SEP + 0.45, 1.2, 0.2],
    [px + 0.45, py + 1.2, 0.2],
    [SEP * 3 + 0.55, 1.2, 0.2],
    [SEP * 4 + 0.45, 1.0, 0.2],
  ];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {/* caminar */}
        <group rotation={[0, Math.PI / 2, 0]}>
          <Humano fase={f * 0.6} marcha={0.85} musculo={0.8} brilla={0.35 * on[0]} colorBrillo={NEAT_C} />
        </group>
        <group rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
          {[0, 1, 2, 3].map((i) => (
            <Huella key={i} p={[(i % 2 ? 0.1 : -0.1), -0.45 - i * 0.32, 0.01]} lado={i % 2 ? 1 : -1} escala={0.8} op={0.5} />
          ))}
        </group>
        <Piso r={0.7} />
        {/* de pie */}
        <group position={[SEP, 0, 0]}>
          <Silla p={[0, 0, SILLA_Z]} />
          <PersonaSentada levanta={entre(b, 0.46, 0.53)} brilla={0.35 * on[1]} colorBrillo={NEAT_C} />
          <Piso r={0.7} />
        </group>
        {/* escaleras */}
        <Escalones p={[x0, 0, 0]} n={4} />
        <group position={[px, py, 0]} rotation={[0, Math.PI / 2, 0]} visible={b > 0.52}>
          <Humano fase={b > 0.55 && b < 0.7 ? f * 0.6 : 0} marcha={0.85} musculo={0.8} brilla={0.35 * on[2]} colorBrillo={NEAT_C} />
        </group>
        {/* gesticular */}
        <group position={[SEP * 3, 0, 0]}>
          <PersonaGesto fase={f * 0.5} gesto={mix(0.15, 1, on[3])} brilla={0.35 * on[3]} colorBrillo={NEAT_C} />
          <Piso r={0.7} />
        </group>
        {/* mover la pierna */}
        <group position={[SEP * 4, 0, 0]}>
          <Silla p={[0, 0, SILLA_Z]} />
          <PersonaSentada pierna={on[4]} fase={b * 90} brilla={0.35 * on[4]} colorBrillo={NEAT_C} />
          <Piso r={0.7} />
        </group>
        {llamas.map((q, i) => (on[i] > 0.01 ? <LlamaGasto key={i} p={q} escala={0.45 * on[i]} b={b + i} /> : null))}
      </Escena3D>
      <Rotulos cam={cam} b={b} items={llamas.map((q, i) => ({ p: [q[0] + 0.05, q[1] - 0.12, q[2]] as V3, t: "+kcal", a: ACC[i].b, z: 1.2, color: KCAL, tam: 44, anton: true }))} />
      <Dato b={b} a={0.03} z={1.2} t="NEAT" sub="moverte sin hacer ejercicio" y={260} />
      {ACC.map((a, i) => (
        <Chip key={a.t} b={b} a={a.b} z={i < ACC.length - 1 ? ACC[i + 1].b : 1.2} t={a.t} x={540} y={1100} color={NEAT_C} />
      ))}
    </AbsoluteFill>
  );
};

// 3 · Dos personas del mismo tamano: quieta vs inquieta; barras de NEAT --------------------
const DosPersonas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.0, 1.4, 7.6], l: [0.08, 0.5, 0], fov: 36 },
      { b: 1, p: [0.3, 1.3, 7.1], l: [0.08, 0.5, 0], fov: 36 },
    ],
    b,
  );
  const f = b * 40;
  const crece = entre(b, 0.5, 0.82);
  const vL = 0.12;
  const vR = mix(0.12, 1, crece);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[-0.85, 0, 0]}>
          <Silla p={[0, 0, SILLA_Z]} />
          <PersonaSentada />
          <Piso r={0.62} color={K.suave} brillo={0.2} />
        </group>
        <group position={[-0.22, 0, 0.1]}>
          <Barra3D valor={vL} color={K.cian} alto={1.3} r={0.15} />
        </group>
        <group position={[0.4, 0, 0]}>
          <PersonaGesto fase={f} gesto={0.4 + 0.6 * entre(b, 0.3, 0.5)} brilla={0.4 * crece} colorBrillo={NEAT_C} />
          <Piso r={0.62} />
        </group>
        <group position={[1.03, 0, 0.1]}>
          <Barra3D valor={vR} color={NEAT_C} alto={1.3} r={0.15} />
        </group>
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-0.22, 0.38, 0.1], t: "NEAT", a: 0.2, z: 1.2, color: K.cian, tam: 28 },
          { p: [1.03, 0.08 + 1.3 * vR + 0.18, 0.1], t: "NEAT", a: 0.2, z: 1.2, color: NEAT_C, tam: 28 },
        ]}
      />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.85, 1.3, 0], t: "Quieto", a: 0.18, z: 1.2, o: [30, -150], color: K.cian },
          { p: [0.4, 1.4, 0], t: "Inquieto", a: 0.3, z: 1.2, o: [40, -170], color: NEAT_C },
        ]}
      />
      <Titular b={b} a={0.02} z={0.7} y={260} tam={104} t={<>Mismo <span style={{ color: K.amarillo }}>tamaño</span></>} />
      <Dato b={b} a={0.72} z={1.2} t="Hasta 2000 kcal/día" sub="de diferencia en NEAT" y={260} tam={80} />
      <Nota b={b} a={0.74} t="Levine y Kotz 2005" y={1150} />
    </AbsoluteFill>
  );
};

// 4 · El estudio: 16 personas, +1000 kcal/dia, 8 semanas -----------------------------------
const PIEL = ["#f1c9a5", "#d9a77c", "#b07a52", "#8a5a3a", "#f3d6bf"];
const ROPA = [K.cian, K.lima, K.naranja, K.rosa, K.morado, K.amarillo, "#5fd3a8", "#e8eef0"];
const posPersona = (i: number): V3 => [((i % 8) - 3.5) * 0.3, 0, i < 8 ? -0.25 : 0.3];

const Estudio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.2, 2.0, 5.8], l: [0, 0.25, 0], fov: 38 },
      { b: 1, p: [-0.15, 2.1, 5.2], l: [0, 0.3, 0], fov: 38 },
    ],
    b,
  );
  const aparece = entre(b, 0.15, 0.4);
  const semanas = lineal(b, 0.72, 0.98);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {Array.from({ length: 16 }).map((_, i) => {
          const k = entre(aparece * 16, i, i + 1);
          if (k <= 0) return null;
          const q = posPersona(i);
          const cae = entre(b, 0.44 + i * 0.008, 0.52 + i * 0.008);
          return (
            <group key={i}>
              <Personita p={q} escala={1.5 * k} ropa={ROPA[i % ROPA.length]} piel={PIEL[i % PIEL.length]} brillo={0.15 * cae} />
              {cae > 0 ? <Hamburguesa p={[q[0], 0.55 + (1 - cae) * 1.2, q[2] + 0.02]} escala={0.32} giro={i} /> : null}
            </group>
          );
        })}
        <group position={[0, 1.0, -1.0]} scale={1.1}>
          <Semanas n={8} marca={semanas} color={K.lima} />
        </group>
        <Piso r={1.4} brillo={0.2} />
      </Escena3D>
      <Rotulos cam={cam} b={b} items={[{ p: [0, 1.42, -1.0], t: "8 semanas", a: 0.72, z: 1.2, color: K.tinta, tam: 36 }]} />
      <Chip b={b} a={0.2} z={1.2} t="16 PERSONAS" x={540} y={1090} color={K.cian} />
      <Dato b={b} a={0.46} z={1.2} t="+1000 kcal/día" sub="extra, cada día" y={260} color={KCAL} />
      <Nota b={b} a={0.2} t="Levine et al. 1999 · Science" y={1150} />
    </AbsoluteFill>
  );
};

// 5 · Resultados: grasa ganada vs aumento de NEAT (16 personas, ordenadas por NEAT) ---------
const N16 = Array.from({ length: 16 }).map((_, i) => {
  const k = i / 15;
  const neat = 0.08 + 0.92 * k + (rnd(`n${i}`) - 0.5) * 0.12;
  const grasa = i === 0 ? 1 : i === 15 ? 0.1 : Math.max(0.12, 1 - 0.88 * k + (rnd(`g${i}`) - 0.5) * 0.18);
  return { neat: Math.max(0.05, Math.min(1, neat)), grasa };
});

const Resultados: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.65, 6.4], l: [0, 0.33, 0], fov: 36 },
      { b: 1, p: [0.2, 0.62, 6.1], l: [0, 0.33, 0], fov: 36 },
    ],
    b,
  );
  const SX = 0.13;
  const BASE_G = 0.72;
  const HG = 0.65;
  const HN = 0.5;
  const cG = entre(b, 0.04, 0.28);
  const cN = entre(b, 0.5, 0.72);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {[0, BASE_G].map((y) => (
          <mesh key={y} position={[0, y - 0.015, 0]}>
            <boxGeometry args={[16 * SX + 0.2, 0.03, 0.3]} />
            <meshStandardMaterial color="#2b3f45" />
          </mesh>
        ))}
        {N16.map((d, i) => {
          const x = (i - 7.5) * SX;
          const hg = HG * d.grasa * entre(cG * 16, i * 0.5, i * 0.5 + 8);
          const hn = HN * d.neat * cN;
          const ext = i === 0 || i === 15;
          return (
            <group key={i} position={[x, 0, 0]}>
              <group position={[0, BASE_G, 0]}>
                <Bloque p={[0, 0, 0]} tam={[0.1, Math.max(0.005, hg), 0.1]} color={GRASA} op={ext || b < 0.4 ? 1 : 0.85} />
              </group>
              <Bloque p={[0, 0, 0]} tam={[0.1, Math.max(0.005, hn), 0.1]} color={NEAT_C} />
            </group>
          );
        })}
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [4.5 * SX, BASE_G + HG * 0.66, 0], t: "Grasa ganada", a: 0.05, z: 1.2, color: GRASA, tam: 34 },
          { p: [-7.5 * SX, BASE_G + HG * N16[0].grasa + 0.06, 0], t: "▼", a: 0.2, z: 1.2, color: K.tinta, tam: 26 },
          { p: [7.5 * SX, BASE_G + HG * 0.1 + 0.06, 0], t: "▼", a: 0.2, z: 1.2, color: K.tinta, tam: 26 },
          { p: [4.5 * SX, BASE_G + HG * 0.43, 0], t: "×10", a: 0.24, z: 1.2, color: GRASA, tam: 64, anton: true },
          { p: [-7.5 * SX - 0.08, HN + 0.1, 0], t: "Aumento de NEAT", a: 0.5, z: 1.2, color: NEAT_C, ancla: "izq", tam: 34 },
        ]}
      />
      <Dato b={b} a={0.22} z={1.2} t="10 veces más grasa" sub="con las mismas calorías extra" y={260} tam={84} color={GRASA} />
      <Chip b={b} a={0.5} z={1.2} t="LA DIFERENCIA: NEAT" x={540} y={1090} color={NEAT_C} />
      <Nota b={b} a={0.05} t="Levine et al. 1999 · Science · ilustrativo" y={1160} />
    </AbsoluteFill>
  );
};

// 6 · El cuerpo enciende el NEAT: inquietud que quema el exceso; zoom al musculo ------------
const MITOS: V3[] = [
  [-1.0, 1.6, -0.4],
  [1.1, -1.4, -0.3],
];

const Inquietud: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const corte = 0.64;
  const fuera = b < corte;
  const t = lineal(b, corte, 0.97);
  const camF = camara(
    [
      { b: 0, p: [0.8, 1.4, 6.0], l: [0.1, 0.5, 0], fov: 36 },
      { b: corte, p: [0.6, 1.2, 6.6], l: [0, 0.6, 0], fov: 36 },
    ],
    b,
  );
  const cam = fuera ? camF : camViaje(t);
  const f = b * 70;
  const levanta = entre(b, 0.5, 0.62);
  const quema = entre(b, 0.08, 0.6);
  const LL: V3 = [0.95, 1.05, 0];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={t > 0.72 ? [10, 34] : undefined}>
        {fuera ? (
          <>
            <Silla p={[0, 0, SILLA_Z]} />
            <PersonaSentada levanta={levanta} pierna={1 - levanta} gesto={0.5 * (1 - levanta)} fase={f} brilla={0.2 + 0.4 * quema} colorBrillo={NEAT_C} />
            <Piso r={0.7} />
            <LlamaGasto p={LL} escala={0.6 + 0.5 * quema} b={b} />
            <Velocimetro p={[-0.85, 1.15, 0]} nivel={0.2 + 0.7 * quema} r={0.3} />
            {Array.from({ length: 8 }).map((_, i) => {
              const u = entre(b, 0.08 + i * 0.06, 0.2 + i * 0.06);
              if (u >= 1) return null;
              const ini: V3 = [0.75 + (i % 3) * 0.18, 0.08 + Math.floor(i / 3) * 0.16, 0.25];
              const q = mix3(ini, [LL[0], LL[1] + 0.15, 0], u);
              return <Bloque key={i} p={q} tam={[0.13 * (1 - u * 0.8), 0.13 * (1 - u * 0.8), 0.13 * (1 - u * 0.8)]} color={KCAL} />;
            })}
          </>
        ) : (
          <>
            <Viaje t={t} b={b} ej="parado" colorBrillo={NEAT_C} interior={{ pcr: 4, atp: 12 * entre(b, 0.86, 0.98), brillo: 0.5 }} />
            {t > 0.72
              ? Array.from({ length: 8 }).map((_, i) => {
                  const m = MITOS[i % 2];
                  const u = (b * 2.2 + i / 8) % 1;
                  const ini: V3 = [m[0] + (rnd(`lx${i}`) - 0.5) * 3, m[1] + (rnd(`ly${i}`) > 0.5 ? 1.6 : -1.6), 0.7];
                  return <GotaLipido key={i} p={mix3(ini, m, u)} r={0.22 * (1 - 0.8 * u)} op={1 - u * 0.6} />;
                })
              : null}
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[corte, ...cortesViaje(corte, 0.97)]} />
      {fuera ? (
        <>
          <Rotulos
            cam={cam}
            b={b}
            items={[
              { p: [0.95, 0.2, 0.25], t: "exceso", a: 0.06, z: 0.5, color: KCAL, tam: 32 },
              { p: [-0.85, 1.65, 0], t: "gasto", a: 0.1, z: corte, color: K.tinta, tam: 30 },
            ]}
          />
          <Chip b={b} a={0.3} z={corte} t="INQUIETUD = ENERGÍA" x={540} y={1100} color={NEAT_C} />
        </>
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={
            t > 0.72
              ? [
                  { p: MITOS[0], t: "Mitocondria", a: 0.86, z: 1.2, o: [60, -120], color: K.naranja },
                  { p: [MITOS[1][0], MITOS[1][1] + 0.9, 0.7], t: "Grasa → energía", a: 0.88, z: 1.2, o: [-60, 130], color: GRASA },
                ]
              : []
          }
        />
      )}
      {!fuera && t < 0.72 ? <Chip b={b} a={corte} z={0.88} t="MÚSCULO EN MOVIMIENTO" x={540} y={470} color={K.rojo} /> : null}
      <Titular b={b} a={0.02} z={corte} y={260} tam={100} t={<>Quema el <span style={{ color: KCAL }}>exceso</span></>} />
    </AbsoluteFill>
  );
};

// 7 · Lo que no ves: fiesta, cena saltada, dia siguiente; la balanza se equilibra ------------
const NoVes: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.25, 7.0], l: [0, 0.72, 0], fov: 36 },
      { b: 1, p: [0.3, 1.2, 6.6], l: [0, 0.72, 0], fov: 36 },
    ],
    b,
  );
  const fiesta = entre(b, 0.44, 0.52);
  const cena = entre(b, 0.66, 0.74);
  const dia2 = entre(b, 0.86, 0.94);
  const ang = -0.28 * fiesta + 0.14 * cena + 0.14 * dia2;
  const ES = 0.5;
  const YT = 1.62;
  const pl = (s: number) => {
    const q = platilloBalanza(s, ang);
    return [q[0] * ES, q[1] * ES, q[2] * ES] as V3;
  };
  const dias: { x: number; on: number; t: string }[] = [
    { x: -0.82, on: fiesta, t: "Fiesta" },
    { x: 0, on: cena, t: "Cena" },
    { x: 0.82, on: dia2, t: "Día siguiente" },
  ];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {/* linea de tiempo */}
        <mesh position={[0, YT - 0.02, 0]}>
          <boxGeometry args={[2.1, 0.025, 0.025]} />
          <meshStandardMaterial color={K.cian} emissive={K.cian} emissiveIntensity={0.5} />
        </mesh>
        {dias.map((d) => (
          <group key={d.t} position={[d.x, YT, 0]} scale={0.4 + 0.6 * d.on}>
            <mesh position={[0, -0.02, 0]}>
              <sphereGeometry args={[0.05, 14, 10]} />
              <meshBasicMaterial color={K.cian} />
            </mesh>
          </group>
        ))}
        <group position={[-0.82, YT + 0.08, 0]} rotation={[0.55, 0, 0]} scale={fiesta}>
          <PlatoComida p={[0, 0, 0]} cantidad={1} escala={0.85} />
          <Pizza p={[-0.12, 0.03, -0.06]} escala={0.5} />
          <Hamburguesa p={[0.14, 0.03, 0.06]} escala={0.5} />
        </group>
        <group position={[0, YT + 0.08, 0]} rotation={[0.55, 0, 0]} scale={cena}>
          <PlatoComida p={[0, 0, 0]} cantidad={0} escala={0.85} />
        </group>
        {cena > 0.5 ? <Tache p={[0, YT + 0.2, 0.2]} escala={0.45} op={entre(b, 0.7, 0.76)} /> : null}
        <group position={[0.82, YT + 0.08, 0]} rotation={[0.55, 0, 0]} scale={dia2}>
          <PlatoComida p={[0, 0, 0]} cantidad={0.25} escala={0.6} />
        </group>
        {/* balanza */}
        <group scale={ES}>
          <BalanzaPlatos
            ang={ang}
            izq={fiesta > 0.01 ? <Bloque p={[0, 0, 0]} tam={[0.55 * fiesta, 0.45 * fiesta, 0.4]} color={KCAL} /> : null}
            der={
              <>
                {cena > 0.01 ? <Bloque p={[-0.16, 0, 0]} tam={[0.26, 0.22 * cena, 0.36]} color={K.cian} /> : null}
                {dia2 > 0.01 ? <Bloque p={[0.16, 0, 0]} tam={[0.26, 0.22 * dia2, 0.36]} color={K.cian} /> : null}
              </>
            }
          />
        </group>
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          ...dias.map((d, i) => ({ p: [d.x, YT - 0.2, 0] as V3, t: d.t, a: [0.44, 0.66, 0.86][i], z: 1.2, color: K.tinta, tam: 30 })),
          { p: [pl(-1)[0] - 0.3, pl(-1)[1] - 0.16, 0.3], t: "come de más", a: 0.48, z: 1.2, color: KCAL, tam: 30, ancla: "izq" },
          { p: [pl(1)[0] + 0.3, pl(1)[1] - 0.16, 0.3], t: "come menos", a: 0.7, z: 1.2, color: K.cian, tam: 30, ancla: "der" },
          { p: [0, 2.1 * ES + 0.2, 0.3], t: "=", a: 0.94, z: 1.2, color: K.lima, tam: 80, anton: true },
        ]}
      />
      <Titular b={b} a={0.02} z={1.2} y={260} tam={96} t={<>¿Come <span style={{ color: K.amarillo }}>tanto</span>?</>} />
      <Chip b={b} a={0.68} z={1.2} t="LO QUE NO VES" x={540} y={1100} color={K.rosa} />
    </AbsoluteFill>
  );
};

// 8 · Genetica: ADN entre una persona tranquila y una con "chispa" de movimiento ------------
const Genetica: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.2, 7.0], l: [0, 0.55, 0], fov: 38 },
      { b: 1, p: [0.25, 1.15, 6.6], l: [0, 0.55, 0], fov: 38 },
    ],
    b,
  );
  const f = b * 40;
  const chispa = entre(b, 0.45, 0.65);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[0, 1.15, -0.2]}>
          <ADN alto={2.0} r={0.26} giro={b * 5} brillo={0.4 + 0.3 * entre(b, 0.1, 0.3)} />
        </group>
        <group position={[-0.78, 0, 0.1]}>
          <Atleta ej="parado" musculo={0.8} />
          <Piso r={0.5} color={K.cian} brillo={0.25} />
        </group>
        <group position={[0.78, 0, 0.1]}>
          <PersonaGesto fase={f} gesto={0.3 + 0.7 * chispa} brilla={0.45 * chispa} colorBrillo={NEAT_C} />
          <Piso r={0.5} />
        </group>
        {[0, 1, 2, 3, 4].map((i) => {
          const u = (b * 3 + i / 5) % 1;
          return (
            <Chispa
              key={i}
              p={[0.78 + Math.cos(i * 2.3) * 0.4, 0.5 + i * 0.28, 0.3]}
              escala={0.13 * chispa * (1 - u)}
              op={chispa * (1 - u)}
              color={K.lima}
            />
          );
        })}
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-0.78, 0.15, 0.5], t: "se mueve poco", a: 0.4, z: 1.2, color: K.cian, tam: 30 },
          { p: [0.78, 0.15, 0.5], t: "se mueve más", a: 0.5, z: 1.2, color: NEAT_C, tam: 30 },
        ]}
      />
      <Dato b={b} a={0.1} z={1.2} t="Genética" sub="movimiento espontáneo" y={260} color={K.cian} />
    </AbsoluteFill>
  );
};

// 9 · Consejos: cuatro tarjetas 3D ---------------------------------------------------------
const TIPS: { x: number; y: number; t: string; a: number; col: string }[] = [
  { x: -0.5, y: 1.25, t: "Camina más", a: 0.36, col: K.lima },
  { x: 0.5, y: 1.25, t: "Escaleras", a: 0.52, col: K.cian },
  { x: -0.5, y: 0.32, t: "Levántate cada hora", a: 0.68, col: K.amarillo },
  { x: 0.5, y: 0.32, t: "Llamadas de pie", a: 0.84, col: K.rosa },
];

const Consejos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.6, 7.0], l: [0, 0.42, 0], fov: 36 },
      { b: 1, p: [-0.2, 0.55, 6.6], l: [0, 0.42, 0], fov: 36 },
    ],
    b,
  );
  const s = TIPS.map((q) => entre(b, q.a - 0.03, q.a + 0.05));
  const paso = Math.floor(b * 14) % 2;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {TIPS.map((q, i) => (
          <group key={i} position={[q.x, q.y, 0]} scale={s[i]} rotation={[0, 0.25 * (1 - s[i]) + 0.08 * Math.sin(b * 6 + i), 0]}>
            <Tarjeta3D ancho={0.88} alto={0.82} color={q.col} brillo={0.7} />
          </group>
        ))}
        {/* pasos */}
        <group position={[TIPS[0].x, TIPS[0].y + 0.05, 0.05]} scale={s[0]}>
          <Huella p={[-0.1, -0.12 + (paso ? 0.08 : 0), 0]} lado={-1} escala={0.9} op={paso ? 1 : 0.5} />
          <Huella p={[0.1, 0.02 + (paso ? 0 : 0.08), 0]} lado={1} escala={0.9} op={paso ? 0.5 : 1} />
        </group>
        {/* escaleras */}
        <group position={[TIPS[1].x - 0.28, TIPS[1].y - 0.28, 0.0]} scale={s[1] * 0.8}>
          <Escalones p={[0, 0, 0]} n={4} h={0.15} d={0.17} ancho={0.3} color="#5c7d85" />
        </group>
        {/* reloj */}
        <group scale={s[2]} position={[TIPS[2].x, TIPS[2].y + 0.04, 0.02]}>
          <Reloj3D p={[0, 0, 0]} r={0.26} hora={8 + b * 6} color={K.amarillo} />
        </group>
        {/* telefono */}
        <group position={[TIPS[3].x, TIPS[3].y + 0.04, 0.05]} scale={s[3] * 1.5} rotation={[0, 0, 0.15 * Math.sin(b * 10)]}>
          <Celular brillo={0.6} />
        </group>
      </Escena3D>
      <Rotulos cam={cam} b={b} items={TIPS.map((q) => ({ p: [q.x, q.y - 0.32, 0.05] as V3, t: q.t, a: q.a, z: 1.2, color: q.col, tam: 30 }))} />
      <Dato b={b} a={0.08} z={1.2} t="Aumenta tu NEAT" sub="sin ir al gimnasio" y={260} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Eres <span style={{ color: K.lima }}>ese amigo</span>?</>}
    escribe="@"
    ideas={["YO SOY ESE AMIGO", "ENGORDO CON VERLA", "TENGO UNO 👇"]}
  />
);

const T = [
  "Todos tenemos ese amigo que come de todo y no engorda. **Etiquétalo**, porque hoy te explico su secreto.",
  "Tu gasto de energía del día tiene varias partes: el **metabolismo basal**, la digestión, el ejercicio, y una que casi nadie conoce: el **NEAT**.",
  "El NEAT es la energía que gastas moviéndote **sin hacer ejercicio**: caminar, estar de pie, subir escaleras, gesticular, hasta mover la pierna.",
  "Y aquí viene lo sorprendente: entre dos personas de tamaño parecido, el NEAT puede variar hasta **dos mil calorías** al día.",
  "En un estudio famoso, dieciséis personas comieron **mil calorías extra** al día durante ocho semanas.",
  "Algunas subieron **diez veces** más grasa que otras. ¿La diferencia? El **NEAT**: varios, sin darse cuenta, empezaron a moverse mucho más.",
  "Su cuerpo encendía el NEAT para quemar el exceso: más movimientos pequeños, más tiempo de pie, más **inquietud**.",
  "Además, muchas veces ese amigo no come tanto como crees: lo ves en la fiesta, pero no lo ves saltarse la cena o comer poco al día siguiente.",
  "Y la **genética** también influye en cuánto se mueve cada quien de forma espontánea.",
  "La buena noticia: el NEAT se puede **aumentar**. Camina más, usa las escaleras, levántate cada hora y haz tus llamadas de pie.",
  "¿Tú eres ese amigo, o engordas con solo ver la comida? **Escríbelo en los comentarios** y etiqueta a ese amigo.",
];

const ESCENAS = [Gancho, Gasto, Accion, DosPersonas, Estudio, Resultados, Inquietud, NoVes, Genetica, Consejos, Final];

export const NEAT: ShortDef = {
  id: "Short-Neat",
  titulo: "¿Por qué tu amigo come de todo y no engorda?",
  planos: ESCENAS.map((Escena, i) => ({ id: `neat-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
