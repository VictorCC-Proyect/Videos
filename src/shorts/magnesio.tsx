// Short: Magnesio: el mineral de tus musculos.
// Del atleta (iones Mg2+ orbitando) al interior de la fibra: Mg-ATP, reticulo
// sarcoplasmico que suelta calcio (contraccion) y bombas SERCA que lo devuelven
// gastando Mg-ATP (relajacion); deficiencia, alimentos y suplementos.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { difusion, Polvo, rnd } from "../fisio/modelos/comun";
import { Sarcomero } from "../fisio/modelos/musculo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Frijoles, Piso, Plato, Rinones } from "./modelos";
import { camViaje, cortesViaje, Viaje } from "./viaje";
import { EscenaCierre } from "./cierre";
import {
  BOMBAS,
  CA,
  Cacao,
  Capsula,
  CISTERNAS,
  Espinaca,
  Frasco,
  Granos,
  IonCa,
  IonMg,
  MG,
  MG_EN_ATP,
  MgATP,
  Nueces,
  Pepitas,
  R_RETICULO,
  RETICULO,
  Reticulo,
  Serca,
} from "./modelos-magnesio";

// 0 · Gancho: curl con iones Mg2+ orbitando + 300 reacciones -----------------------
const ORBITA = Array.from({ length: 12 }).map((_, i) => ({
  r: 0.75 + rnd(`or${i}`) * 0.45,
  y: 0.25 + rnd(`oy${i}`) * 1.5,
  a0: (i / 12) * Math.PI * 2,
  v: 0.8 + rnd(`ov${i}`) * 0.7,
}));
const posOrbita = (i: number, b: number): V3 => {
  const o = ORBITA[i];
  const a = o.a0 + b * Math.PI * 2 * o.v;
  return [Math.cos(a) * o.r, o.y + Math.sin(b * 6 + i) * 0.05, Math.sin(a) * o.r];
};

const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const k = Math.sin(((b * 2.2) % 1) * Math.PI);
  const cam = camara(
    [
      { b: 0, p: [2.6, 1.5, 6.2], l: [0, 0.62, 0], fov: 36 },
      { b: 1, p: [-2.4, 1.3, 5.8], l: [0, 0.66, 0], fov: 36 },
    ],
    b,
  );
  const aparece = entre(b, 0.05, 0.3);
  const cuenta = Math.round(300 * entre(b, 0.45, 0.75));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Atleta ej="curl" k={k} brilla={0.25 + 0.35 * k} colorBrillo={MG} />
        <Piso color={MG} />
        {ORBITA.map((_, i) => (aparece * 12 > i ? <IonMg key={i} p={posOrbita(i, b)} r={0.07} brillo={0.8 + 0.4 * Math.sin(b * 20 + i)} /> : null))}
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={[{ p: posOrbita(0, b), t: "Mg²⁺", a: 0.1, z: 1, o: [70, -70], color: MG }]} />
      <Titular b={b} a={0.02} z={0.45} y={290} tam={150} t="Magnesio" color={MG} />
      <Dato b={b} a={0.45} z={1} t={cuenta >= 300 ? "300+" : `${cuenta}`} sub="reacciones en tu cuerpo" color={MG} y={260} tam={130} />
    </AbsoluteFill>
  );
};

