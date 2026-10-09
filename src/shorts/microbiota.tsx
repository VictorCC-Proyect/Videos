// Short: Ultraprocesados, edulcorantes y microbiota intestinal.
// Del atleta al intestino, a la luz del colon y a su pared: fibra -> bacterias ->
// butirato -> colonocitos y barrera; ultraprocesados, emulsionantes, edulcorantes.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cam, camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3 } from "../fisio/motor";
import { difusion, Polvo, rnd } from "../fisio/modelos/comun";
import { GotaLipido, Mol } from "../fisio/modelos/energia";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaCierre } from "./cierre";
import { Chip, Dato, Destello, K, ShortDef, Titular } from "./marco";
import { Atleta, Frijoles, Piso } from "./modelos";
import { Brocoli, Manzana, Refresco } from "./modelos-glucosa";
import {
  BolsaPapas,
  BUT,
  Chispas,
  Colonia,
  ColoniaProps,
  Cristal,
  Emulsionante,
  Epitelio,
  Espiga,
  Fibra,
  FIBRA,
  Galleta,
  IntestinoCuerpo,
  Lumen,
  MOCO,
  posBacteria,
  puntosFibra,
  Sobre,
  topeMoco,
  Yogur,
} from "./modelos-microbiota";

const FONDO = "#2a0f18";

const camPared = (b: number): Cam =>
  camara(
    [
      { b: 0, p: [0.6, 2.5, 6.6], l: [0, 0.95, 0], fov: 40 },
      { b: 1, p: [-0.5, 2.4, 6.2], l: [0, 0.95, 0], fov: 40 },
    ],
    b,
  );

/** Moleculas de butirato que salen de `desde` y llegan a la pared. */
const Butirato: React.FC<{ b: number; a: number; z: number; desde: V3[]; n?: number; hastaY?: number; seed?: string }> = ({
  b,
  a,
  z,
  desde,
  n = 18,
  hastaY = 0.15,
  seed = "bu",
}) => (
  <>
    {Array.from({ length: n }).map((_, i) => {
      const t0 = a + (z - a - 0.18) * rnd(`${seed}${i}t`);
      const f = lineal(b, t0, t0 + 0.18);
      if (f <= 0 || f >= 1) return null;
      const o = desde[i % desde.length];
      const h: V3 = [o[0] + (rnd(`${seed}${i}x`) - 0.5) * 0.6, hastaY, o[2] + (rnd(`${seed}${i}z`) - 0.5) * 0.6];
      return <Mol key={i} p={difusion(o, h, f, `${seed}${i}`, 0.15)} color={BUT} r={0.06} op={Math.min(1, (1 - f) * 6)} />;
    })}
  </>
);

// 0 · Gancho: atleta translucido -> intestino -> billones de bacterias -------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.42;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [1.2, 1.2, 6.0], l: [0, 0.78, 0], fov: 36 },
          { b: 0.15, p: [0.8, 1.15, 4.6], l: [0, 0.85, 0], fov: 36 },
          { b: 0.42, p: [0.05, 1.05, 0.85], l: [0, 1.0, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.42, p: [0, 0.3, 4.6], l: [0, 0, -3], fov: 40 },
          { b: 1, p: [0.3, 0, 3.2], l: [0, -0.1, -3], fov: 40 },
        ],
        b,
      );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={fuera ? K.fondo2 : FONDO} niebla={fuera ? undefined : [3, 15]}>
        {fuera ? (
          <>
            <Atleta ej="parado" musculo={0.28} />
            <IntestinoCuerpo brillo={0.2 + entre(b, 0.1, 0.35) * 0.5} />
            <Piso />
          </>
        ) : (
          <>
            <Lumen />
            <Colonia b={b * 2} n={80} centro={[0, 0, -4]} caja={[3.2, 3.2, 8]} escala={1.5} seed="g0" />
            <Polvo b={b} radio={5} color="#ffd9e0" />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.42]} />
      {fuera ? (
        <Etiquetas cam={cam} b={b} items={[{ p: [-0.11, 1.08, 0.04], t: "Intestino", a: 0.12, z: 0.42, o: [-60, -110], color: "#ff9fb2" }]} />
      ) : null}
      <Titular b={b} a={0.46} z={1} y={290} tam={124} t={<>Billones de <span style={{ color: K.lima }}>bacterias</span></>} />
    </AbsoluteFill>
  );
};

