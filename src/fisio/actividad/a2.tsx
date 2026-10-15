import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, PlanoDef, useBeat } from "../motor";
import { Humano } from "../modelos/cuerpo";
import { Polvo } from "../modelos/comun";
import { Cinta } from "../modelos/energia";
import { C, FUENTE } from "../tema";
import { Escena3D, Lista, Rico, Tabla, Tarjeta } from "../ui";
import { COL_A, FiguraIzq, Fondo } from "./a1";

const SEC = "4.2 Análisis de la intensidad";

// ---- Que es la intensidad: corredor en cinta con medidor --------------------

const Medidor: React.FC<{ v: number; x: number; y: number }> = ({ v, x, y }) => {
  const ang = mix(-120, 120, v);
  const col = v < 0.35 ? COL_A.ej : v < 0.7 ? COL_A.dep : COL_A.rojo;
  const arco = (a0: number, a1: number, c: string) => {
    const p = (a: number) => [150 + 120 * Math.sin((a * Math.PI) / 180), 160 - 120 * Math.cos((a * Math.PI) / 180)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return <path d={`M${x0},${y0} A120,120 0 0 1 ${x1},${y1}`} stroke={c} strokeWidth={22} fill="none" />;
  };
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 300, fontFamily: FUENTE, textAlign: "center", background: "rgba(4,9,20,0.85)", borderRadius: 16, padding: "10px 0" }}>
      <svg width={300} height={200}>
        {arco(-120, -40, COL_A.ej)}
        {arco(-40, 40, COL_A.dep)}
        {arco(40, 120, COL_A.rojo)}
        <line x1={150} y1={160} x2={150 + 100 * Math.sin((ang * Math.PI) / 180)} y2={160 - 100 * Math.cos((ang * Math.PI) / 180)} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
        <circle cx={150} cy={160} r={12} fill="#fff" />
      </svg>
      <div style={{ fontSize: 30, fontWeight: 900, color: col }}>{v < 0.35 ? "Ligera" : v < 0.7 ? "Moderada" : "Vigorosa"}</div>
    </div>
  );
};

const QueEs: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const v = b < 1 ? 0.5 + 0.45 * Math.sin(b * 3) : b < 2 ? lineal(b, 1, 2) : 0.5;
  const ritmo = mix(0.8, 3, v);
  const cam = { p: [2.6, 1.15, 3.4] as [number, number, number], l: [0.9, 0.95, 0] as [number, number, number], fov: 38 };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -170, top: 40, width: 1920, height: 1080 }}>
        <Escena3D cam={cam}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <group rotation={[0, Math.PI / 2, 0]}>
              <Cinta t={-b * ritmo} />
            </group>
            <group position={[0, 0.05, 0]}>
              <Humano fase={b * ritmo * 6} marcha={mix(0.9, 1.7, v)} musculo={0.55} brilla={v * 0.4} />
            </group>
          </group>
        </Escena3D>
      </div>
      <Medidor v={v} x={60} y={140} />
      <Tarjeta b={b} a={0} z={3} x={760} y={130} w={1100} titulo="Intensidad" color={C.acento2} tam={30}>
        <Rico t="**Grado de esfuerzo** que exige una actividad: la **magnitud** de la carga. Responde a **¿qué tan duro?**" />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={2} x={760} y={350} w={530} titulo="Objetiva" color={C.acento} tam={26}>
        <Lista items={["Frecuencia cardiaca", "Consumo de O₂ · METs", "Lactato", "Velocidad · vatios · kg"]} b={b} a={1} paso={0.1} />
      </Tarjeta>
      <Tarjeta b={b} a={1.3} z={2} x={1330} y={350} w={530} titulo="Subjetiva" color="#c25bff" tam={26}>
        <Lista items={["Percepción del esfuerzo (Borg)", "Test del habla"]} color="#c25bff" />
      </Tarjeta>
      <Tarjeta b={b} a={2} z={3} x={760} y={350} w={1100} titulo="Absoluta vs relativa" color={COL_A.dep} tam={28}>
        <Lista
          items={[
            "**Absoluta**: el gasto real de la actividad (ej. METs, km/h)",
            "**Relativa**: depende de la **capacidad de cada persona** (% FCmáx, % VO₂máx)",
            "Correr a **10 km/h**: suave para un atleta, **máximo** para un sedentario",
          ]}
          b={b}
          a={2}
          paso={0.15}
          color={COL_A.dep}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ---- METs ------------------------------------------------------------------------

