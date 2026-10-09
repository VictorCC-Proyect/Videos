// Short: Colágeno: ¿sirve tomarlo?
// Del atleta (shaker) al tendon: fibras -> fibrillas -> triple helice; digestion en el
// intestino, fibroblasto que fabrica colageno nuevo, vitamina C, el estudio y lo basico.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3 } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Enlace, Vaso } from "../fisio/modelos/energia";
import { Humano } from "../fisio/modelos/cuerpo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaCierre } from "./cierre";
import { Chip, Dato, Destello, K, Sello, ShortDef, Titular } from "./marco";
import { Atleta, Pechuga, Piso, Plato } from "./modelos";
import { Vellosidades } from "./modelos-glucosa";
import {
  Amino,
  cuentasHelice,
  FlechaPuntos,
  FondoFibras,
  Fibroblasto,
  Fibrilla,
  GLY,
  HazTendon,
  HYP,
  Naranja,
  PRO,
  Reloj,
  Shaker,
  Tache,
  TENDON,
  TripleHelice,
  VitaminaC,
  VITC,
} from "./modelos-colageno";

// ---- Utilidades -------------------------------------------------------------------

/** Posicion aproximada de la mano derecha de Humano (hombro en x=0.23, y=1.47). */
const manoD = (th: number, codo: number): V3 => [
  0.25,
  1.47 - 0.3 * Math.cos(th) - 0.32 * Math.cos(th + codo),
  -0.3 * Math.sin(th) - 0.32 * Math.sin(th + codo),
];

/** Tendones de la pierna (pose de pie): rotuliano y de Aquiles, brillando. */
const TendonesPierna: React.FC<{ brillo: number }> = ({ brillo }) => (
  <group>
    {[1, -1].map((l) => (
      <group key={l}>
        <Enlace a={[0.12 * l, 0.39, 0.065]} b={[0.12 * l, 0.5, 0.075]} r={0.022} color={TENDON} brillo={0.4 + brillo} />
        <Enlace a={[0.135 * l, 0.06, -0.06]} b={[0.13 * l, 0.26, -0.05]} r={0.02} color={TENDON} brillo={0.4 + brillo} />
      </group>
    ))}
  </group>
);

// 0 · Gancho: atleta bebe colageno; flechas "directo" a piel y rodilla, tachadas ------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const sube = entre(b, 0.0, 0.15) * (1 - entre(b, 0.78, 0.95));
  const th = mix(-0.15, -0.55, sube);
  const codo = mix(-1.5, -2.3, sube);
  const mano = manoD(th, codo);
  const flechas = lineal(b, 0.2, 0.5);
  const tacha = entre(b, 0.58, 0.68);
  const cam = camara(
    [
      { b: 0, p: [2.2, 1.35, 5.8], l: [0, 0.72, 0], fov: 36 },
      { b: 1, p: [-1.4, 1.25, 5.6], l: [0, 0.72, 0], fov: 36 },
    ],
    b,
  );
  const piel: V3 = [-0.33, 1.15, 0.06];
  const rodilla: V3 = [0.12, 0.5, 0.09];
  const inicio: V3 = [mano[0], mano[1] - 0.05, mano[2] + 0.05];
  const colF = mix(0, 1, tacha) > 0.5 ? "#7f8c8f" : K.cian;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <Humano
          musculo={0.8}
          brilla={0.15}
          pose={{
            hombroD: [th, 0, 0.05],
            hombroI: [0, 0, -0.12],
            codoD: codo,
            codoI: -0.15,
            caderaD: [0, 0, 0.04],
            caderaI: [0, 0, -0.04],
            rodillaD: 0,
            rodillaI: 0,
          }}
        />
        <Shaker p={[mano[0], mano[1] - 0.1, mano[2] + 0.04]} rot={[mix(0, -0.9, sube), 0, 0]} escala={0.15} />
        <FlechaPuntos desde={inicio} ctrl={[-0.6, 1.5, 0.7]} hasta={piel} prog={flechas} color={colF} />
        <FlechaPuntos desde={inicio} ctrl={[0.6, 0.9, 0.8]} hasta={rodilla} prog={flechas} color={colF} />
        {tacha > 0 ? (
          <>
            <Tache p={[piel[0], piel[1], piel[2] + 0.1]} op={tacha} escala={0.8} />
            <Tache p={[rodilla[0], rodilla[1], rodilla[2] + 0.1]} op={tacha} escala={0.8} />
          </>
        ) : null}
        <Piso />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: piel, t: "Piel", a: 0.4, z: 1, o: [-60, -70], color: K.rosa },
          { p: rodilla, t: "Articulaciones", a: 0.45, z: 1, o: [70, 60], color: K.cian },
        ]}
      />
      <Titular b={b} a={0.03} z={1.1} y={250} tam={96} t={<>¿Directo a tus<br />articulaciones?</>} />
      <Sello b={b} a={0.72} z={1.1} t="NO" y={1000} />
    </AbsoluteFill>
  );
};

