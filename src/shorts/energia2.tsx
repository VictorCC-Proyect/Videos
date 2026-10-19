// Short: ¿De dónde sacan energía tus músculos? Parte 2: el sistema aeróbico
// Del atleta a la mitocondria: oxígeno, acetil-CoA, Krebs, cadena respiratoria y ATP sintasa.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Humano } from "../fisio/modelos/cuerpo";
import { ATPsintasa, Cadena, Complejo, Esfera, Glucogeno, GotaLipido, Membrana, MitocondriaGrande, Mol, posKrebs, Pulmones, RuedaKrebs, Vaso } from "../fisio/modelos/energia";
import { Creatina, MiniATP } from "../fisio/energia/e1";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaProximos } from "./cierre";
import { ANTON, Chip, Dato, Destello, INTER, K, ShortDef } from "./marco";
import { AguaMol, Frijoles, InteriorFibra, Piso, Plato } from "./modelos";
import { MitoMini } from "./modelos-ayuno";
import { Hoja } from "./modelos-glucosa";
import { AcetilCoA, Aguacate, Capsula, Columna, FlechasCiclo, Hierro, O2Mol, Portador } from "./modelos-energia";
import { camViaje, cortesViaje, tramoViaje, Viaje } from "./viaje";

const VERDE = "#47d18c";
const GLUCOSA = "#ffd166";
const PIRUVATO = K.naranja;
const GRASA = "#ffd34d";
const ACETIL = "#ffb000";
const NADH = "#5ec8ff";
const FADH = "#7cff8a";
const E = "#ffe14d";
const CO2 = "#8a8f99";
const MITO = "#ff7b54";

const cic = (b: number, vel: number, k = 0) => (((b * vel + k) % 1) + 1) % 1;

// 0 · Gancho: atleta trotando -> viaje a la fibra -> mitocondrias ------------------
const MITOS: { p: V3; r: number }[] = [
  { p: [-1.0, 1.5, 1.0], r: 0.5 },
  { p: [0.9, 0.2, 1.1], r: -0.4 },
  { p: [-0.7, -1.4, 0.9], r: 0.2 },
  { p: [1.0, 2.6, 0.6], r: 1.2 },
  { p: [0.6, -2.6, 0.7], r: -1.0 },
];

const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0.08, 0.6);
  const dentro = t >= 1;
  const cam = dentro
    ? camara(
        [
          { b: 0.6, p: [0, 0.3, 10.5], l: [0, -0.9, 0], fov: 40 },
          { b: 1, p: [0.3, 0.1, 9.0], l: [0, -0.6, 0], fov: 40 },
        ],
        b,
      )
    : camViaje(t);
  const brillan = entre(b, 0.62, 0.75);
  const fase = b * 22;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={dentro ? [6, 22] : t > 0.72 ? [10, 34] : undefined}>
        {tramoViaje(t) === 0 ? (
          <>
            <Humano fase={fase} marcha={0.9} musculo={0.8} brilla={0.25 + 0.5 * entre(t, 0.1, 0.25)} colorBrillo={MITO} />
            <Piso color={K.naranja} />
          </>
        ) : (
          <Viaje t={t} b={b} interior={{ pcr: 0, brillo: 0.05 }} />
        )}
        {dentro
          ? MITOS.map((m, i) => (
              <group key={i}>
                <MitoMini p={m.p} escala={1.7 * (0.6 + 0.4 * brillan)} rot={m.r} />
                <mesh position={m.p}>
                  <sphereGeometry args={[0.75, 20, 14]} />
                  <meshBasicMaterial color={MITO} transparent opacity={0.12 * brillan * (0.7 + 0.3 * Math.sin(b * 20 + i))} depthWrite={false} />
                </mesh>
              </group>
            ))
          : null}
        {dentro
          ? Array.from({ length: 8 }).map((_, i) => {
              const f = cic(b, 1.6, i / 8);
              const m = MITOS[i % MITOS.length].p;
              const ini: V3 = [m[0] + (rnd(`o2x${i}`) > 0.5 ? 1.6 : -1.6), m[1] + 0.6, m[2] + 0.3];
              return <O2Mol key={i} p={mix3(ini, m, f)} escala={1.4} op={visible(b, 0.72, 1) * (1 - f * 0.7)} giro={b * 6 + i} />;
            })
          : null}
      </Escena3D>
      <Destello b={b} en={cortesViaje(0.08, 0.6)} />
      <Chip b={b} a={0.0} z={0.3} t="SISTEMAS DE ENERGÍA · PARTE 2" x={540} y={330} color={K.lima} />
      {dentro ? (
        <Etiquetas cam={cam} b={b} items={[{ p: MITOS[1].p, t: "Mitocondrias", a: 0.66, z: 1, o: [30, -150], color: MITO }]} />
      ) : null}
      <Dato b={b} a={0.62} z={1} t="3 · Aeróbico" sub="el sistema más grande" color={K.naranja} y={250} tam={110} />
      <Chip b={b} a={0.74} z={1} t="CON OXÍGENO" x={540} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 1 · Oxigeno: pulmones -> sangre -> fibra -> mitocondria ---------------------------
