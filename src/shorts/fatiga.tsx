// Short: Fatiga muscular. PCr agotada, fosfato inorgánico, protones, glucógeno y fatiga central.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Cadena, MitocondriaGrande } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { MiniATP } from "../fisio/energia/e1";
import { Cerebro } from "../fisio/capitulos/cap6";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { ANTON, Chip, Dato, Destello, K, pop, ShortDef, Titular } from "./marco";
import { Atleta, InteriorFibra, PCR_POS, Piso } from "./modelos";
import { Columna, LACTATO_C, VERDE_PCR } from "./modelos-energia";
import { NERVIO_C, puntoVia, TriadaZoom, ViaMotora } from "./modelos-contraccion";
import { F2Pesa } from "./modelos-fibras";
import { Botella, Camino, mezclaColor, Pared, Pi, PI_C, Puentes, Reloj, TanqueGlucogeno } from "./modelos-fatiga";
import { camViaje, cortesViaje, Viaje } from "./viaje";

const CAB: V3 = [0, 1.68, 0.01];
const MUSLO: V3 = [0.1, 0.73, 0.02];

/** Halo amarillo en el muslo derecho cuando le llega la senal. */
const HaloMuslo: React.FC<{ op: number; color?: string }> = ({ op, color = NERVIO_C }) =>
  op > 0.01 ? (
    <mesh position={MUSLO} scale={[1, 2.6, 1]}>
      <sphereGeometry args={[0.09, 20, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.4 * op} depthWrite={false} />
    </mesh>
  ) : null;

// 0 · Gancho: la ultima repeticion no sale -----------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const R = 0.3;
  const atora = 0.78;
  let k: number;
  if (b < R) k = Math.sin(((b / R) * 2) % 1 * Math.PI);
  else if (b < atora) k = 0.46 * entre(b, R, 0.5) + Math.sin(b * 170) * 0.03 * entre(b, 0.38, 0.5);
  else k = 0.46 * (1 - entre(b, atora, 0.9));
  const tiembla = b > R && b < atora ? Math.sin(b * 230) * 0.008 * entre(b, 0.38, 0.5) : 0;
  const rep = b < R / 2 ? 10 : b < R ? 11 : 12;
  const cam = camara(
    [
      { b: 0, p: [2.2, 1.3, 5.6], l: [0, 0.8, 0], fov: 36 },
      { b: 1, p: [1.4, 1.4, 3.7], l: [0, 1.0, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[tiembla, 0, 0]}>
          <Atleta ej="curl" k={k} brilla={0.25 + 0.65 * entre(b, R, 0.6)} colorBrillo={K.rojo} />
        </group>
        <Piso color={K.rojo} />
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(255,40,40,${0.3 * entre(b, 0.4, 0.6)}) 100%)` }} />
      <Dato b={b} a={0.02} z={0.58} t={rep === 12 ? "REP 12?" : `REP ${rep}`} color={rep === 12 ? K.rojo : K.lima} y={270} tam={110} />
      <Titular b={b} a={0.58} z={1.1} y={280} tam={170} t="Fatiga" color={K.rojo} />
      <Chip b={b} a={0.34} z={1.1} t="NI UNA MÁS" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 1 · Caida de fuerza: musculo o sistema nervioso -------------------------------------
const Fuentes: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cae = entre(b, 0.08, 0.5);
  const nivel = 1 - 0.6 * cae;
  const col = mezclaColor(K.lima, K.rojo, cae);
  const cam = camara(
    [
      { b: 0, p: [0.9, 1.25, 6.3], l: [-0.2, 0.85, 0], fov: 36 },
      { b: 1, p: [-0.4, 1.2, 5.9], l: [-0.2, 0.85, 0], fov: 36 },
    ],
    b,
  );
  const pulso = (b * 3.2) % 1;
  const musc = entre(b, 0.55, 0.65);
  const ner = entre(b, 0.75, 0.85);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0.3, 0, 0]}>
          <Atleta ej="parado" musculo={0.32} brilla={0.2 + musc * 0.6} colorBrillo={K.rojo} />
          <Piso />
          <group position={CAB} scale={0.125}>
            <Cerebro motor={0.3 + ner * 0.7} />
          </group>
          <ViaMotora medula={0.3 + ner * 0.7} nervio={0.3 + ner * 0.7} pulso={ner > 0.2 ? pulso : -1} />
          <HaloMuslo op={musc * (0.5 + 0.5 * Math.sin(b * 25) ** 2)} color={K.rojo} />
        </group>
        <Columna p={[-0.75, 0, 0]} nivel={nivel} color={col} alto={1.6} r={0.13} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.75, 1.7, 0], t: "Fuerza", a: 0.05, z: 1.1, o: [-20, -90], color: col },
          { p: [0.42, 0.75, 0.05], t: "Músculo", a: 0.55, z: 1.1, o: [-30, 130], color: K.rojo },
          { p: [0.3, 1.7, 0.05], t: "Sistema nervioso", a: 0.75, z: 1.1, o: [-40, 140], color: NERVIO_C },
        ]}
      />
      <Dato b={b} a={0.03} z={1.1} t={`FUERZA ${Math.round(nivel * 100)}%`} sub="capacidad de producir fuerza" color={col} y={260} tam={100} />
    </AbsoluteFill>
  );
};

// 2 · Se agota la fosfocreatina --------------------------------------------------------
const Fosfocreatina: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const V = 0.45;
  const t = lineal(b, 0, V);
  const cam = camViaje(t);
  const g = entre(b, 0.48, 0.95);
  const pcr = 28 * (1 - 0.86 * g);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={t > 0.72 ? [10, 34] : undefined}>
        <Viaje
          t={t}
          b={b}
          ej="sentadilla"
          k={Math.sin(((b * 3) % 1) * Math.PI)}
          colorBrillo={K.rojo}
          interior={{ pcr, carga: 1 - 0.85 * g, atp: 12 - 9 * entre(b, 0.65, 1), brillo: 0.3 + 0.4 * g }}
        />
      </Escena3D>
      <Destello b={b} en={cortesViaje(0, V)} />
      {t >= 1 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: PCR_POS[1], t: "Fosfocreatina", a: V + 0.03, z: 0.75, o: [-40, -110], color: VERDE_PCR },
            { p: [(rnd("ax0") - 0.5) * 2.6, (rnd("ay0") - 0.5) * 4.4, 1.0], t: "ATP", a: 0.68, z: 1.1, o: [60, -90], color: K.naranja },
          ]}
        />
      ) : null}
      <Dato b={b} a={V + 0.02} z={1.1} t={`PCr ${Math.round(100 * (1 - 0.86 * g))}%`} sub="fosfocreatina: se agota" color={VERDE_PCR} y={260} tam={110} />
      <Chip b={b} a={0.68} z={1.1} t="RECARGA DE ATP ↓" x={540} y={1100} color={K.naranja} />
    </AbsoluteFill>
  );
};

// 3 · Fosfato inorganico: estorba a la miosina y al calcio ------------------------------
const PI_POS: V3[] = Array.from({ length: 34 }).map((_, i) => [(rnd(`pix${i}`) - 0.5) * 3.0, (rnd(`piy${i}`) - 0.5) * 3.4, 0.35 + rnd(`piz${i}`) * 0.6]);
const PI_RET: V3[] = Array.from({ length: 14 }).map((_, i) => [(rnd(`prx${i}`) - 0.5) * 2.4, (i % 2 ? 1 : -1) * (1.0 + (rnd(`pry${i}`) - 0.5) * 0.3), (rnd(`prz${i}`) - 0.5) * 0.3]);

const Fosfato: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const S = 0.52;
  const shotA = b < S;
  const acum = entre(b, 0.05, 0.4);
  const fuerza = 1 - 0.6 * acum;
  // deslizamiento = integral de la fuerza
  let desliza = 0;
  for (let i = 0; i < 24; i++) desliza += (b / 24) * 2.4 * (1 - 0.6 * entre((b * (i + 0.5)) / 24, 0.05, 0.4));
  const cam = shotA
    ? camara(
        [
          { b: 0, p: [0.8, 0.4, 10], l: [0, -0.55, 0], fov: 40 },
          { b: S, p: [-0.5, 0.3, 8.8], l: [0, -0.55, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: S, p: [0.5, 0.5, 10.5], l: [0, -0.7, 0], fov: 40 },
          { b: 1, p: [-0.4, 0.4, 9.5], l: [0, -0.7, 0], fov: 40 },
        ],
        b,
      );
  const nPi = Math.round(PI_POS.length * acum);
  const ca = entre(b, S + 0.06, 0.8);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        {shotA ? (
          <>
            <Puentes b={b} fuerza={fuerza} desliza={desliza} />
            {PI_POS.slice(0, nPi).map((p, i) => (
              <Pi key={i} p={[p[0], p[1] + Math.sin(b * 6 + i) * 0.04, p[2]]} escala={0.55} />
            ))}
          </>
        ) : (
          <>
            <TriadaZoom b={b} onda={lineal(b, S, S + 0.08)} sensor={entre(b, S + 0.03, S + 0.08)} abre={0.5 * entre(b, S + 0.05, S + 0.1)} ca={0.45 * ca} nCa={40} miofibrillas={1} brilloMio={0.15 * ca} />
            {PI_RET.map((p, i) => (
              <Pi key={i} p={[p[0] + Math.sin(b * 4 + i) * 0.03, p[1], p[2]]} escala={0.45} />
            ))}
          </>
        )}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Destello b={b} en={[S]} />
      <Etiquetas
        cam={cam}
        b={b}
        items={
          shotA
            ? [
                { p: [0.2, 0, 0.15], t: "Miosina", a: 0.3, z: S, o: [-20, -250], color: K.morado },
                { p: [0.9, 1.12, 0.1], t: "Actina", a: 0.32, z: S, o: [30, -110], color: "#f2b83a" },
                { p: PI_POS[2], t: "Pi", a: 0.2, z: S, o: [60, 60], color: PI_C },
              ]
            : [
                { p: [0.6, 1.3, 0.3], t: "Retículo sarcoplásmico", a: S + 0.03, z: 1.1, o: [-40, -90], color: "#4f8dff" },
                { p: [-0.6, -0.45, 0.6], t: "Ca²⁺ ↓", a: S + 0.15, z: 1.1, o: [-60, 100], color: "#2fe6ff" },
              ]
        }
      />
      <Dato b={b} a={0.03} z={0.3} t="Fosfato inorgánico" sub="Pi se acumula" color={PI_C} y={260} tam={92} />
      <Chip b={b} a={0.25} z={S} t="MENOS FUERZA POR PUENTE" x={540} y={1100} color={PI_C} />
      <Chip b={b} a={S + 0.08} z={0.82} t="MENOS CALCIO LIBERADO" x={540} y={1100} color="#2fe6ff" />
      <Chip b={b} a={0.82} z={1.1} t="PRINCIPAL CULPABLE" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 4 · Protones y pH; el lactato es combustible -----------------------------------------
const Protones: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const S = 0.42;
  const shotA = b < S;
  const acum = entre(b, 0.03, 0.3);
  const ph = (7.1 - 0.6 * entre(b, 0.05, 0.3)).toFixed(1);
  const cam = shotA
    ? camara(
        [
          { b: 0, p: [0, 0.4, 11], l: [0, -0.9, 0], fov: 40 },
          { b: S, p: [-0.5, 0.3, 9.4], l: [0, -0.9, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: S, p: [0.6, 0.3, 7.4], l: [0, -0.3, 0], fov: 40 },
          { b: 1, p: [-0.5, 0.2, 6.8], l: [0, -0.3, 0], fov: 40 },
        ],
        b,
      );
  const lac = Array.from({ length: 5 }).map((_, i) => {
    const f = ((b - S) * 2.2 + i / 5) % 1;
    const x0 = -1.0 + i * 0.5;
    const p = mix3([x0, 1.15, 0.6], [x0 * 0.45, -1.2, 0.35], entre(f, 0.05, 0.8));
    return { p, f, x0 };
  });
  const tacha = entre(b, 0.6, 0.66);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={shotA ? [9, 28] : [8, 24]}>
        {shotA ? (
          <InteriorFibra b={b} pcr={2} carga={0} atp={4} hplus={55 * acum} brillo={0.2 + acum * 0.6} />
        ) : (
          <>
            <CilindroX radio={0.55} largo={3.6} x={1.8} y={1.75} color="#c03a46" estriado={6} emisivo={0.3} tapa="#d75b65" />
            <group position={[0, -1.35, 0]} scale={0.55}>
              <MitocondriaGrande brillo={0.15 + 0.25 * Math.sin(b * 14) ** 2} />
            </group>
            {b > S
              ? lac.map((o, i) => (
                  <group key={i}>
                    {o.f < 0.85 ? <Cadena n={3} p={o.p} color={LACTATO_C} sep={0.22} brillo={0.5} op={visible(o.f, 0, 0.85, 0.1)} /> : null}
                    {o.f > 0.8 ? <MiniATP p={[o.x0 * 0.45 + 0.1, mix(-1.1, -0.2, entre(o.f, 0.8, 1)), 0.7]} escala={1.6 * entre(o.f, 0.8, 0.86)} brillo={1} /> : null}
                  </group>
                ))
              : null}
          </>
        )}
        <Polvo b={b} radio={5} />
      </Escena3D>
      {shotA ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(255,40,40,${0.35 * acum}) 100%)` }} /> : null}
      <Destello b={b} en={[S]} />
      {!shotA ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-1.6, 1.9, 0.5], t: "Fibra que trabaja", a: S + 0.03, z: 1.1, o: [30, -110], color: K.rojo },
            { p: lac[2].p, t: "Lactato", a: S + 0.08, z: 0.75, o: [70, -40], color: LACTATO_C },
            { p: [0.9, -1.35, 0.4], t: "Mitocondria", a: S + 0.12, z: 1.1, o: [-40, 120], color: K.naranja },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.03} z={S} t={`pH ${ph}`} sub="los protones (H⁺) acidifican" color={K.rojo} y={260} tam={130} />
      <Chip b={b} a={0.2} z={S} t="ARDOR" x={540} y={1100} color={K.rojo} />
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: visible(b, S + 0.04, 0.78, 0.05),
        }}
      >
        <div style={{ position: "relative", fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: K.tinta, WebkitTextStroke: "10px #04090b", paintOrder: "stroke fill" }}>
          VILLANO
          <div style={{ position: "absolute", left: -20, right: -20, top: "48%", height: 20, borderRadius: 10, background: K.rojo, transformOrigin: "0 50%", transform: `scaleX(${tacha}) rotate(-4deg)`, boxShadow: `0 0 30px ${K.rojo}` }} />
        </div>
      </div>
      <Dato b={b} a={0.78} z={1.1} t="Lactato = combustible" color={LACTATO_C} y={270} tam={88} />
    </AbsoluteFill>
  );
};