// 1 · Estructura: tendon -> haz -> fibrilla -> triple helice -------------------------
const C1 = 0.2;
const C2 = 0.42;
const C3 = 0.62;

const Estructura: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase = b < C1 ? 0 : b < C2 ? 1 : b < C3 ? 2 : 3;
  const cams = [
    camara(
      [
        { b: 0, p: [1.6, 1.0, 4.6], l: [0, 0.65, 0], fov: 36 },
        { b: C1, p: [0.9, 0.42, 1.6], l: [0.05, 0.3, 0], fov: 36 },
      ],
      b,
    ),
    camara(
      [
        { b: C1, p: [3.6, 4.8, 7.6], l: [0, 0.6, 0], fov: 40 },
        { b: C2, p: [2.6, 3.8, 5.6], l: [0, 1.0, 0], fov: 40 },
      ],
      b,
    ),
    camara(
      [
        { b: C2, p: [2.2, 1.2, 6.6], l: [0, -0.4, 0], fov: 40 },
        { b: C3, p: [1.4, 0.8, 5.0], l: [0, -0.3, 0], fov: 40 },
      ],
      b,
    ),
    camara(
      [
        { b: C3, p: [0.2, 0.3, 6.4], l: [0, -0.6, 0], fov: 40 },
        { b: 1, p: [-0.6, 0.4, 5.6], l: [0, -0.6, 0], fov: 40 },
      ],
      b,
    ),
  ];
  const cam = cams[fase];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={fase > 0 ? [5, 22] : undefined}>
        {fase === 0 ? (
          <>
            <Atleta ej="parado" musculo={0.55} />
            <TendonesPierna brillo={0.6 + 0.6 * entre(b, 0.05, 0.15)} />
            <Piso />
          </>
        ) : fase === 1 ? (
          <group rotation={[0, b * 0.6, 0]}>
            <HazTendon alto={7} brillo={0.2} />
          </group>
        ) : fase === 2 ? (
          <group rotation={[0, b * 0.8, 0]}>
            <Fibrilla alto={7} destaca={0} brillo={0.15} />
          </group>
        ) : (
          <TripleHelice rot={[0.15, b * 2.5, 0]} largo={5} n={27} b={b} escala={1.2} />
        )}
        {fase > 0 ? <Polvo b={b} radio={5} /> : null}
      </Escena3D>
      <Destello b={b} en={[C1, C2, C3]} />
      {fase === 0 ? (
        <Etiquetas cam={cam} b={b} items={[{ p: [0.12, 0.45, 0.07], t: "Tendón", a: 0.06, z: C1, o: [80, -60], color: TENDON }]} />
      ) : null}
      <Chip b={b} a={C1 + 0.01} z={C2} t="HAZ DE FIBRAS" x={540} y={1100} color={TENDON} />
      <Chip b={b} a={C2 + 0.01} z={C3} t="FIBRILLA" x={540} y={1100} color={TENDON} />
      {fase === 3 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[{ p: [0.25, 1.4, 0], t: "Triple hélice", a: C3 + 0.02, z: 1.1, o: [70, -60], color: K.rosa }]}
        />
      ) : null}
      <Dato b={b} a={0.04} z={1.1} t="PROTEÍNA Nº 1" sub="la más abundante de tu cuerpo" color={TENDON} y={260} tam={96} />
      <Chip b={b} a={0.66} z={1.1} t="TENDONES" x={300} y={1000} color={K.lima} />
      <Chip b={b} a={0.72} z={1.1} t="LIGAMENTOS" x={780} y={1000} color={K.cian} />
      <Chip b={b} a={0.8} z={1.1} t="PIEL" x={360} y={1100} color={K.rosa} />
      <Chip b={b} a={0.86} z={1.1} t="HUESO" x={720} y={1100} color={K.tinta} />
    </AbsoluteFill>
  );
};