// 1 · Fibra -> bacterias la fermentan -> butirato -------------------------------------
const FIBRAS: V3[][] = [
  puntosFibra([-0.6, 1.35, 0.3], "f1", 2.2, 0.25),
  puntosFibra([0.55, 1.05, -0.2], "f2", 2.2, -0.3),
  puntosFibra([0.1, 1.75, -0.6], "f3", 2.0, 0.1),
];
const OBJ_FIBRA = FIBRAS.flatMap((f) => f.filter((_, i) => i % 3 === 1 && i > 3 && i < 21));
const bajaFibras = (fs: V3[][], dy: number) => fs.map((f) => f.map((q) => [q[0], q[1] + dy, q[2]] as V3));

const Fermenta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const entra = entre(b, 0.03, 0.25);
  const atrae = entre(b, 0.25, 0.45);
  const come = entre(b, 0.42, 0.95);
  const cam = camPared(b);
  const fs = bajaFibras(FIBRAS, (1 - entra) * 2.6);
  const col: ColoniaProps = { b: b * 2, n: 28, centro: [0, 1.35, 0], caja: [3.2, 1.0, 1.8], seed: "g1", atraer: atrae, objetivos: OBJ_FIBRA };
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={FONDO} niebla={[6, 16]}>
        <Epitelio moco={1} brillo={entre(b, 0.75, 1) * 0.4} />
        {fs.map((f, i) => (
          <Fibra key={i} puntos={f} resto={1 - 0.65 * come} />
        ))}
        <Colonia {...col} />
        <Butirato b={b} a={0.5} z={1} desde={OBJ_FIBRA} n={26} />
        <Polvo b={b} radio={4} color="#ffd9e0" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: fs[0][5], t: "Fibra", a: 0.12, z: 1, o: [-40, -120], color: FIBRA },
          { p: posBacteria(col, 2), t: "Bacterias", a: 0.3, z: 1, o: [60, -140], color: K.cian },
          { p: [0.4, topeMoco(1) - 0.2, 1.2], t: "Moco", a: 0.4, z: 1, o: [60, 110], color: MOCO },
          { p: [-0.5, 0.6, 0.4], t: "Butirato (AGCC)", a: 0.6, z: 1, o: [-50, 150], color: BUT },
        ]}
      />
      <Chip b={b} a={0.03} z={0.5} t="COLON POR DENTRO" x={540} y={330} color={K.rosa} />
      <Dato b={b} a={0.55} z={1} t="Fermentación" sub="fibra → ácidos grasos de cadena corta" color={BUT} y={270} tam={84} />
    </AbsoluteFill>
  );
};

// 2 · El butirato alimenta a los colonocitos; uniones firmes ---------------------------
const Colonocitos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.9, 1.3, 5.0], l: [0, -0.55, 0], fov: 40 },
      { b: 1, p: [-0.4, 1.0, 4.3], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  const brillo = entre(b, 0.15, 0.6);
  const desde: V3[] = Array.from({ length: 8 }).map((_, i) => [-1.2 + i * 0.35, 1.0, 0.2 + (i % 3) * 0.3]);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={FONDO} niebla={[5, 13]}>
        <Epitelio moco={0.8} brillo={brillo * 0.8} />
        <Butirato b={b} a={0.0} z={0.85} desde={desde} n={30} hastaY={-0.35} seed="b2" />
        <Colonia b={b * 2} n={10} centro={[0, 1.7, 0]} caja={[2.6, 0.5, 1.2]} seed="g2" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.6, 1.1, 0.8], t: "Butirato", a: 0.05, z: 0.6, o: [-50, -110], color: BUT },
          { p: [0, -0.9, 1.33], t: "Colonocitos", a: 0.2, z: 1, o: [-60, 130], color: "#ffcf70" },
          { p: [0.6, -0.12, 1.37], t: "Uniones firmes", a: 0.4, z: 1, o: [-40, 120], color: "#47d18c" },
        ]}
      />
      <Dato b={b} a={0.55} z={1} t="Barrera intestinal fuerte" sub="células bien alimentadas y unidas" color="#47d18c" y={270} tam={76} />
    </AbsoluteFill>
  );
};

