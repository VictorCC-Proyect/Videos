// Short: ¿Qué pasa dentro del músculo cuando se contrae? (Parte 2)
// Del atleta al sarcomero: actina, miosina, tropomiosina/troponina (candado), calcio,
// ciclo de puentes cruzados (union, golpe de fuerza, ATP), deslizamiento, relajacion
// con bombas SERCA y lo que necesita el musculo de la dieta.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cam, camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { difusion, hexPack, Polvo, rnd } from "../fisio/modelos/comun";
import { Fosfato, Glucogeno } from "../fisio/modelos/energia";
import { ACT, CabezaMiosina, FilamentoFino, posActina, posTroponina, SARC, Sarcomero } from "../fisio/modelos/musculo";
import { MiniATP } from "../fisio/energia/e1";
import { C } from "../fisio/tema";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, deEje, Destello, K, ShortDef } from "./marco";
import { Atleta, Frijoles, Pechuga, Piso, Plato } from "./modelos";
import { BOMBAS, CISTERNAS, Espinaca, Granos, IonCa, IonMg, R_RETICULO, Reticulo, Serca } from "./modelos-magnesio";
import { Candado, Chispa, IonColor } from "./modelos-contraccion";
import { camViaje, cortesViaje, tramoViaje, Viaje } from "./viaje";

const SITIO = "#ff3d6e";
const NA = "#b388ff";
const POTASIO = K.rosa;

// ---- Sarcomero de pie --------------------------------------------------------------

/** Escala del sarcomero de pie en las tomas generales. */
const S = 0.85;
/** Punto local del sarcomero (eje X) -> mundo (de pie, escalado). */
const enSarc = (p: V3, s = S): V3 => {
  const q = deEje(p);
  return [q[0] * s, q[1] * s, q[2] * s];
};
/** Filamento grueso mas al frente (para senalar sus cabezas). */
const FRENTE = hexPack(0.75, SARC.sep).reduce((m, q) => (q[1] > m[1] ? q : m), [0, -9] as [number, number]);

const SarcomeroDePie: React.FC<{ L: number; s?: number; radio?: number; finos?: number; gruesos?: number }> = ({ L, s = S, radio, finos = 0, gruesos = 0 }) => (
  <group scale={s}>
    <group rotation={[0, 0, Math.PI / 2]}>
      <Sarcomero L={L} radio={radio} resaltaFinos={finos} resaltaGruesos={gruesos} />
    </group>
  </group>
);

/** Camara general del sarcomero de pie. */
const camSarc = (b: number, a: number, z: number): Cam =>
  camara(
    [
      { b: a, p: [3.0, 1.3, 12.6], l: [0, -0.7, 0], fov: 40 },
      { b: z, p: [-2.4, 0.9, 12.0], l: [0, -0.7, 0], fov: 40 },
    ],
    b,
  );

// ---- Filamento fino de cerca (de pie) -----------------------------------------------

const N_FINO = 35;
const CX = (N_FINO * ACT.paso) / 2;
/** Punto local del filamento fino -> mundo (de pie y centrado). */
const enFino = (p: V3): V3 => deEje([p[0] - CX, p[1], p[2]]);
/** Punto sobre la tropomiosina (para etiquetas). */
const posTm = (x: number, s: number, bloqueo: number): V3 => {
  const a = (x / ACT.giro) * Math.PI * 2 + s * Math.PI + Math.PI / 2 + 0.6 * (1 - bloqueo);
  return [x, Math.cos(a) * ACT.radio * 1.55, Math.sin(a) * ACT.radio * 1.55];
};
/** Complejos de troponina que caen dentro del encuadre. */
const TN = [1, 2, 3].flatMap((k) => [0, 1].map((s) => ({ k, s })));
/** Donde se pone el candado (frente a una troponina). */
const P_CANDADO: V3 = [0.2, -0.05, 0.25];

const camFino = (b: number, a: number, z: number): Cam => {
  const ang = mix(0.55, -0.35, lineal(b, a, z));
  return { p: [Math.sin(ang) * 3.1, -0.15, Math.cos(ang) * 3.1], l: [0, -0.32, 0], fov: 40 };
};