const Oxigeno: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.5;
  const respira = 0.5 + 0.5 * Math.sin(b * 16);
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [1.2, 1.5, 3.4], l: [0, 1.0, 0], fov: 36 },
          { b: 0.5, p: [-0.9, 1.3, 3.3], l: [0, 0.95, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.5, p: [0, 0.4, 9.2], l: [0, -0.2, 0], fov: 40 },
          { b: 1, p: [0.4, 0.2, 8.2], l: [0, -0.3, 0], fov: 40 },
        ],
        b,
      );
  // ruta del O2 en el cuerpo: boca -> traquea -> pulmon -> arteria -> muslo
  const ruta: V3[] = [
    [0, 1.75, 0.35],
    [0, 1.62, 0.1],
    [0, 1.45, 0.05],
    [0.09, 1.3, 0.06],
    [0.12, 1.12, 0.12],
    [0.11, 0.75, 0.12],
    [0.1, 0.5, 0.1],
  ];
  const enRuta = (f: number): V3 => {
    const x = Math.min(ruta.length - 1.001, f * (ruta.length - 1));
    const i = Math.floor(x);
    return mix3(ruta[i], ruta[i + 1], x - i);
  };
  const VASO_Y = 1.45;
  const MITO_P: V3 = [0, -1.0, 0];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [7, 22]}>
        {fuera ? (
          <>
            <Humano musculo={0.22} pose={{ hombroD: [0, 0, 0.12], hombroI: [0, 0, -0.12], codoD: -0.15, codoI: -0.15, caderaD: [0, 0, 0.04], caderaI: [0, 0, -0.04], rodillaD: 0, rodillaI: 0 }} />
            <group position={[0, 1.3, 0.02]} scale={0.16}>
              <Pulmones respira={respira} />
            </group>
            <Vaso desde={[0.12, 1.2, 0.12]} hasta={[0.1, 0.45, 0.1]} t={b * 2} radio={0.04} />
            {Array.from({ length: 7 }).map((_, i) => {
              const f = cic(b, 1.3, i / 7);
              return <O2Mol key={i} p={enRuta(f)} escala={0.28} op={visible(b, 0.02, 1)} giro={i + b * 8} />;
            })}
            <Piso color={K.cian} />
          </>
        ) : (
          <>
            <group position={[0, 0, -6]}>
              <InteriorFibra b={b} pcr={0} brillo={0.05} />
            </group>
            <Vaso desde={[-3, VASO_Y, 0]} hasta={[3, VASO_Y + 0.1, 0]} t={b * 2} radio={0.42} />
            <group position={MITO_P} scale={0.62}>
              <MitocondriaGrande brillo={0.1 + 0.3 * entre(b, 0.65, 0.85)} />
            </group>
            {Array.from({ length: 10 }).map((_, i) => {
              const f = cic(b, 1.8, i / 10);
              const x0 = (rnd(`ox${i}`) - 0.5) * 2.4;
              const ini: V3 = [x0, VASO_Y - 0.1, 0.2];
              const fin: V3 = [x0 * 0.5, MITO_P[1] + 0.1, 0.45];
              return <O2Mol key={i} p={mix3(ini, fin, f)} escala={1.3} op={visible(b, 0.52, 1) * (1 - f * 0.6)} giro={b * 5 + i} />;
            })}
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.5]} />
      {fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.09, 1.3, 0.05], t: "Pulmones", a: 0.06, z: 0.5, o: [-60, -110], color: "#f29ba8" },
            { p: [0.11, 0.85, 0.12], t: "Sangre", a: 0.3, z: 0.5, o: [70, 40], color: K.rojo },
          ]}
        />
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-1.0, VASO_Y + 0.3, 0], t: "Sangre", a: 0.52, z: 1, o: [-10, -90], color: K.rojo },
            { p: [0.3, 0.3, 0.3], t: "O₂", a: 0.56, z: 1, o: [60, -40], color: K.cian },
            { p: [0.6, MITO_P[1] - 0.4, 0.4], t: "Mitocondria", a: 0.62, z: 1, o: [40, 110], color: MITO },
          ]}
        />
      )}
      <Dato b={b} a={0.03} z={1} t="O₂" sub={b < 0.5 ? "pulmones → sangre" : "→ fibra → mitocondria"} color={K.cian} y={250} tam={110} />
    </AbsoluteFill>
  );
};

// 2 · Piruvato y acidos grasos -> acetil-CoA ----------------------------------------
const POOL: V3[] = Array.from({ length: 8 }).map((_, j) => [((j % 3) - 1) * 0.5 - 0.1, -0.85 - Math.floor(j / 3) * 0.4, 0.6]);