// 3 · Ultraprocesados: poca fibra, mucho azucar, grasa y aditivos --------------------------
const COMIDA: V3[] = [
  [-0.95, 1.45, 0.3],
  [0.1, 1.5, 0.6],
  [0.95, 1.3, 0.2],
];
const Particula: React.FC<{ i: number; p: V3 }> = ({ i, p }) => {
  const tipo = i % 3;
  if (tipo === 0)
    return (
      <mesh position={p} rotation={[i, i * 1.3, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.25} roughness={0.2} clearcoat={1} />
      </mesh>
    );
  if (tipo === 1) return <GotaLipido p={p} r={0.08} />;
  return <Mol p={p} color={[K.rosa, K.morado, K.cian][i % 3 === 2 ? Math.floor(i / 3) % 3 : 0]} r={0.06} />;
};

const Ultra: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cae = entre(b, 0.0, 0.28);
  const rompe = entre(b, 0.34, 0.5);
  const cam = camPared(b);
  const comida = COMIDA.map((c) => [c[0], c[1] + (1 - cae) * 2.6, c[2]] as V3);
  const parts = Array.from({ length: 36 }).map((_, i) => {
    const o = COMIDA[i % 3];
    const d: V3 = [(rnd(`u${i}x`) - 0.5) * 3.2, 1.0 + rnd(`u${i}y`) * 0.95, (rnd(`u${i}z`) - 0.5) * 1.6];
    return mix3(o, [d[0] + Math.sin(b * 3 + i) * 0.05, d[1], d[2]], rompe);
  });
  const fibra = puntosFibra([0.2, 1.15, -0.4], "fu", 1.4, 0.3);
  const s = 1 - rompe;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={FONDO} niebla={[6, 16]}>
        <Epitelio moco={1} />
        {s > 0.02 ? (
          <>
            <BolsaPapas p={comida[0]} rot={[0.2, 0.4 + b, 0.3]} escala={1.1 * s} />
            <Galleta p={comida[1]} rot={[1.1, 0, 0.3 + b]} escala={1.2 * s} />
            <Refresco p={[comida[2][0], comida[2][1] - 0.4, comida[2][2]]} escala={1.3 * s} />
          </>
        ) : null}
        {rompe > 0 ? parts.map((q, i) => <Particula key={i} i={i} p={q} />) : null}
        <Fibra puntos={fibra} resto={0.4 * entre(b, 0.4, 0.55)} />
        <Colonia b={b * 2} n={14} centro={[0, 1.4, 0]} caja={[3.0, 0.9, 1.6]} seed="g3" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: comida[0], t: "Papas fritas", a: 0.1, z: 0.36, o: [40, -150], color: "#ffb020" },
          { p: comida[1], t: "Galletas", a: 0.14, z: 0.36, o: [40, 130], color: "#f6f1e6" },
          { p: [comida[2][0], comida[2][1] + 0.3, comida[2][2]], t: "Refresco", a: 0.18, z: 0.36, o: [30, -140], color: K.rojo },
          { p: fibra[12], t: "Poca fibra", a: 0.5, z: 1, o: [50, 130], color: FIBRA },
          { p: parts[0], t: "Azúcar", a: 0.56, z: 1, o: [-40, -110], color: "#ffffff" },
          { p: parts[4], t: "Grasa", a: 0.62, z: 1, o: [40, -120], color: "#ffd166" },
          { p: parts[5], t: "Aditivos", a: 0.68, z: 1, o: [-30, 140], color: K.rosa },
        ]}
      />
      <Chip b={b} a={0.03} z={0.45} t="ULTRAPROCESADOS" x={540} y={330} color={K.naranja} />
      <Dato b={b} a={0.5} z={1} t="Poca fibra · muchos aditivos" color={K.naranja} y={270} tam={72} />
    </AbsoluteFill>
  );
};

