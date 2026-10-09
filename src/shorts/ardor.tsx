// Short 2: ¿Por que te arde el musculo? Del atleta al interior de la fibra:
// demanda de ATP, glucolisis rapida, H+ y pH, receptores de dolor, lactato y Cori.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Cadena, Higado, Mol, Vaso } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { MiniATP } from "../fisio/energia/e1";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { ANTON, Chip, Cierre, Dato, Destello, K, Sello, ShortDef, Titular } from "./marco";
import { Atleta, InteriorFibra, Nervio, Piso } from "./modelos";
import { camViaje, cortesViaje, Viaje } from "./viaje";

const GLUCOSA = "#ffd166";
const PIRUVATO = K.naranja;
const LACTATO = "#ff8fd0";

// 0 · Gancho -------------------------------------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const k = Math.sin(((b * 2.4) % 1) * Math.PI);
  const cam = camara(
    [
      { b: 0, p: [3.2, 1.5, 6.2], l: [0, 0.55, 0], fov: 36 },
      { b: 1, p: [-2.6, 1.4, 5.8], l: [0, 0.6, 0], fov: 36 },
    ],
    b,
  );
  const raya = entre(b, 0.5, 0.58);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Atleta ej="sentadilla" k={k} brilla={0.5 + 0.5 * Math.sin(b * 30) ** 2} colorBrillo={K.naranja} />
        <Piso color={K.naranja} />
      </Escena3D>
      <Titular b={b} a={0.02} z={1} y={290} tam={118} t="Ácido láctico" color={K.tinta} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 345, height: 18, borderRadius: 9, background: K.rojo, transformOrigin: "0 50%", transform: `scaleX(${raya})`, boxShadow: `0 0 30px ${K.rojo}` }} />
      <Sello b={b} a={0.6} z={1} t="MITO" y={450} />
    </AbsoluteFill>
  );
};

// 1 · El musculo pide ATP mas rapido de lo que llega el oxigeno ---------------------
const Demanda: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.55);
  const cam = camViaje(t);
  const gasta = lineal(b, 0.55, 1);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={t > 0.72 ? [10, 34] : undefined}>
        <Viaje t={t} b={b} ej="sentadilla" k={Math.sin(((b * 3) % 1) * Math.PI)} colorBrillo={K.naranja} interior={{ pcr: 4, carga: 0.3, atp: 14 * (1 - gasta) + 2, brillo: 0.6 }} />
        {t >= 1
          ? Array.from({ length: 4 }).map((_, i) => {
              const f = (b * 0.8 + i / 4) % 1;
              return <Mol key={i} p={[mix(-5, 3, f), 2.6 - i * 1.3, 1.2]} color={K.cian} r={0.15} />;
            })
          : null}
      </Escena3D>
      <Destello b={b} en={cortesViaje(0, 0.55)} />
      <Dato b={b} a={0.6} z={1} t={<><span style={{ color: K.naranja }}>ATP ↑↑</span>  <span style={{ color: K.cian }}>O₂ ↓</span></>} sub="el oxígeno no alcanza" color={K.naranja} y={270} tam={104} />
    </AbsoluteFill>
  );
};

// 2 · Glucolisis a toda velocidad ---------------------------------------------------
const Glucolisis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 8.5], l: [0, -0.7, 0], fov: 40 },
      { b: 1, p: [0.8, 0.3, 7.4], l: [0, -0.7, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 26]}>
        <group position={[0, 0, -3.5]}>
          <InteriorFibra b={b} pcr={0} brillo={0.3} />
        </group>
        {[0, 1, 2].map((i) => {
          const a = 0.08 + i * 0.25;
          const corte = entre(b, a + 0.12, a + 0.22);
          const c: V3 = [(i - 1) * 1.5, 1.4 - i * 0.9, 0.5];
          if (b < a) return null;
          const op = visible(b, a, 1.1);
          return (
            <group key={i}>
              {corte < 0.05 ? <Cadena n={6} anillo p={c} color={GLUCOSA} sep={0.26} op={op} brillo={0.3} /> : null}
              {corte >= 0.05 ? (
                <>
                  <Cadena n={3} p={mix3(c, [c[0] - 0.9, c[1] + 0.3, c[2]], corte)} color={PIRUVATO} sep={0.24} brillo={0.4} />
                  <Cadena n={3} p={mix3(c, [c[0] + 0.4, c[1] - 0.4, c[2]], corte)} color={PIRUVATO} sep={0.24} brillo={0.4} />
                  <MiniATP p={mix3(c, [c[0] + 0.2, c[1] + 0.9, c[2] + 0.3], corte)} escala={1.8 * corte} brillo={1} />
                  <MiniATP p={mix3(c, [c[0] - 0.4, c[1] - 0.9, c[2] + 0.3], corte)} escala={1.8 * corte} brillo={1} />
                </>
              ) : null}
            </group>
          );
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.5, 1.4, 0.5], t: "Glucosa", a: 0.08, z: 0.3, o: [-30, -110], color: GLUCOSA },
          { p: [-2.4, 1.7, 0.5], t: "2 piruvato", a: 0.32, z: 0.6, o: [-20, -120], color: PIRUVATO },
          { p: [-1.3, 2.3, 0.8], t: "+ ATP rápido", a: 0.36, z: 0.7, o: [60, -120], color: K.naranja },
        ]}
      />
      <Dato b={b} a={0.02} z={1} t="Glucólisis" sub="glucosa → energía rápida" color={GLUCOSA} y={260} tam={110} />
    </AbsoluteFill>
  );
};

