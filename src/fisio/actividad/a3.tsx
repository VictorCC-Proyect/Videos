import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, PlanoDef, useBeat } from "../motor";
import { Humano } from "../modelos/cuerpo";
import { Polvo } from "../modelos/comun";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Rico, Tarjeta, TituloGrande } from "../ui";
import { COL_A, FiguraIzq, Fondo } from "./a1";

const SEC = "4.3 Carga-volumen";
const COL = { vol: "#3fb6e0", int: "#ff6b6b", den: "#c25bff", fre: "#7cff8a", dur: "#ffcf5a" };

// ---- Carga externa e interna ------------------------------------------------------

const Carga: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.1, 4.6], l: [0, 0.9, 0], fov: 36 },
      { b: 2, p: [0.6, 1.1, 4.2], l: [0, 0.9, 0], fov: 36 },
    ],
    b,
  );
  const flex = (Math.sin(b * 7) + 1) / 2;
  const pose = {
    caderaD: [-flex * 1.3, 0, 0] as [number, number, number],
    caderaI: [-flex * 1.3, 0, 0] as [number, number, number],
    rodillaD: flex * 1.9,
    rodillaI: flex * 1.9,
    hombroD: [-1.4, 0, 0.1] as [number, number, number],
    hombroI: [-1.4, 0, -0.1] as [number, number, number],
    codoD: 0,
    codoI: 0,
  };
  const cansado = b >= 2;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[-0.65, -flex * 0.32, 0]} rotation={[0, 0.5, 0]}>
          <Humano musculo={0.55} pose={pose} brilla={0.3} colorBrillo={COL_A.ej} />
        </group>
        <group position={[0.65, -flex * 0.32, 0]} rotation={[0, -0.5, 0]}>
          <Humano musculo={0.55} pose={pose} brilla={cansado ? 0.6 + 0.3 * Math.sin(b * 9) : 0.3} colorBrillo={cansado ? COL_A.rojo : COL_A.ej} />
        </group>
        <Polvo b={b} radio={3} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.65, 1.2, 0], t: "Entrenado · FC 130 · RPE 4", a: 2, z: 3, o: [-160, -40], color: COL_A.ej },
          { p: [0.65, 1.2, 0], t: "Principiante · FC 175 · RPE 8", a: 2.1, z: 3, o: [160, -40], color: COL_A.rojo },
        ]}
      />
      <Tarjeta b={b} a={0} z={1} x={420} y={130} w={1080} titulo="Carga de entrenamiento" color={C.acento2} tam={30}>
        <Rico t="**Conjunto de estímulos** que se aplican al organismo para provocar **adaptaciones**." />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={2} x={60} y={140} w={560} titulo="Carga externa" color={C.acento} tam={27}>
        <Lista items={["El **trabajo realizado**", "Se mide **fuera** del cuerpo", "km, kg, repeticiones, velocidad, vatios"]} color={C.acento} />
      </Tarjeta>
      <Tarjeta b={b} a={1.5} z={2} x={1300} y={140} w={560} titulo="Carga interna" color={COL_A.rojo} tam={27}>
        <Lista items={["La **respuesta del organismo**", "FC, lactato, RPE", "Misma carga externa → **distinta interna**"]} color={COL_A.rojo} />
      </Tarjeta>
      {b >= 2 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: FUENTE, fontSize: 34, fontWeight: 800, color: C.texto, opacity: entre(b, 2, 2.2) }}>
          Ambos: <span style={{ color: C.acento }}>4 × 10 sentadillas con 40 kg</span> (misma carga externa)
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---- Componentes de la carga --------------------------------------------------------

const COMP = [
  { n: "Volumen", q: "¿Cuánto?", t: "Cantidad total de trabajo: km, minutos, series × repeticiones, tonelaje", c: COL.vol, a: 0 },
  { n: "Intensidad", q: "¿Qué tan duro?", t: "Calidad del esfuerzo: % FCmáx, % 1RM, RPE, velocidad", c: COL.int, a: 0.45 },
  { n: "Densidad", q: "¿Cuánto descanso?", t: "Relación trabajo : descanso (ej. 1:2) dentro de la sesión", c: COL.den, a: 1 },
  { n: "Frecuencia", q: "¿Cada cuánto?", t: "Número de sesiones por semana", c: COL.fre, a: 1.35 },
  { n: "Duración", q: "¿Cuánto tiempo?", t: "Tiempo de cada sesión o de cada estímulo", c: COL.dur, a: 1.65 },
];