const ACTIV: { t: string; m: number }[] = [
  { t: "Sentado", m: 1.3 },
  { t: "Caminar normal", m: 3.5 },
  { t: "Bici recreativa", m: 7 },
  { t: "Correr 10 km/h", m: 10 },
];

const METs: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const MAX = 12;
  const W = 1640;
  const x = (m: number) => (m / MAX) * W;
  const tramos = [
    { t: "Sedentaria", a: 0, z: 1.5, c: "#c25bff" },
    { t: "Ligera", a: 1.5, z: 3, c: C.acento },
    { t: "Moderada", a: 3, z: 6, c: COL_A.ej },
    { t: "Vigorosa", a: 6, z: MAX, c: COL_A.rojo },
  ];
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 140, top: 130, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ display: "flex", gap: 30, opacity: entre(b, 0, 0.2) }}>
          <div style={{ background: "rgba(4,9,20,0.86)", borderRadius: 14, padding: "14px 24px", borderLeft: `6px solid ${C.acento2}`, fontSize: 30 }}>
            <Rico t="**1 MET** = gasto en reposo ≈ **3.5 ml O₂/kg/min** ≈ **1 kcal/kg/h**" />
          </div>
        </div>
        <div style={{ position: "relative", width: W, height: 120, marginTop: 40 }}>
          {tramos.map((tr, i) => {
            const op = entre(b, 1 + i * 0.2, 1.2 + i * 0.2);
            return (
              <div key={tr.t} style={{ position: "absolute", left: x(tr.a), width: x(tr.z) - x(tr.a), top: 0, height: 70, background: tr.c, opacity: 0.2 + op * 0.7, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#08121f", fontWeight: 900, fontSize: 26, whiteSpace: "nowrap", overflow: "hidden" }}>
                {op > 0.5 ? tr.t : ""}
              </div>
            );
          })}
          {[0, 1.5, 3, 6, 9, 12].map((m) => (
            <div key={m} style={{ position: "absolute", left: x(m) - 30, width: 60, top: 78, textAlign: "center", fontSize: 24, color: C.suave }}>
              {m}
            </div>
          ))}
        </div>
        <div style={{ position: "relative", width: W, height: 170 }}>
          {ACTIV.map((a, i) => {
            const op = entre(b, 2 + i * 0.2, 2.2 + i * 0.2);
            return (
              <div key={a.t} style={{ position: "absolute", left: x(a.m) - 110, width: 220, top: i % 2 ? 80 : 0, opacity: op, textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{a.t}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: C.acento2 }}>{a.m} METs</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, width: W, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "18px 28px", borderTop: `6px solid ${C.acento2}`, opacity: entre(b, 3, 3.2), fontSize: 34 }}>
          <div>
            <b style={{ color: C.acento2 }}>kcal = METs × peso (kg) × horas</b>
          </div>
          <div style={{ marginTop: 8, opacity: entre(b, 3.3, 3.5) }}>
            70 kg corriendo 30 min a 10 METs → 10 × 70 × 0.5 = <b style={{ color: COL_A.ej }}>350 kcal</b>
          </div>
        </div>
      </div>
    </Fondo>
  );
};

// ---- Frecuencia cardiaca: corazon latiendo + calculadora ---------------------

const Corazon: React.FC<{ b: number; lpm: number }> = ({ b, lpm }) => {
  const latido = Math.pow(Math.max(0, Math.sin(b * lpm * 0.12)), 8);
  const s = 1 + latido * 0.12;
  const cam = camara([{ b: 0, p: [0, 0.2, 6.6], l: [0, 0, 0], fov: 38 }], b);
  return (
    <Escena3D cam={cam}>
      <group scale={s} rotation={[0, Math.sin(b * 0.5) * 0.4, 0.2]}>
        {[-1, 1].map((k) => (
          <mesh key={k} position={[k * 0.38, 0.3, 0]}>
            <sphereGeometry args={[0.55, 40, 30]} />
            <meshPhysicalMaterial color="#c4162c" emissive="#ff3048" emissiveIntensity={0.15 + latido * 0.6} roughness={0.35} clearcoat={0.6} />
          </mesh>
        ))}
        <mesh position={[0, -0.32, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.85, 1.25, 40]} />
          <meshPhysicalMaterial color="#c4162c" emissive="#ff3048" emissiveIntensity={0.15 + latido * 0.6} roughness={0.35} clearcoat={0.6} />
        </mesh>
        <mesh position={[0.1, 0.95, 0]} rotation={[0, 0, -0.3]}>
          <torusGeometry args={[0.28, 0.1, 12, 30, Math.PI]} />
          <meshStandardMaterial color="#e3263a" />
        </mesh>
      </group>
      <Polvo b={b} radio={3} color="#ff8fa3" />
    </Escena3D>
  );
};

const Linea: React.FC<{ op: number; t: string; grande?: boolean; color?: string }> = ({ op, t, grande, color = C.texto }) => (
  <div style={{ opacity: op, transform: `translateX(${(1 - op) * 20}px)`, fontSize: grande ? 40 : 31, fontWeight: grande ? 900 : 500, color, marginBottom: 12, fontVariantNumeric: "tabular-nums" }}>
    <Rico t={t} />
  </div>
);

const FC: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const lpm = b < 3 ? mix(60, 200, lineal(b, 0, 2)) : 158;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -580, top: -60, width: 1920, height: 1080 }}>
        <Corazon b={b} lpm={lpm} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 760, fontFamily: FUENTE, fontSize: 56, fontWeight: 900, color: "#ff6b81", fontVariantNumeric: "tabular-nums" }}>
        {Math.round(lpm)} lpm
      </div>
      <div style={{ position: "absolute", left: 760, top: 130, width: 1100, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.86)", borderRadius: 16, padding: "22px 30px", borderTop: `6px solid #ff6b81` }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#ff6b81", marginBottom: 14 }}>Frecuencia cardiaca (FC)</div>
        <Linea op={entre(b, 0, 0.2)} t="Sube de forma casi **lineal** con la intensidad" />
        <Linea op={entre(b, 1, 1.15)} t="**FCmáx = 220 − edad** → 20 años: **200 lpm**" />
        <Linea op={entre(b, 1.4, 1.55)} t="**Tanaka: 208 − 0.7 × edad** → 20 años: **194 lpm**" />
        <div style={{ height: 2, background: "rgba(255,255,255,0.15)", margin: "14px 0", opacity: entre(b, 2, 2.1) }} />
        <Linea op={entre(b, 2, 2.15)} t="**Karvonen** (FC de reserva):" color={C.acento} />
        <Linea op={entre(b, 2.2, 2.35)} t="FC objetivo = FC reposo + **%** × (FCmáx − FC reposo)" />
        <Linea op={entre(b, 3, 3.15)} t="Reserva = 200 − 60 = **140**" />
        <Linea op={entre(b, 3.35, 3.5)} t="70 %: 60 + 0.7 × 140 = " />
        <Linea op={entre(b, 3.6, 3.75)} t="**158 lpm**" grande color={COL_A.ej} />
      </div>
    </AbsoluteFill>
  );
};

