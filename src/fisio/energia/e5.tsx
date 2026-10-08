import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, PlanoDef, useBeat, V3 } from "../motor";
import { Humano } from "../modelos/cuerpo";
import { Polvo } from "../modelos/comun";
import { Mol, Vaso } from "../modelos/energia";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Rico, Tarjeta } from "../ui";

const SEC = "Continuum energético";
const COL = { pcr: "#8f4ad8", anae: "#f08a2a", aero: "#3fb6e0", grasa: "#5b6f8f" };

// ---- Linea de tiempo (diapositiva 40) -------------------------------------

const TRAMOS: { t: string; d: string; c: string; x0: number; x1: number; s: string }[] = [
  { t: "ATP", d: "0–5 s", c: COL.pcr, x0: 0, x1: 0.07, s: "Anaeróbico aláctico" },
  { t: "PCr", d: "0–15 s", c: COL.pcr, x0: 0.07, x1: 0.16, s: "Anaeróbico aláctico" },
  { t: "Glucólisis anaeróbica", d: "10–90 s", c: COL.anae, x0: 0.16, x1: 0.38, s: "Anaeróbico láctico" },
  { t: "Glucólisis aeróbica", d: "1.5–30 min", c: COL.aero, x0: 0.38, x1: 0.66, s: "Aeróbico" },
  { t: "Beta-oxidación", d: "30–180 min", c: COL.grasa, x0: 0.66, x1: 0.92, s: "Aeróbico" },
  { t: "Otros", d: "", c: "#7cff8a", x0: 0.92, x1: 1, s: "Aeróbico" },
];

const LineaTiempo: React.FC<{ avance: number; top?: number }> = ({ avance, top = 600 }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "16px 40px" }}>
    <div style={{ position: "relative", height: 150 }}>
      <div style={{ position: "absolute", top: 56, left: 0, right: 0, height: 6, background: "rgba(255,255,255,0.25)", borderRadius: 3 }} />
      <div style={{ position: "absolute", top: 56, left: 0, width: `${avance * 100}%`, height: 6, background: C.acento2, borderRadius: 3 }} />
      <div style={{ position: "absolute", top: 36, left: `calc(${avance * 100}% - 20px)`, width: 40, height: 40, borderRadius: 20, background: C.acento2, boxShadow: `0 0 24px ${C.acento2}` }} />
      {TRAMOS.map((tr) => {
        const on = avance >= tr.x0;
        return (
          <div key={tr.t} style={{ position: "absolute", left: `${tr.x0 * 100}%`, width: `${(tr.x1 - tr.x0) * 100}%`, top: 0, opacity: on ? 1 : 0.35, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: tr.c, height: 30, whiteSpace: "nowrap", overflow: "visible" }}>{tr.t}</div>
            <div style={{ marginTop: 50, fontSize: 22, color: C.suave }}>{tr.d}</div>
          </div>
        );
      })}
    </div>
  </div>
);

const ContinuumIntro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [2.6, 1.3, 2.6], l: [0, 1.1, 0], fov: 36 },
      { b: 2, p: [3.0, 1.3, 1.8], l: [0, 1.1, 0], fov: 36 },
    ],
    b,
  );
  const avance = lineal(b, 0.1, 1.95);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0, 0.25, 0]} rotation={[0, 0.4, 0]}>
          <Humano fase={b * mix(14, 6, avance)} marcha={mix(1.7, 0.9, avance)} musculo={0.55} />
        </group>
      </Escena3D>
      <LineaTiempo avance={avance} top={560} />
      <div style={{ position: "absolute", left: 80, top: 480, display: "flex", gap: 24, fontFamily: FUENTE, fontSize: 26, fontWeight: 800, background: "rgba(4,9,20,0.8)", padding: "8px 16px", borderRadius: 10 }}>
        <span style={{ color: COL.pcr }}>■ Anaeróbico aláctico</span>
        <span style={{ color: COL.anae }}>■ Anaeróbico láctico</span>
        <span style={{ color: COL.aero }}>■ Aeróbico</span>
      </div>
    </AbsoluteFill>
  );
};