// 2 · Digestion: la helice se rompe en aminoacidos y peptidos que pasan a la sangre ------
type Frag = { cuentas: { p: V3; tipo: number }[]; destino: V3; centro: V3 };

const fragmentos = (): Frag[] => {
  const cs = cuentasHelice({ largo: 4.4, n: 15, enrolla: 1 });
  const out: Frag[] = [];
  cs.forEach((cad, k) => {
    let i = 0;
    let f = 0;
    while (i < cad.length) {
      const tam = rnd(`tm${k}${f}`) < 0.6 ? 1 : rnd(`tm2${k}${f}`) < 0.6 ? 2 : 3;
      const grupo = cad.slice(i, i + tam);
      // helice horizontal: (x,y,z) -> (-y, x, z) y elevada
      const pts = grupo.map((c) => ({ p: [-c.p[1], c.p[0] + 2.3, c.p[2]] as V3, tipo: c.tipo === 2 ? 2 : c.tipo }));
      const centro = pts[0].p;
      const destino: V3 = [(rnd(`dx${k}${f}`) - 0.5) * 5.6, 0.6 + rnd(`dy${k}${f}`) * 2.2, (rnd(`dz${k}${f}`) - 0.5) * 1.6];
      out.push({ cuentas: pts, destino, centro });
      i += tam;
      f++;
    }
  });
  return out;
};
const FRAGS = fragmentos();