const Componentes: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, right: 90, top: 130, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 20 }}>Componentes de la carga</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
          {COMP.map((k) => {
            const op = entre(b, k.a, k.a + 0.2);
            return (
              <div key={k.n} style={{ opacity: op, transform: `translateY(${(1 - op) * 20}px)`, background: "rgba(4,9,20,0.86)", borderRadius: 16, padding: "20px 24px", borderTop: `6px solid ${k.c}`, minHeight: 200 }}>
                <div style={{ fontSize: 38, fontWeight: 900, color: k.c }}>{k.n}</div>
                <div style={{ fontSize: 26, color: C.suave, marginBottom: 8 }}>{k.q}</div>
                <div style={{ fontSize: 28, lineHeight: 1.3 }}>{k.t}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Fondo>
  );
};

// ---- Volumen y tonelaje: barra con discos ---------------------------------------

const Barra3D: React.FC<{ b: number; discos: number; sube: number }> = ({ b, discos, sube }) => (
  <group position={[0, sube, 0]} rotation={[0, Math.sin(b * 0.4) * 0.3, 0]}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.03, 0.03, 3.2, 16]} />
      <meshStandardMaterial color="#c9d3dc" metalness={0.85} roughness={0.25} />
    </mesh>
    {[-1, 1].map((s) =>
      Array.from({ length: discos }).map((_, i) => (
        <mesh key={`${s}${i}`} position={[s * (0.95 + i * 0.12), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45 - i * 0.04, 0.45 - i * 0.04, 0.09, 40]} />
          <meshStandardMaterial color={["#2b6cff", "#ff3b3b", "#ffcf3a", "#3ec46d"][i % 4]} roughness={0.4} metalness={0.2} />
        </mesh>
      )),
    )}
  </group>
);

const Volumen: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.6, 6.4], l: [0, 0, 0], fov: 38 },
      { b: 2, p: [0.8, 0.9, 6.0], l: [0, 0, 0], fov: 38 },
    ],
    b,
  );
  const reps = b >= 1 ? Math.min(40, Math.floor(lineal(b, 1.1, 1.9) * 40)) : 0;
  const serie = Math.min(4, Math.floor(reps / 10) + (reps > 0 ? 1 : 0));
  const sube = b >= 1 && reps < 40 ? Math.abs(Math.sin(b * 25)) * 0.35 : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -560, top: 60, width: 1920, height: 1080 }}>
        <Escena3D cam={cam}>
          <Barra3D b={b} discos={2} sube={sube} />
          <Polvo b={b} radio={3} />
        </Escena3D>
      </div>
      <Tarjeta b={b} a={0} z={1} x={760} y={130} w={1100} titulo="¿Cómo se mide el volumen?" color={COL.vol} tam={29}>
        <Lista items={["Carrera, nado, ciclismo: **km o minutos**", "Fuerza: **series × repeticiones**", "o el **tonelaje** (kg totales movidos)"]} b={b} a={0} paso={0.2} color={COL.vol} />
      </Tarjeta>
      {b >= 1 ? (
        <div style={{ position: "absolute", left: 760, top: 130, width: 1100, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "22px 30px", borderTop: `6px solid ${COL.vol}`, opacity: entre(b, 1, 1.15) }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: COL.vol }}>Tonelaje = series × repeticiones × kg</div>
          <div style={{ fontSize: 30, marginTop: 14 }}>Sentadilla: 4 series de 10 con 60 kg</div>
          <div style={{ display: "flex", gap: 30, marginTop: 16, fontSize: 30, fontVariantNumeric: "tabular-nums" }}>
            <div>
              Serie <b style={{ color: C.acento2 }}>{serie}</b> / 4
            </div>
            <div>
              Reps <b style={{ color: C.acento2 }}>{reps}</b>
            </div>
            <div>
              Kg movidos <b style={{ color: C.acento2 }}>{(reps * 60).toLocaleString("es-MX")}</b>
            </div>
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, marginTop: 14, color: COL_A.ej, opacity: entre(b, 1.85, 2) }}>4 × 10 × 60 = 2 400 kg</div>
        </div>
      ) : null}
      <Tarjeta b={b} a={2} z={3} x={760} y={560} w={1100} titulo="Hipertrofia: series efectivas" color={COL_A.ej} tam={28}>
        <Rico t="Se cuentan las **series por grupo muscular a la semana**: la evidencia sugiere unas **10 a 20 series semanales**." />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ---- Relacion inversa volumen-intensidad -------------------------------------

