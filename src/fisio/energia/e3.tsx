import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../motor";
import { Polvo } from "../modelos/comun";
import {
  ATPsintasa,
  Cadena,
  Complejo,
  KREBS,
  Membrana,
  MitocondriaGrande,
  Mol,
  posKrebs,
  RuedaKrebs,
} from "../modelos/energia";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Tarjeta } from "../ui";
import { MiniATP } from "./e1";

const SEC = "Metabolismo aeróbico";
const H = "#ff4d4d";
const NADH = "#5ec8ff";
const FADH = "#7cff8a";
const CO2 = "#8a8f99";
const E = "#ffe14d";

// ===================================================================

const AerobicaIntro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-0.6, 0.8, 8.4], l: [-0.6, 0, 0], fov: 40 },
      { b: 1, p: [1.4, 0.6, 6.4], l: [1.4, 0, 0], fov: 40 },
      { b: 2, p: [0.6, 0.9, 7.6], l: [0.6, 0, 0], fov: 40 },
    ],
    b,
  );
  const entra = lineal(b, 0.4, 1.4);
  const piruvato: V3 = mix3([-3.2, 0.2, 0.3], [1.0, 0.1, 0.3], entra);
  const acetil = b > 1.4;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[2.2, 0, -0.3]}>
          <MitocondriaGrande brillo={visible(b, 1, 3) * 0.3} />
        </group>
        {/* glucosa que se rompe en piruvato en el citosol */}
        {b < 0.5 ? <Cadena n={6} anillo p={[-3.2, 0.2, 0.3]} color="#ffd166" sep={0.25} /> : null}
        {b >= 0.4 && !acetil ? <Cadena n={3} p={[piruvato[0] - 0.3, piruvato[1], piruvato[2]]} color="#ff9a5c" sep={0.3} /> : null}
        {acetil ? (
          <>
            <Cadena n={2} p={[mix(1.0, 2.6, entre(b, 1.4, 2)), 0.1, 0.3]} color="#ffb000" sep={0.3} />
            <Mol p={[mix(1.6, 3.2, entre(b, 1.4, 2)), 0.1, 0.3]} color="#c08cff" r={0.16} />
            <Mol p={[1.0 + entre(b, 1.4, 1.8) * 0.5, 0.1 + entre(b, 1.4, 1.8) * 1.4, 0.4]} color={CO2} r={0.1} />
          </>
        ) : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-3.2, 0.5, 0.3], t: "Glucosa → piruvato (citosol)", a: 0.05, z: 1, o: [-40, -90], color: "#ffd166" },
          { p: [2.2, 0.9, -0.3], t: "Mitocondria", a: 0.3, z: 3, o: [60, -80], color: C.mitocondria },
          { p: [2.0, 0.2, 0.3], t: "Acetil-CoA → ciclo de Krebs", a: 1.45, z: 2.2, o: [60, 90], color: "#ffb000" },
          { p: [1.4, 1.2, 0.4], t: "CO₂", a: 1.45, z: 2, o: [-60, -60], color: CO2 },
        ]}
      />
      <Tarjeta b={b} a={0} z={3} x={60} y={130} w={560} titulo="Glucólisis aeróbica" color={C.mitocondria} tam={25}>
        <Lista
          items={[
            "**Dónde**: mitocondrias",
            "Con O₂ el piruvato **no** se convierte en lactato",
            b > 1 ? "Piruvato → **acetil-CoA** → **Krebs** → **cadena de electrones**" : "",
            b > 1 ? "Productos finales: **H₂O y CO₂**" : "",
            b > 2 ? "≈ **36 ATP** por glucosa" : "",
            b > 2 ? "✔ Más eficiente; esfuerzos de **horas**" : "",
            b > 2 ? "✖ Más **lenta**; **depende del oxígeno**" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================

// En que paso del ciclo se libera cada producto (indice del intermediario que se forma)
const PRODUCTOS: { paso: number; color: string; t: string }[] = [
  { paso: 2, color: CO2, t: "CO₂" },
  { paso: 2, color: NADH, t: "NADH" },
  { paso: 3, color: CO2, t: "CO₂" },
  { paso: 3, color: NADH, t: "NADH" },
  { paso: 4, color: C.atp, t: "GTP" },
  { paso: 5, color: FADH, t: "FADH₂" },
  { paso: 7, color: NADH, t: "NADH" },
];

const Krebs: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.5, 1.6, 4.6], l: [0, 1.2, 0], fov: 40 },
      { b: 1, p: [0, -0.5, 6.6], l: [0, -0.5, 0], fov: 40 },
      { b: 3, p: [0.4, -0.3, 6.4], l: [0, -0.5, 0], fov: 40 },
    ],
    b,
  );
  const vuelta = b < 1 ? 0 : lineal(b, 1.0, 2.9) * 1.999;
  const frac = vuelta % 1;
  const paso = Math.floor(frac * 8);
  const entraAcetil = entre(b, 0.2, 0.7);
  const giro = frac * Math.PI * 2;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <RuedaKrebs giro={giro} resalta={b < 1 ? (b < 0.7 ? 7 : 0) : paso} />
        {b < 1 ? (
          <>
            <Cadena n={2} p={mix3([-2.4, 3.0, 0], [-0.15, 1.6, 0.1], entraAcetil)} color="#ffb000" sep={0.3} />
            <Mol p={mix3([-1.8, 3.0, 0], [-1.2, 2.6, 0], entraAcetil)} color="#c08cff" r={0.15} op={1} />
          </>
        ) : null}
        {/* productos que salen del ciclo en cada paso */}
        {b >= 1
          ? PRODUCTOS.map((pr, i) => {
              const inicio = pr.paso / 8;
              const f = frac - inicio;
              if (f < 0 || f > 0.35) return null;
              const base = posKrebs(pr.paso, 0);
              const dir: V3 = [base[0] * 0.7, base[1] * 0.7, 0.3];
              const t = f / 0.35;
              return <Mol key={i} p={[base[0] + dir[0] * t + (i % 2) * 0.15, base[1] + dir[1] * t, dir[2] * t]} color={pr.color} r={0.12} op={1 - t * 0.5} />;
            })
          : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.15, 1.6, 0.1], t: "Acetil-CoA (2 C)", a: 0.05, z: 0.9, o: [-80, -80], color: "#ffb000" },
          { p: posKrebs(7), t: "Oxalacetato (4 C)", a: 0.2, z: 0.95, o: [-80, -40], color: "#ffd166" },
          { p: posKrebs(0), t: "Citrato (6 C)", a: 0.65, z: 1, o: [80, -60], color: "#7fd6ff" },
          ...KREBS.map((n, i) => ({
            p: posKrebs(i),
            t: n,
            a: 1.0,
            z: 3,
            o: [posKrebs(i)[0] >= 0 ? 60 : -60, posKrebs(i)[1] >= 0 ? -40 : 40] as [number, number],
            color: i === 7 ? "#ffd166" : "#7fd6ff",
          })),
        ]}
      />
      <Tarjeta b={b} a={2} z={3} x={60} y={130} w={460} titulo="Por cada vuelta" color={NADH} tam={30}>
        <Lista items={["**3 NADH**", "**1 FADH₂**", "**1 GTP** (= ATP)", "**2 CO₂**"]} />
        <div style={{ fontSize: 22, color: C.suave, marginTop: 8 }}>2 vueltas por cada glucosa</div>
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================