const Combustibles: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.2, 9.4], l: [0, -0.3, 0], fov: 40 },
      { b: 1, p: [-0.3, 0.1, 8.6], l: [0, -0.35, 0], fov: 40 },
    ],
    b,
  );
  // piruvato (3 C): entra y pierde un CO2 -> acetil + CoA
  const entraP = entre(b, 0.03, 0.2);
  const convP = entre(b, 0.22, 0.34);
  const pirP: V3 = mix3([2.4, 1.2, 0.5], [0.3, 1.1, 0.5], entraP);
  const reune = entre(b, 0.66, 0.86);
  // acido graso: sale de la gota y se corta de 2 en 2 carbonos (beta-oxidacion)
  const entraG = entre(b, 0.3, 0.44);
  const cortes = Math.min(7, Math.floor(entre(b, 0.46, 0.64) * 7.999));
  const resto = 14 - cortes * 2;
  const x0 = mix(-2.9, -1.55, entraG);
  const SEP = 0.12;
  const finCadena = (n: number) => x0 + (n - 1) * SEP;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[10, 26]}>
        <group position={[0, -0.3, -0.5]} rotation={[0.15, 0.25, Math.PI / 2]} scale={1.15}>
          <MitocondriaGrande op={0.9} brillo={0.15 + 0.3 * reune} />
        </group>
        <GotaLipido p={[-2.05, 0.0, 0.2]} r={0.5} />
        {/* piruvato */}
        {convP < 0.5 ? <Cadena n={3} p={[pirP[0] - 0.22, pirP[1], pirP[2]]} color={PIRUVATO} sep={0.22} brillo={0.4} /> : null}
        {convP > 0 ? <Mol p={mix3([pirP[0] + 0.22, pirP[1], 0.5], [1.4, 2.0, 0.6], convP)} color={CO2} r={0.1} op={1 - entre(b, 0.4, 0.5)} /> : null}
        {convP >= 0.5 ? <AcetilCoA p={mix3([pirP[0] - 0.1, pirP[1], 0.5], POOL[7], reune)} escala={1.3} cola={entre(convP, 0.5, 1)} /> : null}
        {/* acido graso largo */}
        {entraG > 0 && resto > 0 ? <Cadena n={resto} p={[x0, 0.0, 0.5]} color={GRASA} sep={SEP} brillo={0.35} /> : null}
        {Array.from({ length: cortes }).map((_, j) => {
          const tj = 0.46 + (j / 7) * 0.18;
          const desde: V3 = [finCadena(14 - j * 2) - 0.06, 0.0, 0.5];
          const espera: V3 = [-0.55 + (j % 4) * 0.42, -0.42 - Math.floor(j / 4) * 0.3, 0.55];
          const p = mix3(mix3(desde, espera, entre(b, tj, tj + 0.06)), POOL[j], reune);
          return <AcetilCoA key={j} p={p} escala={1.3} cola={entre(b, tj, tj + 0.05)} />;
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.0, 2.0, -0.3], t: "Mitocondria", a: 0.0, z: 0.05, o: [40, -80], color: MITO },
          { p: [pirP[0], pirP[1] + 0.12, 0.5], t: "Piruvato (glucosa)", a: 0.06, z: 0.3, o: [-20, -110], color: PIRUVATO },
          { p: [1.0, 1.6, 0.6], t: "CO₂", a: 0.26, z: 0.4, o: [40, -50], color: CO2 },
          { p: [-1.0, 0.05, 0.5], t: "Ácidos grasos", a: 0.34, z: 0.62, o: [-20, -130], color: GRASA },
          { p: POOL[4], t: "Acetil-CoA", a: 0.84, z: 1, o: [60, 130], color: ACETIL },
        ]}
      />
      <Chip b={b} a={0.47} z={0.64} t="β-OXIDACIÓN: TROZOS DE 2 C" x={540} y={1100} color={GRASA} />
      <Dato b={b} a={0.7} z={1} t="Acetil-CoA" sub="un mismo combustible" color={ACETIL} y={250} tam={110} />
    </AbsoluteFill>
  );
};

// 3 · Ciclo de Krebs -------------------------------------------------------------
const PRODUCTOS: { paso: number; tipo: "nadh" | "fadh" | "co2" }[] = [
  { paso: 2, tipo: "nadh" },
  { paso: 2, tipo: "co2" },
  { paso: 3, tipo: "nadh" },
  { paso: 3, tipo: "co2" },
  { paso: 5, tipo: "fadh" },
  { paso: 7, tipo: "nadh" },
];

const R_K = 1.25;
const KC: V3 = [0, -0.35, 0];