const FinoCerca: React.FC<{
  b: number;
  bloqueo: number;
  sitios: number;
  tm?: number;
  tn?: number;
  ca?: number;
  candado?: number; // opacidad/escala del candado
  abierto?: number;
  iones?: V3[]; // iones de calcio libres (coordenadas del filamento)
}> = ({ b, bloqueo, sitios, tm = 1, tn = 1, ca = 0, candado = 0, abierto = 0, iones = [] }) => (
  <>
    <group rotation={[0, 0, Math.PI / 2]}>
      <group position={[-CX, 0, 0]}>
        <FilamentoFino n={N_FINO} bloqueo={bloqueo} sitios={sitios} tropomiosina={tm} troponina={tn} caUnido={ca} />
        {iones.map((p, i) => (
          <IonCa key={i} p={p} r={0.028} />
        ))}
      </group>
    </group>
    {candado > 0.01 ? <Candado p={P_CANDADO} escala={0.3 * candado} abierto={abierto} color={C.tropomiosina} brillo={0.3 + 0.3 * abierto} giro={-0.3} /> : null}
    <Polvo b={b} radio={3} />
  </>
);

// ---- Ciclo de puentes cruzados (horizontal, como en el capitulo 1) ---------------------

const CAB_X = 1.3;
const punta = (ang: number, separa: number): V3 => [CAB_X - Math.sin(ang) * 0.82, 0.15 - separa * 0.18 + Math.cos(ang) * 0.82, 0.12];
const ARMADA = 0.45;

const camCiclo = (b: number): Cam =>
  camara(
    [
      { b: 0, p: [1.85, 0.95, 5.6], l: [1.3, 0.58, 0], fov: 40 },
      { b: 1, p: [0.8, 0.8, 5.3], l: [1.3, 0.58, 0], fov: 40 },
    ],
    b,
  );

const Puente: React.FC<{
  b: number;
  ang: number;
  separa: number;
  desliza: number;
  energia?: number;
  adp?: V3 | null;
  pi?: V3 | null;
  piOp?: number;
  atp?: V3 | null;
  chispa?: number;
}> = ({ b, ang, separa, desliza, energia = 0, adp, pi, piOp = 1, atp, chispa = 0 }) => {
  const p = punta(ang, separa);
  return (
    <>
      <group position={[-0.9, 1.05, 0]} scale={1.25}>
        <FilamentoFino n={34} desliza={desliza} bloqueo={0} sitios={0.85} troponina={0.5} tropomiosina={0.55} />
      </group>
      <mesh position={[CAB_X, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 6, 16]} />
        <meshStandardMaterial color={C.miosina} emissive={C.miosina} emissiveIntensity={0.15} />
      </mesh>
      {/* otras cabezas del filamento grueso, en segundo plano */}
      {[-0.5, 0.4, 2.2, 3.1].map((x, i) => (
        <group key={i} position={[x, 0.0, -0.35]} scale={0.8}>
          <CabezaMiosina angulo={i % 2 ? ARMADA : -0.3} estira={0.9} />
        </group>
      ))}
      <group position={[CAB_X, 0.15 - separa * 0.18, 0.12]}>
        <CabezaMiosina angulo={ang} estira={0.95} />
      </group>
      {energia > 0 ? (
        <mesh position={p}>
          <sphereGeometry args={[0.3, 20, 14]} />
          <meshBasicMaterial color={K.amarillo} transparent opacity={0.18 * energia} depthWrite={false} />
        </mesh>
      ) : null}
      {adp ? <MiniATP p={adp} n={2} escala={0.6} brillo={0.5} /> : null}
      {pi && piOp > 0.02 ? <Fosfato p={pi} escala={0.32} brillo={0.5} op={piOp} /> : null}
      {atp ? <MiniATP p={atp} n={3} escala={0.6} brillo={0.7} /> : null}
      <Chispa p={p} t={chispa} r={0.3} />
      <Polvo b={b} radio={3} />
    </>
  );
};
const enADP = (p: V3): V3 => [p[0] - 0.02, p[1] - 0.2, 0.3];
const enPi = (p: V3): V3 => [p[0] + 0.2, p[1] - 0.08, 0.3];

// 0 · Gancho: del atleta a la fibra, llega el calcio; el sarcomero --------------------
const CA_G = Array.from({ length: 18 }).map((_, i) => ({
  ini: [(rnd(`gi${i}`) - 0.5) * 6, 3.5 + rnd(`gj${i}`) * 1.5, 0.8 + rnd(`gk${i}`)] as V3,
  fin: [(rnd(`gx${i}`) - 0.5) * 3.6, -3.2 + rnd(`gy${i}`) * 4.2, 0.8 + rnd(`gz${i}`) * 1.2] as V3,
}));
const CA_SARC: V3[] = Array.from({ length: 22 }).map((_, i) => {
  const a = rnd(`sa${i}`) * Math.PI * 2;
  const r = 0.9 + rnd(`sr${i}`) * 0.6;
  return [Math.cos(a) * r, (rnd(`sy${i}`) - 0.5) * 3.6, Math.sin(a) * r];
});

