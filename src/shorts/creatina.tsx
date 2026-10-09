// Short 1: Creatina. Del atleta al interior de la fibra: fosfocreatina, ATP y fuerza.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { Esfera, Higado, Mol, Vaso } from "../fisio/modelos/energia";
import { Creatina, MiniATP } from "../fisio/energia/e1";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { Chip, Cierre, Dato, Destello, K, Sello, ShortDef, Titular } from "./marco";
import { AguaMol, Atleta, Golpe, InteriorFibra, Piso, Rinones, VasoAgua } from "./modelos";
import { camViaje, cortesViaje, Viaje } from "./viaje";

const VERDE = "#47d18c";

// 0 · Gancho -------------------------------------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const ciclo = (b * 2.2) % 1;
  const k = Math.sin(ciclo * Math.PI);
  const cam = camara(
    [
      { b: 0, p: [3.4, 1.6, 6.4], l: [0, 0.55, 0], fov: 36 },
      { b: 1, p: [-2.6, 1.4, 6.0], l: [0, 0.6, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <Atleta ej="sentadilla" k={k} brilla={0.25 + 0.5 * k} pesa={false} />
        <Piso />
      </Escena3D>
      <Titular b={b} a={0.03} z={1} y={300} tam={150} t="¿Esteroide?" />
      <Sello b={b} a={0.62} z={1} t="NO" y={480} />
    </AbsoluteFill>
  );
};

// 1 · De donde sale: 3 aminoacidos -> creatina; higado; carne y pescado -----------
const AMINO: { n: string; c: string; p: V3 }[] = [
  { n: "Arginina", c: K.cian, p: [-1.6, 1.8, 0] },
  { n: "Glicina", c: K.rosa, p: [1.6, 1.9, 0] },
  { n: "Metionina", c: K.naranja, p: [0, 3.0, 0] },
];

const Origen: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const junta = entre(b, 0.12, 0.38);
  const viaja = entre(b, 0.45, 0.95);
  const cam = camara(
    [
      { b: 0, p: [0, 1.4, 11.5], l: [0, 0.2, 0], fov: 42 },
      { b: 0.45, p: [0.4, 1.1, 10.0], l: [0, 0.1, 0], fov: 42 },
      { b: 1, p: [1.4, 0.2, 10.5], l: [1.0, -0.9, 0], fov: 42 },
    ],
    b,
  );
  const cr: V3 = mix3([0, 1.6, 0.6], [2.4, -2.6, 0.6], viaja);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0, -0.6, -1.2]} scale={1.3}>
          <Higado brillo={0.15 + junta * 0.3} />
        </group>
        <Vaso desde={[-3, -2.2, 0]} hasta={[4, -2.8, 0]} t={b * 1.5} radio={0.35} />
        {junta < 1
          ? AMINO.map((a, i) => <Mol key={i} p={mix3(a.p, [0, 1.6, 0.6], junta)} color={a.c} r={0.38} />)
          : null}
        {junta > 0.6 ? <Creatina p={cr} fosfato={0} escala={4.5 * Math.min(1, (junta - 0.6) / 0.4)} /> : null}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          ...AMINO.map((a, i) => ({ p: a.p, t: a.n, a: 0.02 + i * 0.03, z: 0.3, o: [i === 0 ? -60 : 60, -70] as [number, number], color: a.c })),
          { p: [0, -0.4, -1.2], t: "Hígado y riñón la fabrican", a: 0.25, z: 0.6, o: [-40, 160], color: "#e88a7a" },
          { p: cr, t: "Creatina", a: 0.38, z: 1, o: [70, -80], color: VERDE },
        ]}
      />
      <Chip b={b} a={0.66} z={1} t="+ CARNE" x={330} y={430} color={K.naranja} />
      <Chip b={b} a={0.76} z={1} t="+ PESCADO" x={750} y={430} color={K.cian} />
    </AbsoluteFill>
  );
};

// 2 · Viaje al musculo: se guarda como fosfocreatina ------------------------------
const Almacen: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.62);
  const cam = camViaje(t);
  const llena = entre(b, 0.62, 0.95);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={t > 0.72 ? [10, 34] : undefined}>
        <Viaje t={t} b={b} ej="parado" interior={{ pcr: 6 + 16 * llena, carga: 1 }} />
      </Escena3D>
      <Destello b={b} en={cortesViaje(0, 0.62)} />
      <Chip b={b} a={0.05} z={0.17} t="MÚSCULO" x={540} y={330} color={K.rojo} />
      <Chip b={b} a={0.18} z={0.3} t="FIBRA MUSCULAR" x={540} y={330} color={K.rosa} />
      <Dato b={b} a={0.68} z={1} t="PCr" sub="fosfocreatina = batería rápida" color={VERDE} y={280} />
    </AbsoluteFill>
  );
};