const Krebs: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.6, 0.0, 9.6], l: [0, -0.35, 0], fov: 40 },
      { b: 1, p: [-0.5, -0.1, 8.6], l: [0, -0.4, 0], fov: 40 },
    ],
    b,
  );
  const vueltas = lineal(b, 0.12, 1) * 2.2;
  const frac = vueltas % 1;
  const giro = vueltas * Math.PI * 2;
  const paso = Math.floor(frac * 8);
  const libera = b > 0.45;
  const k = (i: number, R = R_K): V3 => {
    const q = posKrebs(i, 0, R);
    return [q[0] + KC[0], q[1] + KC[1], q[2] + KC[2]];
  };
  // el acetil-CoA entra al inicio de cada vuelta
  const entra = b < 0.12 ? entre(b, 0.0, 0.12) : Math.min(1, frac / 0.12);
  const acP = mix3([-1.7, 1.0, 0.4], k(0), entra);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 22]}>
        <group position={[0, -0.3, -4]} scale={2.6} rotation={[0, 0, Math.PI / 2]}>
          <MitocondriaGrande op={0.3} corte={false} />
        </group>
        <group position={KC}>
          <RuedaKrebs giro={giro} resalta={b < 0.12 ? 7 : paso} R={R_K} />
          <FlechasCiclo R={R_K} giro={giro} />
        </group>
        {entra < 1 ? <AcetilCoA p={acP} escala={1.5} cola={1 - entre(entra, 0.7, 1)} /> : null}
        {libera
          ? PRODUCTOS.map((pr, i) => {
              const f = frac - pr.paso / 8;
              if (f < 0 || f > 0.4) return null;
              const t = f / 0.4;
              const base = k(pr.paso);
              const dir: V3 = [base[0] - KC[0], base[1] - KC[1], 0];
              const p: V3 = [base[0] + dir[0] * t * 0.9 + (pr.tipo === "co2" ? 0.2 : 0), base[1] + dir[1] * t * 0.9, 0.3 + t * 0.4];
              return pr.tipo === "co2" ? (
                <Mol key={i} p={p} color={CO2} r={0.11} op={1 - t * 0.6} />
              ) : (
                <Portador key={i} p={p} color={pr.tipo === "nadh" ? NADH : FADH} t={b + i} op={1 - t * 0.3} />
              );
            })
          : null}
        {libera
          ? Array.from({ length: 10 }).map((_, i) => {
              const f = cic(b, 1.4, i / 10);
              const a = rnd(`ek${i}`) * Math.PI * 2;
              const p: V3 = [KC[0] + Math.cos(a) * (R_K + 0.2 + f * 1.4), KC[1] + Math.sin(a) * (R_K + 0.2 + f * 1.4), 0.4];
              return <Mol key={`s${i}`} p={p} color={E} r={0.05} op={visible(b, 0.46, 1) * (1 - f)} brillo={1.5} />;
            })
          : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: acP, t: "Acetil-CoA", a: 0.03, z: 0.4, o: [40, -110], color: ACETIL },
          { p: k(2), t: "NADH (e⁻)", a: 0.5, z: 1, o: [-60, -200], color: NADH },
          { p: [k(5)[0] - 0.4, k(5)[1] - 0.3, 0.4], t: "FADH₂ (e⁻)", a: 0.56, z: 1, o: [30, 170], color: FADH },
          { p: [k(3)[0] + 0.4, k(3)[1] - 0.3, 0.4], t: "CO₂", a: 0.6, z: 1, o: [-30, 170], color: CO2 },
        ]}
      />
      <Dato b={b} a={0.08} z={1} t="Ciclo de Krebs" sub="una rueda de reacciones" color={NADH} y={250} tam={100} />
      <Chip b={b} a={0.66} z={1} t="LIBERA ELECTRONES" x={540} y={1100} color={E} />
    </AbsoluteFill>
  );
};

// 4 · Cadena respiratoria: e- de complejo en complejo; O2 + e- -> H2O -------------
const CX = { I: -1.6, Q: -0.95, III: -0.25, c: 0.45, IV: 1.15 };