// 4 · Emulsionantes adelgazan el moco -> bacterias cerca -> inflamacion -------------------
const Emulsion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const entra = entre(b, 0.03, 0.25);
  const moco = 1 - 0.68 * entre(b, 0.22, 0.62);
  const acerca = entre(b, 0.45, 0.75);
  const inflama = entre(b, 0.65, 0.85);
  const cam = camara(
    [
      { b: 0, p: [0.6, 2.0, 5.6], l: [0, 0.75, 0], fov: 40 },
      { b: 1, p: [-0.4, 1.7, 5.0], l: [0, 0.7, 0], fov: 40 },
    ],
    b,
  );
  const tope = topeMoco(moco);
  const emu = Array.from({ length: 20 }).map((_, i) => {
    const dentro: V3 = [(rnd(`e${i}x`) - 0.5) * 3.2, 0.12 + rnd(`e${i}y`) * (tope - 0.1), (rnd(`e${i}z`) - 0.5) * 1.8];
    const arriba: V3 = [dentro[0], 2.6 + rnd(`e${i}a`), dentro[2]];
    return mix3(arriba, [dentro[0] + Math.sin(b * 6 + i) * 0.05, dentro[1], dentro[2]], entra);
  });
  const col: ColoniaProps = { b: b * 2, n: 24, centro: [0, 1.5, 0], caja: [3.2, 0.7, 1.6], seed: "g4", baja: acerca * 0.95 };
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={FONDO} niebla={[6, 15]}>
        <Epitelio moco={moco} inflama={inflama} />
        {emu.map((q, i) => (
          <Emulsionante key={i} p={q} rot={i + b * 2} escala={1.3} />
        ))}
        <Colonia {...col} />
        <Chispas b={b} nivel={inflama} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: emu[3], t: "Emulsionantes", a: 0.12, z: 1, o: [-40, -130], color: K.morado },
          { p: [0.5, tope - 0.05, 1.3], t: moco > 0.6 ? "Capa de moco" : "Moco más fino", a: 0.25, z: 1, o: [-40, 130], color: MOCO },
          { p: posBacteria(col, 1), t: "Bacterias más cerca", a: 0.5, z: 1, o: [50, -120], color: K.cian },
          { p: [-0.6, 0.25, 0.8], t: "Inflamación", a: 0.72, z: 1, o: [40, 150], color: K.rojo },
        ]}
      />
      <Chip b={b} a={0.3} z={1} t="ESTUDIOS SOBRE TODO EN ANIMALES" x={540} y={330} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 5 · Edulcorantes: algunas bacterias cambian; evidencia mixta ---------------------------