// 5 · Maraton: el glucogeno se vacia y aparece la pared -----------------------------------
const Muro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const vacia = entre(b, 0.15, 0.7);
  const llega = entre(b, 0.35, 0.82);
  const vel = 1 - 0.55 * entre(b, 0.6, 0.9);
  const cam = camara(
    [
      { b: 0, p: [-1.4, 1.45, 5.6], l: [0.2, 0.8, 0], fov: 36 },
      { b: 1, p: [-2.4, 1.4, 4.8], l: [0.3, 0.8, 0], fov: 36 },
    ],
    b,
  );
  const avance = b * 22 * (1 - 0.3 * entre(b, 0.6, 0.9));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, Math.PI / 2, 0]}>
          <Camino avance={-avance} />
        </group>
        <group rotation={[0, Math.PI / 2, 0]}>
          <Atleta ej="sprint" fase={b * 34 * vel} brilla={0.2 + 0.5 * vacia} colorBrillo={K.morado} />
        </group>
        <group position={[mix(7, 0.95, llega), 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <Pared ancho={1.8} alto={2.1} brillo={entre(b, 0.75, 0.85)} />
        </group>
        <group position={[-0.2, 1.25, -0.8]}>
          <TanqueGlucogeno nivel={1 - vacia} b={b} escala={0.55} />
        </group>
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.2, 1.75, -0.8], t: `Glucógeno ${Math.round(100 * (1 - vacia))}%`, a: 0.12, z: 1.1, o: [40, -110], color: K.morado },
        ]}
      />
      <Chip b={b} a={0.05} z={0.7} t="MARATÓN" x={540} y={1100} color={K.cian} />
      <Dato b={b} a={0.72} z={1.1} t="La pared" sub="glucógeno agotado" color={K.rojo} y={260} tam={130} />
    </AbsoluteFill>
  );
};