const CX = { I: -2.8, II: -1.6, Q: -1.0, III: -0.2, c: 0.6, IV: 1.3, sint: 3.0 };

const CadenaTransporte: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.8, 9.6], l: [0, -0.2, 0], fov: 40 },
      { b: 1, p: [-1.2, 0.4, 7.0], l: [-1.0, -0.2, 0], fov: 40 },
      { b: 2, p: [1.2, -0.2, 6.2], l: [1.2, -0.5, 0], fov: 40 },
      { b: 3, p: [2.4, -0.2, 6.6], l: [2.4, -0.6, 0], fov: 40 },
      { b: 4, p: [0.6, 0.6, 9.6], l: [0.2, -0.2, 0], fov: 40 },
    ],
    b,
  );
  const activo = b >= 1;
  // electrones recorriendo I -> Q -> III -> c -> IV
  const ruta: V3[] = [
    [CX.I, -0.6, 0.4],
    [CX.I, 0, 0.4],
    [CX.Q, 0, 0.5],
    [CX.III, 0, 0.4],
    [CX.c, 0.55, 0.4],
    [CX.IV, 0, 0.4],
    [CX.IV, -0.6, 0.4],
  ];
  const enRuta = (t: number): V3 => {
    const f = Math.min(ruta.length - 1.001, t * (ruta.length - 1));
    const i = Math.floor(f);
    return mix3(ruta[i], ruta[i + 1], f - i);
  };
  const electrones = activo ? [0, 1, 2, 3].map((k) => enRuta((b * 0.6 + k / 4) % 1)) : [];
  // protones bombeados hacia arriba (espacio intermembrana)
  const bombeo = activo
    ? [CX.I, CX.III, CX.IV].flatMap((x, j) =>
        [0, 1].map((k): V3 => {
          const f = (b * 0.9 + k / 2 + j * 0.2) % 1;
          return [x + (k ? 0.15 : -0.15), mix(-0.6, 1.2, f), 0.3];
        }),
      )
    : [];
  const arriba: V3[] = Array.from({ length: Math.round(8 + entre(b, 1, 2) * 18) }).map((_, i) => [
    -3 + ((i * 0.37) % 6.2),
    1.0 + ((i * 0.53) % 0.8),
    -0.4 + ((i * 0.29) % 0.8),
  ]);
  const sintasaOn = entre(b, 2.9, 3.1);
  const bajan = sintasaOn > 0 ? [0, 1, 2, 3].map((k): V3 => [CX.sint, mix(1.2, -0.9, (b * 1.2 + k / 4) % 1), 0.1]) : [];
  const giro = b * 9 * sintasaOn;
  const atps = sintasaOn > 0 ? [0, 1, 2].map((k): V3 => [CX.sint + 0.5 + ((b * 0.8 + k / 3) % 1) * 1.4, -1.5 - k * 0.15, 0.4]) : [];
  const agua = entre(b, 2.2, 2.6);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Membrana ancho={8.4} prof={2.2} />
        <Complejo p={[CX.I, 0, 0]} color="#ff7a59" escala={[0.5, 0.95, 0.5]} brillo={visible(b, 1, 2) * 0.4} />
        <Complejo p={[CX.II, -0.25, 0]} color="#ffd166" escala={[0.35, 0.55, 0.35]} />
        <Complejo p={[CX.Q, 0, 0.5]} color="#7cff8a" escala={[0.15, 0.15, 0.15]} />
        <Complejo p={[CX.III, 0, 0]} color="#5ec8ff" escala={[0.45, 0.85, 0.45]} brillo={visible(b, 1, 2) * 0.4} />
        <Complejo p={[CX.c, 0.55, 0.3]} color="#ff8fd0" escala={[0.14, 0.14, 0.14]} />
        <Complejo p={[CX.IV, 0, 0]} color="#b48cff" escala={[0.45, 0.85, 0.45]} brillo={visible(b, 2, 3) * 0.5} />
        <ATPsintasa p={[CX.sint, 0, 0]} giro={giro} brillo={sintasaOn * 0.4} />
        {activo ? <Mol p={[CX.I - 0.6, -1.0 + (b % 1) * 0.3, 0.4]} color={NADH} r={0.13} /> : null}
        {activo ? <Mol p={[CX.II - 0.4, -0.9, 0.4]} color={FADH} r={0.12} /> : null}
        {electrones.map((p, i) => (
          <Mol key={`e${i}`} p={p} color={E} r={0.07} />
        ))}
        {bombeo.map((p, i) => (
          <Mol key={`h${i}`} p={p} color={H} r={0.06} />
        ))}
        {activo ? arriba.map((p, i) => <Mol key={`a${i}`} p={p} color={H} r={0.055} op={0.85} />) : null}
        {b >= 2 ? (
          <>
            <Mol p={[CX.IV + 0.5, mix(-1.6, -0.8, agua), 0.4]} color="#ff5050" r={0.13} />
            {agua > 0.9 ? <Mol p={[CX.IV + 0.8, -1.3, 0.5]} color="#a8e6ff" r={0.12} /> : null}
          </>
        ) : null}
        {bajan.map((p, i) => (
          <Mol key={`b${i}`} p={p} color={H} r={0.06} />
        ))}
        {atps.map((p, i) => (
          <MiniATP key={`t${i}`} p={p} escala={1.6} brillo={0.6} />
        ))}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-3.6, 1.3, 0], t: "Espacio intermembrana", a: 0.05, z: 1, o: [-40, -60], color: C.suave },
          { p: [-3.6, -1.3, 0], t: "Matriz mitocondrial", a: 0.05, z: 1, o: [-40, 60], color: C.suave },
          { p: [CX.I, 0.95, 0], t: "Complejo I", a: 0.15, z: 1.2, o: [-40, -70], color: "#ff7a59" },
          { p: [CX.II, -0.8, 0], t: "II", a: 0.2, z: 1.2, o: [-30, 70], color: "#ffd166" },
          { p: [CX.III, 0.85, 0], t: "Complejo III", a: 0.25, z: 1.2, o: [0, -80], color: "#5ec8ff" },
          { p: [CX.IV, 0.85, 0], t: "Complejo IV", a: 0.3, z: 1.2, o: [40, -70], color: "#b48cff" },
          { p: [CX.sint, 0.3, 0], t: "ATP sintasa", a: 0.35, z: 1.2, o: [60, -80], color: "#b48cff" },
          { p: [CX.I - 0.6, -1.0, 0.4], t: "NADH", a: 1.05, z: 2, o: [-60, 60], color: NADH },
          { p: [CX.II - 0.4, -0.9, 0.4], t: "FADH₂", a: 1.1, z: 2, o: [-30, 90], color: FADH },
          { p: [CX.III, 0, 0.4], t: "e⁻", a: 1.15, z: 2, o: [40, 70], color: E },
          { p: [CX.III, 0.9, 0.3], t: "H⁺ bombeados", a: 1.3, z: 2, o: [60, -80], color: H },
          { p: [CX.IV + 0.5, -1.0, 0.4], t: "O₂ + H⁺ → H₂O", a: 2.15, z: 3, o: [60, 70], color: "#a8e6ff" },
          { p: [CX.sint, 0.6, 0.1], t: "H⁺ regresan: gira la turbina", a: 3.05, z: 4, o: [-60, -90], color: H },
          { p: [CX.sint + 1.0, -1.6, 0.4], t: "ADP + Pi → ATP", a: 3.2, z: 4, o: [60, 70], color: C.atp },
        ]}
      />
    </AbsoluteFill>
  );
};

