import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, PlanoDef, useBeat, V3 } from "../motor";
import { Polvo } from "../modelos/comun";
import { Mol, Pulmones, Vaso } from "../modelos/energia";
import { C, FUENTE } from "../tema";
import { Escena3D, Lista, Rico, Tabla, Tarjeta } from "../ui";
import { Fondo, FiguraIzq } from "../actividad/a1";
import { COL_K, Curvas, Pasos } from "./comun";

const SEC = "3.2 Consumo de oxígeno y VO₂máx";

// ---- Que es el VO2: viaje del oxigeno ---------------------------------------------

const Viaje: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 8.5], l: [0, -0.1, 0], fov: 40 },
      { b: 2, p: [0.4, 0.6, 8.2], l: [0, -0.1, 0], fov: 40 },
    ],
    b,
  );
  const o2 = Array.from({ length: 10 }).map((_, i): V3 => {
    const f = (b * 0.35 + i / 10) % 1;
    return [mix(-1.4, 1.2, f), mix(0.9, -0.9, f) + Math.sin(i * 2) * 0.08, 0.3];
  });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -420, top: 0, width: 1920, height: 1080 }}>
        <Escena3D cam={cam}>
          <group position={[-1.5, 0.9, 0]} scale={0.8}>
            <Pulmones respira={(Math.sin(b * 5) + 1) / 2} />
          </group>
          <Vaso desde={[-1.3, 0.9, 0.3]} hasta={[1.2, -0.9, 0.3]} t={b * 0.4} radio={0.2} />
          <mesh position={[1.4, -1.0, 0]} scale={[0.9, 0.55, 0.55]}>
            <sphereGeometry args={[1, 40, 30]} />
            <meshPhysicalMaterial color={C.musculo} emissive={C.musculoClaro} emissiveIntensity={0.2 + 0.2 * Math.sin(b * 6)} transparent opacity={0.8} roughness={0.4} clearcoat={0.4} />
          </mesh>
          {o2.map((p, i) => (
            <Mol key={i} p={p} color="#a8e6ff" r={0.07} />
          ))}
          <Polvo b={b} radio={4} />
        </Escena3D>
      </div>
      <div style={{ position: "absolute", left: 80, top: 760, display: "flex", gap: 20, fontFamily: FUENTE, fontSize: 26, fontWeight: 800 }}>
        {[
          ["Pulmones", "#f29ba8"],
          ["Sangre", "#e3263a"],
          ["Músculo", C.musculoClaro],
        ].map(([t, c]) => (
          <span key={t} style={{ color: c, background: "rgba(4,9,20,0.8)", padding: "6px 14px", borderRadius: 10 }}>
            {t}
          </span>
        ))}
      </div>
      <Pasos
        b={b}
        x={900}
        y={130}
        w={960}
        titulo="Consumo de oxígeno (VO₂)"
        color={COL_K.o2}
        lineas={[
          { a: 0, t: "Volumen de O₂ que el cuerpo **capta, transporta y usa** por minuto" },
          { a: 0.4, t: "Reposo: **≈ 3.5 ml/kg/min** (= 1 MET) · ≈ **250 ml/min**" },
          { a: 1, t: "**Ecuación de Fick**:", color: COL_K.o2 },
          { a: 1.1, t: "**VO₂ = gasto cardiaco × diferencia a-vO₂**", grande: true, color: COL_K.o2 },
          { a: 1.6, t: "**Central**: cuánta sangre manda el corazón" },
          { a: 1.8, t: "**Periférico**: cuánto O₂ extrae el músculo (arterias − venas)" },
          { a: 2, t: "En ejercicio intenso puede subir **10 a 20 veces**" },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---- VO2max: meseta -------------------------------------------------------------

const vo2 = (x: number) => (x < 0.72 ? 0.12 + x * 1.05 : 0.876 + (x - 0.72) * 0.03);

const Max: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, top: 120, fontFamily: FUENTE, fontSize: 36, fontWeight: 900, color: C.texto }}>Prueba de esfuerzo incremental</div>
      <Curvas
        x={90}
        y={180}
        w={1100}
        h={580}
        series={[{ f: vo2, color: COL_K.o2, hasta: lineal(b, 0.1, 1.2), t: "VO₂máx" }]}
        ejeX="Intensidad (velocidad o vatios)"
        ejeY="VO₂ (ml/kg/min)"
        areas={[{ x0: 0.72, x1: 1, color: COL_K.deuda, t: "Meseta", op: entre(b, 1.1, 1.3) }]}
      />
      <Tarjeta b={b} a={0} z={2.05} x={1230} y={180} w={620} titulo="VO₂máx" color={COL_K.o2} tam={28}>
        <Lista
          items={[
            "La **máxima cantidad de O₂** que el cuerpo puede captar, transportar y usar",
            "Mejor indicador de la **capacidad aeróbica** o cardiorrespiratoria",
            "Criterio: **meseta** del VO₂ aunque la carga siga subiendo",
            "Si no hay meseta, se habla de **VO₂ pico**",
          ]}
          b={b}
          a={0.1}
          paso={0.35}
          color={COL_K.o2}
        />
      </Tarjeta>
    </Fondo>
  );
};