// 3 · Sprint: PCr + ADP -> Cr + ATP -> la miosina tira ------------------------------
const Reaccion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.3;
  const fase3 = b >= 0.72;
  const salto = entre(b, 0.45, 0.62);
  const vuela = entre(b, 0.72, 0.84);
  const golpe = entre(b, 0.84, 0.92);
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [4.6, 1.3, 5.2], l: [0, 0.6, 0], fov: 36 },
          { b: 0.3, p: [3.4, 1.1, 4.6], l: [0, 0.6, 0], fov: 36 },
        ],
        b,
      )
    : fase3
      ? camara(
          [
            { b: 0.72, p: [0.2, 0.2, 8.0], l: [0, -0.9, 0], fov: 40 },
            { b: 1, p: [-0.6, 0.3, 7.0], l: [0, -0.9, 0], fov: 40 },
          ],
          b,
        )
      : camara(
          [
            { b: 0.3, p: [0, 0.4, 9.5], l: [0, -0.8, 0], fov: 40 },
            { b: 0.7, p: [0.3, 0.3, 8.2], l: [0, -0.8, 0], fov: 40 },
          ],
          b,
        );
  const pcrP: V3 = [-1.0, 0.4, 0];
  const adpP: V3 = [0.7, 0.4, 0];
  const fosf: V3 = mix3([-0.72, 0.29, 0], [1.24, 0.4, 0], salto);
  const atpVuelo: V3 = mix3([1.0, 1.6, 0.4], [0.35, -0.1, 0.2], vuela);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [5, 20]}>
        {fuera ? (
          <>
            <Atleta ej="sprint" fase={b * 26} brilla={0.6} />
            <Piso />
          </>
        ) : fase3 ? (
          <>
            <Golpe b={b} giro={mix(-0.6, 0.5, golpe)} desliza={golpe * 0.3} brillo={golpe} />
            {vuela < 1 ? <MiniATP p={atpVuelo} escala={3} brillo={0.8} /> : null}
            <Polvo b={b} radio={4} />
          </>
        ) : (
          <>
            <mesh position={[-0.1, 1.2, -0.5]} scale={[0.6, 0.4, 0.4]}>
              <sphereGeometry args={[1, 32, 24]} />
              <meshPhysicalMaterial color="#b48cff" emissive="#b48cff" emissiveIntensity={0.25 + salto * 0.6} transparent opacity={0.45} depthWrite={false} />
            </mesh>
            <Creatina p={pcrP} fosfato={0} escala={3.2} />
            <MiniATP p={adpP} n={2} escala={3.2} brillo={0.2 + salto * 0.6} />
            <Esfera p={fosf} r={0.21} color="#ff9a2e" brillo={0.7 + salto} />
            <Polvo b={b} radio={4} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.3, 0.72]} />
      <Chip b={b} a={0.03} z={0.3} t="SPRINT · SERIE PESADA" x={540} y={330} color={K.naranja} />
      {!fuera && !fase3 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-1.0, 0.7, 0], t: salto < 0.6 ? "Fosfocreatina" : "Creatina", a: 0.32, z: 0.72, o: [-40, -120], color: VERDE },
            { p: [0.9, 0.7, 0], t: salto < 0.6 ? "ADP" : "¡ATP!", a: 0.34, z: 0.72, o: [40, -120], color: K.naranja },
            { p: [-0.6, 0.18, 0], t: "Fosfato", a: 0.4, z: 0.6, o: [-50, 140], color: "#ff9a2e" },
          ]}
        />
      ) : null}
      {fase3 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.75, 1.6, 0], t: "Miosina", a: 0.74, z: 1, o: [-40, -100], color: "#b48cff" },
            { p: [0.55, 1.4, 0], t: "Actina", a: 0.76, z: 1, o: [40, -100], color: "#f2b83a" },
            { p: atpVuelo, t: "ATP", a: 0.73, z: 0.84, o: [60, 60], color: K.naranja },
          ]}
        />
      ) : null}
      {fase3 ? <Dato b={b} a={0.86} z={1} t="¡CONTRACCIÓN!" sub="el ATP mueve la miosina" color={K.naranja} y={280} tam={84} /> : null}
    </AbsoluteFill>
  );
};