const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.5);
  const sarc = b >= 0.56;
  const cam = sarc ? camSarc(b, 0.56, 1) : camViaje(t);
  const llega = entre(b, 0.36, 0.54);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={!sarc && t > 0.72 ? [10, 34] : sarc ? [10, 24] : undefined}>
        {!sarc ? (
          <>
            <Viaje t={t} b={b} ej="curl" k={Math.sin(((b * 3) % 1) * Math.PI)} colorBrillo={K.cian} interior={{ pcr: 0, atp: 5, brillo: 0.3 }} />
            {tramoViaje(t) === 3 ? CA_G.map((c, i) => <IonCa key={i} p={difusion(c.ini, c.fin, llega, `cg${i}`, 0.3)} r={0.09} />) : null}
          </>
        ) : (
          <>
            <SarcomeroDePie L={SARC.reposo} />
            {CA_SARC.map((p, i) => (
              <IonCa key={i} p={[p[0], p[1] + Math.sin(b * 6 + i) * 0.06, p[2]]} r={0.07} />
            ))}
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[...cortesViaje(0, 0.5), 0.56]} />
      <Chip b={b} a={0} z={0.54} t="PARTE 2" x={540} y={330} color={K.lima} />
      {tramoViaje(t) === 3 && !sarc ? <Chip b={b} a={0.4} z={0.54} t="Ca²⁺ LIBRE" x={540} y={1100} color={K.cian} /> : null}
      <Dato b={b} a={0.6} z={1} t="Sarcómero" sub="la unidad que se contrae" color={K.lima} y={270} tam={110} />
    </AbsoluteFill>
  );
};

// 1 · Actina (finos) y miosina (gruesos) con cabezas -------------------------------------
const Partes: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const L = SARC.reposo;
  const cab = enSarc([0.95, FRENTE[0], FRENTE[1] + 0.07]);
  const cam = camara(
    [
      { b: 0, p: [3.0, 1.3, 12.6], l: [0, -0.7, 0], fov: 40 },
      { b: 0.68, p: [-1.8, 0.9, 11.4], l: [0, -0.6, 0], fov: 40 },
      { b: 0.86, p: [cab[0] + 1.8, cab[1] + 0.3, cab[2] + 7.2], l: [cab[0] * 0.5, cab[1] - 0.9, 0], fov: 40 },
      { b: 1, p: [cab[0] + 1.4, cab[1] + 0.2, cab[2] + 6.6], l: [cab[0] * 0.5, cab[1] - 0.9, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 24]}>
        <SarcomeroDePie L={L} finos={visible(b, 0.16, 0.52, 0.06)} gruesos={visible(b, 0.48, 0.9, 0.06)} />
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: enSarc([L / 2, 0, 0.93]), t: "Disco Z", a: 0.04, z: 0.66, o: [70, -40], color: "#c8d6ff" },
          { p: enSarc([-L / 2, 0, 0.93]), t: "Disco Z", a: 0.06, z: 0.66, o: [70, 40], color: "#c8d6ff" },
          { p: enSarc([1.5, -0.1, 0.72]), t: "Actina (fino)", a: 0.18, z: 0.66, o: [-90, -60], color: C.actina },
          { p: enSarc([-0.3, 0.1, 0.72]), t: "Miosina (grueso)", a: 0.48, z: 0.66, o: [90, 40], color: C.cabeza },
          { p: cab, t: "Cabezas de miosina", a: 0.86, z: 1.1, o: [-60, 120], color: C.cabeza },
        ]}
      />
      <Chip b={b} a={0.18} z={1} t="ACTINA · FINO" x={290} y={1100} color={C.actina} />
      <Chip b={b} a={0.48} z={1} t="MIOSINA · GRUESO" x={790} y={1100} color={C.cabeza} />
      <Dato b={b} a={0.02} z={1} t="2 filamentos" sub="finos y gruesos" color={K.lima} y={270} tam={100} />
    </AbsoluteFill>
  );
};