const Digestion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const corta = entre(b, 0.12, 0.42);
  const absorbe = entre(b, 0.6, 0.88);
  const cam = camara(
    [
      { b: 0, p: [0, 1.6, 9.6], l: [0, 0.2, 0], fov: 40 },
      { b: 1, p: [0.8, 1.2, 9.0], l: [0, 0.0, 0], fov: 40 },
    ],
    b,
  );
  const xs = [-2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1];
  const posFrag = (f: Frag, i: number): V3 => {
    const suelto = mix3(f.centro, f.destino, corta);
    const punta: V3 = [xs[i % xs.length], -0.3, 0.45];
    const t = Math.min(1, Math.max(0, absorbe * 1.3 - rnd(`ab${i}`) * 0.3));
    return mix3(suelto, punta, t);
  };
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#2a0f18">
        <group position={[0, -1.8, 0]}>
          <Vellosidades b={b} brillo={absorbe} />
        </group>
        <Vaso desde={[-4.5, -2.75, 1.0]} hasta={[4.5, -2.75, 1.0]} t={b * 1.5} radio={0.32} />
        {corta < 0.02 ? (
          <TripleHelice p={[0, 2.3, 0]} rot={[0, 0, Math.PI / 2]} largo={4.4} n={15} />
        ) : (
          FRAGS.map((f, i) => {
            const pos = posFrag(f, i);
            const t = Math.min(1, Math.max(0, absorbe * 1.3 - rnd(`ab${i}`) * 0.3));
            const op = 1 - entre(t, 0.8, 1);
            if (op <= 0) return null;
            const comp = mix(1, 0.55, corta);
            return (
              <group key={i}>
                {f.cuentas.map((c, j) => {
                  const rel: V3 = [(c.p[0] - f.centro[0]) * comp, (c.p[1] - f.centro[1]) * comp, (c.p[2] - f.centro[2]) * comp];
                  return <Amino key={j} p={[pos[0] + rel[0], pos[1] + rel[1], pos[2] + rel[2]]} tipo={c.tipo} op={op} r={0.11} />;
                })}
                {f.cuentas.length > 1
                  ? f.cuentas.slice(1).map((c, j) => {
                      const a0 = f.cuentas[j].p;
                      const p0: V3 = [pos[0] + (a0[0] - f.centro[0]) * comp, pos[1] + (a0[1] - f.centro[1]) * comp, pos[2] + (a0[2] - f.centro[2]) * comp];
                      const p1: V3 = [pos[0] + (c.p[0] - f.centro[0]) * comp, pos[1] + (c.p[1] - f.centro[1]) * comp, pos[2] + (c.p[2] - f.centro[2]) * comp];
                      return <Enlace key={`e${j}`} a={p0} b={p1} r={0.03} color="#f4f7f2" op={op} />;
                    })
                  : null}
              </group>
            );
          })
        )}
        {/* aminoacidos ya en la sangre */}
        {absorbe > 0.3
          ? Array.from({ length: 12 }).map((_, i) => {
              const f = (i / 12 + b * 0.5) % 1;
              return <Amino key={`s${i}`} p={[mix(-4.2, 4.2, f), -2.75 + Math.sin(i * 2) * 0.12, 1.0]} tipo={i % 3} r={0.09} op={entre(absorbe, 0.3, 0.6)} />;
            })
          : null}
        <Polvo b={b} radio={5} color="#ffc2d0" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, 2.3, 0], t: "Colágeno", a: 0.02, z: 0.14, o: [80, -80], color: K.rosa },
          { p: posFrag(FRAGS[0], 0), t: "Glicina", a: 0.3, z: 0.62, o: [-50, -80], color: GLY },
          { p: posFrag(FRAGS[1], 1), t: "Prolina", a: 0.33, z: 0.62, o: [60, -80], color: PRO },
          { p: posFrag(FRAGS[5], 5), t: "Hidroxiprolina", a: 0.36, z: 0.62, o: [60, 80], color: HYP },
          { p: [0, -0.2, 0.45], t: "Intestino", a: 0.5, z: 0.75, o: [-80, 120], color: "#ff8fa3" },
          { p: [2.5, -2.75, 1.0], t: "Sangre", a: 0.7, z: 1.1, o: [40, 110], color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.4} z={1.1} t="AMINOÁCIDOS" sub="+ péptidos pequeños" color={K.lima} y={260} tam={96} />
      <Chip b={b} a={0.78} z={1.1} t="= CUALQUIER PROTEÍNA" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 3 · Fibroblasto: toma aminoacidos de la sangre y fabrica colageno ---------------------