const Inversa: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const W = 1100;
  const H = 520;
  const t = b < 1 ? 0.5 + 0.45 * Math.sin(b * 4) : lineal(b, 1.1, 1.9);
  const vol = mix(0.9, 0.25, t);
  const int = mix(0.3, 0.92, t);
  const pts = (f: (u: number) => number) =>
    Array.from({ length: 41 })
      .map((_, i) => `${60 + (i / 40) * (W - 90)},${H - 50 - f(i / 40) * (H - 90)}`)
      .join(" ");
  const fases = ["Preparatorio general", "Preparatorio específico", "Competitivo"];
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 80, top: 140, display: "flex", gap: 40, alignItems: "flex-end", fontFamily: FUENTE, color: C.texto }}>
        {[
          { n: "Volumen", v: vol, c: COL.vol },
          { n: "Intensidad", v: int, c: COL.int },
        ].map((k) => (
          <div key={k.n} style={{ textAlign: "center" }}>
            <div style={{ width: 160, height: 480, background: "rgba(255,255,255,0.07)", borderRadius: 14, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${k.v * 100}%`, background: k.c, opacity: 0.85 }} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: k.c, marginTop: 10 }}>{k.n}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 560, top: 140, opacity: entre(b, 1, 1.2), fontFamily: FUENTE, color: C.texto }}>
        <svg width={W + 200} height={H} style={{ background: "rgba(4,9,20,0.88)", borderRadius: 14 }}>
          <line x1={60} y1={H - 50} x2={W - 20} y2={H - 50} stroke={C.suave} strokeWidth={2} />
          <line x1={60} y1={H - 50} x2={60} y2={20} stroke={C.suave} strokeWidth={2} />
          <polyline points={pts((u) => mix(0.88, 0.2, u))} fill="none" stroke={COL.vol} strokeWidth={6} />
          <polyline points={pts((u) => mix(0.3, 0.9, u))} fill="none" stroke={COL.int} strokeWidth={6} />
          <line x1={60 + t * (W - 90)} x2={60 + t * (W - 90)} y1={20} y2={H - 50} stroke={C.acento2} strokeWidth={3} strokeDasharray="8 8" />
          {fases.map((f, i) => (
            <text key={f} x={60 + ((i + 0.5) / 3) * (W - 90)} y={H - 18} fill={C.suave} fontSize={22} textAnchor="middle" fontFamily={FUENTE}>
              {f}
            </text>
          ))}
          <text x={W - 10} y={70} fill={COL.int} fontSize={28} fontWeight={800} fontFamily={FUENTE}>
            Intensidad
          </text>
          <text x={W - 10} y={H - 110} fill={COL.vol} fontSize={28} fontWeight={800} fontFamily={FUENTE}>
            Volumen
          </text>
        </svg>
      </div>
      {b < 1 ? (
        <div style={{ position: "absolute", left: 560, top: 300, width: 1200, fontFamily: FUENTE, fontSize: 40, fontWeight: 900, color: C.texto, textAlign: "center" }}>
          Si uno <span style={{ color: COL_A.ej }}>sube</span>, el otro <span style={{ color: COL_A.rojo }}>baja</span>
          <div style={{ fontSize: 30, fontWeight: 500, color: C.suave, marginTop: 14 }}>Un maratón no se corre al ritmo de un sprint de 100 m</div>
        </div>
      ) : null}
    </Fondo>
  );
};

// ---- sRPE y relacion aguda:cronica ---------------------------------------------

const SEMANAS = [1600, 1700, 1650, 1750, 2700];

const SRPE: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const acr = 2700 / ((1700 + 1650 + 1750 + 2700) / 4);
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, top: 140, width: 860, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "22px 30px", borderTop: `6px solid #c25bff` }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#c25bff" }}>RPE de la sesión (Foster)</div>
        <div style={{ fontSize: 36, fontWeight: 800, marginTop: 14, opacity: entre(b, 0.2, 0.35) }}>Carga = RPE (0–10) × minutos</div>
        <div style={{ fontSize: 26, color: C.suave, opacity: entre(b, 0.3, 0.45) }}>en unidades arbitrarias (UA)</div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: entre(b, 1, 1.15) }}>Sesión de 60 min con RPE 7</div>
        <div style={{ fontSize: 50, fontWeight: 900, color: COL_A.ej, opacity: entre(b, 1.3, 1.45) }}>7 × 60 = 420 UA</div>
        <div style={{ fontSize: 28, marginTop: 14, opacity: entre(b, 1.6, 1.75) }}>
          <Rico t="Se suman las sesiones → **carga semanal**" />
        </div>
      </div>
      <div style={{ position: "absolute", left: 1000, top: 140, width: 840, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "22px 30px", opacity: entre(b, 2, 2.15) }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: C.acento2 }}>Relación aguda : crónica</div>
        <div style={{ fontSize: 24, color: C.suave, marginBottom: 12 }}>Última semana ÷ promedio de las últimas 4</div>
        <div style={{ display: "flex", gap: 18, alignItems: "flex-end", height: 260 }}>
          {SEMANAS.map((v, i) => {
            const op = entre(b, 2.1 + i * 0.08, 2.2 + i * 0.08);
            const ult = i === SEMANAS.length - 1;
            return (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 20, color: C.suave }}>{v}</div>
                <div style={{ height: (v / 2800) * 210 * op, background: ult ? COL_A.rojo : C.acento, borderRadius: 8 }} />
                <div style={{ fontSize: 20, marginTop: 6 }}>S{i + 1}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", height: 34, marginTop: 18, borderRadius: 8, overflow: "hidden", fontSize: 20, fontWeight: 900, color: "#08121f" }}>
          <div style={{ flex: 0.8, background: C.acento, display: "flex", alignItems: "center", justifyContent: "center" }}>&lt; 0.8</div>
          <div style={{ flex: 0.5, background: COL_A.ej, display: "flex", alignItems: "center", justifyContent: "center" }}>0.8–1.3</div>
          <div style={{ flex: 0.2, background: COL_A.dep }} />
          <div style={{ flex: 0.5, background: COL_A.rojo, display: "flex", alignItems: "center", justifyContent: "center" }}>&gt; 1.5</div>
        </div>
        <div style={{ fontSize: 30, marginTop: 14, opacity: entre(b, 2.5, 2.65) }}>
          2 700 ÷ 1 950 = <b style={{ color: COL_A.rojo }}>{acr.toFixed(2)}</b> → <b style={{ color: COL_A.rojo }}>riesgo de lesión</b>
        </div>
      </div>
    </Fondo>
  );
};

// ---- Supercompensacion ------------------------------------------------------------

const curvaSC = (x: number) => {
  // estimulo en x=0.1: baja (fatiga), recupera, supera y vuelve
  if (x < 0.1) return 0.5;
  const t = (x - 0.1) / 0.9;
  return 0.5 - 0.28 * Math.sin(Math.min(1, t / 0.3) * Math.PI) * (t < 0.3 ? 1 : 0) + (t >= 0.3 ? 0.2 * Math.sin(Math.min(1, (t - 0.3) / 0.45) * Math.PI) : 0);
};
const escalera = (x: number) => {
  const n = 3;
  const k = Math.min(n - 1, Math.floor(x * n));
  const f = x * n - k;
  return 0.25 + k * 0.17 + (f < 0.35 ? -0.12 * Math.sin((f / 0.35) * Math.PI) : 0.14 * Math.sin(Math.min(1, (f - 0.35) / 0.65) * (Math.PI / 2)));
};

const Supercomp: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const W = 1300;
  const H = 520;
  const prog = b < 1 ? lineal(b, 0.05, 0.95) : b < 2 ? lineal(b, 1.05, 1.9) : 1;
  const f = b < 1 ? curvaSC : escalera;
  const n = Math.max(1, Math.round(prog * 120));
  const pts = Array.from({ length: n + 1 })
    .map((_, i) => `${60 + (i / 120) * (W - 90)},${H - 50 - f(i / 120) * (H - 90)}`)
    .join(" ");
  const fasesSC = [
    { t: "Estímulo", x: 0.1, c: C.acento2 },
    { t: "Fatiga", x: 0.22, c: COL_A.rojo },
    { t: "Recuperación", x: 0.45, c: C.acento },
    { t: "Supercompensación", x: 0.65, c: COL_A.ej },
  ];
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 80, top: 130, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 10 }}>{b < 1 ? "Supercompensación" : b < 2 ? "Estímulos en el momento justo" : "Sobrecarga progresiva"}</div>
        <svg width={W} height={H} style={{ background: "rgba(4,9,20,0.88)", borderRadius: 14 }}>
          <line x1={60} y1={H - 50 - 0.5 * (H - 90)} x2={W - 20} y2={H - 50 - 0.5 * (H - 90)} stroke={C.suave} strokeDasharray="6 8" opacity={b < 1 ? 1 : 0} />
          <line x1={60} y1={H - 50} x2={W - 20} y2={H - 50} stroke={C.suave} strokeWidth={2} />
          <line x1={60} y1={H - 50} x2={60} y2={20} stroke={C.suave} strokeWidth={2} />
          <text x={20} y={H / 2} fill={C.suave} fontSize={22} fontFamily={FUENTE} transform={`rotate(-90 20 ${H / 2})`} textAnchor="middle">
            Rendimiento
          </text>
          <text x={W - 30} y={H - 18} fill={C.suave} fontSize={22} fontFamily={FUENTE} textAnchor="end">
            Tiempo
          </text>
          <polyline points={pts} fill="none" stroke={b < 2 ? COL_A.ej : C.acento2} strokeWidth={6} />
          {b < 1
            ? fasesSC.map((k) =>
                prog >= k.x ? (
                  <text key={k.t} x={60 + k.x * (W - 90)} y={H - 50 - curvaSC(k.x) * (H - 90) + (k.t === "Fatiga" ? 50 : -24)} fill={k.c} fontSize={26} fontWeight={800} fontFamily={FUENTE} textAnchor="middle">
                    {k.t}
                  </text>
                ) : null,
              )
            : null}
        </svg>
      </div>
      <div style={{ position: "absolute", left: 1420, top: 180, width: 440, fontFamily: FUENTE, color: C.texto, display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { t: "**En el pico**: el rendimiento sube", c: COL_A.ej, a: 1 },
          { t: "**Muy pronto**: fatiga acumulada → sobreentrenamiento", c: COL_A.rojo, a: 1.3 },
          { t: "**Muy tarde**: la mejora se pierde", c: C.suave, a: 1.6 },
          { t: "Subir la carga **poco a poco**: ≈ **10 % por semana** como máximo", c: C.acento2, a: 2.3 },
          { t: "Siempre **carga + recuperación**", c: C.acento, a: 2.6 },
        ].map((k) => (
          <div key={k.t} style={{ opacity: entre(b, k.a, k.a + 0.15), background: "rgba(4,9,20,0.86)", borderLeft: `6px solid ${k.c}`, borderRadius: 12, padding: "14px 18px", fontSize: 26 }}>
            <Rico t={k.t} color={k.c} />
          </div>
        ))}
      </div>
    </Fondo>
  );
};