// ---- Borg y test del habla -----------------------------------------------------

const CR10: [number, string][] = [
  [0, "Reposo"],
  [1, "Muy, muy ligero"],
  [2, "Ligero"],
  [3, "Moderado"],
  [4, "Algo duro"],
  [5, "Duro"],
  [6, ""],
  [7, "Muy duro"],
  [8, ""],
  [9, ""],
  [10, "Máximo"],
];

const Borg: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const sel = b < 1 ? -1 : b < 1.35 ? 3 : b < 1.7 ? 5 : 7;
  const habla = b >= 2;
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, top: 130, width: 860, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#c25bff", marginBottom: 6 }}>Percepción del esfuerzo (RPE)</div>
        <div style={{ fontSize: 26, color: C.suave, marginBottom: 14 }}>Borg original: 6 a 20 (× 10 ≈ FC) · Borg modificada: CR-10</div>
        {CR10.map(([n, t], i) => {
          const op = entre(b, i * 0.07, i * 0.07 + 0.15);
          const c = `hsl(${mix(140, 0, n / 10)}, 80%, 55%)`;
          const on = n === sel || (sel === 3 && n === 4) || (sel === 5 && n === 6) || (sel === 7 && n === 8);
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 16, opacity: op, marginBottom: 4 }}>
              <div style={{ width: 60, height: 42, borderRadius: 8, background: c, color: "#08121f", fontWeight: 900, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on ? 1.12 : 1})` }}>{n}</div>
              <div style={{ height: 42, width: 120 + n * 50, background: c, opacity: on ? 0.9 : 0.35, borderRadius: 8 }} />
              <div style={{ fontSize: 26, fontWeight: on ? 900 : 500 }}>{t}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 1010, top: 150, width: 840, fontFamily: FUENTE, color: C.texto, opacity: habla ? 1 : 0.0 }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: C.acento2, marginBottom: 16 }}>Test del habla</div>
        {[
          { t: "Puedes **hablar y cantar**", r: "Ligera", c: COL_A.ej, a: 2 },
          { t: "Puedes **hablar, pero no cantar**", r: "Moderada", c: COL_A.dep, a: 2.3 },
          { t: "Solo dices **unas palabras**", r: "Vigorosa", c: COL_A.rojo, a: 2.6 },
        ].map((f) => (
          <div key={f.r} style={{ opacity: entre(b, f.a, f.a + 0.15), display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(4,9,20,0.86)", borderLeft: `6px solid ${f.c}`, borderRadius: 12, padding: "18px 24px", marginBottom: 16, fontSize: 30 }}>
            <span>
              <Rico t={f.t} />
            </span>
            <b style={{ color: f.c }}>{f.r}</b>
          </div>
        ))}
      </div>
      {!habla ? (
        <Tarjeta b={b} a={0.3} z={2} x={1010} y={180} w={820} titulo="Ventajas" color="#c25bff" tam={28}>
          <Lista items={["**Gratis** y rápida", "No necesita pulsómetro", "Refleja la **carga interna** de la persona", "Útil en cualquier tipo de ejercicio"]} color="#c25bff" />
        </Tarjeta>
      ) : null}
    </Fondo>
  );
};

// ---- Zonas de entrenamiento -----------------------------------------------------

const ZONAS = [
  ["Z1 · Muy ligera", "50–60 %", "1–2", "Recuperación, calentamiento"],
  ["Z2 · Ligera", "60–70 %", "3–4", "Base aeróbica, oxidación de grasas"],
  ["Z3 · Moderada", "70–80 %", "5–6", "Mejora de la capacidad aeróbica"],
  ["Z4 · Dura", "80–90 %", "7–8", "Cerca del umbral anaeróbico"],
  ["Z5 · Máxima", "90–100 %", "9–10", "VO₂máx y potencia anaeróbica"],
];
const COL_Z = ["#5ec8ff", "#7cff8a", "#ffcf5a", "#ff8a3d", "#ff4d4d"];

const Zonas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const visibles = b < 1 ? (b < 0.5 ? 1 : 2) : 5;
  const resalta = b < 1 ? visibles - 1 : Math.min(4, 2 + Math.floor((b - 1) * 3));
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, right: 90, top: 140, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 16 }}>Zonas de entrenamiento</div>
        <div style={{ display: "flex", gap: 8, height: 70, marginBottom: 20 }}>
          {COL_Z.map((c, i) => (
            <div key={i} style={{ flex: 1, background: c, opacity: i < visibles ? (i === resalta ? 1 : 0.5) : 0.12, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#08121f", fontWeight: 900, fontSize: 30, transform: `scaleY(${i === resalta ? 1.12 : 1})` }}>
              Z{i + 1}
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(4,9,20,0.9)", borderRadius: 14, padding: "10px 16px" }}>
          <Tabla tam={27} anchos="1.3fr 0.9fr 0.8fr 2fr" cab={["Zona", "% FCmáx", "RPE (0–10)", "Para qué sirve"]} filas={ZONAS.slice(0, visibles)} resalta={resalta} />
        </div>
      </div>
    </Fondo>
  );
};

// ---- Intensidad en fuerza -----------------------------------------------------

const Fuerza: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -260, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo="curl" brilla={0.35} colorBrillo={COL_A.rojo} giro={0.3} />
      </div>
      <Tarjeta b={b} a={0} z={3} x={700} y={130} w={1160} titulo="%1RM" color={COL_A.rojo} tam={29}>
        <Rico t="**1RM** (una repetición máxima): la carga más alta que puedes levantar **una sola vez** con buena técnica." color={COL_A.rojo} />
      </Tarjeta>
      <div style={{ position: "absolute", left: 700, top: 340, width: 1160, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "12px 18px", opacity: entre(b, 1, 1.15) }}>
        <Tabla
          tam={27}
          anchos="1fr 1fr 1.3fr"
          cab={["% de 1RM", "Repeticiones", "Objetivo"]}
          filas={[
            ["≥ 85 %", "1–5", "Fuerza máxima"],
            ["67–85 %", "6–12", "Hipertrofia"],
            ["≤ 67 %", "12 o más", "Resistencia muscular"],
          ]}
          b={b}
          a={1}
          paso={0.2}
        />
      </div>
      <Tarjeta b={b} a={2} z={3} x={700} y={640} w={560} titulo="RIR" color={C.acento} tam={26}>
        <Rico t="**Repeticiones en reserva**: cuántas te quedan antes del **fallo**. RIR 2 = podías hacer 2 más." />
      </Tarjeta>
      <Tarjeta b={b} a={2.3} z={3} x={1300} y={640} w={560} titulo="Velocidad" color={COL_A.dep} tam={26}>
        <Rico t="A **más carga**, la barra se mueve **más lento**: la velocidad estima el %1RM." />
      </Tarjeta>
    </AbsoluteFill>
  );
};

export const A2: PlanoDef[] = [
  {
    id: "i-que-es",
    seccion: SEC,
    textos: [
      "**Intensidad**: es el **grado de esfuerzo** que exige una actividad, es decir, la **magnitud** de la carga en un momento dado. Responde a la pregunta: **¿qué tan duro?**",
      "Se mide de forma **objetiva**, con la frecuencia cardiaca, el consumo de oxígeno, los METs, el lactato, la velocidad o la carga levantada; o de forma **subjetiva**, con la percepción del esfuerzo y el test del habla.",
      "También se distingue la intensidad **absoluta**, el gasto real de la actividad, de la **relativa**, que depende de la capacidad de cada persona: correr a 10 km/h es suave para un atleta y **máximo** para alguien sedentario.",
    ],
    Escena: QueEs,
  },
  {
    id: "i-mets",
    seccion: SEC + " · METs",
    textos: [
      "**MET**, o equivalente metabólico: **1 MET** es el gasto de energía en **reposo**, aproximadamente **3.5 ml de oxígeno por kilo por minuto**, o **1 kcal por kilo por hora**.",
      "Clasificación: **sedentaria**, hasta **1.5 METs**; **ligera**, de 1.6 a 2.9; **moderada**, de **3 a 5.9**; y **vigorosa**, **6 METs o más**.",
      "Ejemplos: estar sentado, 1.3 METs; caminar a paso normal, 3.5; bici recreativa, de 6 a 8; y correr a 10 km/h, alrededor de **10 METs**.",
      "Para estimar el gasto: **kcal = METs × peso en kilos × horas**. Una persona de **70 kg** que corre **30 minutos a 10 METs** gasta 10 × 70 × 0.5 = **350 kcal**.",
    ],
    Escena: METs,
  },
  {
    id: "i-fc",
    seccion: SEC + " · Frecuencia cardiaca",
    textos: [
      "La **frecuencia cardiaca** sube de forma casi **lineal** con la intensidad, por eso es el método más usado. Primero se estima la **frecuencia cardiaca máxima**.",
      "Fórmula clásica: **220 menos la edad**. Una más precisa es la de **Tanaka: 208 menos 0.7 por la edad**. Para alguien de **20 años**: 200 latidos por minuto con la clásica y 194 con Tanaka.",
      "El método de **Karvonen** usa la **frecuencia cardiaca de reserva**: FC objetivo = FC de reposo + el **porcentaje de intensidad** × (FC máxima − FC de reposo).",
      "Ejemplo: 20 años y FC de reposo de **60**. Reserva = 200 − 60 = **140**. Al **70 %**: 60 + 0.7 × 140 = **158 latidos por minuto**.",
    ],
    Escena: FC,
  },
  {
    id: "i-borg",
    seccion: SEC + " · Percepción del esfuerzo",
    textos: [
      "La **percepción subjetiva del esfuerzo (RPE)** usa la **escala de Borg**: la original va de **6 a 20**, y multiplicada por 10 se aproxima a la frecuencia cardiaca; la modificada, **CR-10**, va de **0 a 10**.",
      "En la CR-10: **3 a 4** es moderado, **5 a 6** es duro y **7 a 8** es muy duro. Es gratis, rápida y muy útil cuando no hay pulsómetro.",
      "El **test del habla**: si puedes **hablar y cantar**, la intensidad es ligera; si puedes **hablar pero no cantar**, es moderada; y si **solo dices unas palabras** sin pausar para respirar, es vigorosa.",
    ],
    Escena: Borg,
  },
  {
    id: "i-zonas",
    seccion: SEC + " · Zonas",
    textos: [
      "Juntando los métodos se forman las **zonas de entrenamiento**. Zona 1, del **50 al 60 %** de la FC máxima: muy ligera, para recuperar. Zona 2, del **60 al 70 %**: ligera, base aeróbica y oxidación de grasas.",
      "Zona 3, del **70 al 80 %**: moderada, mejora la capacidad aeróbica. Zona 4, del **80 al 90 %**: dura, cerca del **umbral anaeróbico**. Zona 5, del **90 al 100 %**: máxima, para el **VO₂máx** y la potencia anaeróbica.",
    ],
    Escena: Zonas,
  },
  {
    id: "i-fuerza",
    seccion: SEC + " · Entrenamiento de fuerza",
    textos: [
      "En el **entrenamiento de fuerza** la intensidad se expresa como **porcentaje de 1RM**: la carga máxima que se puede levantar **una sola vez**.",
      "Relación aproximada: **85 % o más**, de 1 a 5 repeticiones, para **fuerza máxima**; del **67 al 85 %**, de 6 a 12 repeticiones, para **hipertrofia**; y **67 % o menos**, 12 o más repeticiones, para **resistencia muscular**.",
      "Otras formas: las **repeticiones en reserva (RIR)**, cuántas repeticiones te quedan antes del fallo, y la **velocidad de ejecución**: a más carga, la barra se mueve **más lento**.",
    ],
    Escena: Fuerza,
  },
];