// 4 · Se agota en ~10 s --------------------------------------------------------
const Agota: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const gasto = lineal(b, 0.1, 0.8);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 11.0], l: [0, -0.9, 0], fov: 40 },
      { b: 1, p: [0.5, 0.3, 9.6], l: [0, -0.9, 0], fov: 40 },
    ],
    b,
  );
  const seg = Math.round(gasto * 10);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 22]}>
        <InteriorFibra b={b} pcr={22} carga={1 - gasto} brillo={0.3 * (1 - gasto)} />
      </Escena3D>
      <Dato b={b} a={0.05} z={1} t={`${seg} s`} sub={seg >= 10 ? "batería vacía" : "esfuerzo máximo"} color={seg >= 10 ? K.rojo : K.naranja} y={270} tam={150} />
    </AbsoluteFill>
  );
};

// 5 · Suplemento: +20-40 % de reservas ------------------------------------------------
const Reservas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const sube = entre(b, 0.15, 0.7);
  const cam = camara(
    [
      { b: 0, p: [0, 0.3, 9.6], l: [0, -0.9, 0], fov: 40 },
      { b: 1, p: [-0.6, 0.4, 11.0], l: [0, -0.9, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 22]}>
        <InteriorFibra b={b} pcr={18 + 10 * sube} carga={1} brillo={0.2 + sube * 0.3} />
      </Escena3D>
      <Dato b={b} a={0.4} z={1} t="+20–40 %" sub="más fosfocreatina guardada" color={K.lima} y={270} tam={130} />
    </AbsoluteFill>
  );
};

// 6 · Mas repeticiones, mas fuerza ------------------------------------------------------
const Reps: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const reps = b * 6.2;
  const k = Math.sin((reps % 1) * Math.PI);
  const n = Math.min(10, 4 + Math.floor(reps));
  const extra = n > 8;
  const cam = camara(
    [
      { b: 0, p: [2.0, 1.3, 5.4], l: [0, 0.7, 0], fov: 36 },
      { b: 1, p: [-1.6, 1.2, 5.2], l: [0, 0.7, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Atleta ej="curl" k={k} brilla={extra ? 0.9 : 0.3} colorBrillo={extra ? K.lima : undefined} />
        <Piso color={extra ? K.lima : K.cian} />
      </Escena3D>
      <Dato b={b} a={0.02} z={1} t={`${n} reps`} sub={extra ? "¡+1–2 extra con creatina!" : "serie normal"} color={extra ? K.lima : K.tinta} y={270} tam={130} />
      <Chip b={b} a={0.7} z={1} t="↑ FUERZA" x={330} y={1100} color={K.lima} />
      <Chip b={b} a={0.8} z={1} t="↑ MÚSCULO" x={750} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 7 · Dosis: 3-5 g al dia -----------------------------------------------------------
const Dosis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 2.6, 7.2], l: [0, 0.4, 0], fov: 38 },
      { b: 1, p: [1.2, 2.2, 6.6], l: [0, 0.4, 0], fov: 38 },
    ],
    b,
  );
  const dias = Math.floor(entre(b, 0.35, 0.85) * 7.99);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, b * 0.8, 0]}>
          <VasoAgua b={b} polvo={entre(b, 0.05, 0.6)} />
        </group>
      </Escena3D>
      <Dato b={b} a={0.05} z={1} t="3–5 g" sub="al día, todos los días" color={K.lima} y={260} tam={140} />
      <div style={{ position: "absolute", top: 1060, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14, opacity: visible(b, 0.33, 1) }}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <div
            key={i}
            style={{
              width: 100,
              height: 100,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "InterV, Inter, sans-serif",
              fontWeight: 900,
              fontSize: i < dias ? 54 : 34,
              color: i < dias ? "#071316" : K.suave,
              background: i < dias ? K.lima : "rgba(255,255,255,0.08)",
              border: "3px solid rgba(255,255,255,0.2)",
            }}
          >
            {i < dias ? "✓" : d}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 8 · Monohidrato --------------------------------------------------------------------
