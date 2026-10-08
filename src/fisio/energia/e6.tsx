import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, PlanoDef, useBeat } from "../motor";
import { Humano } from "../modelos/cuerpo";
import { Cinta } from "../modelos/energia";
import { C, FUENTE } from "../tema";
import { Escena3D, Lista, Tabla, Tarjeta, TituloGrande } from "../ui";

const SEC = "Umbral anaeróbico";
const LAC = "#ff6b6b";

/** Corredor en cinta (vista lateral) a la izquierda de la pantalla. */
const Corredor: React.FC<{ b: number; ritmo: number; textos?: string[] }> = ({ b, ritmo }) => {
  const cam = { p: [2.6, 1.15, 3.4] as [number, number, number], l: [0.9, 0.95, 0] as [number, number, number], fov: 38 };
  return (
    <Escena3D cam={cam}>
      <group rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <Cinta t={-b * ritmo} />
        </group>
        <group position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
          <Humano fase={b * ritmo * 6} marcha={mix(0.9, 1.7, Math.min(1, ritmo / 3))} musculo={0.55} />
        </group>
      </group>
    </Escena3D>
  );
};

// ---- Grafica lactato / FC vs velocidad -------------------------------------

const GraficaXY: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  puntos: [number, number][]; // en coordenadas 0..1
  hasta: number;
  color: string;
  ejeX: string;
  ejeY: string;
  ticksX?: string[];
  marcas?: { u: number; t: string; c: string }[];
  fantasma?: [number, number][];
}> = ({ x, y, w, h, puntos, hasta, color, ejeX, ejeY, ticksX = [], marcas = [], fantasma }) => {
  const n = Math.max(1, Math.round(hasta * (puntos.length - 1)));
  const sx = (u: number) => 60 + u * (w - 80);
  const sy = (v: number) => h - 50 - v * (h - 80);
  const linea = (ps: [number, number][]) => ps.map(([u, v]) => `${sx(u)},${sy(v)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, background: "rgba(4,9,20,0.88)", borderRadius: 14 }}>
      <line x1={60} y1={h - 50} x2={w - 15} y2={h - 50} stroke={C.suave} strokeWidth={2} />
      <line x1={60} y1={h - 50} x2={60} y2={15} stroke={C.suave} strokeWidth={2} />
      <text x={w - 20} y={h - 14} fill={C.suave} fontSize={20} textAnchor="end" fontFamily={FUENTE}>
        {ejeX}
      </text>
      <text x={18} y={h / 2} fill={C.suave} fontSize={20} fontFamily={FUENTE} transform={`rotate(-90 18 ${h / 2})`} textAnchor="middle">
        {ejeY}
      </text>
      {ticksX.map((t, i) => (
        <text key={t} x={sx(i / (ticksX.length - 1))} y={h - 28} fill={C.suave} fontSize={17} textAnchor="middle" fontFamily={FUENTE}>
          {t}
        </text>
      ))}
      {fantasma ? <polyline points={linea(fantasma)} fill="none" stroke={C.suave} strokeWidth={3} strokeDasharray="8 8" /> : null}
      <polyline points={linea(puntos.slice(0, n + 1))} fill="none" stroke={color} strokeWidth={5} />
      {puntos.slice(0, n + 1).map(([u, v], i) => (
        <circle key={i} cx={sx(u)} cy={sy(v)} r={5} fill="#fff" />
      ))}
      {marcas.map((m) => {
        const i = Math.round(m.u * (puntos.length - 1));
        if (i > n) return null;
        const [u, v] = puntos[i];
        return (
          <g key={m.t}>
            <circle cx={sx(u)} cy={sy(v)} r={14} fill="none" stroke={m.c} strokeWidth={4} />
            <text x={sx(u) - 10} y={sy(v) - 24} fill={m.c} fontSize={24} fontWeight={800} fontFamily={FUENTE} textAnchor="end">
              {m.t}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const LACTATO: [number, number][] = Array.from({ length: 21 }).map((_, i) => {
  const u = i / 20;
  const v = u < 0.45 ? 0.12 + u * 0.05 : u < 0.7 ? 0.14 + (u - 0.45) * 0.55 : 0.28 + (u - 0.7) ** 1.6 * 4.2;
  return [u, Math.min(0.98, v)];
});

const UmbralDef: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const avance = lineal(b, 0.1, 1.9);
  const vel = mix(10, 18, avance);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -300, top: 0, width: 1920, height: 1080 }}>
        <Corredor b={b} ritmo={mix(1.2, 3, avance)} />
      </div>
      <GraficaXY
        x={880}
        y={320}
        w={980}
        h={460}
        puntos={LACTATO}
        hasta={avance}
        color={LAC}
        ejeX="Velocidad (km/h)"
        ejeY="Ácido láctico en sangre"
        ticksX={["10", "12", "14", "16", "18"]}
        marcas={[
          { u: 0.45, t: "1 = Umbral aeróbico", c: "#7cff8a" },
          { u: 0.7, t: "2 = Umbral anaeróbico", c: LAC },
        ]}
      />
      <div style={{ position: "absolute", left: 80, top: 150, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.85)", borderRadius: 14, padding: "12px 20px" }}>
        <div style={{ fontSize: 22, color: C.suave }}>Velocidad</div>
        <div style={{ fontSize: 56, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{vel.toFixed(1)} km/h</div>
      </div>
      <Tarjeta b={b} a={1} z={2} x={880} y={110} w={980} titulo="Indicadores no lineales" color={LAC} tam={24}>
        <Lista items={["↑ brusco del **lactato** en sangre (umbral de lactato)", "↑ desproporcionado de la **ventilación** (umbral ventilatorio)", "↑ **CO₂** por **saturación de los amortiguadores**"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

const UmbralUtilidad: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const desplaza = entre(b, 2.2, 2.8) * 0.15;
  const mejorada: [number, number][] = LACTATO.map(([u, v]) => [Math.min(1, u + desplaza), v]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.fondo2} 0%, ${C.fondo} 75%)` }}>
      {b < 1 ? (
        <div style={{ position: "absolute", left: 160, right: 160, top: 160, fontFamily: FUENTE, color: C.texto }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.acento2, marginBottom: 20 }}>1. Zonas de entrenamiento de precisión</div>
          {[
            ["Muy por debajo del umbral", "#7cff8a", 0.55],
            ["Justo en el umbral: tempo run", "#ffcf5a", 0.8],
            ["Muy por encima del umbral", "#ff5a5a", 1],
          ].map(([t, c, w]) => (
            <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
              <div style={{ height: 50, width: `${(w as number) * 900 * entre(b, 0.1, 0.5)}px`, background: c as string, borderRadius: 10 }} />
              <span style={{ fontSize: 30, fontWeight: 700 }}>{t}</span>
            </div>
          ))}
        </div>
      ) : b < 2 ? (
        <div style={{ position: "absolute", left: 160, right: 160, top: 150, fontFamily: FUENTE, color: C.texto }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.acento2, marginBottom: 20 }}>2. Predice el rendimiento mejor que el VO₂ máx</div>
          {[
            ["Atleta A", 0.65],
            ["Atleta B", 0.85],
          ].map(([n, u]) => (
            <div key={n as string} style={{ marginBottom: 30 }}>
              <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>
                {n} · mismo VO₂ máx · umbral al {Math.round((u as number) * 100)} %
              </div>
              <div style={{ position: "relative", height: 56, width: 1200, background: "rgba(255,255,255,0.1)", borderRadius: 12 }}>
                <div style={{ position: "absolute", height: 56, width: `${(u as number) * 100 * entre(b, 1.1, 1.5)}%`, background: (u as number) > 0.7 ? "#7cff8a" : "#ffcf5a", borderRadius: 12 }} />
              </div>
            </div>
          ))}
          <div style={{ fontSize: 30, color: C.suave }}>Mismo motor, pero el atleta B sostiene un ritmo mucho mayor en pruebas largas.</div>
        </div>
      ) : (
        <>
          <div style={{ position: "absolute", left: 160, top: 140, fontFamily: FUENTE, fontSize: 40, fontWeight: 900, color: C.acento2 }}>3. Monitoreo de la mejora</div>
          <GraficaXY x={160} y={250} w={1600} h={560} puntos={mejorada} hasta={1} color="#7cff8a" fantasma={LACTATO} ejeX="Velocidad o potencia" ejeY="Lactato / ventilación" ticksX={["10", "12", "14", "16", "18"]} />
          <div style={{ position: "absolute", left: 160, right: 160, top: 190, textAlign: "right", fontFamily: FUENTE, fontSize: 30, color: C.texto }}>
            Meses después, el salto ocurre a <b style={{ color: "#7cff8a" }}>mayor velocidad</b>: mejoró su rendimiento metabólico
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

const UmbralMedicion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const i = Math.min(2, Math.floor(b));
  const items = [
    { t: "Ergoespirometría", d: "Estándar de oro: máscara + analizador de gases; el umbral aparece cuando el CO₂ y la ventilación (VE) se disparan. Sin pinchar al atleta.", c: C.acento },
    { t: "Lactato en sangre", d: "Gotas de sangre del lóbulo de la oreja o del dedo, aumentando la velocidad cada 3 minutos, para hallar el punto de inflexión.", c: LAC },
    { t: "Métodos de campo", d: "Velocidad máxima sostenible en 30 min (time trial), test de Conconi o frecuencia cardiaca de deflexión.", c: "#7cff8a" },
  ];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -380, top: 0, width: 1920, height: 1080 }}>
        <Corredor b={b} ritmo={2} />
      </div>
      <div style={{ position: "absolute", right: 70, top: 150, width: 900, display: "flex", flexDirection: "column", gap: 20, fontFamily: FUENTE, color: C.texto }}>
        {items.map((it, k) => (
          <div key={it.t} style={{ background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "18px 24px", borderLeft: `8px solid ${it.c}`, opacity: k <= i ? 1 : 0.35, transform: `scale(${k === i ? 1.02 : 1})` }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: it.c }}>{it.t}</div>
            <div style={{ fontSize: 25, lineHeight: 1.3, marginTop: 6 }}>{it.d}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Datos aproximados del grafico del test de Conconi (diapositiva 57)
const CONCONI: [number, number][] = [
  [10, 154], [11, 159], [12, 165], [12.6, 170], [13.2, 174], [13.8, 179], [14.4, 184],
  [15, 186], [16, 189], [17, 192], [17.6, 193], [18.4, 195], [19.2, 198], [20, 199],
];

const Conconi: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const vel = b < 1 ? mix(8, 20, lineal(b, 0.2, 0.95)) : 20;
  const pts: [number, number][] = CONCONI.map(([v, f]) => [(v - 9) / 11, (f - 140) / 70]);
  const hasta = b < 1 ? 0 : lineal(b, 1.05, 1.9);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -400, top: 0, width: 1920, height: 1080 }}>
        <Corredor b={b} ritmo={mix(1, 3, (vel - 8) / 12)} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 140, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.85)", borderRadius: 14, padding: "12px 20px" }}>
        <div style={{ fontSize: 22, color: C.suave }}>Cinta · +0.5 km/h cada minuto</div>
        <div style={{ fontSize: 56, fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>{(Math.round(vel * 2) / 2).toFixed(1)} km/h</div>
      </div>
      {b < 1 ? (
        <Tarjeta b={b} a={0} z={1} x={880} y={140} w={980} titulo="Protocolo del test de Conconi" color={C.acento2} tam={26}>
          <Lista
            items={[
              "**Calentamiento**: 6 min al **60 % de la FC máx**",
              "**Inicio**: 8 km/h · **+0.5 km/h cada minuto**",
              "Ritmo de **6:40 min/km** hasta cerca de **3:45 min/km**",
              "**Fin**: fatiga voluntaria o no poder mantener el ritmo",
            ]}
          />
        </Tarjeta>
      ) : (
        <GraficaXY
          x={880}
          y={140}
          w={980}
          h={600}
          puntos={pts}
          hasta={hasta}
          color="#7cff8a"
          ejeX="Velocidad (km/h)"
          ejeY="Frecuencia cardiaca (lpm)"
          ticksX={["9", "11", "13", "15", "17", "19"]}
          marcas={b >= 2 ? [{ u: 6 / 13, t: "Punto de deflexión", c: C.acento2 }] : []}
        />
      )}
      {b >= 1 ? (
        <div style={{ position: "absolute", left: 880, top: 760, width: 980, fontFamily: FUENTE, fontSize: 26, color: C.texto, background: "rgba(4,9,20,0.85)", borderRadius: 14, padding: "12px 20px" }}>
          FC registrada al menos <b>cada 30 s</b> · se grafica velocidad frente a FC
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const ZONAS: string[][] = [
  ["Zona 1 · Recuperación activa", "< 75 %", "< 120 lpm · < 9.0 km/h", "Recuperación, circulación, moviliza grasas (Borg 1-2)"],
  ["Zona 2 · Resistencia aeróbica (base)", "75–85 %", "120–136 lpm · 9.0–10.2", "Cimiento: eficiencia mitocondrial y oxidativa (Borg 3-4)"],
  ["Zona 3 · Tempo", "85–95 %", "136–152 lpm · 10.2–11.4", "Llevadero pero exige concentración (Borg 7)"],
  ["Zona 4 · Umbral (máx. estado estable)", "95–100 %", "152–160 lpm · 11.4–12.0", "Zona reina: tolerar y aclarar metabolitos (Borg 8-9)"],
  ["Zona 5 · Capacidad láctica / VO₂ máx", "> 100 %", "> 160 lpm · > 12.0", "Potencia máxima e intervalos intensos (Borg 10)"],
];
const COL_ZONAS = ["#5ec8ff", "#7cff8a", "#ffcf5a", "#ff8a3d", "#ff4d4d"];

const Zonas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const visibles = b < 1 ? 2 : b < 2 ? 4 : 5;
  const resalta = b < 1 ? (b < 0.5 ? 0 : 1) : b < 2 ? (b < 1.5 ? 2 : 3) : 4;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.fondo2} 0%, ${C.fondo} 75%)` }}>
      <div style={{ position: "absolute", left: 70, right: 70, top: 130, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 30, color: C.suave, marginBottom: 10 }}>
          Ejemplo: umbral anaeróbico en <b style={{ color: C.acento2 }}>160 lpm / 12 km/h</b>
        </div>
        <div style={{ display: "flex", gap: 8, height: 60, marginBottom: 16 }}>
          {COL_ZONAS.map((c, i) => (
            <div key={i} style={{ flex: [75, 10, 10, 5, 12][i], background: c, opacity: i < visibles ? (i === resalta ? 1 : 0.55) : 0.12, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#08121f", fontWeight: 900, fontSize: 26 }}>
              Z{i + 1}
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(4,9,20,0.9)", borderRadius: 14, padding: "10px 16px" }}>
          <Tabla
            tam={23}
            anchos="1.5fr 0.7fr 1.2fr 2fr"
            cab={["Zona", "% del umbral", "Ejemplo", "Utilidad"]}
            filas={ZONAS.slice(0, visibles)}
            resalta={resalta}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Cierre: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.2, 4.4], l: [0, 1.0, 0], fov: 35 },
      { b: 2, p: [1.4, 1.3, 3.6], l: [0, 1.0, 0], fov: 35 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, -0.6 + b * 0.4, 0]} position={[1.2, 0, 0]}>
          <Humano fase={b * 8} marcha={1.4} musculo={0.55} />
        </group>
      </Escena3D>
      <Tarjeta b={b} a={0} z={1.5} x={80} y={150} w={760} titulo="Resumen: sistemas energéticos" tam={27}>
        <Lista
          b={b}
          a={0.05}
          paso={0.12}
          items={[
            "**ATP**: la moneda energética",
            "**Fosfágenos**: 0–10 s, PCr + creatin cinasa",
            "**Glucólisis anaeróbica**: 30 s–3 min, lactato y H⁺",
            "**Aeróbico**: Krebs + cadena de electrones ≈ 36 ATP",
            "**Grasas** (≈129 ATP) y **aminoácidos**",
            "**Continuum**, **umbral anaeróbico** y **zonas**",
          ]}
        />
      </Tarjeta>
      <TituloGrande b={b} a={1.5} z={2.2} sup="Unidad 2" t="¡Éxito en tu examen!" />
    </AbsoluteFill>
  );
};

export const E6: PlanoDef[] = [
  {
    id: "e-umbral",
    seccion: SEC,
    textos: [
      "**Umbral anaeróbico**: se introdujo para definir el momento del **ejercicio progresivo** en que aparecen la **acidosis metabólica** y cambios en el **intercambio de gases** de los pulmones.",
      "Es la **intensidad crítica** donde se combinan, de forma **no lineal**: un aumento brusco del **lactato en sangre** (umbral de lactato), un incremento desproporcionado de la **ventilación** (umbral ventilatorio) y más **CO₂** por la **saturación de los amortiguadores**.",
    ],
    Escena: UmbralDef,
  },
  {
    id: "e-umbral-utilidad",
    seccion: SEC + " · ¿Para qué sirve?",
    textos: [
      "**1. Zonas de entrenamiento de precisión**: permite calcular las zonas reales del atleta. Entrenar **justo al borde del umbral**, el famoso **tempo run**, es la herramienta más potente para elevar la resistencia aeróbica sin sobrecargar al sistema.",
      "**2. Predicción del rendimiento**: en pruebas largas, como **maratón o ciclismo de ruta**, el umbral predice el rendimiento **mejor que el VO₂ máximo**. Dos atletas con el mismo VO₂ máximo rinden muy distinto si uno tiene el umbral al **65 %** y el otro al **85 %**.",
      "**3. Monitoreo de la mejora**: si meses después el salto no lineal del lactato o la ventilación ocurre a **mayor velocidad o potencia**, el rendimiento metabólico **mejoró**.",
    ],
    Escena: UmbralUtilidad,
  },
  {
    id: "e-umbral-medicion",
    seccion: SEC + " · ¿Cómo se mide?",
    textos: [
      "**Ergoespirometría**: el **estándar de oro**. El atleta corre o pedalea con una **máscara conectada a un analizador de gases**; el umbral ventilatorio aparece cuando el **CO₂ y la ventilación** se disparan, **sin necesidad de pinchar** al atleta.",
      "**Pruebas de lactato**: se toman **gotas de sangre** del **lóbulo de la oreja o del dedo**, aumentando la velocidad **cada 3 minutos**, para trazar la curva y ubicar el **punto de inflexión**.",
      "**Métodos de campo**: sin laboratorio, se usan la **velocidad máxima sostenible en 30 minutos** (time trial), el **test de Conconi** o la **frecuencia cardiaca de deflexión**.",
    ],
    Escena: UmbralMedicion,
  },
  {
    id: "e-conconi",
    seccion: SEC + " · Test de Conconi",
    textos: [
      "**Test de Conconi en cinta**: calentamiento de **6 minutos al 60 % de la FC máxima**. Se inicia a **8 km/h** y se aumenta **0.5 km/h cada minuto**, de un ritmo de **6:40 min/km** hasta cerca de **3:45 min/km**, hasta la **fatiga voluntaria**.",
      "Se registra la **frecuencia cardiaca** al menos **cada 30 segundos** y se grafica la **velocidad frente a la frecuencia cardiaca**.",
      "La FC sube en línea recta con la velocidad hasta que **se aplana**: ese **punto de deflexión** marca el **umbral anaeróbico**.",
    ],
    Escena: Conconi,
  },
  {
    id: "e-zonas",
    seccion: SEC + " · Zonas de entrenamiento",
    textos: [
      "Con el umbral localizado, la intensidad se divide en **porcentajes del umbral**. Ejemplo: umbral en **160 lpm y 12 km/h**. **Zona 1**, recuperación activa: **menos del 75 %**. **Zona 2**, resistencia aeróbica de base: **75 a 85 %**.",
      "**Zona 3**, tempo: **85 a 95 %**, llevadera pero exige concentración. **Zona 4**, máximo estado estable: **95 a 100 %**, la **zona reina** para elevar el rendimiento y desplazar el umbral hacia arriba.",
      "**Zona 5**, capacidad láctica y VO₂ máximo: **más del 100 %** del umbral; estimula la **potencia máxima** y la **tolerancia a la acidez** con intervalos intensos.",
    ],
    Escena: Zonas,
  },
  {
    id: "e-cierre",
    seccion: "",
    textos: [
      "Repasamos los **sistemas energéticos**: del **ATP** y la **fosfocreatina** a la **glucólisis**, la **mitocondria**, las **grasas**, el **continuum** y el **umbral anaeróbico**.",
      "Bibliografía: McArdle, Katch y Katch (2022); Powers y Howley (2021); Brooks y Fahey (2020). ¡Mucho éxito en tu examen!",
    ],
    Escena: Cierre,
  },
];