const Fibro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const llegan = entre(b, 0.08, 0.4);
  const crece = entre(b, 0.35, 0.65);
  const enrolla = entre(b, 0.55, 0.75);
  const sale = entre(b, 0.75, 0.98);
  const cam = camara(
    [
      { b: 0, p: [0, 0.6, 11.5], l: [0, -0.5, 0], fov: 40 },
      { b: 1, p: [1.0, 0.3, 10.0], l: [0.6, -0.5, 0], fov: 40 },
    ],
    b,
  );
  const heliceP: V3 = mix3([0.9, -0.15, 0.2], [5.2, -2.0, -0.6], sale);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#10223a" niebla={[8, 26]}>
        <FondoFibras z={-2.2} n={8} />
        <Vaso desde={[-6, 2.6, -0.4]} hasta={[6, 2.6, -0.4]} t={b * 1.4} radio={0.4} />
        <Fibroblasto p={[0, 0, 0]} brillo={crece * 0.6} />
        {/* aminoacidos que bajan de la sangre */}
        {Array.from({ length: 14 }).map((_, i) => {
          const t = Math.min(1, Math.max(0, llegan * 1.4 - rnd(`ll${i}`) * 0.4));
          if (t <= 0 || t >= 1) return null;
          const x0 = (rnd(`lx${i}`) - 0.5) * 6;
          const p = mix3([x0, 2.6, -0.4], [mix(0.4, 2.0, rnd(`lt${i}`)), -0.2 + (rnd(`ly${i}`) - 0.5) * 0.5, 0.2], t);
          return <Amino key={i} p={p} tipo={i % 3} r={0.1} />;
        })}
        {crece > 0 ? (
          <TripleHelice p={heliceP} rot={[0, 0.3, Math.PI / 2]} largo={2.6} n={15} crece={crece} enrolla={enrolla} b={b} escala={0.85} brillo={0.4} />
        ) : null}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.6, 0.4, 0.3], t: "Fibroblasto", a: 0.04, z: 1.1, o: [-40, -110], color: "#9fb0ff" },
          { p: [-3.5, 2.6, -0.4], t: "Aminoácidos de la sangre", a: 0.12, z: 0.45, o: [30, -90], color: K.rojo },
          { p: heliceP, t: "Colágeno nuevo", a: 0.6, z: 1.1, o: [-40, 120], color: K.rosa },
        ]}
      />
      <Dato b={b} a={0.1} z={1.1} t="FIBROBLASTOS" sub="fabrican su propio colágeno" color="#9fb0ff" y={260} tam={92} />
      <Chip b={b} a={0.8} z={1.1} t="DONDE HAGA FALTA" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 4 · Vitamina C: la helice se estabiliza ----------------------------------------------
const VitC: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const vuela = entre(b, 0.08, 0.45);
  const estab = entre(b, 0.38, 0.75);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 6.6], l: [0, -0.3, 0], fov: 40 },
      { b: 1, p: [0.6, 0.3, 5.6], l: [0, -0.4, 0], fov: 40 },
    ],
    b,
  );
  const naranja: V3 = [-1.3, 1.9, -0.6];
  const blancos: V3[] = [-1.4, -0.7, 0, 0.7, 1.4].map((x, i) => [x, -0.45 + (i % 2 ? 0.25 : -0.25), 0.4]);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#13203d" niebla={[5, 18]}>
        <mesh position={[0, -0.5, -2.5]} scale={[6, 3.5, 1]}>
          <sphereGeometry args={[1, 32, 24]} />
          <meshBasicMaterial color="#2b3c7a" transparent opacity={0.35} depthWrite={false} />
        </mesh>
        <Naranja p={naranja} escala={0.9} giro={b * 2} />
        {blancos.map((d, i) => {
          const t = Math.min(1, Math.max(0, vuela * 1.3 - i * 0.07));
          if (t <= 0) return null;
          const p = mix3(naranja, d, t);
          return <VitaminaC key={i} p={[p[0], p[1] + Math.sin(b * 8 + i) * 0.04, p[2]]} escala={0.9} giro={b * 6 + i} op={1 - entre(estab, 0.85, 1) * 0.6} />;
        })}
        <TripleHelice p={[0, -0.5, 0]} rot={[0.25, 0, Math.PI / 2 + 0.05]} largo={4.4} n={21} floja={1 - estab} hidrox={estab} puentes={estab} b={b} brillo={0.3} />
        <Polvo b={b} radio={4} color="#ffe28a" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: naranja, t: "Vitamina C", a: 0.05, z: 1.1, o: [70, -60], color: VITC },
          { p: [-1.6, -0.5, 0.2], t: estab < 0.5 ? "Sin vitamina C: hélice floja" : "Hélice estable", a: 0.1, z: 1.1, o: [-20, 150], color: estab < 0.5 ? K.rojo : K.lima },
        ]}
      />
      <Dato b={b} a={0.03} z={1.1} t="VITAMINA C" sub="necesaria para armar el colágeno" color={VITC} y={260} tam={100} />
    </AbsoluteFill>
  );
};