// 2 · Tropomiosina = candado, sujeta por la troponina ---------------------------------
const Reposo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camFino(b, 0, 1);
  const tm = entre(b, 0.24, 0.42);
  const sitios = entre(b, 0.02, 0.1) * (1 - tm);
  const tn = entre(b, 0.7, 0.82);
  const candado = entre(b, 0.5, 0.6);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <FinoCerca b={b} bloqueo={1} sitios={sitios} tm={Math.max(0.02, tm)} tn={tn} candado={candado} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: enFino(posActina(14, 0)), t: "Actina", a: 0.0, z: 1, o: [-110, 40], color: C.actina },
          { p: enFino(posActina(19, 1)), t: "Sitios de unión", a: 0.06, z: 0.36, o: [-110, -60], color: SITIO },
          { p: enFino(posTm(1.9, 0, 1)), t: "Tropomiosina", a: 0.3, z: 1, o: [100, -90], color: C.tropomiosina },
          { p: enFino(posTroponina(1, 1, 1)), t: "Troponina", a: 0.74, z: 1, o: [-100, -60], color: C.troponina },
        ]}
      />
      <Chip b={b} a={0.5} z={1} t="CANDADO CERRADO" x={540} y={1100} color={C.tropomiosina} />
      <Dato b={b} a={0.02} z={1} t="En reposo" sub="sitios de unión tapados" color={C.tropomiosina} y={270} tam={100} />
    </AbsoluteFill>
  );
};

// 3 · El calcio se une a la troponina y se abren los sitios ---------------------------
const Calcio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camFino(b, 0, 1);
  const bloqueo = 1 - entre(b, 0.4, 0.62);
  const ca = entre(b, 0.3, 0.4);
  const iones = TN.map(({ k, s }, i) => {
    const fin = posTroponina(k, s, bloqueo);
    const tt = entre(b, 0.06 + i * 0.03, 0.3 + i * 0.015);
    if (tt >= 0.99) return null;
    const ini: V3 = [fin[0] + (rnd(`ci${i}`) - 0.5) * 0.6, fin[1] - 0.6 - rnd(`cj${i}`) * 0.4, fin[2] + 0.6];
    return difusion(ini, fin, tt, `cc${i}`, 0.08);
  });
  const libres = iones.filter((x): x is V3 => !!x);
  const sitios = (1 - bloqueo) * (0.75 + 0.25 * Math.sin(b * 40));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <FinoCerca b={b} bloqueo={bloqueo} sitios={sitios} ca={ca} candado={1} abierto={entre(b, 0.42, 0.6)} iones={libres} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: enFino(iones[2] ?? posTroponina(2, 0, bloqueo)), t: "Ca²⁺", a: 0.08, z: 0.3, o: [-100, -50], color: K.cian },
          { p: enFino(posTroponina(2, 0, bloqueo)), t: "Ca²⁺ + troponina", a: 0.32, z: 0.62, o: [-100, -60], color: C.troponina },
          { p: enFino(posTm(1.9, 0, bloqueo)), t: "Tropomiosina se mueve", a: 0.44, z: 0.7, o: [90, -90], color: C.tropomiosina },
          { p: enFino(posActina(16, 1)), t: "Sitios libres", a: 0.62, z: 1, o: [90, 60], color: SITIO },
        ]}
      />
      <Chip b={b} a={0.44} z={1} t="CANDADO ABIERTO" x={540} y={1100} color={C.tropomiosina} />
      <Dato b={b} a={0.02} z={0.58} t="Ca²⁺" sub="se une a la troponina" color={K.cian} y={270} tam={110} />
      <Dato b={b} a={0.6} z={1} t="Sitios libres" sub="la actina queda expuesta" color={SITIO} y={270} tam={100} />
    </AbsoluteFill>
  );
};

// 4 · Cabeza armada (ADP + Pi) se une: puente cruzado -----------------------------------
const PuenteCruzado: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camCiclo(b);
  const separa = 1 - entre(b, 0.55, 0.72);
  const p = punta(ARMADA, separa);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Puente b={b} ang={ARMADA} separa={separa} desliza={0} energia={0.6 + 0.4 * Math.sin(b * 20)} adp={enADP(p)} pi={enPi(p)} chispa={lineal(b, 0.66, 0.8)} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.4, 1.12, 0.1], t: "Actina", a: 0.0, z: 1, o: [-60, -90], color: C.actina },
          { p: [1.3, 0.25, 0.2], t: "Cabeza de miosina", a: 0.05, z: 1, o: [90, 90], color: C.cabeza },
          { p: enPi(p), t: "ADP + Pi: armada", a: 0.24, z: 0.62, o: [90, -40], color: K.naranja },
          { p: [p[0], p[1] + 0.12, p[2]], t: "Puente cruzado", a: 0.72, z: 1, o: [80, -100], color: K.lima },
        ]}
      />
      <Dato b={b} a={0.02} z={0.66} t="Cargada" sub="la cabeza guarda energía" color={K.amarillo} y={270} tam={104} />
      <Dato b={b} a={0.7} z={1} t="Puente cruzado" sub="miosina + actina" color={K.lima} y={270} tam={100} />
    </AbsoluteFill>
  );
};