const Respiratoria: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-0.4, 2.0, 10.4], l: [-0.3, -0.2, 0], fov: 40 },
      { b: 0.55, p: [0.1, 2.0, 11.2], l: [0.0, -0.25, 0], fov: 40 },
      { b: 1, p: [0.5, 1.6, 10.2], l: [0.4, -0.35, 0], fov: 40 },
    ],
    b,
  );
  const ruta: V3[] = [
    [CX.I - 0.3, -0.75, 0.5],
    [CX.I, 0, 0.5],
    [CX.Q, 0, 0.55],
    [CX.III, 0, 0.5],
    [CX.c, 0.55, 0.45],
    [CX.IV, 0, 0.5],
    [CX.IV + 0.2, -0.7, 0.5],
  ];
  const enRuta = (f: number): V3 => {
    const x = Math.min(ruta.length - 1.001, f * (ruta.length - 1));
    const i = Math.floor(x);
    return mix3(ruta[i], ruta[i + 1], x - i);
  };
  const on = entre(b, 0.05, 0.12);
  const llegaO2 = entre(b, 0.55, 0.72);
  const forma = entre(b, 0.74, 0.84);
  const o2P: V3 = mix3([2.4, -1.7, 0.5], [CX.IV + 0.3, -0.85, 0.55], llegaO2);
  const aguaSale = entre(b, 0.84, 1);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 20]}>
        <Membrana ancho={5.4} prof={1.6} />
        <Complejo p={[CX.I, 0, 0]} color="#ff7a59" escala={[0.42, 0.85, 0.42]} brillo={on * 0.4} />
        <Complejo p={[CX.Q, 0, 0.5]} color="#7cff8a" escala={[0.13, 0.13, 0.13]} />
        <Complejo p={[CX.III, 0, 0]} color="#5ec8ff" escala={[0.4, 0.8, 0.4]} brillo={on * 0.4} />
        <Complejo p={[CX.c, 0.55, 0.3]} color="#ff8fd0" escala={[0.13, 0.13, 0.13]} />
        <Complejo p={[CX.IV, 0, 0]} color="#b48cff" escala={[0.4, 0.8, 0.4]} brillo={on * 0.4 + forma * 0.5} />
        <Portador p={mix3([CX.I - 1.3, -1.4, 0.5], [CX.I - 0.3, -0.8, 0.5], cic(b, 1.5))} color={NADH} t={b} op={on} />
        {on > 0
          ? Array.from({ length: 6 }).map((_, i) => <Mol key={i} p={enRuta(cic(b, 0.9, i / 6))} color={E} r={0.1} brillo={1.6} op={on} />)
          : null}
        {/* H+ bombeados hacia el espacio intermembrana */}
        {on > 0
          ? [CX.I, CX.III, CX.IV].flatMap((x, j) =>
              [0, 1].map((q) => {
                const f = cic(b, 1.1, q / 2 + j * 0.2);
                return <Mol key={`h${j}${q}`} p={[x + (q ? 0.13 : -0.13), mix(-0.6, 1.3, f), 0.35]} color={K.rojo} r={0.055} op={on * (1 - f * 0.5)} />;
              }),
            )
          : null}
        {forma < 1 ? <O2Mol p={o2P} escala={1.4} op={visible(b, 0.55, 1)} giro={b * 4} /> : null}
        {forma > 0
          ? [0, 1].map((i) => (
              <AguaMol key={`w${i}`} p={mix3([CX.IV + 0.3 + i * 0.15, -0.85, 0.55], [CX.IV + 0.6 + i * 0.5, -1.45 - i * 0.2, 0.7], aguaSale)} escala={1.5 * forma} />
            ))
          : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [CX.I, 0.85, 0], t: "Complejo I", a: 0.06, z: 0.55, o: [20, -130], color: "#ff7a59" },
          { p: [CX.III, 0.8, 0], t: "III", a: 0.12, z: 0.55, o: [0, -110], color: "#5ec8ff" },
          { p: [CX.IV, 0.8, 0], t: "IV", a: 0.18, z: 1, o: [30, -90], color: "#b48cff" },
          { p: enRuta(0.42), t: "e⁻", a: 0.2, z: 0.55, o: [30, 90], color: E },
          { p: o2P, t: "O₂", a: 0.58, z: 0.76, o: [60, 50], color: K.cian },
          { p: [CX.IV + 0.6, -1.45, 0.7], t: "H₂O (agua)", a: 0.86, z: 1, o: [-30, 110], color: K.cian },
        ]}
      />
      <Dato b={b} a={0.03} z={1} t="Cadena respiratoria" sub={b < 0.6 ? "los e⁻ pasan de complejo en complejo" : "O₂ + e⁻ → agua"} color={E} y={250} tam={88} />
    </AbsoluteFill>
  );
};