const Monohidrato: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const une = entre(b, 0.15, 0.45);
  const cam = camara(
    [
      { b: 0, p: [0, 0.3, 4.4], l: [0, -0.35, 0], fov: 40 },
      { b: 1, p: [0.6, 0.4, 3.8], l: [0, -0.35, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0.3, b * 2.2, 0]}>
          <Creatina p={[-0.15, 0, 0]} fosfato={0} escala={3.2} />
          <AguaMol p={mix3([1.6, 0.9, 0], [0.55, 0.05, 0], une)} escala={2.4} />
        </group>
        <Polvo b={b} radio={3} />
      </Escena3D>
      <Dato b={b} a={0.08} z={1} t="Monohidrato" sub="creatina + 1 molécula de agua" color={K.cian} y={260} tam={110} />
      <Chip b={b} a={0.55} z={1} t="✓ LA MÁS ESTUDIADA" x={540} y={1010} color={K.lima} />
      <Chip b={b} a={0.72} z={1} t="✓ LA MÁS BARATA" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 9 · El kilo extra es agua --------------------------------------------------------------
const Agua: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const entra = entre(b, 0.2, 0.85);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 12.0], l: [0, -0.9, 0], fov: 42 },
      { b: 1, p: [0.4, 0.3, 10.8], l: [0, -0.9, 0], fov: 42 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 24]}>
        <InteriorFibra b={b} pcr={24} agua={entra} hinchazon={entra} />
      </Escena3D>
      <Dato b={b} a={0.02} z={0.45} t="+1 kg" sub="en la báscula" color={K.naranja} y={270} tam={130} />
      <Dato b={b} a={0.5} z={1} t={<><span style={{ color: K.cian }}>AGUA</span> ≠ <span style={{ color: K.rojo }}>GRASA</span></>} color={K.cian} y={270} tam={110} />
    </AbsoluteFill>
  );
};

// 10 · Seguridad ---------------------------------------------------------------------------
const Segura: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.2, 10.0], l: [0, -1.1, 0], fov: 40 },
      { b: 1, p: [1.4, 0.4, 9.0], l: [0, -1.1, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Rinones brillo={0.15 + 0.25 * entre(b, 0.1, 0.4)} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Dato b={b} a={0.08} z={1} t="✓ SEGURA" sub="en personas sanas" color={K.lima} y={260} tam={120} />
      <Chip b={b} a={0.5} z={1} t="¿ENFERMEDAD RENAL? → TU MÉDICO" x={540} y={1100} color={K.naranja} />
    </AbsoluteFill>
  );
};

// 11 · Cierre ---------------------------------------------------------------------------
const Final: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara([{ b: 0, p: [0, 1.1, 6.4], l: [0, 1.05, 0], fov: 36 }], b);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, -0.5 + b * 1.2, 0]} position={[0, 0, 0]}>
          <Atleta ej="flex" k={Math.sin(b * 8) * 0.5 + 0.5} brilla={0.5} colorBrillo={K.lima} />
          <Piso />
        </group>
      </Escena3D>
      <Cierre b={b} />
    </AbsoluteFill>
  );
};

const T = [
  "¿La **creatina** es un esteroide? Spoiler: **no**.",
  "Tu cuerpo la fabrica a partir de **tres aminoácidos**, y también la obtienes de la **carne** y el **pescado**.",
  "En el músculo se guarda como **fosfocreatina**: una batería de energía rápida.",
  "En un esfuerzo explosivo, como un sprint o una serie pesada, la fosfocreatina le cede su **fosfato** al ADP y vuelve a formar **ATP** en un instante.",
  "Pero esa batería se agota en unos **diez segundos**.",
  "Al suplementarte, tus reservas suben entre un **20 y un 40 %**.",
  "Resultado: **una o dos repeticiones más** por serie y, con las semanas, más **fuerza** y más **músculo**.",
  "¿Cuánto tomar? De **3 a 5 g al día**, todos los días. La fase de carga no es obligatoria.",
  "Elige **monohidrato de creatina**: es la forma más estudiada y la más barata.",
  "¿Y el kilo extra en la báscula? Es **agua dentro del músculo**, no grasa.",
  "En personas sanas es **segura**. Si tienes enfermedad renal, consulta a tu médico.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Origen, Almacen, Reaccion, Agota, Reservas, Reps, Dosis, Monohidrato, Agua, Segura, Final];

export const CREATINA: ShortDef = {
  id: "Short-Creatina",
  titulo: "Creatina: ¿qué es y para qué sirve?",
  planos: ESCENAS.map((Escena, i) => ({
    id: `creatina-${i}`,
    seccion: "",
    textos: [T[i]],
    Escena,
  })) as PlanoDef[],
};