// 1 · Viaje a la fibra: el ATP trabaja unido al Mg2+ ---------------------------------
const Unido: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const FIN = 0.42;
  const t = lineal(b, 0, FIN);
  const cerca = b >= FIN + 0.02;
  const une = entre(b, 0.58, 0.8);
  const cam = cerca
    ? camara(
        [
          { b: FIN, p: [0.3, 0.4, 7.2], l: [0, -0.5, 0], fov: 40 },
          { b: 1, p: [-0.6, 0.3, 6.2], l: [0, -0.5, 0], fov: 40 },
        ],
        b,
      )
    : camViaje(t);
  // ATP de pie: adenina abajo, fosfatos arriba
  const giro = Math.sin(b * 4) * 0.35;
  const rot = (q: V3): V3 => {
    const x = -q[1];
    const y = q[0];
    return [x * Math.cos(giro) + q[2] * Math.sin(giro), y, -x * Math.sin(giro) + q[2] * Math.cos(giro)];
  };
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={!cerca && t > 0.72 ? [10, 34] : undefined}>
        {cerca ? (
          <>
            <group rotation={[0, giro, 0]}>
              <group rotation={[0, 0, Math.PI / 2]}>
                <MgATP une={une} brillo={une * 0.4} />
              </group>
            </group>
            <Polvo b={b} radio={4} />
          </>
        ) : (
          <Viaje t={t} b={b} ej="curl" k={Math.sin(((b * 6) % 1) * Math.PI)} colorBrillo={MG} interior={{ pcr: 0, atp: 10, brillo: 0.2 }} />
        )}
      </Escena3D>
      <Destello b={b} en={[...cortesViaje(0, FIN), FIN + 0.02]} />
      {!cerca ? <Chip b={b} a={0.04} z={0.12} t="MÚSCULO" x={540} y={330} color={K.rojo} /> : null}
      {!cerca ? <Chip b={b} a={0.24} z={FIN} t="DENTRO DE LA FIBRA" x={540} y={330} color={K.rosa} /> : null}
      {cerca ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: rot([-1.3, 0.3, 0]), t: "ATP", a: FIN + 0.03, z: 1, o: [-90, 60], color: K.naranja },
            { p: rot(MG_EN_ATP), t: une > 0.9 ? "Mg-ATP" : "Mg²⁺", a: 0.58, z: 1, o: [80, -60], color: MG },
          ]}
        />
      ) : null}
      {cerca ? <Dato b={b} a={0.72} z={1} t="ATP + magnesio" sub="la forma activa de la energía" color={MG} y={270} tam={96} /> : null}
    </AbsoluteFill>
  );
};

// 2 · Calcio contrae, magnesio ayuda a relajar --------------------------------------
const NCA = 44;
const CA_IONES = Array.from({ length: NCA }).map((_, i) => {
  const a = rnd(`ca${i}`) * Math.PI * 2;
  const y = CISTERNAS[i % 2];
  const casa: V3 = [Math.cos(a) * R_RETICULO, y, Math.sin(a) * R_RETICULO];
  const ra = rnd(`cb${i}`) * Math.PI * 2;
  const rr = 0.25 + rnd(`cr${i}`) * 0.5;
  const libre: V3 = [Math.cos(ra) * rr, (rnd(`cy${i}`) - 0.5) * 2.2, Math.sin(ra) * rr];
  return { casa, libre, bomba: BOMBAS[i % BOMBAS.length], d: rnd(`cd${i}`) };
});
const MG_LIBRES = Array.from({ length: 10 }).map((_, i) => {
  const a = rnd(`mx${i}`) * Math.PI * 2;
  const r = 0.4 + rnd(`mr${i}`) * 0.5;
  return [Math.cos(a) * r, (rnd(`my${i}`) - 0.5) * 2.4, Math.sin(a) * r] as V3;
});