const Edulcorantes: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const inclina = entre(b, 0.05, 0.18);
  const cambia = entre(b, 0.38, 0.65);
  const cam = camara(
    [
      { b: 0, p: [0.4, 1.7, 4.8], l: [0, 1.15, 0], fov: 40 },
      { b: 1, p: [-0.4, 1.5, 4.2], l: [0, 1.05, 0], fov: 40 },
    ],
    b,
  );
  const sobres: V3[] = [
    [-0.55, 1.95, 0.3],
    [0.6, 2.0, 0.1],
  ];
  const fuera = 1 - entre(b, 0.45, 0.55);
  const crist = Array.from({ length: 30 }).map((_, i) => {
    const s = sobres[i % 2];
    const t0 = 0.12 + rnd(`cr${i}`) * 0.3;
    const f = lineal(b, t0, t0 + 0.25);
    const fin: V3 = [(rnd(`cr${i}x`) - 0.5) * 2.6, 0.55 + rnd(`cr${i}y`) * 0.9, (rnd(`cr${i}z`) - 0.5) * 1.4];
    return { p: mix3([s[0] + 0.25 * (i % 2 ? -1 : 1), s[1] - 0.1, s[2]], fin, f), f };
  });
  const col: ColoniaProps = { b: b * 2, n: 34, centro: [0, 1.05, 0], caja: [2.8, 1.1, 1.4], seed: "g5", gris: cambia * 0.9, desaparece: cambia * 0.3 };
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={FONDO} niebla={[4, 12]}>
        {fuera > 0.02
          ? sobres.map((s, i) => <Sobre key={i} p={s} rot={[0.3, 0, (i ? -1 : 1) * (0.2 + inclina * 0.9)]} color={i ? "#ffd23f" : "#ff7eb6"} escala={fuera} />)
          : null}
        {crist.map((c, i) => (c.f > 0 ? <Cristal key={i} p={c.p} giro={b * 4 + i} escala={1.1} /> : null))}
        <Colonia {...col} />
        <Polvo b={b} radio={4} color="#ffd9e0" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: sobres[0], t: "Edulcorantes", a: 0.05, z: 0.5, o: [30, 150], color: "#ffffff" },
          { p: posBacteria(col, 3), t: "Microbiota alterada", a: 0.45, z: 1, o: [60, -220], color: "#9aa3ad" },
        ]}
      />
      <Dato b={b} a={0.6} z={1} t="Evidencia mixta" sub="algunos estudios, no todos" color={K.amarillo} y={270} tam={92} />
      <Chip b={b} a={0.32} z={1} t="SACARINA" x={320} y={1100} color="#ff7eb6" />
      <Chip b={b} a={0.4} z={1} t="SUCRALOSA" x={760} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 6 · Menos bacterias beneficas, barrera mas debil ------------------------------------------
const Debil: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const pierde = entre(b, 0.05, 0.4);
  const abre = entre(b, 0.25, 0.65);
  const cam = camara(
    [
      { b: 0, p: [0.9, 1.9, 5.8], l: [0, 0.1, 0], fov: 40 },
      { b: 1, p: [-0.5, 1.6, 5.2], l: [0, 0.0, 0], fov: 40 },
    ],
    b,
  );
  const col: ColoniaProps = { b: b * 2, n: 22, centro: [0, 1.25, 0], caja: [2.8, 0.8, 1.4], seed: "g6", gris: pierde, desaparece: pierde * 0.6 };
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={FONDO} niebla={[5, 13]}>
        <Epitelio moco={mix(0.9, 0.35, pierde)} abiertas={abre} inflama={abre} />
        <Colonia {...col} />
        <Chispas b={b} nivel={abre * 0.7} seed="c6" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: posBacteria(col, 0), t: "Menos bacterias benéficas", a: 0.12, z: 0.55, o: [-40, -130], color: "#9aa3ad" },
          { p: [0.0, -0.05, 0.0], t: "Uniones abiertas", a: 0.45, z: 1, o: [-40, -130], color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.55} z={1} t="Barrera más débil" color={K.rojo} y={270} tam={100} />
    </AbsoluteFill>
  );
};