// 5 · Sale el fosfato: golpe de fuerza -------------------------------------------------
const GolpeFuerza: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camCiclo(b);
  const golpe = entre(b, 0.3, 0.55);
  const ang = mix(ARMADA, -ARMADA, golpe);
  const p = punta(ang, 0);
  const pi0 = enPi(punta(ARMADA, 0));
  const piSale = entre(b, 0.06, 0.32);
  const pi = mix3(pi0, [pi0[0] + 0.8, pi0[1] - 0.9, 0.8], piSale);
  const adpSale = entre(b, 0.78, 0.96);
  const adp = mix3(enADP(p), [p[0] - 0.7, p[1] - 0.9, 0.8], adpSale);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Puente b={b} ang={ang} separa={0} desliza={golpe * 0.33} energia={(1 - golpe) * 0.8} adp={adpSale < 1 ? adp : null} pi={pi} piOp={1 - entre(b, 0.3, 0.42)} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: pi, t: "Sale el fosfato (Pi)", a: 0.05, z: 0.38, o: [60, 70], color: K.naranja },
          { p: [p[0], p[1] - 0.25, 0.2], t: "La cabeza gira", a: 0.32, z: 0.7, o: [-80, 100], color: C.cabeza },
          { p: [2.3, 1.12, 0.1], t: "Hacia el centro →", a: 0.5, z: 1, o: [-60, -100], color: C.actina },
        ]}
      />
      <Chip b={b} a={0.7} z={1} t="COMO UN REMO" x={540} y={1100} color={C.cabeza} />
      <Dato b={b} a={0.3} z={1} t="Golpe de fuerza" sub="jala la actina" color={K.naranja} y={270} tam={100} />
    </AbsoluteFill>
  );
};

// 6 · Llega ATP: se suelta, rompe el ATP y se rearma -----------------------------------
const Rearma: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camCiclo(b);
  const separa = entre(b, 0.3, 0.45);
  const ang = mix(-ARMADA, ARMADA, entre(b, 0.64, 0.86));
  const p = punta(ang, separa);
  const p0 = punta(-ARMADA, 0);
  const llega = entre(b, 0.04, 0.26);
  const atp = mix3([p0[0] + 0.9, p0[1] - 0.9, 0.7], [p[0] + 0.05, p[1] - 0.2, 0.3], llega);
  const roto = b >= 0.56;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Puente
          b={b}
          ang={ang}
          separa={separa}
          desliza={0.33}
          energia={entre(b, 0.6, 0.9)}
          atp={roto ? null : atp}
          adp={roto ? enADP(p) : null}
          pi={roto ? enPi(p) : null}
          chispa={lineal(b, 0.54, 0.7)}
        />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: atp, t: "ATP nuevo", a: 0.04, z: 0.55, o: [70, 60], color: K.naranja },
          { p: [p[0], p[1] + 0.1, p[2]], t: "Se suelta", a: 0.34, z: 0.55, o: [-90, -90], color: C.cabeza },
          { p: enPi(p), t: "ADP + Pi", a: 0.58, z: 1, o: [80, 60], color: K.naranja },
        ]}
      />
      <Chip b={b} a={0.3} z={1} t="ATP → SE SUELTA" x={290} y={1100} color={K.naranja} />
      <Chip b={b} a={0.66} z={1} t="SE REARMA" x={810} y={1100} color={K.lima} />
      <Dato b={b} a={0.02} z={0.52} t="ATP" sub="la llave para soltarse" color={K.naranja} y={270} tam={120} />
      <Dato b={b} a={0.54} z={1} t="ATP → ADP + Pi" sub="energía para el siguiente jalón" color={K.amarillo} y={270} tam={96} />
    </AbsoluteFill>
  );
};