const Ciclo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const suelta = entre(b, 0.06, 0.3);
  const contrae = entre(b, 0.14, 0.38) * (1 - entre(b, 0.62, 0.92));
  const regresa = entre(b, 0.5, 0.9);
  const bombas = visible(b, 0.46, 0.95, 0.05);
  const L = mix(4.0, 3.1, contrae);
  const cam = camara(
    [
      { b: 0, p: [2.4, 2.2, 10.4], l: [0, -0.7, 0], fov: 40 },
      { b: 0.5, p: [1.0, 1.6, 9.6], l: [0, -0.7, 0], fov: 40 },
      { b: 1, p: [-1.2, 1.8, 10.0], l: [0, -0.7, 0], fov: 40 },
    ],
    b,
  );
  const ca = CA_IONES.map((c, i) => {
    const s = Math.min(1, Math.max(0, suelta * 1.4 - c.d * 0.4));
    const r = Math.min(1, Math.max(0, regresa * 1.4 - c.d * 0.4));
    if (r > 0) return r < 0.5 ? mix3(c.libre, c.bomba, r * 2) : mix3(c.bomba, c.casa, (r - 0.5) * 2);
    return difusion(c.casa, c.libre, s, `cf${i}`, 0.12);
  });
  const relajado = b > 0.62;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 22]}>
        <group rotation={[0, 0, Math.PI / 2]}>
          <Sarcomero L={L} radio={0.62} resaltaFinos={contrae * 0.5} />
        </group>
        <Reticulo brillo={suelta * (1 - regresa) * 0.5} />
        {BOMBAS.map((p, i) => (
          <Serca key={i} p={p} activa={bombas * (0.6 + 0.4 * Math.sin(b * 40 + i))} />
        ))}
        {ca.map((p, i) => (
          <IonCa key={i} p={p} />
        ))}
        {MG_LIBRES.map((p, i) => (
          <IonMg key={i} p={[p[0], p[1] + Math.sin(b * 5 + i) * 0.05, p[2]]} r={0.05} op={visible(b, 0.42, 1.1)} />
        ))}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-R_RETICULO, CISTERNAS[1], 0.3], t: "Retículo sarcoplásmico", a: 0.02, z: 0.3, o: [40, -150], color: RETICULO },
          { p: ca[3], t: "Ca²⁺", a: 0.16, z: 0.42, o: [-120, -50], color: CA },
          { p: [0, L / 2, 0], t: "Disco Z", a: 0.24, z: 0.42, o: [140, -90], color: "#c8d6ff" },
          { p: BOMBAS[0], t: "Bomba SERCA", a: 0.5, z: 0.95, o: [-170, 90], color: "#ffd23f" },
          { p: [BOMBAS[3][0] + 0.25, BOMBAS[3][1] - 0.1, BOMBAS[3][2]], t: "usa Mg-ATP", a: 0.56, z: 0.95, o: [110, -90], color: MG },
        ]}
      />
      <Dato b={b} a={0.2} z={0.56} t="CONTRAE" sub="el calcio sale del retículo" color={CA} y={270} tam={110} />
      <Dato b={b} a={0.6} z={1} t="SE RELAJA" sub="el calcio vuelve a su lugar" color={MG} y={270} tam={110} />
      <Chip b={b} a={0.22} z={1} t="Ca²⁺ = contrae" x={300} y={1100} color={CA} />
      <Chip b={b} a={relajado ? 0.62 : 0.62} z={1} t="Mg²⁺ = relaja" x={780} y={1100} color={MG} />
    </AbsoluteFill>
  );
};

// 3 · Deficiencia: cansancio, debilidad, calambres -----------------------------------
const Falta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const espasmo = entre(b, 0.66, 0.74);
  const pulso = espasmo * (Math.sin(b * 90) > 0.2 ? 1 : 0.25);
  const tiembla = espasmo * Math.sin(b * 260) * 0.006;
  const cam = camara(
    [
      { b: 0, p: [0.6, 1.1, 6.2], l: [0, 0.72, 0], fov: 36 },
      { b: 0.55, p: [2.6, 0.9, 3.6], l: [0, 0.6, 0], fov: 36 },
      { b: 1, p: [1.6, 0.6, -2.8], l: [0.05, 0.42, 0], fov: 36 },
    ],
    b,
  );
  const respira = Math.sin(b * 8) * 0.01;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} luz={0.8}>
        <group rotation={[0.05, 0, 0]} position={[0, respira, 0]}>
          <Atleta ej="parado" brilla={0.12} colorBrillo="#6f8a90" musculo={0.6} />
        </group>
        <Piso color="#6f8a90" brillo={0.25} />
        {/* pantorrilla derecha: espasmo */}
        {[1, -1].map((l) => (
          <group key={l} position={[0.1 * l + tiembla, 0.34, -0.025]}>
            <mesh scale={[0.07, 0.15, 0.065]}>
              <sphereGeometry args={[1, 24, 18]} />
              <meshPhysicalMaterial color={K.rojo} emissive={K.rojo} emissiveIntensity={l > 0 ? 0.4 + pulso * 2.2 : 0.05} transparent opacity={l > 0 ? 0.25 + pulso * 0.6 : 0.0} depthWrite={false} />
            </mesh>
          </group>
        ))}
        {pulso > 0.5 ? (
          <mesh position={[0.1, 0.34, -0.03]}>
            <sphereGeometry args={[0.2, 20, 14]} />
            <meshBasicMaterial color={K.rojo} transparent opacity={0.18} depthWrite={false} />
          </mesh>
        ) : null}
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={[{ p: [0.1, 0.34, -0.06], t: "Pantorrilla", a: 0.74, z: 1, o: [-140, -80], color: K.rojo }]} />
      <Chip b={b} a={0.3} z={1} t="CANSANCIO" x={290} y={300} color={K.amarillo} />
      <Chip b={b} a={0.45} z={1} t="DEBILIDAD" x={790} y={300} color={K.naranja} />
      <Chip b={b} a={0.7} z={1} t="CALAMBRES*" x={540} y={400} color={K.rojo} />
      <div
        style={{
          position: "absolute",
          top: 448,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: INTER,
          fontWeight: 700,
          fontSize: 32,
          color: K.tinta,
          opacity: visible(b, 0.72, 1),
          textShadow: "0 4px 14px rgba(0,0,0,0.8)",
        }}
      >
        (*en algunas personas)
      </div>
    </AbsoluteFill>
  );
};