// 6 · Fatiga central: el cerebro baja la senal --------------------------------------------
const PULSOS = (() => {
  const out: number[] = [];
  let e = 0;
  while (e < 1) {
    out.push(e);
    e += 0.055 + 0.15 * Math.min(1, Math.max(0, (e - 0.2) / 0.5));
  }
  return out;
})();
const intensidad = (e: number) => 1 - 0.7 * Math.min(1, Math.max(0, (e - 0.2) / 0.5));

const Central: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const baja = entre(b, 0.2, 0.7);
  const cam = camara(
    [
      { b: 0, p: [0.8, 1.25, 5.6], l: [0, 0.8, 0], fov: 36 },
      { b: 0.4, p: [1.8, 1.45, 3.9], l: [0.05, 1.22, 0], fov: 36 },
      { b: 1, p: [2.0, 1.4, 3.5], l: [0.05, 1.22, 0], fov: 36 },
    ],
    b,
  );
  const DUR = 0.11;
  const llegada = Math.max(0, ...PULSOS.map((e) => (b - e - DUR >= 0 && b - e - DUR < 0.05 ? intensidad(e) * (1 - (b - e - DUR) / 0.05) : 0)));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Atleta ej="parado" musculo={0.28} />
        <Piso />
        <group position={CAB} scale={0.125}>
          <Cerebro motor={1 - 0.65 * baja} />
        </group>
        <ViaMotora medula={1 - 0.6 * baja} nervio={1 - 0.6 * baja} />
        {PULSOS.map((e, i) => {
          const u = (b - e) / DUR;
          if (u < 0 || u > 1) return null;
          const k = intensidad(e);
          return (
            <group key={i} position={puntoVia(u)}>
              <mesh>
                <sphereGeometry args={[0.012 + 0.014 * k, 16, 12]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.4 + 0.6 * k} />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.03 + 0.035 * k, 16, 12]} />
                <meshBasicMaterial color={NERVIO_C} transparent opacity={0.45 * k} depthWrite={false} />
              </mesh>
            </group>
          );
        })}
        <HaloMuslo op={llegada} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.08, 1.74, 0.05], t: "Cerebro", a: 0.1, z: 1.1, o: [90, 10], color: "#ff9db0" },
          { p: puntoVia(0.5), t: "Señal nerviosa", a: 0.3, z: 1.1, o: [-60, -40], color: NERVIO_C },
          { p: MUSLO, t: "Músculo", a: 0.45, z: 1.1, o: [90, -70], color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.03} z={1.1} t={`SEÑAL ${Math.round(100 * (1 - 0.6 * baja))}%`} sub="el cerebro frena para protegerte" color={NERVIO_C} y={260} tam={100} />
      <Chip b={b} a={0.12} z={1.1} t="FATIGA CENTRAL" x={540} y={1100} color={K.morado} />
    </AbsoluteFill>
  );
};