// 7 · Millones de cabezas: los filamentos se deslizan --------------------------------
const N_CAB = 7;
const Desliza: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const toma = b < 0.32 ? 0 : b < 0.72 ? 1 : 2;
  const largo = 30 * 0.11;
  const ciclos = lineal(b, 0, 0.32) * 4;
  const contrae = entre(b, 0.38, 0.66);
  const L = mix(SARC.reposo, SARC.contraido, contrae);
  const cam: Cam =
    toma === 0
      ? camara(
          [
            { b: 0, p: [largo / 2 + 0.4, 0.2, 5.4], l: [largo / 2, -0.55, 0], fov: 40 },
            { b: 0.32, p: [largo / 2 - 0.3, 0.3, 5.0], l: [largo / 2, -0.55, 0], fov: 40 },
          ],
          b,
        )
      : toma === 1
        ? camSarc(b, 0.32, 0.72)
        : camara(
            [
              { b: 0.72, p: [2.4, 1.4, 5.6], l: [0, 0.72, 0], fov: 36 },
              { b: 1, p: [1.2, 1.3, 5.2], l: [0, 0.75, 0], fov: 36 },
            ],
            b,
          );
  const yG = -0.95;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={toma === 2 ? undefined : [8, 24]}>
        {toma === 0 ? (
          <>
            <FilamentoFino n={36} desliza={-0.3 + ciclos * 0.11} bloqueo={0} sitios={0.7} troponina={0.5} tropomiosina={0.5} />
            <mesh position={[largo / 2, yG, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, largo + 2, 16]} />
              <meshStandardMaterial color={C.miosina} emissive={C.miosina} emissiveIntensity={0.15} />
            </mesh>
            {Array.from({ length: N_CAB }).map((_, i) => {
              const fase = (ciclos + i * 0.37) % 1;
              const ang = fase < 0.55 ? mix(0.5, -0.5, entre(fase, 0.1, 0.55)) : mix(-0.5, 0.5, entre(fase, 0.65, 0.95));
              return (
                <group key={i} position={[0.35 + i * 0.42, yG + 0.06, 0.04]} scale={0.95}>
                  <CabezaMiosina angulo={ang} estira={0.82 + (fase < 0.6 ? 0.08 : 0)} />
                </group>
              );
            })}
            <Polvo b={b} radio={4} />
          </>
        ) : toma === 1 ? (
          <>
            <SarcomeroDePie L={L} finos={0.5} />
            <Polvo b={b} radio={5} />
          </>
        ) : (
          <>
            <Atleta ej="curl" k={entre(b, 0.74, 0.9)} brilla={entre(b, 0.76, 0.9)} colorBrillo={K.cian} />
            <Piso color={K.cian} />
          </>
        )}
      </Escena3D>
      {toma === 1 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: enSarc([L / 2, 0, 0.93]), t: "Disco Z ↓", a: 0.36, z: 0.72, o: [80, -40], color: "#c8d6ff" },
            { p: enSarc([-L / 2, 0, 0.93]), t: "Disco Z ↑", a: 0.38, z: 0.72, o: [80, 40], color: "#c8d6ff" },
          ]}
        />
      ) : null}
      {toma === 0 ? (
        <Etiquetas cam={cam} b={b} items={[{ p: [largo / 2 + 0.4, 0.1, 0.1], t: "La actina se desliza →", a: 0.06, z: 0.32, o: [-80, -110], color: C.actina }]} />
      ) : null}
      <Destello b={b} en={[0.32, 0.72]} />
      <Chip b={b} a={0.03} z={0.31} t="MILLONES DE CABEZAS" x={540} y={1100} color={C.cabeza} />
      <Chip b={b} a={0.42} z={0.71} t="EL SARCÓMERO SE ACORTA" x={540} y={1100} color={K.cian} />
      <Chip b={b} a={0.78} z={1} t="¡TU MÚSCULO SE CONTRAE!" x={540} y={1100} color={K.lima} />
      <Dato b={b} a={0.33} z={1} t="Filamentos deslizantes" color={K.cian} y={270} tam={78} />
    </AbsoluteFill>
  );
};

// 8 · Relajacion: SERCA regresa el calcio; el candado se cierra -------------------------
const CA_R = Array.from({ length: 16 }).map((_, i) => {
  const libre: V3 = [(rnd(`rx${i}`) - 0.5) * 1.1, (rnd(`ry${i}`) - 0.5) * 3.2, 0.2 + rnd(`rz${i}`) * 0.5];
  const bomba = BOMBAS[i % BOMBAS.length];
  const a = Math.PI / 2 + (rnd(`ra${i}`) - 0.5) * 1.6;
  const y = CISTERNAS[i % 2];
  return { libre, bomba, casa: [Math.cos(a) * R_RETICULO, y, Math.sin(a) * R_RETICULO] as V3, d: rnd(`rd${i}`) };
});