// 5 · ATP sintasa: turbina que fabrica ATP --------------------------------------
const Turbina: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.8, 0.9, 9.6], l: [0, -0.5, 0], fov: 40 },
      { b: 1, p: [-0.8, 0.6, 9.8], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  const S = 1.6;
  const vel = mix(2, 14, entre(b, 0.1, 0.5));
  const giro = b * vel * 2;
  const fabrica = entre(b, 0.2, 0.5);
  const cuenta = Math.round(entre(b, 0.45, 0.72) * 30);
  const nATP = Math.round(4 + 16 * fabrica);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 20]}>
        <group scale={S} position={[0, 0.3, 0]}>
          <Membrana ancho={3.6} prof={1.6} />
          <ATPsintasa p={[0, 0, 0]} giro={giro} brillo={0.2 + 0.3 * fabrica} />
          {Array.from({ length: 8 }).map((_, i) => {
            const f = cic(b, 1.3, i / 8);
            return <Mol key={i} p={[0.25 * Math.cos(i), mix(1.2, -0.2, f), 0.25 * Math.sin(i)]} color={K.rojo} r={0.05} op={visible(b, 0.05, 1) * (1 - f * 0.5)} />;
          })}
        </group>
        {Array.from({ length: nATP }).map((_, i) => {
          const f = cic(b, 0.9, i / nATP);
          const a = rnd(`at${i}`) * Math.PI * 2;
          const d = 0.5 + f * 1.7;
          const p: V3 = [Math.cos(a) * d, 0.3 - 1.15 * S - 0.15 - f * 1.1 + Math.sin(a) * 0.25, Math.sin(a) * 0.4 + 0.6];
          return <MiniATP key={i} p={p} escala={1.15} brillo={0.6} op={visible(b, 0.15, 1) * (1 - f * 0.6)} />;
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.6, 0.3, 0], t: "ATP sintasa", a: 0.05, z: 0.45, o: [40, -110], color: "#b48cff" },
          { p: [0.4, 0.3 + 1.0 * S, 0.4], t: "H⁺ (la energía)", a: 0.1, z: 0.45, o: [-60, -60], color: K.rojo },
          { p: [1.0, 0.3 - 1.4 * S, 0.5], t: "ATP", a: 0.25, z: 0.45, o: [40, 90], color: K.naranja },
        ]}
      />
      {b < 0.75 ? (
        <Dato b={b} a={0.44} z={0.75} t={`${cuenta} ATP`} sub="por cada glucosa" color={K.naranja} y={250} tam={120} />
      ) : (
        <Dato
          b={b}
          a={0.75}
          z={1}
          t={
            <>
              ~30 <span style={{ color: K.suave, fontSize: 70 }}>vs</span> <span style={{ color: GLUCOSA }}>2</span>
            </>
          }
          sub="aeróbico vs glucólisis"
          color={K.naranja}
          y={250}
          tam={120}
        />
      )}
      <Chip b={b} a={0.08} z={0.44} t="GIRA COMO TURBINA" x={540} y={1100} color="#b48cff" />
    </AbsoluteFill>
  );
};

// 6 · Lento pero duradero ---------------------------------------------------------
const DUR: { n: string; t: string; w: number; c: string }[] = [
  { n: "FOSFOCREATINA", t: "~10 s", w: 0.08, c: VERDE },
  { n: "GLUCÓLISIS", t: "~2 min", w: 0.22, c: GLUCOSA },
  { n: "AERÓBICO", t: "horas", w: 1, c: K.naranja },
];

const Duradero: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase = 14 * b + 12 * Math.max(0, b - 0.38) + 6 * Math.max(0, b - 0.62);
  const marcha = mix(mix(0.45, 1.0, entre(b, 0.36, 0.44)), 1.3, entre(b, 0.6, 0.68));
  const partido = b > 0.62;
  const cam = camara(
    [
      { b: 0, p: [3.4, 1.7, 9.8], l: [0, 0.45, 0], fov: 36 },
      { b: 1, p: [-3.0, 1.5, 9.8], l: [0, 0.45, 0], fov: 36 },
    ],
    b,
  );
  const bote = Math.abs(Math.sin(fase * 0.5));
  const actividad = b < 0.4 ? "CAMINAR" : b < 0.64 ? "TROTAR" : "UN PARTIDO";
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Humano fase={fase} marcha={marcha} musculo={0.8} brilla={0.3} colorBrillo={K.naranja} />
        {partido ? (
          <group position={[0.15, 0.11 + bote * 0.25, 0.35]} rotation={[fase, 0, 0]}>
            <Esfera p={[0, 0, 0]} r={0.11} color="#f4f7f2" brillo={0.1} />
            <Esfera p={[0, 0.07, 0.07]} r={0.04} color="#20262a" brillo={0} />
            <Esfera p={[0.07, -0.05, 0.05]} r={0.04} color="#20262a" brillo={0} />
          </group>
        ) : null}
        <Piso color={K.naranja} />
      </Escena3D>
      <Dato b={b} a={0.02} z={1} t="Lento pero duradero" color={K.naranja} y={230} tam={78} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 395, opacity: visible(b, 0.08, 1, 0.08), fontFamily: INTER }}>
        {DUR.map((d, i) => {
          const llena = i < 2 ? entre(b, 0.1 + i * 0.05, 0.2 + i * 0.05) : Math.pow(entre(b, 0.12, 0.85), 2.2);
          return (
            <div key={d.n} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{ width: 250, fontWeight: 900, fontSize: 28, color: d.c, textAlign: "right" }}>{d.n}</div>
              <div style={{ flex: 1, height: 38, borderRadius: 19, background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.18)", overflow: "hidden" }}>
                <div style={{ width: `${d.w * llena * 100}%`, height: "100%", background: d.c, boxShadow: `0 0 20px ${d.c}` }} />
              </div>
              <div style={{ width: 110, fontFamily: ANTON, fontSize: 34, color: K.tinta }}>{d.t}</div>
            </div>
          );
        })}
      </div>
      <Chip b={b} a={0.28} z={1} t="CASI NO SE AGOTA" x={540} y={1100} color={K.naranja} />
      <Chip b={b} a={0.36} z={1} t={actividad} x={540} y={1020} color={K.lima} />
    </AbsoluteFill>
  );
};