// ---- Repaso -----------------------------------------------------------------------

const Repaso: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cards = [
    { n: "4.1 Conceptos", c: C.acento, l: ["**AF**: todo movimiento con gasto energético", "**Ejercicio**: planificado, estructurado, repetitivo, con objetivo", "**Deporte**: reglas, competición, institución"] },
    { n: "4.2 Intensidad", c: COL_A.rojo, l: ["**¿Qué tan duro?**", "FC (Karvonen), METs, RPE, test del habla", "Fuerza: **%1RM**, RIR, velocidad"] },
    { n: "4.3 Carga-volumen", c: COL.vol, l: ["Carga **externa** e **interna**", "Volumen, intensidad, densidad, frecuencia", "Volumen ↔ intensidad: **relación inversa**"] },
  ];
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 80, right: 80, top: 140, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, fontFamily: FUENTE, color: C.texto }}>
        {cards.map((k, i) => {
          const op = entre(b, i === 0 ? 0 : i === 1 ? 1 : 1.4, (i === 0 ? 0 : i === 1 ? 1 : 1.4) + 0.2);
          return (
            <div key={k.n} style={{ opacity: op, transform: `translateY(${(1 - op) * 20}px)`, background: "rgba(4,9,20,0.86)", borderRadius: 16, padding: "22px 26px", borderTop: `6px solid ${k.c}` }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: k.c, marginBottom: 12 }}>{k.n}</div>
              <div style={{ fontSize: 28 }}>
                <Lista items={k.l} color={k.c} />
              </div>
            </div>
          );
        })}
      </div>
    </Fondo>
  );
};