// 4 · Alimentos ------------------------------------------------------------------------
const PLATOS: { p: V3; n: string; a: number; c: string }[] = [
  { p: [-0.7, 0, -1.3], n: "Semillas de calabaza", a: 0.17, c: "#9ccf6a" },
  { p: [0.7, 0, -1.3], n: "Nueces", a: 0.27, c: "#d9a066" },
  { p: [-0.7, 0, 0], n: "Cacao", a: 0.35, c: "#c98a5e" },
  { p: [0.7, 0, 0], n: "Frijoles", a: 0.43, c: K.naranja },
  { p: [-0.7, 0, 1.3], n: "Espinaca", a: 0.53, c: "#47d18c" },
  { p: [0.7, 0, 1.3], n: "Granos enteros", a: 0.74, c: "#e2b65a" },
];

const Comida: React.FC<{ i: number }> = ({ i }) => {
  const p: V3 = [0, 0.035, 0];
  if (i === 0) return <Pepitas p={p} escala={1.1} />;
  if (i === 1) return <Nueces p={p} escala={1.2} />;
  if (i === 2) return <Cacao p={p} escala={1.1} />;
  if (i === 3) return <Frijoles p={[0, 0, 0]} escala={0.95} />;
  if (i === 4) return <Espinaca p={p} escala={1.2} />;
  return <Granos p={p} escala={1.1} />;
};

const Alimentos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 5.6, 6.4], l: [0, -0.9, -0.2], fov: 38 },
      { b: 1, p: [0.8, 5.0, 5.8], l: [0, -0.9, -0.2], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <mesh position={[0, -0.03, 0]}>
          <boxGeometry args={[2.9, 0.06, 4.1]} />
          <meshStandardMaterial color="#3a2a22" roughness={0.7} />
        </mesh>
        {PLATOS.map((pl, i) => {
          const s = Math.min(1, Math.max(0, (b - pl.a + 0.04) / 0.08));
          if (s <= 0) return null;
          const rebote = s < 1 ? 1 + Math.sin(s * Math.PI) * 0.15 : 1;
          return (
            <group key={i} position={[pl.p[0], pl.p[1] + (1 - s) * 0.6, pl.p[2]]} scale={s * rebote}>
              <Plato p={[0, 0.03, 0]} escala={1.05} />
              <group position={[0, 0.06, 0]} rotation={[0, b * 0.6, 0]}>
                <Comida i={i} />
              </group>
            </group>
          );
        })}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={PLATOS.map((pl, i) => ({
          p: [pl.p[0], 0.25, pl.p[2]] as V3,
          t: pl.n,
          a: pl.a,
          z: 1.2,
          o: [i % 2 ? 40 : -40, -90] as [number, number],
          color: pl.c,
        }))}
      />
      <Dato b={b} a={0.02} z={1} t="¿Dónde encontrarlo?" color={MG} y={270} tam={88} />
    </AbsoluteFill>
  );
};