// 7 · Los 3 sistemas trabajan juntos; domina uno segun intensidad/duracion -------------
const SIS: { n: string; c: string; x: number; centro: number }[] = [
  { n: "Fosfocreatina", c: VERDE, x: -1.05, centro: 0 },
  { n: "Glucólisis", c: GLUCOSA, x: 0, centro: 0.5 },
  { n: "Aeróbico", c: K.naranja, x: 1.05, centro: 1 },
];

const Juntos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.0, 1.5, 12.3], l: [0, 0.2, 0], fov: 38 },
      { b: 1, p: [-1.0, 1.4, 12.0], l: [0, 0.2, 0], fov: 38 },
    ],
    b,
  );
  const sube = entre(b, 0.04, 0.3);
  const perilla = entre(b, 0.5, 0.95);
  const modo = entre(b, 0.44, 0.52);
  const nivel = (c: number, i: number) => {
    const junto = 0.55 + 0.06 * Math.sin(b * 30 + i * 2);
    const domina = 0.14 + 0.82 * Math.exp(-(((perilla - c) / 0.3) ** 2));
    return sube * mix(junto, domina, modo);
  };
  const dom = perilla < 0.25 ? 0 : perilla < 0.75 ? 1 : 2;
  const etiquetas = ["SPRINT · SEGUNDOS", "1–2 MINUTOS", "TROTE · HORAS"];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {SIS.map((s, i) => {
          const n = nivel(s.centro, i);
          return (
            <group key={s.n}>
              <Columna p={[s.x, 0, 0]} nivel={n} color={s.c} alto={1.6} />
              <group position={[s.x, 2.0, 0]} rotation={[0, b * 3 + i, 0]}>
                {i === 0 ? <Creatina p={[0, 0, 0]} fosfato={1} escala={2.6} /> : null}
                {i === 1 ? <Cadena n={6} anillo p={[0, 0, 0]} color={GLUCOSA} sep={0.17} brillo={0.4} /> : null}
                {i === 2 ? <MitoMini p={[0, 0, 0]} escala={0.9} /> : null}
              </group>
            </group>
          );
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={SIS.map((s, i) => ({ p: [s.x, 0.02, 0.3] as V3, t: s.n, a: 0.04 + i * 0.03, z: 1, o: [i === 0 ? -10 : i === 2 ? 10 : 0, 34] as [number, number], color: s.c }))} />
      <Dato b={b} a={0.06} z={1} t="Trabajan juntos" sub={modo < 0.5 ? "desde el primer segundo" : `domina: ${SIS[dom].n.toLowerCase()}`} color={K.lima} y={250} tam={96} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1100, opacity: visible(b, 0.46, 1, 0.06), fontFamily: INTER, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ fontWeight: 900, fontSize: 26, color: VERDE, width: 150, textAlign: "right", lineHeight: 1.1 }}>MÁXIMA<br />INTENSIDAD</div>
        <div style={{ flex: 1, position: "relative", height: 30, borderRadius: 15, background: `linear-gradient(90deg, ${VERDE}, ${GLUCOSA}, ${K.naranja})` }}>
          <div style={{ position: "absolute", top: -16, left: `calc(${perilla * 100}% - 31px)`, width: 62, height: 62, borderRadius: 31, background: K.tinta, border: `6px solid ${SIS[dom].c}`, boxShadow: "0 6px 20px rgba(0,0,0,0.5)" }} />
        </div>
        <div style={{ fontWeight: 900, fontSize: 26, color: K.naranja, width: 150, lineHeight: 1.1 }}>MÁS<br />DURACIÓN</div>
      </div>
      <Chip b={b} a={0.5} z={1} t={etiquetas[dom]} x={540} y={470} color={SIS[dom].c} />
    </AbsoluteFill>
  );
};

// 8 · El plato alimenta a la mitocondria -----------------------------------------
const MITO_PL: V3 = [0, 1.85, 0];