// ---- Absoluto vs relativo y valores ---------------------------------------------

const Valores: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <Fondo>
      <Pasos
        b={b}
        x={90}
        y={140}
        w={820}
        titulo="Absoluto vs relativo"
        color={COL_K.o2}
        lineas={[
          { a: 0, t: "**Absoluto**: litros por minuto (L/min)" },
          { a: 0.2, t: "**Relativo**: ml por **kilo** por minuto" },
          { a: 0.45, t: "Permite comparar personas de **distinto peso**" },
          { a: 0.65, t: "Ejemplo: 3.5 L/min y 70 kg" },
          { a: 0.8, t: "3 500 ÷ 70 = **50 ml/kg/min**", grande: true, color: COL_K.o2 },
        ]}
      />
      <div style={{ position: "absolute", left: 960, top: 140, width: 880, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "16px 22px", opacity: entre(b, 1, 1.15) }}>
        <div style={{ fontSize: 34, fontWeight: 900, color: COL_K.o2, marginBottom: 10 }}>Valores aproximados (ml/kg/min)</div>
        <Tabla
          tam={27}
          anchos="1.6fr 1fr"
          cab={["Grupo", "VO₂máx"]}
          filas={[
            ["Sedentarios", "30–40"],
            ["Personas activas", "40–50"],
            ["Deportistas de equipo", "50–60"],
            ["Fondistas, ciclistas, esquí de fondo", "70–85"],
            ["Récords mundiales", "> 90"],
          ]}
          b={b}
          a={1.05}
          paso={0.15}
        />
        <div style={{ fontSize: 24, color: C.suave, marginTop: 10, opacity: entre(b, 1.8, 1.95) }}>Las mujeres suelen tener valores 15–25 % menores</div>
      </div>
    </Fondo>
  );
};

// ---- Factores ---------------------------------------------------------------------

const FACT = [
  { n: "Genética", t: "Explica ≈ **50 %** de las diferencias", c: COL_K.met },
  { n: "Edad", t: "Baja ≈ **10 % por década** desde los 25–30 años", c: COL_K.deuda },
  { n: "Sexo", t: "Mujeres: menos hemoglobina y más % de grasa", c: COL_K.fc },
  { n: "Entrenamiento", t: "Puede mejorar **15–20 %** (más en sedentarios)", c: COL_K.o2 },
];

const Factores: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -300, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo="corre" brilla={0.3} colorBrillo={COL_K.o2} />
      </div>
      <div style={{ position: "absolute", left: 640, top: 130, width: 1220, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontFamily: FUENTE, color: C.texto }}>
        {FACT.map((f, i) => {
          const op = entre(b, i * 0.2, i * 0.2 + 0.2);
          return (
            <div key={f.n} style={{ opacity: op, background: "rgba(4,9,20,0.86)", borderTop: `6px solid ${f.c}`, borderRadius: 16, padding: "16px 22px" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: f.c }}>{f.n}</div>
              <div style={{ fontSize: 26, marginTop: 6 }}>
                <Rico t={f.t} color={f.c} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 640, top: 520, width: 1220, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, fontFamily: FUENTE, color: C.texto, opacity: entre(b, 1, 1.15) }}>
        <div style={{ background: "rgba(4,9,20,0.86)", borderLeft: `6px solid ${COL_K.fc}`, borderRadius: 12, padding: "16px 22px", fontSize: 27 }}>
          <b style={{ color: COL_K.fc }}>Limitantes centrales</b>
          <div>
            <Rico t="**Gasto cardiaco**, volumen sistólico, hemoglobina" color={COL_K.fc} />
          </div>
        </div>
        <div style={{ background: "rgba(4,9,20,0.86)", borderLeft: `6px solid ${COL_K.vs}`, borderRadius: 12, padding: "16px 22px", fontSize: 27 }}>
          <b style={{ color: COL_K.vs }}>Limitantes periféricos</b>
          <div>
            <Rico t="**Capilares**, **mitocondrias** y enzimas oxidativas del músculo" color={COL_K.vs} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---- Pruebas --------------------------------------------------------------------

const Pruebas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -300, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo="corre" brilla={0.3} colorBrillo={COL_K.deuda} />
      </div>
      <Tarjeta b={b} a={0} z={1} x={640} y={130} w={1220} titulo="Medición directa: ergoespirometría" color={COL_K.o2} tam={28}>
        <Lista items={["**Analizador de gases**: mide el O₂ y CO₂ que respiras", "En **cinta** o **cicloergómetro**, con carga que sube cada 1–3 min", "Es el método **más exacto** (laboratorio)"]} b={b} a={0} paso={0.2} color={COL_K.o2} />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={2} x={640} y={130} w={1220} titulo="Estimación indirecta: pruebas de campo" color={COL_K.deuda} tam={28}>
        <Lista items={["**Test de Cooper**: máxima distancia en 12 minutos", "**Course Navette**: ida y vuelta de 20 m a ritmo creciente", "**Prueba de la milla (Rockport)**: caminando"]} b={b} a={1} paso={0.2} color={COL_K.deuda} />
      </Tarjeta>
      <Pasos
        b={b}
        x={640}
        y={130}
        w={1220}
        titulo="Test de Cooper: ejemplo"
        color={COL_K.deuda}
        op={entre(b, 2, 2.1)}
        lineas={[
          { a: 2, t: "**VO₂máx = (metros − 504.9) ÷ 44.73**", grande: true, color: COL_K.deuda },
          { a: 2.2, t: "Corres **2 800 m** en 12 minutos" },
          { a: 2.4, t: "(2 800 − 504.9) ÷ 44.73" },
          { a: 2.6, t: "≈ **51 ml/kg/min**", grande: true, color: COL_K.o2 },
        ]}
      />
    </AbsoluteFill>
  );
};