// 7 · Lo que ayuda: fibra y fermentados ---------------------------------------------------
const Ayuda: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const baja = entre(b, 0.0, 0.2);
  const suelta = entre(b, 0.36, 0.5);
  const crece = entre(b, 0.4, 0.85);
  const cura = entre(b, 0.5, 0.9);
  const cam = camPared(b);
  const y = mix(4.0, 1.55, baja);
  const s = 1 - suelta;
  const fs = FIBRAS.map((f) => f.map((q) => [q[0], q[1] + 0.05, q[2]] as V3));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={FONDO} niebla={[6, 16]}>
        <Epitelio moco={mix(0.35, 1, cura)} abiertas={1 - cura} inflama={1 - cura} brillo={entre(b, 0.75, 1) * 0.6} />
        {s > 0.02 ? (
          <group scale={1}>
            <Manzana p={[-1.05, y, 0.3]} escala={2.2 * s} />
            <Brocoli p={[-0.4, y - 0.25, 0.1]} escala={2.4 * s} />
            <Frijoles p={[0.35, y - 0.1, 0.2]} escala={0.8 * s} />
            <Espiga p={[1.0, y, 0.2]} escala={1.3 * s} rot={-0.3} />
            <Yogur p={[0.0, y - 0.45, 0.8]} escala={1.3 * s} />
          </group>
        ) : null}
        {fs.map((f, i) => (
          <Fibra key={i} puntos={f} resto={suelta * (1 - 0.3 * entre(b, 0.7, 1))} />
        ))}
        <Colonia b={b * 2} n={40} centro={[0, 1.35, 0]} caja={[3.2, 1.0, 1.8]} seed="g7" desaparece={0.75 * (1 - crece)} atraer={0.35 * crece} objetivos={OBJ_FIBRA} />
        <Butirato b={b} a={0.6} z={1} desde={OBJ_FIBRA} n={22} seed="b7" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.05, y, 0.3], t: "Frutas", a: 0.18, z: 0.4, o: [30, -130], color: K.rojo },
          { p: [-0.4, y, 0.1], t: "Verduras", a: 0.2, z: 0.4, o: [-20, 120], color: "#5cc34f" },
          { p: [0.35, y, 0.2], t: "Leguminosas", a: 0.22, z: 0.4, o: [-20, -170], color: "#d97a2b" },
          { p: [1.0, y + 0.1, 0.2], t: "Granos enteros", a: 0.24, z: 0.4, o: [-30, 170], color: "#e2b65a" },
          { p: [0.0, y - 0.45, 0.8], t: "Yogur", a: 0.26, z: 0.4, o: [-40, 130], color: "#5aa9ff" },
          { p: [-0.6, 0.6, 0.4], t: "Butirato", a: 0.7, z: 1, o: [-50, 150], color: BUT },
        ]}
      />
      <Chip b={b} a={0.45} z={1} t="+ FIBRA" x={320} y={330} color={FIBRA} />
      <Chip b={b} a={0.52} z={1} t="+ FERMENTADOS" x={740} y={330} color="#5aa9ff" />
    </AbsoluteFill>
  );
};

const T = [
  "En tu intestino viven **billones de bacterias**: tu microbiota. Y lo que comes las cambia.",
  "Las bacterias buenas se alimentan de **fibra**: la fermentan y producen **ácidos grasos de cadena corta**, como el butirato.",
  "El butirato alimenta a las células del colon y ayuda a mantener fuerte la **barrera intestinal**.",
  "Los **ultraprocesados** suelen tener poca fibra y mucho azúcar, grasa y aditivos.",
  "Algunos **emulsionantes**, en estudios sobre todo con animales, adelgazan la capa de moco que protege el intestino y favorecen la **inflamación**.",
  "¿Y los **edulcorantes**? La sacarina y la sucralosa han alterado la microbiota en algunos estudios, aunque la evidencia todavía es **mixta**.",
  "Menos fibra y más aditivos: menos bacterias benéficas y una **barrera más débil**.",
  "Lo que ayuda: **fibra** de frutas, verduras, leguminosas y granos enteros, y alimentos **fermentados** como el yogur.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Fermenta, Colonocitos, Ultra, Emulsion, Edulcorantes, Debil, Ayuda, EscenaCierre];

export const MICROBIOTA: ShortDef = {
  id: "Short-Microbiota",
  titulo: "Ultraprocesados, edulcorantes y microbiota intestinal",
  planos: ESCENAS.map((Escena, i) => ({ id: `microbiota-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