// ---- Grafica de areas kJ/min (diapositivas 36-39) --------------------------

// Eje X logaritmico aproximado: 0s,10s,1min,10min,30min,90min,2h,5h,10h
const TX = ["0 s", "10 s", "1 min", "10 min", "30 min", "90 min", "2 h", "5 h", "10 h"];
const curvaPCr = (x: number) => 340 * Math.exp(-x * 9);
const curvaAnae = (x: number) => 200 * Math.exp(-(((x - 0.24) / 0.13) ** 2));
const curvaAero = (x: number) => 130 * Math.exp(-(((x - 0.5) / 0.17) ** 2));
const curvaGrasa = (x: number) => (x < 0.35 ? 0 : 75 * Math.min(1, (x - 0.35) / 0.15) * (x > 0.95 ? 0.6 : 1));

const Area: React.FC<{ f: (x: number) => number; color: string; w: number; h: number; hasta: number; op: number }> = ({ f, color, w, h, hasta, op }) => {
  const n = 120;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * hasta;
    pts.push(`${x * w},${h - (f(x) / 400) * h}`);
  }
  return <polygon points={`0,${h} ${pts.join(" ")} ${hasta * w},${h}`} fill={color} opacity={op} />;
};

const Grafica: React.FC<{ b: number }> = ({ b }) => {
  const W = 1300;
  const Hh = 520;
  const capas = [
    { f: curvaPCr, c: COL.pcr, a: 0, t: "ATP/PCr" },
    { f: curvaAnae, c: COL.anae, a: 1, t: "Glucólisis anaeróbica" },
    { f: curvaAero, c: COL.aero, a: 2, t: "Aeróbico de la glucosa" },
    { f: curvaGrasa, c: COL.grasa, a: 2.45, t: "Aeróbico de las grasas" },
  ];
  return (
    <div style={{ position: "absolute", left: 300, top: 130, fontFamily: FUENTE, color: C.texto }}>
      <div style={{ fontSize: 26, color: C.suave, marginBottom: 6 }}>Energía producida (kJ/min) · 1 kcal = 4.184 kJ</div>
      <svg width={W + 60} height={Hh + 60} style={{ background: "rgba(4,9,20,0.85)", borderRadius: 14 }}>
        <g transform="translate(50,14)">
          {[0, 100, 200, 300, 400].map((v) => (
            <g key={v}>
              <line x1={0} x2={W} y1={Hh - (v / 400) * Hh} y2={Hh - (v / 400) * Hh} stroke="rgba(255,255,255,0.1)" />
              <text x={-8} y={Hh - (v / 400) * Hh + 6} fill={C.suave} fontSize={18} textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          {capas.map((k) =>
            b > k.a ? <Area key={k.t} f={k.f} color={k.c} w={W} h={Hh} hasta={Math.min(1, entre(b, k.a, k.a + 0.6) * 1)} op={0.75} /> : null,
          )}
          {TX.map((t, i) => (
            <text key={t} x={(i / (TX.length - 1)) * W} y={Hh + 34} fill={C.suave} fontSize={18} textAnchor="middle">
              {t}
            </text>
          ))}
        </g>
      </svg>
      <div style={{ display: "flex", gap: 24, marginTop: 10, fontSize: 24, fontWeight: 800 }}>
        {capas.map((k) => (
          <span key={k.t} style={{ color: k.c, opacity: b > k.a ? 1 : 0.3 }}>
            ■ {k.t}
          </span>
        ))}
      </div>
    </div>
  );
};

const ContinuumGrafica: React.FC<{ textos: string[] }> = ({ textos }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.fondo2} 0%, ${C.fondo} 75%)` }}>
    <Grafica b={useBeat(textos)} />
  </AbsoluteFill>
);

// ---- Factores ---------------------------------------------------------------

const FACTORES = [
  { n: "1. Duración", t: "Corta = **anaeróbico** · Prolongada = **aeróbico**", c: COL.pcr },
  { n: "2. Intensidad", t: "Alta = **glucólisis anaeróbica** · Baja a moderada = **oxidativo**", c: COL.anae },
  { n: "3. Sustratos", t: "**PCr** para esfuerzos breves · **Glucógeno y lípidos** para prolongados", c: COL.aero },
  { n: "4. Entrenamiento", t: "En entrenados, el oxidativo **entra antes** y el lactato **se acumula más lento**", c: "#7cff8a" },
];

const Factores: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.fondo2} 0%, ${C.fondo} 75%)` }}>
      <div style={{ position: "absolute", left: 120, right: 120, top: 140, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, fontFamily: FUENTE, color: C.texto }}>
        {FACTORES.map((f, i) => {
          const op = entre(b, i < 2 ? i * 0.4 : 1 + (i - 2) * 0.4, (i < 2 ? i * 0.4 : 1 + (i - 2) * 0.4) + 0.2);
          return (
            <div key={f.n} style={{ opacity: op, transform: `translateY(${(1 - op) * 20}px)`, background: "rgba(4,9,20,0.85)", borderRadius: 16, padding: "24px 28px", borderTop: `6px solid ${f.c}`, minHeight: 170 }}>
              <div style={{ fontSize: 38, fontWeight: 900, color: f.c, marginBottom: 10 }}>{f.n}</div>
              <div style={{ fontSize: 30, lineHeight: 1.3 }}>
                <Rico t={f.t} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- Oclusion vascular -------------------------------------------------------

const Oclusion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.8, 7.6], l: [0, -0.3, 0], fov: 40 },
      { b: 1, p: [1.2, 0.5, 6.4], l: [0, -0.3, 0], fov: 40 },
      { b: 3, p: [-0.4, 0.8, 7.2], l: [0, -0.3, 0], fov: 40 },
    ],
    b,
  );
  const rm = b < 1 ? 10 : Math.round(mix(10, 70, lineal(b, 1.05, 1.9)));
  const comprime = Math.min(1, Math.max(0, (rm - 30) / 40));
  const hinchado = rm / 100;
  const o2 = Array.from({ length: 8 }).map((_, i): V3 => {
    const f = (b * 0.8 + i / 8) % 1;
    return [mix(-2.6, 2.6, f), 0.05 + Math.sin(i * 3) * 0.1, 0.35];
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <mesh scale={[2.2, 0.9 + hinchado * 0.5, 0.9 + hinchado * 0.4]}>
          <sphereGeometry args={[1, 48, 32]} />
          <meshPhysicalMaterial color={C.musculo} emissive={C.musculoClaro} emissiveIntensity={0.1 + hinchado * 0.5} transparent opacity={0.55} roughness={0.4} clearcoat={0.4} depthWrite={false} />
        </mesh>
        <Vaso desde={[-3.2, 0, 0.35]} hasta={[3.2, 0, 0.35]} t={b * 0.5} radio={0.22} comprime={comprime} />
        {comprime < 0.95 ? o2.map((p, i) => <Mol key={i} p={p} color="#a8e6ff" r={0.06} op={1 - comprime} />) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.2, 0.8, 0.4], t: "Músculo en contracción isométrica", a: 0.05, z: 3, o: [-60, -100], color: C.musculoClaro },
          { p: [2.4, 0, 0.35], t: comprime > 0.9 ? "Vaso ocluido: sin O₂" : "Vaso sanguíneo (O₂)", a: 0.1, z: 3, o: [40, 90], color: "#ff6b6b" },
        ]}
      />
      <div style={{ position: "absolute", right: 80, top: 160, width: 380, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.85)", borderRadius: 16, padding: "18px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 26, color: C.suave }}>Fuerza (% de 1RM)</div>
        <div style={{ fontSize: 80, fontWeight: 900, color: rm >= 50 ? "#ff5050" : rm > 30 ? C.acento2 : "#7cff8a", fontVariantNumeric: "tabular-nums" }}>{rm} %</div>
        <div style={{ fontSize: 26, fontWeight: 700 }}>{rm >= 50 ? "Oclusión completa" : rm > 30 ? "Flujo restringido" : "Flujo normal"}</div>
      </div>
      {b >= 2 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FUENTE, fontSize: 44, fontWeight: 900, color: COL.anae }}>
          Hipoxia local → vía anaeróbica inmediata
        </div>
      ) : null}
      <Tarjeta b={b} a={0} z={1} x={60} y={140} w={520} titulo="Mecánica y circulación" color={C.acento} tam={27}>
        <Rico t="La transición entre sistemas también depende de cómo se **contrae** el músculo y de su efecto en el **flujo sanguíneo**." />
      </Tarjeta>
    </AbsoluteFill>
  );
};