const Relaja: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cerca = b >= 0.66;
  const regresa = entre(b, 0.08, 0.55);
  const alarga = entre(b, 0.36, 0.64);
  const L = mix(SARC.contraido, SARC.reposo, alarga);
  const camR = camara(
    [
      { b: 0, p: [2.6, 2.2, 13.0], l: [0, -0.9, 0], fov: 40 },
      { b: 0.66, p: [-1.2, 1.8, 12.4], l: [0, -0.9, 0], fov: 40 },
    ],
    b,
  );
  const cam = cerca ? camFino(b, 0.66, 1) : camR;
  const ca = CA_R.map((c) => {
    const r = Math.min(1, Math.max(0, regresa * 1.4 - c.d * 0.4));
    return r < 0.5 ? mix3(c.libre, c.bomba, r * 2) : mix3(c.bomba, c.casa, (r - 0.5) * 2);
  });
  // de cerca: el calcio se va de la troponina y la tropomiosina vuelve a tapar
  const suelta = entre(b, 0.68, 0.8);
  const bloqueo = entre(b, 0.76, 0.92);
  const ionesFuera = TN.map(({ k, s }, i) => {
    const p = posTroponina(k, s, bloqueo);
    return difusion(p, [p[0] + 0.3, p[1] - 1.0, p[2] + 0.6], suelta, `cr${i}`, 0.08);
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={cerca ? undefined : [10, 26]}>
        {!cerca ? (
          <>
            <group rotation={[0, 0, Math.PI / 2]}>
              <Sarcomero L={L} radio={0.62} />
            </group>
            <Reticulo brillo={regresa * 0.5} op={0.45} />
            {BOMBAS.map((p, i) => (
              <Serca key={i} p={p} activa={visible(b, 0.05, 0.62, 0.05) * (0.6 + 0.4 * Math.sin(b * 40 + i))} />
            ))}
            {ca.map((p, i) => (
              <IonCa key={i} p={p} />
            ))}
            <Polvo b={b} radio={5} />
          </>
        ) : (
          <FinoCerca
            b={b}
            bloqueo={bloqueo}
            sitios={(1 - bloqueo) * 0.8}
            ca={1 - suelta}
            candado={1}
            abierto={1 - entre(b, 0.8, 0.94)}
            iones={suelta > 0.02 && suelta < 0.98 ? ionesFuera : []}
          />
        )}
      </Escena3D>
      {!cerca ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-R_RETICULO, CISTERNAS[1], 0.3], t: "Retículo (almacén de Ca²⁺)", a: 0.02, z: 0.66, o: [40, -140], color: "#4f8dff" },
            { p: BOMBAS[0], t: "Bomba SERCA", a: 0.08, z: 0.66, o: [-150, 90], color: "#ffd23f" },
            { p: [BOMBAS[3][0] + 0.25, BOMBAS[3][1] - 0.1, BOMBAS[3][2]], t: "usa ATP", a: 0.16, z: 0.66, o: [110, -60], color: K.naranja },
            { p: [0, L / 2, 0], t: "El sarcómero se alarga", a: 0.38, z: 0.66, o: [120, -80], color: "#c8d6ff" },
          ]}
        />
      ) : (
        <Etiquetas cam={cam} b={b} items={[{ p: enFino(posTm(1.9, 0, bloqueo)), t: "Tropomiosina tapa", a: 0.8, z: 1, o: [90, -90], color: C.tropomiosina }]} />
      )}
      <Destello b={b} en={[0.66]} />
      <Chip b={b} a={0.86} z={1} t="CANDADO CERRADO" x={540} y={1100} color={C.tropomiosina} />
      <Dato b={b} a={0.02} z={1} t="Relajación" sub="el calcio vuelve a su almacén" color="#4f8dff" y={270} tam={104} />
    </AbsoluteFill>
  );
};

// 9 · Lo que necesita tu musculo: todo sale de lo que comes -----------------------------
const NUTRIENTES = [
  { n: "ATP", s: "ATP", c: K.naranja, a: 0.3 },
  { n: "GLUCÓGENO", s: "Glucógeno", c: "#8a6bff", a: 0.36 },
  { n: "CALCIO", s: "Ca²⁺", c: K.cian, a: 0.52 },
  { n: "MAGNESIO", s: "Mg²⁺", c: "#5dffc4", a: 0.58 },
  { n: "SODIO", s: "Na⁺", c: NA, a: 0.64 },
  { n: "POTASIO", s: "K⁺", c: POTASIO, a: 0.7 },
];