export const K2: PlanoDef[] = [
  {
    id: "k-vo2-def",
    seccion: SEC,
    textos: [
      "El **consumo de oxígeno**, o **VO₂**, es el volumen de oxígeno que el cuerpo **capta, transporta y utiliza** por minuto. En reposo es de unos **3.5 ml por kilo por minuto**, lo que equivale a **1 MET**.",
      "Se explica con la **ecuación de Fick**: **VO₂ = gasto cardiaco × diferencia arteriovenosa de oxígeno**. Es decir, cuánta sangre manda el corazón, el factor **central**, por cuánto oxígeno extrae el músculo, el factor **periférico**.",
      "Durante el ejercicio intenso el VO₂ puede aumentar de **10 a 20 veces** respecto al reposo.",
    ],
    Escena: Viaje,
  },
  {
    id: "k-vo2max",
    seccion: SEC + " · VO₂máx",
    textos: [
      "El **VO₂máx** es la **máxima cantidad de oxígeno** que el organismo puede captar, transportar y utilizar. Es el mejor indicador de la **capacidad aeróbica**.",
      "Se mide en una **prueba incremental**: el VO₂ sube con la carga hasta que llega a una **meseta**, aunque la intensidad siga aumentando. Si no aparece la meseta, se le llama **VO₂ pico**.",
    ],
    Escena: Max,
  },
  {
    id: "k-vo2-valores",
    seccion: SEC + " · Valores",
    textos: [
      "Se expresa en **absoluto**, en litros por minuto, o en **relativo**, en mililitros por kilo por minuto, que permite comparar personas de distinto peso. Ejemplo: **3.5 litros por minuto en 70 kilos** = 3 500 ÷ 70 = **50 ml por kilo por minuto**.",
      "Valores aproximados: sedentarios, **30 a 40**; personas activas, **40 a 50**; fondistas y ciclistas de élite, **70 a 85**. Las mujeres suelen tener valores **15 a 25 % menores**.",
    ],
    Escena: Valores,
  },
  {
    id: "k-vo2-factores",
    seccion: SEC + " · Factores",
    textos: [
      "Factores que lo determinan: la **genética**, que explica cerca de la **mitad**; la **edad**, que lo reduce **alrededor de 10 % por década** desde los 25 o 30 años; el **sexo**; y el **entrenamiento**, que puede mejorarlo **15 a 20 %**.",
      "Sus limitantes son **centrales**, como el gasto cardiaco y la hemoglobina, y **periféricos**, como los **capilares** y las **mitocondrias** del músculo.",
    ],
    Escena: Factores,
  },
  {
    id: "k-vo2-pruebas",
    seccion: SEC + " · Cómo se mide",
    textos: [
      "La medición **directa** es la **ergoespirometría**: un **analizador de gases** mide el oxígeno y el CO₂ mientras corres en cinta o pedaleas con una carga que sube cada pocos minutos.",
      "También se puede **estimar** con pruebas de campo: el **test de Cooper**, la **Course Navette** o la **prueba de la milla** caminando.",
      "En el test de Cooper: **VO₂máx = (metros recorridos en 12 minutos − 504.9) ÷ 44.73**. Si corres **2 800 metros**: (2 800 − 504.9) ÷ 44.73 ≈ **51 ml por kilo por minuto**.",
    ],
    Escena: Pruebas,
  },
];