export const E5: PlanoDef[] = [
  {
    id: "e-continuum",
    seccion: SEC,
    textos: [
      "**Continuum energético**: es la respuesta del organismo a la actividad física para **garantizar la resíntesis de ATP**.",
      "Los **tres sistemas**, anaeróbico aláctico, anaeróbico láctico y aeróbico, **no actúan de forma aislada**: se usan **de forma simultánea y dinámica**, según la **intensidad y la duración** del ejercicio.",
    ],
    Escena: ContinuumIntro,
  },
  {
    id: "e-continuum-grafica",
    seccion: SEC + " · Energía por minuto",
    textos: [
      "**Al inicio** domina el **sistema de fosfágenos (ATP y fosfocreatina)**: la mayor potencia, pero solo durante unos segundos.",
      "Conforme avanza el tiempo **aumenta la participación glucolítica**: la glucólisis anaeróbica alcanza su pico alrededor del **primer minuto**.",
      "Finalmente **predomina el metabolismo oxidativo** para sostener el esfuerzo prolongado: primero de la **glucosa** y, en esfuerzos de horas, de las **grasas**.",
      "**Ningún sistema se apaga**: simplemente **cambia su contribución relativa**. La energía se expresa en **kilojulios por minuto**; una kilocaloría equivale a **4.184 kilojulios**.",
    ],
    Escena: ContinuumGrafica,
  },
  {
    id: "e-factores",
    seccion: SEC + " · Factores",
    textos: [
      "**Factores que determinan el sistema predominante. 1. Duración**: corta, anaeróbico; prolongada, aeróbico. **2. Intensidad**: alta, glucólisis anaeróbica; baja a moderada, oxidativo.",
      "**3. Disponibilidad de sustratos**: fosfocreatina para esfuerzos breves; glucógeno y lípidos para los prolongados. **4. Nivel de entrenamiento**: en sujetos entrenados, el sistema oxidativo **entra antes** y el lactato **se acumula más lentamente**.",
    ],
    Escena: Factores,
  },
  {
    id: "e-oclusion",
    seccion: SEC + " · Contracción y oclusión vascular",
    textos: [
      "La transición entre sistemas no solo depende del tiempo: también de la **mecánica de la contracción muscular** y su efecto sobre la **circulación**.",
      "En contracciones **isométricas sostenidas**, el músculo **comprime sus propios vasos**. Por encima del **30 % de la fuerza máxima (1RM)** el flujo se restringe; entre el **50 % y el 70 %** los vasos **se obstruyen por completo**.",
      "Ante esa **hipoxia local**, como al sostener una **plancha abdominal** rígida o empujar una carga inamovible, el organismo **no espera** al continuum: activa **de inmediato la vía anaeróbica**.",
    ],
    Escena: Oclusion,
  },
];