const Preguntas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const q = b < 1 ? 0 : 1;
  const pregs = [
    {
      p: "40 años · FC reposo 70 lpm · ¿FC al 60 % por Karvonen?",
      r: ["FCmáx = 220 − 40 = 180", "Reserva = 180 − 70 = 110", "70 + 0.6 × 110 = **136 lpm**"],
    },
    { p: "Caminar a 3.5 METs: ¿ligera, moderada o vigorosa?", r: ["Moderada = 3 a 5.9 METs", "→ **Moderada**"] },
  ];
  const pr = pregs[q];
  const a = q;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -260, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo="corre" brilla={0.3} />
      </div>
      <div key={q} style={{ position: "absolute", left: 700, top: 150, width: 1160, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 28, color: C.acento2, fontWeight: 800, letterSpacing: 3 }}>PREGUNTA DE REPASO {q + 1}</div>
        <div style={{ fontSize: 42, fontWeight: 900, marginTop: 10, opacity: entre(b, a, a + 0.15) }}>{pr.p}</div>
        <div style={{ marginTop: 26, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "20px 28px", borderLeft: `6px solid ${COL_A.ej}`, fontSize: 34 }}>
          {pr.r.map((t, i) => (
            <div key={t} style={{ opacity: entre(b, a + 0.3 + i * 0.15, a + 0.4 + i * 0.15), marginBottom: 8 }}>
              <Rico t={t} color={COL_A.ej} />
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -330, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo="corre" brilla={0.4} giro={0.9} />
      </div>
      <TituloGrande b={b} a={0} z={1.2} sup="Unidad 4" t="¡Listo para clase!" sub="Actividad física · Ejercicio · Deporte · Intensidad · Carga" />
    </AbsoluteFill>
  );
};

export const A3: PlanoDef[] = [
  {
    id: "c-carga",
    seccion: SEC + " · Carga de entrenamiento",
    textos: [
      "**Carga de entrenamiento**: es el **conjunto de estímulos** que se aplican al organismo para provocar **adaptaciones**. Se divide en carga **externa** y carga **interna**.",
      "La **carga externa** es el **trabajo realizado**, que se mide fuera del cuerpo: kilómetros, kilos, repeticiones, velocidad o vatios. La **carga interna** es la **respuesta del organismo** a ese trabajo: frecuencia cardiaca, lactato o percepción del esfuerzo.",
      "Por eso la **misma carga externa** produce **cargas internas distintas**: cuatro series de diez sentadillas con 40 kilos son fáciles para alguien entrenado y muy duras para un principiante.",
    ],
    Escena: Carga,
  },
  {
    id: "c-componentes",
    seccion: SEC + " · Componentes",
    textos: [
      "La carga se describe con sus **componentes**. **Volumen**: la **cantidad** total de trabajo. **Intensidad**: la **calidad**, qué tan exigente es cada repetición o cada minuto.",
      "**Densidad**: la relación entre **trabajo y descanso**, por ejemplo uno a dos. **Frecuencia**: cuántas **sesiones por semana**. Y **duración**: el tiempo de cada sesión o estímulo.",
    ],
    Escena: Componentes,
  },
  {
    id: "c-volumen",
    seccion: SEC + " · Volumen y tonelaje",
    textos: [
      "El **volumen** se mide según la actividad: en carrera o natación, en **kilómetros o minutos**; en fuerza, en **series por repeticiones**, o con el **tonelaje**.",
      "**Tonelaje = series × repeticiones × kilos**. En sentadilla, **4 series de 10 con 60 kilos** = 4 × 10 × 60 = **2 400 kilos** de volumen de carga.",
      "Para la hipertrofia también se cuentan las **series efectivas por grupo muscular a la semana**: la evidencia sugiere unas **10 a 20 series semanales**.",
    ],
    Escena: Volumen,
  },
  {
    id: "c-inversa",
    seccion: SEC + " · Relación volumen-intensidad",
    textos: [
      "**Volumen e intensidad tienen una relación inversa**: cuando uno sube, el otro debe bajar. No se puede correr un maratón al ritmo de un sprint de 100 metros.",
      "En la **periodización clásica**, al inicio de la temporada predomina el **volumen alto con intensidad baja**; al acercarse la competición, **baja el volumen y sube la intensidad**.",
    ],
    Escena: Inversa,
  },
  {
    id: "c-srpe",
    seccion: SEC + " · Cuantificar la carga interna",
    textos: [
      "Para cuantificar la carga interna se usa la **RPE de la sesión, o método de Foster**: **carga = RPE de 0 a 10 × duración en minutos**, en **unidades arbitrarias**.",
      "Ejemplo: una sesión de **60 minutos** con un RPE de **7** = 7 × 60 = **420 unidades arbitrarias**. Sumando las sesiones se obtiene la **carga semanal**.",
      "La **relación aguda : crónica** compara la carga de la última semana con el promedio de las últimas cuatro. Entre **0.8 y 1.3** es una zona segura; por encima de **1.5** aumenta el **riesgo de lesión**.",
    ],
    Escena: SRPE,
  },
  {
    id: "c-supercomp",
    seccion: SEC + " · Supercompensación",
    textos: [
      "¿Por qué aplicar carga? Por la **supercompensación**: tras el estímulo aparece la **fatiga** y el rendimiento baja; con el **descanso** se recupera y luego **supera el nivel inicial**.",
      "Si el siguiente estímulo llega **en el pico**, el rendimiento **mejora progresivamente**. Si llega **demasiado pronto**, se acumula fatiga y puede aparecer el **sobreentrenamiento**; si llega **tarde**, la mejora se pierde.",
      "De ahí el principio de **sobrecarga progresiva**: aumentar la carga **poco a poco**; una regla práctica es **no más del 10 % por semana**, combinando siempre **carga y recuperación**.",
    ],
    Escena: Supercomp,
  },
];

export const A4: PlanoDef[] = [
  {
    id: "r-resumen",
    seccion: "Repaso",
    textos: [
      "**Resumen.** Actividad física: **todo movimiento** con gasto energético. Ejercicio: **planificado, estructurado, repetitivo** y con un objetivo. Deporte: **reglas, competición e institución**.",
      "Intensidad: **qué tan duro**, medida con frecuencia cardiaca, METs, RPE, test del habla o porcentaje de 1RM. Carga: **volumen, intensidad, densidad y frecuencia**, tanto externa como interna.",
    ],
    Escena: Repaso,
  },
  {
    id: "r-preguntas",
    seccion: "Repaso · Preguntas",
    textos: [
      "Pregunta: una persona de **40 años**, con FC de reposo de **70**, ¿a qué frecuencia debe trabajar al **60 %** por Karvonen? FC máxima 180; reserva 110; 70 + 0.6 × 110 = **136 latidos por minuto**.",
      "Otra: caminar a **3.5 METs**, ¿es actividad ligera, moderada o vigorosa? Es **moderada**, porque está entre 3 y 5.9 METs.",
    ],
    Escena: Preguntas,
  },
  {
    id: "r-final",
    seccion: "",
    textos: [
      "Con esto ya tienes la base del **tema 4**. ¡Mucho éxito en tu clase!",
    ],
    Escena: Final,
  },
];
