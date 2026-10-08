import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix3, PlanoDef, useBeat, V3 } from "../motor";
import { Polvo } from "../modelos/comun";
import { Cadena, Esfera, GotaLipido, Higado, MitocondriaGrande, Mol, posKrebs, RuedaKrebs } from "../modelos/energia";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Tarjeta } from "../ui";

const GRASA = "#ffd34d";
const NADH = "#5ec8ff";
const FADH = "#7cff8a";
const COA = "#c08cff";

const BetaIntro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.6, 8.2], l: [0, -0.2, 0], fov: 40 },
      { b: 2, p: [0.8, 0.8, 7.6], l: [0.6, -0.2, 0], fov: 40 },
    ],
    b,
  );
  const viaje = lineal(b, 0.2, 1.6);
  const chains = [0, 1, 2].map((k) => {
    const f = (viaje + k * 0.33) % 1;
    return mix3([-2.6, 0.6 - k * 0.4, 0.3], [1.6, 0.2 - k * 0.2, 0.3], f);
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <GotaLipido p={[-3.2, 0.2, 0]} r={0.9} />
        <group position={[2.6, 0, -0.4]}>
          <MitocondriaGrande brillo={0.2} />
        </group>
        {chains.map((p, i) => (
          <Cadena key={i} n={8} p={p} color={GRASA} sep={0.16} brillo={0.3} />
        ))}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-3.2, 1.0, 0], t: "Gota de lípidos (triglicéridos)", a: 0.05, z: 2, o: [-40, -80], color: GRASA },
          { p: [2.6, 0.9, -0.4], t: "Mitocondria", a: 0.1, z: 2, o: [60, -80], color: C.mitocondria },
          { p: [0, 0.4, 0.3], t: "Ácidos grasos →", a: 0.3, z: 2, o: [-40, 90], color: GRASA },
        ]}
      />
      <Tarjeta b={b} a={0} z={2} x={60} y={130} w={600} titulo="Beta-oxidación (aeróbico)" color={GRASA} tam={26}>
        <Lista
          items={[
            "**Dónde**: mitocondria",
            "**Duración**: media a larga (> 20–30 min)",
            "**Sustrato**: ácidos grasos",
            b > 1 ? "**ATP**: muy alto (≈ **129** por ácido palmítico)" : "",
            b > 1 ? "✔ Energía **casi ilimitada**" : "",
            b > 1 ? "✖ **Más lenta** que la glucosa; **requiere O₂**" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

const PASOS_BETA = ["Oxidación (FAD → FADH₂)", "Hidratación (+ H₂O)", "Oxidación (NAD⁺ → NADH)", "Tiólisis (tiolasa + CoA)"];

const BetaProceso: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.4, 0.4, 7.6], l: [0.4, -0.3, 0], fov: 40 },
      { b: 2, p: [1.4, 0.5, 7.8], l: [1.2, -0.3, 0], fov: 40 },
      { b: 3, p: [1.6, 0.6, 8.0], l: [1.4, -0.3, 0], fov: 40 },
    ],
    b,
  );
  // 4 vueltas de beta-oxidacion a lo largo de b0..b2
  const vueltas = lineal(b, 0.1, 2.0) * 4;
  const hechas = Math.min(4, Math.floor(vueltas));
  const sub = vueltas - hechas;
  const paso = Math.min(3, Math.floor(sub * 4));
  const largo = 16 - hechas * 2;
  const sep = 0.2;
  const corte = paso === 3 ? entre(sub, 0.8, 1) : 0;
  const acetiles = Array.from({ length: hechas }).map((_, i) => {
    const t = Math.min(1, vueltas - (i + 1));
    return mix3([-0.2, 0, 0.3], [posKrebs(7, 0, 0.8)[0] + 3.6, posKrebs(7, 0, 0.8)[1] + 0.2, 0], Math.max(0, t));
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {/* acil-CoA que se va acortando */}
        <group position={[-1.0 - (16 - largo) * 0 + 0, 0, 0]}>
          <Cadena n={largo} p={[-largo * sep + 0.4, 0, 0]} color={GRASA} sep={sep} brillo={0.3} />
          <Esfera p={[0.55, 0, 0]} r={0.16} color={COA} brillo={0.4} />
          {/* carbono beta resaltado */}
          <Esfera p={[0.4 - 2 * sep, 0, 0]} r={0.11} color={["#7cff8a", "#a8e6ff", "#5ec8ff", "#ff8a5c"][paso]} brillo={1.2} />
          {corte > 0 ? <Cadena n={2} p={[0.4 - sep + corte * 0.5, corte * 0.4, 0]} color="#ffb000" sep={sep} /> : null}
        </group>
        {sub > 0 && b < 2
          ? [paso === 0 ? FADH : null, paso === 2 ? NADH : null].filter(Boolean).map((c, i) => (
              <Mol key={i} p={[-1.4, 0.4 + (sub % 0.25) * 4, 0.3]} color={c as string} r={0.12} />
            ))
          : null}
        <group position={[3.6, 0, 0]} scale={0.55}>
          <RuedaKrebs giro={b * 2} R={1.6} />
        </group>
        {acetiles.map((p, i) => (
          <group key={i}>
            <Cadena n={2} p={p} color="#ffb000" sep={sep} />
            <Esfera p={[p[0] + 0.45, p[1], p[2]]} r={0.12} color={COA} />
          </group>
        ))}
        {b >= 2
          ? Array.from({ length: 8 }).map((_, i) => {
              const f = ((b - 2) * 1.2 + i / 8) % 1;
              return <Mol key={`m${i}`} p={[3.6 + Math.cos(i) * 0.9, -0.9 - f * 1.4, 0.3]} color={i % 3 ? NADH : FADH} r={0.1} op={1 - f} />;
            })
          : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-2.0, 0.1, 0], t: "Acil-CoA (ácido graso activado)", a: 0.05, z: 2, o: [-60, -100], color: GRASA },
          { p: [-0.35, 0.1, 0], t: "Carbono beta", a: 0.15, z: 1, o: [40, -110], color: "#ff8a5c" },
          { p: [3.6, 0.9, 0], t: "Ciclo de Krebs", a: 0.9, z: 3, o: [60, -80], color: "#7fd6ff" },
          { p: [2.0, 0.3, 0], t: "Acetil-CoA (2 C)", a: 1.0, z: 2.2, o: [-40, -100], color: "#ffb000" },
          { p: [3.6, -1.4, 0.3], t: "NADH y FADH₂ → cadena de electrones", a: 2.05, z: 3, o: [60, 80], color: NADH },
        ]}
      />
      {b < 2 ? (
        <div style={{ position: "absolute", left: 60, top: 130, width: 470, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.85)", borderRadius: 16, padding: "16px 22px" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: GRASA, marginBottom: 8 }}>
            Vuelta {Math.min(4, hechas + 1)} · cadena de {largo} carbonos
          </div>
          {PASOS_BETA.map((p, i) => (
            <div key={i} style={{ fontSize: 24, padding: "6px 10px", borderRadius: 8, background: i === paso ? "rgba(255,211,77,0.18)" : undefined, color: i === paso ? C.acento2 : C.suave, fontWeight: i === paso ? 800 : 500 }}>
              {i + 1}. {p}
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Aminoacidos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 4.6], l: [0, 0, 0], fov: 40 },
      { b: 2, p: [0.8, 0.6, 6.4], l: [0.8, 0, 0], fov: 40 },
      { b: 3, p: [1.0, 0.6, 6.6], l: [0.8, 0, 0], fov: 40 },
    ],
    b,
  );
  const quita = entre(b, 2.05, 2.4);
  const amonio = entre(b, 2.3, 2.7);
  const esqueleto = entre(b, 2.5, 2.95);
  const nPos: V3 = mix3([-0.45, 0.25, 0], [-2.8, 1.3, 0], amonio);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {/* aminoacido: C alfa, grupo amino, carboxilo y cadena R */}
        <group position={mix3([0, 0, 0], [2.4, -0.2, 0], esqueleto)}>
          <Esfera p={[0, 0, 0]} r={0.16} color="#3a3a3a" brillo={0.2} />
          <Esfera p={[0.45, 0.2, 0]} r={0.14} color="#3a3a3a" brillo={0.2} />
          <Esfera p={[0.8, 0.45, 0]} r={0.11} color="#ff4b4b" />
          <Esfera p={[0.8, -0.05, 0]} r={0.11} color="#ff4b4b" />
          <Cadena n={3} p={[0, -0.45, 0]} color="#7cff8a" sep={0.25} brillo={0.3} />
        </group>
        {quita < 1 ? <Esfera p={[-0.45 * (1 - quita) - 0.45 * quita, 0.25 + quita * 0.3, 0]} r={0.15} color="#4f8dff" brillo={0.4} /> : null}
        {quita >= 1 ? <Mol p={nPos} color="#4f8dff" r={0.16} /> : null}
        {b >= 2 ? (
          <group position={[-3.4, 1.6, -1]} scale={0.5}>
            <Higado brillo={amonio * 0.5} />
          </group>
        ) : null}
        {b >= 2 ? (
          <group position={[3.4, 0, 0]} scale={0.6}>
            <RuedaKrebs giro={b} R={1.6} resalta={[0, 2, 3, 5, 7][Math.floor(b * 3) % 5]} />
          </group>
        ) : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.45, 0.25, 0], t: "Grupo amino (NH₂)", a: 0.05, z: 2.05, o: [-60, -90], color: "#4f8dff" },
          { p: [0.8, 0.45, 0], t: "Carboxilo (COOH)", a: 0.15, z: 2.05, o: [60, -80], color: "#ff4b4b" },
          { p: [0.25, -0.45, 0], t: "Cadena lateral (R)", a: 0.25, z: 2.05, o: [60, 80], color: "#7cff8a" },
          { p: [-2.8, 1.3, 0], t: "NH₄⁺ → urea (hígado)", a: 2.4, z: 3, o: [60, -60], color: "#4f8dff" },
          { p: [3.4, 1.0, 0], t: "Esqueleto de carbonos → Krebs", a: 2.6, z: 3, o: [60, -80], color: "#7fd6ff" },
        ]}
      />
      <Tarjeta b={b} a={0} z={2} x={60} y={130} w={600} titulo="Aminoácidos (aeróbico)" color="#7cff8a" tam={26}>
        <Lista
          items={[
            "**Dónde**: mitocondria",
            "**Uso**: ayuno prolongado o estrés extremo",
            "**ATP**: variable según el aminoácido",
            b > 1 ? "✔ Permite **sobrevivir sin carbohidratos**" : "",
            b > 1 ? "✖ **Menos eficiente**; no es la vía preferida para el ejercicio normal" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
      {b >= 2 ? (
        <div style={{ position: "absolute", left: 60, top: 560, width: 560, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.85)", borderRadius: 14, padding: "14px 20px", fontSize: 24 }}>
          <div style={{ fontWeight: 800, color: C.acento2, fontSize: 28, marginBottom: 6 }}>Entradas al ciclo de Krebs</div>
          Piruvato · Acetil-CoA · Oxalacetato · α-cetoglutarato (glutamato) · Succinil-CoA · Fumarato
          <div style={{ color: C.suave, marginTop: 6 }}>Glucogénicos y cetogénicos</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const E4: PlanoDef[] = [
  {
    id: "e-beta-oxidacion",
    seccion: "Beta-oxidación de ácidos grasos",
    textos: [
      "**Beta-oxidación de ácidos grasos (aeróbico).** Ocurre en la **mitocondria**, en esfuerzos de **media a larga duración**, de **más de 20 a 30 minutos**, usando **ácidos grasos** como sustrato.",
      "Su producción de ATP es **muy alta**: unos **129 ATP por cada ácido palmítico**. Ventaja: es una fuente de energía **casi ilimitada**. Desventaja: es **más lenta** que la glucosa y **requiere oxígeno**.",
    ],
    Escena: BetaIntro,
  },
  {
    id: "e-beta-proceso",
    seccion: "Beta-oxidación · El proceso",
    textos: [
      "El ácido graso, activado como **acil-CoA**, se degrada en **4 reacciones** que se repiten: **oxidación** (forma **FADH₂**), **hidratación** (añade agua), **segunda oxidación** (forma **NADH**) y **tiólisis**.",
      "En la **tiólisis**, la enzima **tiolasa** corta la cadena: libera un **acetil-CoA** de 2 carbonos y deja un acil-CoA **dos carbonos más corto**, que vuelve a empezar el ciclo.",
      "Cada **acetil-CoA** entra al **ciclo de Krebs**, y el **NADH y FADH₂** van a la **cadena de transporte de electrones**: por eso las grasas producen **tanto ATP**.",
    ],
    Escena: BetaProceso,
  },
  {
    id: "e-aminoacidos",
    seccion: "Metabolismo de aminoácidos",
    textos: [
      "**Metabolismo de aminoácidos (aeróbico).** Ocurre en la **mitocondria**, principalmente en **ayuno prolongado** o **estrés extremo**. Su producción de ATP es **variable** según el aminoácido.",
      "Ventaja: permite la **supervivencia cuando faltan carbohidratos**. Desventaja: es **menos eficiente** y **no es la vía preferida** para el ejercicio normal.",
      "Primero se retira el **grupo amino**, que pasa al **glutamato** y se libera como **amonio**; el hígado lo convierte en **urea**. El **esqueleto de carbonos** entra al **ciclo de Krebs** como piruvato, acetil-CoA u otros intermediarios.",
    ],
    Escena: Aminoacidos,
  },
];