// 7 · Como retrasarla -----------------------------------------------------------------
const Consejos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara([{ b: 0, p: [0, 0, 8], l: [0, 0, 0], fov: 40 }], b);
  const items: { a: number; p: V3; t: string; color: string; x: number; y: number }[] = [
    { a: 0.1, p: [-0.73, 1.09, 0], t: "ENTRENA", color: K.lima, x: 300, y: 790 },
    { a: 0.4, p: [0.73, 1.09, 0], t: "GLUCÓGENO LLENO", color: K.morado, x: 780, y: 790 },
    { a: 0.6, p: [-0.73, 0.0, 0], t: "HIDRÁTATE", color: K.cian, x: 300, y: 1130 },
    { a: 0.72, p: [0.73, 0.0, 0], t: "DESCANSA", color: K.amarillo, x: 780, y: 1130 },
  ];
  const s = (a: number) => Math.max(0, pop(b, a, 0.1)) * (b >= a ? 1 : 0);
  const giro = Math.sin(b * 5) * 0.4;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={items[0].p} scale={0.75 * s(items[0].a)} rotation={[0, giro, 0.25]}>
          <F2Pesa p={[0, 0, 0]} />
        </group>
        <group position={items[1].p} scale={0.55 * s(items[1].a)} rotation={[0, giro, 0]}>
          <TanqueGlucogeno nivel={1} b={b} />
        </group>
        <group position={items[2].p} scale={0.62 * s(items[2].a)} rotation={[0.1, giro, -0.1]}>
          <group position={[0, -0.62, 0]}>
            <Botella />
          </group>
        </group>
        <group position={items[3].p} scale={0.62 * s(items[3].a)} rotation={[0, giro * 0.5, 0]}>
          <Reloj t={b * 3} />
        </group>
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Titular b={b} a={0.02} z={1.1} y={280} tam={110} t="Para retrasarla" color={K.lima} />
      {items.map((it) => (
        <Chip key={it.t} b={b} a={it.a + 0.02} z={1.1} t={it.t} x={it.x} y={it.y} color={it.color} />
      ))}
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿El cardio en ayunas quema <span style={{ color: K.lima }}>más grasa</span>?</>}
    escribe="Yo creo que…"
    ideas={["SÍ", "NO", "DEPENDE"]}
  />
);