const Nutrientes: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.8, 2.3, 8.8], l: [0, -0.45, 0], fov: 38 },
      { b: 0.78, p: [-0.8, 2.2, 8.5], l: [0, -0.45, 0], fov: 38 },
      { b: 1, p: [-0.6, 2.0, 7.8], l: [0, -0.5, 0], fov: 38 },
    ],
    b,
  );
  const pos = NUTRIENTES.map((_, i): V3 => {
    const fila = i < 3 ? 1 : 0;
    return [((i % 3) - 1) * 0.85 + Math.sin(b * 3 + i) * 0.04, -0.02 + fila * 0.34 + Math.sin(b * 6 + i) * 0.05, 0.3 - fila * 0.2];
  });
  const esc = (i: number) => Math.min(1, Math.max(0, (b - NUTRIENTES[i].a) / 0.06));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0, -0.6, 0]} rotation={[0, b * 0.5, 0]}>
          <Plato p={[0, 0, 0]} escala={2} />
          <Pechuga p={[-0.35, 0.1, 0.25]} escala={1.1} />
          <Frijoles p={[0.5, 0.04, -0.2]} escala={0.6} />
          <Espinaca p={[0.3, 0.06, 0.55]} escala={1.3} />
          <Granos p={[-0.35, 0.06, -0.45]} escala={0.9} />
        </group>
        {pos.map((p, i) => {
          const e = esc(i);
          if (e <= 0) return null;
          return (
            <group key={i} position={p} scale={e}>
              {i === 0 ? <MiniATP p={[-0.05, 0, 0]} escala={1.0} brillo={0.6} /> : null}
              {i === 1 ? <Glucogeno p={[0, 0, 0]} escala={0.75} /> : null}
              {i === 2 ? <IonCa p={[0, 0, 0]} r={0.1} /> : null}
              {i === 3 ? <IonMg p={[0, 0, 0]} r={0.1} /> : null}
              {i >= 4 ? <IonColor p={[0, 0, 0]} color={NUTRIENTES[i].c} r={0.1} /> : null}
            </group>
          );
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={NUTRIENTES.map((n, i) => ({ p: pos[i], t: n.s, a: n.a + 0.02, z: 1, o: [i % 2 ? 50 : -50, -60] as [number, number], color: n.c }))} />
      {NUTRIENTES.map((n, i) => (
        <Chip key={i} b={b} a={n.a} z={1} t={n.n} x={[200, 540, 880][i % 3]} y={i < 3 ? 1030 : 1120} color={n.c} />
      ))}
      <Dato b={b} a={0.02} z={0.78} t="¿Qué necesita?" sub="tu músculo para contraerse" color={K.lima} y={270} tam={100} />
      <Dato b={b} a={0.8} z={1} t="Todo sale de lo que comes" color={K.lima} y={270} tam={70} />
    </AbsoluteFill>
  );
};

const Comentarios: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Qué <span style={{ color: K.lima }}>serie</span> sigue?</>}
    escribe="Quiero una serie de…"
    ideas={["HUESOS", "HORMONAS", "DIGESTIÓN", "CORAZÓN", "SUEÑO"]}
  />
);

const T = [
  "En la parte uno, tu cerebro liberó el calcio dentro de la fibra. Ahora mira qué pasa en el **sarcómero**, la unidad que se contrae.",
  "El sarcómero tiene filamentos finos de **actina** y filamentos gruesos de **miosina**, con cabezas que pueden agarrar a la actina.",
  "En reposo no pueden: la **tropomiosina** tapa los sitios de unión, como un candado, sujeta por la **troponina**.",
  "El **calcio** se une a la troponina, el candado se mueve y los sitios de la actina quedan **libres**.",
  "La cabeza de miosina, ya cargada con energía, se pega a la actina: es el **puente cruzado**.",
  "Suelta el fosfato y hace el **golpe de fuerza**: jala la actina hacia el centro, como un remo.",
  "Llega una nueva molécula de **ATP**, la cabeza se suelta, rompe el ATP y se vuelve a armar para el siguiente jalón.",
  "Millones de cabezas repiten este ciclo, los filamentos **se deslizan** y el sarcómero se acorta. Así se contrae tu músculo.",
  "Para relajarse, una bomba usa ATP para regresar el calcio a su almacén, y el candado se vuelve a cerrar.",
  "¿Qué necesita tu músculo para contraerse? **ATP** y glucógeno como energía, **calcio**, **magnesio**, **sodio** y **potasio**. Todo sale de lo que comes.",
  "¿De qué tema quieres la siguiente serie? **Escríbelo en los comentarios**, y sígueme para más nutrición explicada con ciencia.",
];

const ESCENAS = [Gancho, Partes, Reposo, Calcio, PuenteCruzado, GolpeFuerza, Rearma, Desliza, Relaja, Nutrientes, Comentarios];

export const CONTRACCION2: ShortDef = {
  id: "Short-Contraccion2",
  titulo: "¿Qué pasa dentro del músculo cuando se contrae? (Parte 2)",
  planos: ESCENAS.map((Escena, i) => ({ id: `contraccion2-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