const PlatoEsc: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 3.3, 8.6], l: [0, 0.55, 0], fov: 40 },
      { b: 1, p: [0.9, 3.0, 8.2], l: [0, 0.6, 0], fov: 40 },
    ],
    b,
  );
  const fuentes: { p: V3; c: string; a: number }[] = [
    { p: [-0.6, 0.2, 0.35], c: "#5b3fc4", a: 0.12 },
    { p: [0.6, 0.2, 0.35], c: GRASA, a: 0.36 },
    { p: [-0.55, 0.2, -0.4], c: K.naranja, a: 0.58 },
    { p: [0.5, 0.25, -0.4], c: K.rojo, a: 0.78 },
  ];
  const glucogeno = entre(b, 0.18, 0.3);
  const funciona = entre(b, 0.86, 0.96);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Plato p={[0, 0, 0]} escala={2.2} />
        <Frijoles p={[-0.6, 0.04, 0.35]} escala={0.85} />
        <Aguacate p={[0.6, 0.04, 0.35]} escala={1.5} giro={0.4} />
        <Hoja p={[-0.7, 0.07, -0.35]} giro={0.6} escala={1.2} />
        <Hoja p={[-0.4, 0.08, -0.5]} giro={-0.4} escala={1.0} />
        <Capsula p={[-0.45, 0.1, -0.25]} escala={1.6} rot={[Math.PI / 2, 0, 0.9]} />
        <Capsula p={[-0.7, 0.1, -0.15]} escala={1.6} rot={[Math.PI / 2, 0, -0.5]} color={K.amarillo} />
        <Hierro p={[0.5, 0.17, -0.4]} r={0.15} brillo={0.15 + 0.5 * visible(b, 0.78, 1)} />
        <Glucogeno p={[-1.0, 0.8, 0.4]} escala={1.6 * glucogeno} op={glucogeno} />
        <GotaLipido p={[1.0, 0.8, 0.4]} r={0.18 * entre(b, 0.4, 0.5)} />
        <group position={MITO_PL} scale={0.42} rotation={[0.2, b * 0.8, 0]}>
          <MitocondriaGrande brillo={0.05 + 0.5 * funciona} />
        </group>
        {fuentes.flatMap((f, j) =>
          Array.from({ length: 4 }).map((_, i) => {
            const k = cic(b, 1.5, i / 4 + j * 0.13);
            return <Mol key={`${j}-${i}`} p={mix3(f.p, [MITO_PL[0] + (j - 1.5) * 0.15, MITO_PL[1] - 0.2, 0.2], k)} color={f.c} r={0.06} op={visible(b, f.a + 0.04, 1) * (1 - k * 0.5)} />;
          }),
        )}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.0, 0.9, 0.4], t: "Glucógeno", a: 0.2, z: 1, o: [-10, -90], color: "#8e75ff" },
          { p: [0.5, 0.32, -0.4], t: "Fe", a: 0.8, z: 1, o: [60, -60], color: K.rojo },
          { p: [MITO_PL[0] + 0.6, MITO_PL[1] + 0.2, 0], t: "Mitocondria", a: 0.88, z: 1, o: [40, -70], color: MITO },
        ]}
      />
      <Dato b={b} a={0.02} z={1} t="Todo empieza en tu plato" color={K.lima} y={250} tam={76} />
      <Chip b={b} a={0.12} z={1} t="CARBOHIDRATOS" x={290} y={1090} color="#8e75ff" />
      <Chip b={b} a={0.38} z={1} t="GRASAS" x={790} y={1090} color={GRASA} />
      <Chip b={b} a={0.6} z={1} t="COMPLEJO B" x={290} y={1165} color={K.naranja} />
      <Chip b={b} a={0.78} z={1} t="HIERRO" x={790} y={1165} color={K.rojo} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaProximos
    textos={textos}
    items={[{ t: "Fibras rápidas y lentas", sub: "por qué no todas son iguales", color: K.cian, a: 0.1 }]}
  />
);

const T = [
  "En la parte uno viste los sistemas rápidos. Ahora el más grande: el **sistema aeróbico**, que funciona con **oxígeno** dentro de las mitocondrias.",
  "El oxígeno entra por tus pulmones, viaja en la sangre y llega a la fibra hasta las **mitocondrias**, las fábricas de energía.",
  "Ahí, el piruvato de la glucosa y los **ácidos grasos** de la grasa se convierten en un mismo combustible: el **acetil coenzima A**.",
  "Ese combustible entra al **ciclo de Krebs**, una rueda de reacciones que libera electrones cargados de energía.",
  "Los electrones pasan por la **cadena respiratoria**. Al final, el oxígeno los recibe y se forma agua.",
  "Con esa energía, una pequeña turbina, la **ATP sintasa**, gira y fabrica ATP en grande: unos **treinta ATP** por cada glucosa, contra solo dos de la glucólisis.",
  "Es lento para arrancar, pero casi **no se agota**: es el sistema de caminar, trotar o jugar un partido completo.",
  "Recuerda: los **tres sistemas trabajan juntos** desde el primer segundo. Lo que cambia es cuál **domina**, según la intensidad y la duración.",
  "Y todos dependen de tu plato: **carbohidratos** para el glucógeno, **grasas** como combustible, y vitaminas del **complejo B** y **hierro** para que la mitocondria funcione.",
  "En el próximo video: por qué no todas tus fibras son iguales, las **rápidas** y las **lentas**. ¿Qué tema quieres después? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Oxigeno, Combustibles, Krebs, Respiratoria, Turbina, Duradero, Juntos, PlatoEsc, Final];

export const ENERGIA2: ShortDef = {
  id: "Short-Energia2",
  titulo: "¿De dónde sacan energía tus músculos? Parte 2: el sistema aeróbico",
  planos: ESCENAS.map((Escena, i) => ({ id: `energia2-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