// 5 · Suplementos: solo si hay deficiencia; exceso y rinones ---------------------------
const CAPS = Array.from({ length: 34 }).map((_, i) => {
  const a = rnd(`ka${i}`) * Math.PI * 2;
  const r = 0.55 + rnd(`kr${i}`) * 0.9;
  return { p: [Math.cos(a) * r, 0.07, Math.sin(a) * r * 0.8 + 0.3] as V3, rot: [Math.PI / 2, rnd(`kg${i}`) * 3, 0] as V3 };
});

const Suplementos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const CORTE = 0.68;
  const rinon = b >= CORTE;
  const exceso = entre(b, 0.46, 0.62);
  const n = Math.round(4 + exceso * 30);
  const cam = rinon
    ? camara(
        [
          { b: CORTE, p: [0, 0.2, 9.4], l: [0, -1.0, 0], fov: 40 },
          { b: 1, p: [1.2, 0.4, 8.6], l: [0, -1.0, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: 0, p: [0, 2.2, 5.2], l: [0, 0.0, 0], fov: 38 },
          { b: CORTE, p: [0.9, 2.6, 5.8], l: [0, 0.0, 0], fov: 38 },
        ],
        b,
      );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {rinon ? (
          <>
            <Rinones brillo={0.15 + 0.3 * Math.abs(Math.sin(b * 12)) * entre(b, CORTE, CORTE + 0.08)} />
            <Polvo b={b} radio={4} />
          </>
        ) : (
          <group rotation={[0, b * 0.5, 0]}>
            <Frasco p={[0, 0, -0.2]} />
            {CAPS.slice(0, n).map((c, i) => (
              <Capsula key={i} p={c.p} rot={c.rot} escala={1.2} />
            ))}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.8, 48]} />
              <meshStandardMaterial color="#0d2a2f" roughness={0.8} />
            </mesh>
          </group>
        )}
      </Escena3D>
      <Destello b={b} en={[CORTE]} />
      {!rinon ? <Dato b={b} a={0.02} z={CORTE} t="Suplementos" color={MG} y={270} tam={100} /> : null}
      {rinon ? <Dato b={b} a={CORTE} z={1} t="Riñones" sub="eliminan el exceso de magnesio" color="#e88a7a" y={270} tam={100} /> : null}
      <Chip b={b} a={0.3} z={0.5} t="SOLO SI HAY DEFICIENCIA" x={540} y={1100} color={K.lima} />
      <Chip b={b} a={0.5} z={CORTE} t="EXCESO → DIARREA" x={540} y={1100} color={K.naranja} />
      <Chip b={b} a={CORTE + 0.04} z={1} t="ENFERMEDAD RENAL: CUIDADO" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

const T = [
  "El **magnesio** participa en más de **300 reacciones** de tu cuerpo.",
  "En el músculo es clave: el ATP casi siempre trabaja **unido al magnesio**.",
  "El calcio hace que el músculo se **contraiga**, y el magnesio ayuda a que se **relaje** y a que el calcio regrese a su lugar.",
  "Si te falta, pueden aparecer **cansancio**, debilidad y, en algunas personas, **calambres**.",
  "Lo encuentras en **semillas**, nueces, cacao, frijoles, verduras de hoja verde y granos enteros.",
  "Los suplementos ayudan sobre todo si tienes **deficiencia**. En exceso causan diarrea, y con enfermedad renal hay que tener **cuidado**.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Unido, Ciclo, Falta, Alimentos, Suplementos, EscenaCierre];

export const MAGNESIO: ShortDef = {
  id: "Short-Magnesio",
  titulo: "Magnesio: el mineral de tus músculos",
  planos: ESCENAS.map((Escena, i) => ({ id: `magnesio-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