// 5 · El estudio: 15 g + vitamina C, 1 h antes; salto; tendon con mas sintesis -------------
const E1 = 0.36;
const E2 = 0.66;

const Estudio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase = b < E1 ? 0 : b < E2 ? 1 : 2;
  const saltos = (b - E1) * 30;
  const aire = Math.max(0, Math.sin(saltos * Math.PI));
  const nuevas = entre(b, E2 + 0.04, 0.95);
  const cam =
    fase === 0
      ? camara(
          [
            { b: 0, p: [0.2, 1.3, 5.6], l: [0.2, 0.15, 0], fov: 38 },
            { b: E1, p: [-0.4, 1.1, 5.0], l: [0.2, 0.15, 0], fov: 38 },
          ],
          b,
        )
      : fase === 1
        ? camara(
            [
              { b: E1, p: [2.2, 1.2, 5.6], l: [0, 0.75, 0], fov: 36 },
              { b: E2, p: [-1.6, 1.1, 5.6], l: [0, 0.75, 0], fov: 36 },
            ],
            b,
          )
        : camara(
            [
              { b: E2, p: [3.2, 4.6, 6.8], l: [0, 0.8, 0], fov: 40 },
              { b: 1, p: [2.4, 3.8, 5.4], l: [0, 1.0, 0], fov: 40 },
            ],
            b,
          );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={fase === 2 ? [5, 22] : undefined}>
        {fase === 0 ? (
          <>
            <Shaker p={[-0.75, -0.6, 0]} escala={0.95} rot={[0, b * 2, 0]} nivel={0.7} />
            <Naranja p={[0.55, -0.15, 0.3]} escala={0.9} giro={b * 3} />
            <Reloj p={[0.75, 1.35, -0.4]} escala={1.0} t={lineal(b, 0.05, E1)} />
          </>
        ) : fase === 1 ? (
          <>
            <group position={[0, aire * 0.18, 0]}>
              <Atleta ej="sentadilla" k={0.18 * (1 - aire)} musculo={0.6} brilla={0.3} colorBrillo={K.lima} />
            </group>
            <Piso />
          </>
        ) : (
          <group rotation={[0, b * 0.5, 0]}>
            <HazTendon alto={7} brillo={0.15 + nuevas * 0.3} nuevas={nuevas} b={b} />
          </group>
        )}
        {fase !== 1 ? <Polvo b={b} radio={5} /> : null}
      </Escena3D>
      <Destello b={b} en={[E1, E2]} />
      {fase === 0 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.75, 0.3, 0.4], t: "15 g colágeno", a: 0.1, z: E1, o: [-30, -230], color: K.rosa },
            { p: [0.55, -0.15, 0.6], t: "+ vitamina C", a: 0.16, z: E1, o: [30, 170], color: VITC },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.03} z={E2} t="15 g + VITAMINA C" sub="1 hora antes de entrenar" color={K.lima} y={260} tam={86} />
      <Chip b={b} a={E1 + 0.02} z={E2} t="ENTRENA" x={540} y={1100} color={K.cian} />
      <Dato b={b} a={E2 + 0.02} z={1.1} t="↑ SÍNTESIS" sub="de colágeno en el tendón" color={K.lima} y={260} tam={100} />
      <Chip b={b} a={0.78} z={1.1} t="EVIDENCIA PRELIMINAR" x={540} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 6 · Lo basico: proteina, carga progresiva, descanso ---------------------------------------