const Balance: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-3.0, 0.4, 5.6], l: [-2.2, 0, 0], fov: 40 },
      { b: 2, p: [-3.2, 0.6, 5.2], l: [-2.2, 0, 0], fov: 40 },
    ],
    b,
  );
  const barras: [string, number, string, number][] = [
    ["Glucólisis", 2, "#ffd166", 0.05],
    ["Krebs", 2, "#7fd6ff", 0.4],
    ["Cadena de electrones (NADH, FADH₂)", 32, C.mitocondria, 1.1],
  ];
  const total = barras.reduce((a, [, v, , t]) => a + (b > t ? v : 0), 0);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0.2, b * 0.3, 0]} position={[-4.4, 0, -1]}>
          <MitocondriaGrande />
        </group>
        <Polvo b={b} radio={5} />
      </Escena3D>
      <div style={{ position: "absolute", right: 60, top: 140, width: 1000, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "20px 26px" }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: C.acento2, marginBottom: 12 }}>ATP por cada glucosa</div>
        {barras.map(([n, v, c, t]) => (
          <div key={n} style={{ marginBottom: 12, opacity: entre(b, t, t + 0.15) }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{n}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ height: 34, width: `${(v / 36) * 760 * entre(b, t, t + 0.3)}px`, background: c, borderRadius: 8 }} />
              <span style={{ fontSize: 30, fontWeight: 900, color: c }}>{v === 32 ? "≈ 32" : v}</span>
            </div>
          </div>
        ))}
        <div style={{ borderTop: "2px solid rgba(255,255,255,0.2)", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 34, fontWeight: 900 }}>
          <span>Aeróbico</span>
          <span style={{ color: "#7cff8a", fontVariantNumeric: "tabular-nums" }}>≈ {total} ATP</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 800, marginTop: 6, opacity: entre(b, 1.3, 1.5) }}>
          <span>Anaeróbico</span>
          <span style={{ color: "#ff8fd0" }}>2 ATP</span>
        </div>
        <div style={{ fontSize: 24, color: C.suave, marginTop: 14, opacity: entre(b, 1.05, 1.2) }}>
          1 NADH ≈ 2.5–3 ATP · 1 FADH₂ ≈ 1.5 ATP
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const E3: PlanoDef[] = [
  {
    id: "e-glucolisis-aerobica",
    seccion: SEC + " · Glucólisis aeróbica",
    textos: [
      "**Glucólisis aeróbica (catabolismo aeróbico de la glucosa).** Ocurre en las **mitocondrias**. Empieza igual: **glucosa → piruvato**, pero la **presencia de oxígeno evita** que el piruvato se convierta en lactato.",
      "El piruvato entra en la mitocondria y se transforma en **acetil-CoA**, que pasa al **ciclo de Krebs** y luego a la **cadena de transporte de electrones**. Productos finales: **agua (H₂O) y dióxido de carbono (CO₂)**.",
      "Rinde aproximadamente **36 ATP por molécula de glucosa**. Ventajas: **mayor eficiencia** y permite mantener el esfuerzo **durante horas**. Desventajas: genera energía **más lentamente** y **depende del oxígeno** disponible.",
    ],
    Escena: AerobicaIntro,
  },
  {
    id: "e-krebs",
    seccion: SEC + " · Ciclo de Krebs",
    textos: [
      "**Ciclo de Krebs**: en la matriz de la mitocondria, el **acetil-CoA** (2 carbonos) se une al **oxalacetato** (4 carbonos) y forma **citrato** (6 carbonos).",
      "El citrato pasa por **isocitrato, alfa-cetoglutarato, succinil-CoA, succinato, fumarato y malato**, hasta regenerar el **oxalacetato**. En el camino libera **2 CO₂**.",
      "Cada vuelta produce **3 NADH, 1 FADH₂ y 1 GTP**, equivalente a un ATP. El NADH y el FADH₂ **llevan electrones** a la cadena de transporte.",
    ],
    Escena: Krebs,
  },
  {
    id: "e-cadena-electrones",
    seccion: SEC + " · Cadena de transporte de electrones",
    textos: [
      "**Cadena de transporte de electrones**: en la **membrana interna** de la mitocondria hay **complejos de proteínas** (I, II, III y IV) y la **ATP sintasa**.",
      "El **NADH** y el **FADH₂** entregan sus **electrones**, que pasan de complejo en complejo. Esa energía **bombea protones (H⁺)** hacia el espacio intermembrana.",
      "Al final, en el **complejo IV**, los electrones se unen al **oxígeno**, que junto con los H⁺ forma **agua**. Por eso necesitamos **respirar**.",
      "Los H⁺ acumulados regresan a través de la **ATP sintasa**, que **gira como una turbina** y fabrica **ATP** a partir de ADP y fosfato.",
    ],
    Escena: CadenaTransporte,
  },
  {
    id: "e-balance",
    seccion: SEC + " · Balance energético",
    textos: [
      "**Balance energético**: la **glucólisis** aporta **2 ATP y 2 NADH**; el **ciclo de Krebs** aporta **2 ATP** más y la mayor parte del **NADH y FADH₂**.",
      "En la cadena de transporte, cada **NADH** rinde **2.5 a 3 ATP** y cada **FADH₂** unos **1.5 ATP**. En total, unos **36 ATP por glucosa**, frente a solo **2 ATP en la vía anaeróbica**.",
    ],
    Escena: Balance,
  },
];