// 3 · Se liberan H+ y el pH baja ---------------------------------------------------
const Acido: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const acum = entre(b, 0.1, 0.85);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 11], l: [0, -0.9, 0], fov: 40 },
      { b: 1, p: [-0.5, 0.3, 9.4], l: [0, -0.9, 0], fov: 40 },
    ],
    b,
  );
  const ph = (7.1 - 0.6 * entre(b, 0.45, 0.95)).toFixed(1);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 28]}>
        <InteriorFibra b={b} pcr={0} atp={6} hplus={50 * acum} brillo={0.2 + acum * 0.6} />
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(255,40,40,${0.35 * acum}) 100%)` }} />
      <Chip b={b} a={0.12} z={0.6} t="H⁺ (iones de hidrógeno)" x={540} y={1100} color={K.rojo} />
      <Dato b={b} a={0.4} z={1} t={`pH ${ph}`} sub="más ácido" color={K.rojo} y={260} tam={140} />
    </AbsoluteFill>
  );
};

// 4 · Activan los receptores de dolor -> ardor --------------------------------------
const Receptor: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const llegan = entre(b, 0.1, 0.5);
  const activa = entre(b, 0.45, 0.6);
  const cam = camara(
    [
      { b: 0, p: [0, 0.6, 9.5], l: [0, 0.6, 0], fov: 40 },
      { b: 1, p: [1.2, 0.4, 8.0], l: [0, 0.5, 0], fov: 40 },
    ],
    b,
  );
  const iones: { c: string; d: V3 }[] = Array.from({ length: 16 }).map((_, i) => ({
    c: i % 4 === 3 ? "#ff9a2e" : K.rojo,
    d: [(rnd(`ri${i}`) - 0.5) * 7, -3 + rnd(`rj${i}`) * 1.5, (rnd(`rk${i}`) - 0.5) * 2],
  }));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        <group position={[0, -0.6, 0]}>
          <Nervio activa={activa} pulso={b * 3} />
        </group>
        {iones.map((o, i) => {
          const fin: V3 = [Math.sin(i) * 0.6, -1.7 + Math.cos(i * 2) * 0.3, Math.cos(i) * 0.5];
          return <Mol key={i} p={mix3(o.d, fin, llegan * (0.6 + 0.4 * rnd(`rl${i}`)))} color={o.c} r={0.12} />;
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 60%, rgba(255,90,40,${0.3 * activa}) 0%, transparent 60%)` }} />
      <Chip b={b} a={0.06} z={0.5} t="TERMINACIÓN NERVIOSA" x={540} y={330} color={K.amarillo} />
      <Chip b={b} a={0.2} z={0.6} t="H⁺ + FOSFATO + METABOLITOS" x={540} y={1100} color={K.rojo} />
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: ANTON,
          fontSize: 210,
          lineHeight: 1,
          opacity: visible(b, 0.72, 1, 0.05),
          transform: `scale(${0.9 + 0.1 * entre(b, 0.72, 0.8)}) translateX(${Math.sin(b * 120) * 6}px)`,
          background: `linear-gradient(0deg, ${K.rojo}, ${K.naranja} 60%, ${K.amarillo})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        ARDOR
      </div>
    </AbsoluteFill>
  );
};

// 5 · El lactato ayuda: se lleva H+ y es combustible -------------------------------
const Lactato: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 7.6], l: [0, -0.6, 0], fov: 40 },
      { b: 1, p: [-0.8, 0.3, 7.0], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  const toma = entre(b, 0.25, 0.5);
  const sale = entre(b, 0.6, 0.95);
  const centros: V3[] = [
    [-1.4, 1.2, 0.4],
    [1.2, 0.3, 0.6],
    [-0.6, -0.9, 0.5],
  ];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 24]}>
        <group position={[0, 0, -3.5]}>
          <InteriorFibra b={b} pcr={0} hplus={20 * (1 - toma)} />
        </group>
        <Vaso desde={[4.5, 3, -0.5]} hasta={[4.5, -4, -0.5]} t={b * 1.4} radio={0.5} />
        {centros.map((c, i) => {
          const p = mix3(c, [4.2, c[1] + 0.5, -0.4], sale);
          return (
            <group key={i}>
              <Cadena n={3} p={p} color={toma > 0.5 ? LACTATO : PIRUVATO} sep={0.26} brillo={0.5} />
              {toma < 1 ? <Mol p={mix3([c[0] + 1.0, c[1] + 0.8, c[2]], [c[0] + 0.25, c[1], c[2]], toma)} color={K.rojo} r={0.13} op={1 - toma * 0.8} /> : null}
            </group>
          );
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.1, 1.3, 0.4], t: toma < 0.5 ? "Piruvato + H⁺" : "Lactato", a: 0.05, z: 0.6, o: [-20, -130], color: toma < 0.5 ? PIRUVATO : LACTATO },
          { p: [4.5, 2.0, -0.5], t: "A la sangre", a: 0.6, z: 1, o: [-60, -110], color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.02} z={1} t="Lactato = aliado" color={LACTATO} y={260} tam={100} />
      <Chip b={b} a={0.45} z={1} t="✓ SE LLEVA H⁺" x={300} y={1100} color={K.lima} />
      <Chip b={b} a={0.7} z={1} t="✓ COMBUSTIBLE" x={780} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 6 · Ciclo de Cori: musculo -> higado -> glucosa ----------------------------------
const Cori: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.5, 13], l: [0, -0.4, 0], fov: 40 },
      { b: 1, p: [1.5, 0.6, 12], l: [0, -0.4, 0], fov: 40 },
    ],
    b,
  );
  const sube = (f: number): V3 => [mix(-1.6, -1.6, f), mix(-3.2, 2.0, f), 0.6];
  const baja = (f: number): V3 => [mix(1.6, 1.6, f), mix(2.0, -3.2, f), 0.6];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0, 3.0, -0.6]} scale={1.2}>
          <Higado brillo={0.2 + 0.3 * Math.sin(b * 12) ** 2} />
        </group>
        <group position={[0, -3.8, -0.4]} rotation={[0, 0, 0]}>
          <CilindroX radio={0.9} largo={5} x={2.5} color="#c03a46" estriado={6} />
        </group>
        <Vaso desde={[-1.6, -3.2, 0]} hasta={[-1.6, 2.0, 0]} t={b} radio={0.32} />
        <Vaso desde={[1.6, 2.0, 0]} hasta={[1.6, -3.2, 0]} t={b} radio={0.32} />
        {[0, 1, 2, 3].map((i) => {
          const f = (b * 1.3 + i / 4) % 1;
          return (
            <group key={i}>
              <Cadena n={3} p={sube(f)} color={LACTATO} sep={0.22} brillo={0.6} />
              {b > 0.35 ? <Cadena n={6} anillo p={baja(f)} color={GLUCOSA} sep={0.2} brillo={0.5} /> : null}
            </group>
          );
        })}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, 3.4, 0], t: "Hígado", a: 0.05, z: 1, o: [80, -60], color: "#e88a7a" },
          { p: [0, -3.8, 0.9], t: "Músculo", a: 0.05, z: 1, o: [80, 60], color: K.rojo },
          { p: [-1.6, -0.6, 0.6], t: "Lactato ↑", a: 0.15, z: 1, o: [-70, 0], color: LACTATO },
          { p: [1.6, -0.6, 0.6], t: "Glucosa ↓", a: 0.4, z: 1, o: [70, 0], color: GLUCOSA },
        ]}
      />
      <Titular b={b} a={0.55} z={1} y={1060} tam={96} t="Ciclo de Cori" color={K.lima} />
    </AbsoluteFill>
  );
};

// 7 · Al parar se va en minutos; agujetas = microdano -------------------------------
const Agujetas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const limpia = entre(b, 0.05, 0.35);
  const dano = entre(b, 0.55, 0.7);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 11], l: [0, -0.9, 0], fov: 40 },
      { b: 0.5, p: [0, 0.3, 10], l: [0, -0.9, 0], fov: 40 },
      { b: 1, p: [0.6, 0.2, 7.5], l: [0, -0.9, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 28]}>
        <InteriorFibra b={b} pcr={14} hplus={40 * (1 - limpia)} dano={dano} />
      </Escena3D>
      <Dato b={b} a={0.03} z={0.5} t="Minutos" sub="al parar, el ardor se va" color={K.naranja} y={260} tam={120} />
      <Dato b={b} a={0.55} z={1} t="24–72 h" sub="agujetas = microdaño" color={K.amarillo} y={260} tam={130} />
    </AbsoluteFill>
  );
};

// 8 · Amortiguadores ----------------------------------------------------------------
const Buffers: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const atrapa = entre(b, 0.25, 0.8);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 8.5], l: [0, -0.6, 0], fov: 40 },
      { b: 1, p: [-0.6, 0.3, 7.6], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 26]}>
        <group position={[0, 0, -3.5]}>
          <InteriorFibra b={b} pcr={10} />
        </group>
        {Array.from({ length: 12 }).map((_, i) => {
          const base: V3 = [(rnd(`bx${i}`) - 0.5) * 4, (rnd(`by${i}`) - 0.5) * 5, 0.6 + rnd(`bz${i}`)];
          const h: V3 = [base[0] + 0.9, base[1] + 0.7, base[2]];
          const col = i % 2 ? "#4f8dff" : K.morado;
          return (
            <group key={i}>
              <Mol p={base} color={col} r={0.2} brillo={0.6} />
              <Mol p={mix3(h, [base[0] + 0.2, base[1] + 0.1, base[2] + 0.1], atrapa)} color={K.rojo} r={0.1} op={1 - atrapa * 0.5} />
            </group>
          );
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Dato b={b} a={0.05} z={1} t="Amortiguadores ↑" sub="atrapan el H⁺" color={K.cian} y={260} tam={96} />
      <Chip b={b} a={0.35} z={1} t="BICARBONATO" x={300} y={1100} color="#4f8dff" />
      <Chip b={b} a={0.45} z={1} t="CARNOSINA" x={780} y={1100} color={K.morado} />
    </AbsoluteFill>
  );
};

// 9 · Cierre --------------------------------------------------------------------------
const Final: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara([{ b: 0, p: [0, 1.1, 6.4], l: [0, 1.05, 0], fov: 36 }], b);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, -0.5 + b * 1.2, 0]}>
          <Atleta ej="flex" k={Math.sin(b * 8) * 0.5 + 0.5} brilla={0.5} colorBrillo={K.lima} />
          <Piso />
        </group>
      </Escena3D>
      <Cierre b={b} />
    </AbsoluteFill>
  );
};

const T = [
  "Ese ardor en las últimas repeticiones... **no** es culpa del ácido láctico, como te contaron.",
  "Cuando entrenas intenso, tu músculo pide **ATP** más rápido de lo que el **oxígeno** alcanza a producirlo.",
  "Entonces acelera la **glucólisis**: rompe glucosa a toda velocidad para sacar energía.",
  "Al gastar tanto ATP se liberan **iones de hidrógeno**, y el músculo se vuelve más ácido: el **pH baja**.",
  "Esa acidez, junto con el fosfato y otros metabolitos, activa tus **receptores de dolor**. Eso es el **ardor**.",
  "¿Y el lactato? En realidad te **ayuda**: se lleva hidrógenos y sirve como **combustible**.",
  "Tu hígado incluso lo vuelve a convertir en glucosa: es el **ciclo de Cori**.",
  "Al parar, el ardor se va en **minutos**. Las agujetas del día siguiente son otra cosa: **microdaño muscular**.",
  "Y si entrenas a alta intensidad, mejoran tus **amortiguadores** y toleras mejor el ardor.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Demanda, Glucolisis, Acido, Receptor, Lactato, Cori, Agujetas, Buffers, Final];

export const ARDOR: ShortDef = {
  id: "Short-Ardor",
  titulo: "¿Por qué te arde el músculo?",
  planos: ESCENAS.map((Escena, i) => ({ id: `ardor-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