const Barra: React.FC<{ discos: number }> = ({ discos }) => (
  <group>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.014, 0.014, 1.5, 12]} />
      <meshStandardMaterial color="#c9d3dc" metalness={0.8} roughness={0.3} />
    </mesh>
    {[1, -1].map((l) =>
      Array.from({ length: discos }).map((_, i) => (
        <mesh key={`${l}${i}`} position={[l * (0.56 + i * 0.045), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.16, 0.035, 28]} />
          <meshStandardMaterial color={i % 2 ? K.naranja : "#2a2f36"} metalness={0.3} roughness={0.5} />
        </mesh>
      )),
    )}
  </group>
);

const Basico: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const reps = b * 5.5;
  const k = Math.sin((reps % 1) * Math.PI);
  const discos = 1 + Math.min(3, Math.floor(reps / 1.4));
  const h = 1.25 * k;
  const r = 2.1 * k;
  const baja = 0.87 - (0.44 * Math.cos(h) + 0.43 * Math.cos(r - h));
  const pie = 0.44 * Math.sin(h) - 0.43 * Math.sin(r - h);
  const cam = camara(
    [
      { b: 0, p: [2.6, 1.4, 5.6], l: [0.3, 0.72, 0], fov: 36 },
      { b: 1, p: [-1.2, 1.3, 6.0], l: [0.3, 0.72, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Atleta ej="sentadilla" k={k} musculo={0.8} brilla={0.2 + 0.4 * k} colorBrillo={K.lima} />
        <group position={[0, -baja, -pie]}>
          <group rotation={[0.35 * k, 0, 0]}>
            <group position={[0, 1.42, 0.55]}>
              <Barra discos={discos} />
            </group>
          </group>
        </group>
        <Piso r={0.85} />
        {b > 0.3 ? (
          <group position={[1.1, 0, 0.3]} scale={entre(b, 0.3, 0.4)}>
            <Plato p={[0, 0.03, 0]} escala={0.5} />
            <Pechuga p={[0, 0.07, 0]} escala={0.5} />
          </group>
        ) : null}
      </Escena3D>
      <Titular b={b} a={0.03} z={1.1} y={260} tam={120} t="Lo básico" color={K.lima} />
      <Chip b={b} a={0.36} z={1.1} t="PROTEÍNA SUFICIENTE" x={540} y={420} color={K.naranja} />
      <Chip b={b} a={0.6} z={1.1} t="CARGA PROGRESIVA" x={540} y={1010} color={K.cian} />
      <Chip b={b} a={0.8} z={1.1} t="DESCANSO" x={540} y={1100} color={K.morado} />
    </AbsoluteFill>
  );
};

const T = [
  "¿El **colágeno** que tomas va directo a tu piel y a tus articulaciones? **No exactamente**.",
  "El colágeno es la proteína más abundante de tu cuerpo: forma **tendones**, ligamentos, piel y hueso.",
  "Cuando lo comes, tu intestino lo rompe en **aminoácidos** y péptidos pequeños, como a cualquier proteína.",
  "Luego tus células, los **fibroblastos**, usan esos aminoácidos para fabricar su propio colágeno donde haga falta.",
  "Y para armarlo necesitan **vitamina C**.",
  "Algunos estudios sugieren que **15 gramos** de colágeno con vitamina C, una hora antes de entrenar, aumentan la síntesis de colágeno en los tendones.",
  "Pero no reemplaza lo básico: **proteína suficiente**, carga progresiva y descanso.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Estructura, Digestion, Fibro, VitC, Estudio, Basico, EscenaCierre];

export const COLAGENO: ShortDef = {
  id: "Short-Colageno",
  titulo: "Colágeno: ¿sirve tomarlo?",
  planos: ESCENAS.map((Escena, i) => ({ id: `colageno-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