const T = [
  "¿Por qué llega un momento en que ya no puedes hacer **ni una repetición más**? Eso es la **fatiga**, y no tiene una sola causa.",
  "La fatiga es la caída de tu capacidad para producir fuerza. Puede venir del **músculo** o del **sistema nervioso**.",
  "En el músculo, primero se agota la **fosfocreatina**, y el ATP ya no se recarga tan rápido.",
  "Se acumula **fosfato inorgánico**, que le estorba a la miosina y a la liberación de calcio: es uno de los principales culpables en esfuerzos intensos.",
  "Los **protones** bajan el pH y dan ese ardor. Y el **lactato** no es el villano: de hecho, se reutiliza como combustible.",
  "En esfuerzos largos, el problema es que se vacía el **glucógeno**: es la famosa **pared** de los maratonistas.",
  "Y también hay fatiga **central**: tu cerebro reduce la señal que manda a los músculos para protegerte.",
  "Para retrasarla: entrena tu sistema energético, llega con el **glucógeno lleno**, hidrátate y descansa entre series según tu objetivo.",
  "En el próximo video: ¿el **cardio en ayunas** quema más grasa? ¿Tú qué crees? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Fuentes, Fosfocreatina, Fosfato, Protones, Muro, Central, Consejos, Final];

export const FATIGA: ShortDef = {
  id: "Short-Fatiga",
  titulo: "Fatiga: por qué ya no puedes ni una repetición más",
  planos: ESCENAS.map((Escena, i) => ({ id: `fatiga-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
