import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, PlanoDef, useBeat, V3, visible } from "../motor";
import { difusion, Particulas, Polvo, rnd, Tubo } from "../modelos/comun";
import {
  HuesoLargo,
  Osteoblasto,
  Osteocito,
  Osteoclasto,
  Osteona,
  Trabeculas,
} from "../modelos/hueso";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Rico, Tabla, Tarjeta } from "../ui";
import { Pasos } from "./cap1";

const SEC = "1.3 Sistema óseo";

// ---- Superficie de hueso con hoyo de resorcion y osteoide ---------------

const forma = (x: number, z: number) => Math.exp(-((x * x) / 0.8 + (z * z) / 0.35));

export const altura = (x: number, z: number, hoyo: number, relleno: number, capa = 0) =>
  -hoyo * forma(x, z) * (1 - relleno) + capa;

const Superficie: React.FC<{
  hoyo?: number;
  relleno?: number;
  mineral?: number;
  capa?: number; // capa uniforme de osteoide
  opacidad?: number;
  limpia?: number; // zona sin osteoide bajo la celula de revestimiento
}> = ({ hoyo = 0, relleno = 0, mineral = 0, capa = 0, opacidad = 1, limpia = 0 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(12, 6, 120, 60);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const k = `${hoyo.toFixed(3)}-${relleno.toFixed(3)}-${mineral.toFixed(3)}-${capa.toFixed(3)}-${limpia.toFixed(3)}`;
  useMemo(() => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const cols = new Float32Array(pos.count * 3);
    const hueso = new THREE.Color(C.hueso);
    const osteoide = new THREE.Color("#f7a6c0");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const f = forma(x, z);
      const zonaLimpia = limpia > 0 && Math.abs(x - 1.5) < 0.9 && Math.abs(z) < 0.6 ? limpia : 0;
      const capaAqui = capa * (1 - zonaLimpia) * (Math.abs(z) < 0.75 ? 1 : 0);
      pos.setY(i, -hoyo * f * (1 - relleno) + capaAqui);
      const rosa = (relleno > 0 && f > 0.05 ? 1 : 0) * (1 - mineral) + (capaAqui > 0.001 ? 1 : 0);
      const c = hueso.clone().lerp(osteoide, Math.min(1, rosa));
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  }, [geo, k, hoyo, relleno, mineral, capa, limpia]);
  return (
    <group>
      <mesh geometry={geo}>
        <meshPhysicalMaterial vertexColors roughness={0.6} clearcoat={0.2} transparent={opacidad < 1} opacity={opacidad} side={THREE.DoubleSide} />
      </mesh>
      {/* cuerpo de la matriz mineralizada */}
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[12, 2, 6]} />
        <meshPhysicalMaterial color="#e8dcc0" transparent opacity={0.35 * opacidad} roughness={0.7} depthWrite={false} />
      </mesh>
      {/* fibras de colageno dentro de la matriz */}
      {Array.from({ length: 10 }).map((_, i) => {
        const y = -0.4 - rnd(`cy${i}`) * 1.4;
        const z = (rnd(`cz${i}`) - 0.5) * 4;
        return <Tubo key={i} puntos={[[-6, y, z], [0, y + 0.05, z + 0.1], [6, y, z]]} radio={0.02} color={C.colageno} opacidad={0.5 * opacidad} segmentos={12} />;
      })}
    </group>
  );
};

/** Red de osteocitos dentro de la matriz. */
const RED: V3[] = [
  [-2.4, -0.7, -0.6],
  [-1.2, -1.1, 0.4],
  [0, -0.85, -0.2],
  [1.3, -1.2, 0.5],
  [2.5, -0.75, -0.4],
  [-1.8, -1.6, -0.8],
  [0.6, -1.65, -0.7],
  [2.0, -1.7, 0.6],
];
const ENLACES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 1],
  [2, 6],
  [6, 3],
  [3, 7],
  [7, 4],
];

const RedOsteocitos: React.FC<{ brillo?: number; muere?: number; aSuperficie?: boolean }> = ({
  brillo = 0,
  muere = 0,
  aSuperficie = true,
}) => (
  <group>
    {RED.map((p, i) => {
      const dend: V3[] = ENLACES.filter(([a]) => a === i).map(([, z]) => RED[z]);
      if (aSuperficie && p[1] > -1.0) dend.push([p[0] + 0.2, 0, p[2]]);
      return <Osteocito key={i} pos={p} dendritas={dend} brillo={i === 2 ? brillo : brillo * 0.4} />;
    })}
    {muere > 0 ? (
      <mesh position={RED[3]} scale={[1.6, 0.8, 1.2]}>
        <sphereGeometry args={[0.14, 16, 12]} />
        <meshStandardMaterial color="#555555" transparent opacity={muere} />
      </mesh>
    ) : null}
  </group>
);

// ===================================================================

const SuperficieCelulas: React.FC<{ b: number }> = ({ b }) => (
  <group>
    <Superficie opacidad={0.75} />
    <RedOsteocitos />
    {[-3.0, -2.55, -2.1, -1.65].map((x, i) => (
      <Osteoblasto key={i} pos={[x, 0, 0]} brillo={visible(b, 1.2, 2) * 0.4} />
    ))}
    {[0.2, 0.9].map((x, i) => (
      <Osteoblasto key={i} pos={[x, 0, 0.3]} aplanado={1} />
    ))}
    <Osteoclasto pos={[2.4, 0, 0]} />
    {/* celula osteogenica (madre) */}
    <mesh position={[-4.2, 0.3, 0.2]}>
      <sphereGeometry args={[0.22, 20, 16]} />
      <meshPhysicalMaterial color="#c9f0ff" emissive="#8fd8ff" emissiveIntensity={0.3} clearcoat={0.6} />
    </mesh>
  </group>
);

const HuesoIntro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const enHueso = b < 1;
  const cam = enHueso
    ? camara(
        [
          { b: 0, p: [0, 0.3, 8.4], l: [-0.8, 0, 0], fov: 40 },
          { b: 1, p: [1.8, 0.6, 7.0], l: [-0.6, 0.2, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: 1, p: [-0.4, 2.2, 5.6], l: [-0.6, -0.3, 0], fov: 40 },
          { b: 2, p: [0.0, 1.8, 5.0], l: [-0.6, -0.4, 0], fov: 40 },
        ],
        b,
      );
  const flash = Math.max(0, 1 - Math.abs(b - 1) / 0.07);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {enHueso ? (
          <group rotation={[0.25, b * 2.2, 0.15]}>
            <HuesoLargo corte={entre(b, 0.45, 0.8)} />
          </group>
        ) : (
          <SuperficieCelulas b={b} />
        )}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-4.2, 0.3, 0.2], t: "Célula osteogénica (madre)", a: 1.1, z: 2, o: [-40, -90], color: "#8fd8ff" },
          { p: [-2.3, 0.4, 0], t: "Osteoblastos: forman matriz", a: 1.2, z: 2, o: [-60, -150], color: C.osteoblasto },
          { p: [0.55, 0.1, 0.3], t: "Células de revestimiento", a: 1.3, z: 2, o: [-30, -140], color: "#9fd1ff" },
          { p: [2.4, 0.45, 0], t: "Osteoclasto: reabsorbe", a: 1.4, z: 2, o: [60, -110], color: C.osteoclasto },
          { p: RED[2], t: "Osteocito: mantiene el tejido", a: 1.5, z: 2, o: [80, 110], color: C.osteocito },
        ]}
      />
      <Tarjeta b={b} a={0} z={1} x={1300} y={130} w={560} titulo="Funciones del hueso" color={C.hueso} tam={28}>
        <Lista
          b={b}
          a={0.1}
          paso={0.15}
          items={["**Locomoción**", "**Soporte y protección** de tejidos blandos", "**Almacén de calcio y fosfato**", "**Alojamiento de la médula ósea**"]}
        />
      </Tarjeta>
      <AbsoluteFill style={{ background: "#000", opacity: flash }} />
    </AbsoluteFill>
  );
};

// ===================================================================

const FILA = [-2.25, -1.5, -0.75, 0, 0.75, 1.5, 2.25];

const OsteoblastosEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 2.4, 5.4], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [-2.6, 1.3, 3.8], l: [-3.2, 0.3, 0.5], fov: 40 },
      { b: 2, p: [0.4, 0.9, 2.0], l: [0, 0.2, 0], fov: 40 },
      { b: 3, p: [0.6, 1.4, 3.2], l: [0, 0.1, 0], fov: 40 },
      { b: 5, p: [1.6, 1.8, 4.2], l: [1.0, 0.1, 0], fov: 40 },
      { b: 6, p: [0, 2.0, 4.6], l: [0, -0.2, 0], fov: 40 },
    ],
    b,
  );
  const capa = entre(b, 3.1, 3.8) * 0.12;
  // vesiculas de matriz que se convierten en cristales
  const ves = Array.from({ length: 16 }).map((_, i): V3 => {
    const x = FILA[i % FILA.length] + (rnd(`vx${i}`) - 0.5) * 0.3;
    const t = lineal(b, 4.05 + (i % 5) * 0.05, 4.5 + (i % 5) * 0.05);
    return [x, mix(0.1, capa * 0.5, t), (rnd(`vz${i}`) - 0.5) * 0.6];
  });
  const cristal = entre(b, 4.45, 4.8);
  const senal = lineal(b, 5.1, 5.8);
  // destinos (b6): 0 apoptosis, 3 revestimiento, 5 osteocito
  const muere = entre(b, 6.1, 6.5);
  const aplana = entre(b, 6.3, 6.7);
  const hunde = entre(b, 6.5, 6.95);
  // diferenciacion MSC -> osteoblasto
  const dif = entre(b, 1.2, 1.8);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Superficie capa={capa} mineral={0} opacidad={0.9} />
        {FILA.map((x, i) => {
          const y = capa;
          if (i === 1) return <Osteoblasto key={i} pos={[x, y, 0]} op={1 - muere} />;
          if (i === 3) return <Osteoblasto key={i} pos={[x, y, 0]} aplanado={aplana} />;
          if (i === 5) return <Osteoblasto key={i} pos={[x, y - hunde * 0.8, 0]} brillo={hunde * 0.3} />;
          return <Osteoblasto key={i} pos={[x, y, 0]} brillo={visible(b, 2, 3) * 0.3} />;
        })}
        {hunde > 0.6 ? (
          <Osteocito pos={[FILA[5], capa - 0.65, 0]} dendritas={[[FILA[5] + 0.5, capa - 0.3, 0.2], [FILA[5] - 0.4, capa - 0.9, -0.2]]} brillo={0.4} />
        ) : null}
        {/* MSC que se diferencia */}
        {b > 0.9 && b < 2.1 ? (
          <group position={[-3.6, 0.25, 1.0]}>
            <mesh scale={[1 - dif * 0.2, 1 - dif * 0.2, 1 - dif * 0.2]}>
              {dif < 0.5 ? <sphereGeometry args={[0.22, 20, 16]} /> : <boxGeometry args={[0.38, 0.38, 0.38]} />}
              <meshPhysicalMaterial color={dif < 0.5 ? "#c9f0ff" : C.osteoblasto} emissive="#8fd8ff" emissiveIntensity={0.3} clearcoat={0.6} />
            </mesh>
          </group>
        ) : null}
        {/* colageno secretado (fibras rosadas) */}
        {capa > 0.01
          ? FILA.map((x, i) => (
              <Tubo key={`c${i}`} puntos={[[x - 0.35, capa * 0.6, -0.3], [x, capa * 0.7, 0], [x + 0.35, capa * 0.6, 0.3]]} radio={0.015} color="#ffd0dd" segmentos={8} />
            ))
          : null}
        {b > 4 && b < 5 ? <Particulas pos={ves} radio={0.04 * (1 - cristal)} color="#b4f5ff" /> : null}
        {cristal > 0 && b < 7
          ? ves.map((p, i) => (
              <mesh key={`k${i}`} position={[p[0], capa * 0.5, p[2]]} rotation={[0, i, 0.4]} scale={cristal}>
                <cylinderGeometry args={[0.025, 0.025, 0.14, 6]} />
                <meshStandardMaterial color="#ffffff" emissive="#dff7ff" emissiveIntensity={0.6} />
              </mesh>
            ))
          : null}
        {senal > 0 && senal < 1 ? (
          <>
            <Particulas pos={[0, 1, 2, 3].map((k): V3 => [mix(1.5, 3.6, senal) + k * 0.1, 0.5 + Math.sin(senal * 6 + k) * 0.1, k * 0.1])} radio={0.05} color="#ffd166" />
            <Osteoclasto pos={[3.8, 0, 0]} op={0.5 + senal * 0.5} escala={0.6 + 0.3 * senal} />
          </>
        ) : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, 0.45, 0], t: "Capa continua de osteoblastos", a: 0.1, z: 1, o: [60, -100], color: C.osteoblasto },
          { p: [-3.6, 0.3, 1.0], t: "Célula madre mesenquimal → osteoblasto", a: 1.05, z: 2, o: [60, -150], color: "#8fd8ff" },
          { p: [0, 0.4, 0.19], t: "Cúbico y polarizado", a: 2.1, z: 3, o: [60, -100], color: C.osteoblasto },
          { p: [0.3, 0.27, 0.19], t: "RER + Golgi: fábrica de proteínas", a: 2.3, z: 3, o: [80, 60], color: C.acento },
          { p: [0.4, 0.06, 0.4], t: "Osteoide (colágeno I)", a: 3.2, z: 4, o: [60, 80], color: "#ff8fb1" },
          { p: [0.2, 0.06, 0.2], t: "Hidroxiapatita", a: 4.4, z: 5, o: [70, 90], color: "#dff7ff" },
          { p: [3.8, 0.3, 0], t: "Activa a los osteoclastos", a: 5.3, z: 6, o: [-60, -100], color: "#ffd166" },
          { p: [FILA[1], 0.35, 0], t: "Apoptosis", a: 6.3, z: 7, o: [-30, -110], color: "#aaaaaa" },
          { p: [FILA[3], 0.1, 0], t: "Célula de revestimiento", a: 6.5, z: 7, o: [0, -130], color: "#9fd1ff" },
          { p: [FILA[5], -0.5, 0], t: "Osteocito", a: 6.7, z: 7, o: [60, 70], color: C.osteocito },
        ]}
      />
      <Tarjeta b={b} a={1} z={2} x={60} y={130} w={500} titulo="Genes de diferenciación" color="#8fd8ff" tam={28}>
        <Lista items={["**Runx2**: el gen maestro", "**Osterix (Osx)**"]} />
      </Tarjeta>
      <Tarjeta b={b} a={3} z={4} x={60} y={130} w={500} titulo="Osteoide" color="#ff8fb1" tam={26}>
        <Lista items={["**Colágeno tipo I**", "Osteocalcina", "Osteonectina", "Sialoproteína ósea"]} />
      </Tarjeta>
      <Tarjeta b={b} a={4} z={5} x={60} y={130} w={500} titulo="Mineralización" color="#b4f5ff" tam={26}>
        <Rico t="Vesículas con **fosfatasa alcalina** → Ca²⁺ + fosfato → cristales de **hidroxiapatita**" />
      </Tarjeta>
      <Tarjeta b={b} a={6} z={7} x={60} y={130} w={500} titulo="3 destinos del osteoblasto" color={C.acento2} tam={26}>
        <Lista items={["**Apoptosis**", "**Célula de revestimiento**", "**Osteocito**"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================

const RevestimientoEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.6, 1.4, 4.0], l: [0.6, -0.2, 0], fov: 40 },
      { b: 1, p: [0.6, 0.4, 4.0], l: [0.6, -0.6, 0], fov: 40 },
      { b: 2, p: [-0.4, 1.6, 3.4], l: [0, 0, 0], fov: 40 },
      { b: 3, p: [1.6, 1.4, 2.8], l: [1.5, 0, 0], fov: 40 },
    ],
    b,
  );
  const limpia = entre(b, 3.2, 3.8);
  // iones que intentan pasar y son frenados por la barrera
  const iones = Array.from({ length: 14 }).map((_, i): V3 => {
    const t = (b * 0.8 + rnd(`io${i}`)) % 1;
    const x = -2 + (i % 7) * 0.6;
    const y = 1.0 - Math.min(t, 0.5) * 1.6 + Math.max(0, t - 0.5) * 1.6;
    return [x, y, (rnd(`iz${i}`) - 0.5) * 0.8];
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Superficie capa={0.05} limpia={limpia} opacidad={0.8} />
        <RedOsteocitos brillo={visible(b, 1, 2) * 0.6} />
        {[-2.1, -1.0, 0.1, 1.5].map((x, i) => (
          <Osteoblasto key={i} pos={[x, 0.04, 0]} aplanado={1} brillo={visible(b, 0, 1) * 0.3} />
        ))}
        {b > 2 && b < 3 ? <Particulas pos={iones} radio={0.04} color={C.calcio} /> : null}
        {b > 3.1 && b < 4
          ? <Particulas pos={[0, 1, 2, 3, 4].map((k): V3 => [1.2 + k * 0.15, 0.08, -0.3 + (k % 2) * 0.4])} radio={0.035} color="#ff5ad1" opacidad={1 - limpia} />
          : null}
        {b > 3.6 ? <Osteoclasto pos={[3.4 - entre(b, 3.6, 4) * 1.6, 0, 0]} op={entre(b, 3.6, 3.8)} escala={0.8} /> : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.1, 0.08, 0], t: "Célula de revestimiento (aplanada)", a: 0.1, z: 1, o: [60, -110], color: "#9fd1ff" },
          { p: RED[2], t: "Osteocito", a: 1.1, z: 2, o: [80, 60], color: C.osteocito },
          { p: [0.2, -0.45, -0.2], t: "Prolongaciones por canalículos", a: 1.2, z: 2, o: [-80, 80], color: C.osteocito },
          { p: [-1.4, 0.6, 0], t: "Barrera: regula el paso de iones", a: 2.1, z: 3, o: [-60, -90], color: C.calcio },
          { p: [1.5, 0.08, 0], t: "Metaloproteinasas digieren el osteoide", a: 3.15, z: 4, o: [-80, -110], color: "#ff5ad1" },
        ]}
      />
      <Tarjeta b={b} a={2} z={4} x={1320} y={130} w={540} titulo="Funciones" color="#9fd1ff" tam={27}>
        <Lista items={["**Barrera**: separa el hueso del líquido intersticial y de la médula", b > 3 ? "**Prepara la resorción**: expone el hueso mineralizado para el osteoclasto" : ""].filter(Boolean)} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================

const OsteocitosEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.6, 4.6], l: [0, -1.0, 0], fov: 40 },
      { b: 1, p: [0.8, -0.6, 2.4], l: [0.4, -1.1, 0], fov: 40 },
      { b: 2, p: [0, 1.2, 4.8], l: [0, -0.9, 0], fov: 40 },
      { b: 4, p: [0.6, 1.2, 4.6], l: [0.4, -0.8, 0], fov: 40 },
    ],
    b,
  );
  const carga = visible(b, 2, 3);
  const flex = carga * Math.max(0, Math.sin((b - 2) * 18)) * 0.12;
  // flujo de fluido por los canaliculos
  const flujo = ENLACES.flatMap(([a, z], k) =>
    [0, 0.33, 0.66].map((o): V3 => {
      const t = (b * 2 + o + k * 0.1) % 1;
      return [mix(RED[a][0], RED[z][0], t), mix(RED[a][1], RED[z][1], t), mix(RED[a][2], RED[z][2], t)];
    }),
  );
  const escl = lineal(b, 3.1, 3.8);
  const muere = entre(b, 4.4, 4.7);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0, -flex, 0]}>
          <Superficie opacidad={0.55} />
          <RedOsteocitos brillo={0.3 + carga * 0.5} muere={muere} />
        </group>
        {carga > 0 ? (
          <mesh position={[0, 0.55 - flex * 2, 0]}>
            <boxGeometry args={[3, 0.25, 1.5]} />
            <meshStandardMaterial color="#5f6b84" metalness={0.6} roughness={0.3} transparent opacity={carga} />
          </mesh>
        ) : null}
        {carga > 0.05 ? <Particulas pos={flujo} radio={0.025} color={C.acento} opacidad={carga} /> : null}
        {escl > 0 && escl < 1
          ? <Particulas pos={[0, 1, 2, 3, 4, 5].map((k): V3 => difusion(RED[k % 5], [RED[k % 5][0] + 0.2, 0.25, 0], escl, `es${k}`, 0.1))} radio={0.045} color="#b14dff" />
          : null}
        {b > 3.1 && b < 4.05 ? (
          <Osteoblasto pos={[0.3, 0, 0]} op={1 - escl * 0.6} />
        ) : null}
        {b > 4.5 ? <Osteoclasto pos={[RED[3][0], 0, 0.2]} op={entre(b, 4.6, 4.85)} escala={0.8} /> : null}
        {b > 4.45 && b < 4.9 ? (
          <Particulas pos={[0, 1, 2].map((k): V3 => [RED[3][0], mix(RED[3][1], 0.2, lineal(b, 4.45 + k * 0.06, 4.75 + k * 0.06)), RED[3][2]])} radio={0.05} color="#ffd166" />
        ) : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: RED[2], t: "Osteocito en su laguna", a: 0.1, z: 2, o: [80, -80], color: C.osteocito },
          { p: [0.65, -1.0, 0.1], t: "Canalículos", a: 1.1, z: 2, o: [80, 80], color: C.osteocito },
          { p: [0, 0.55, 0], t: "Carga / ejercicio", a: 2.1, z: 3, o: [80, -60], color: "#c8d6ff" },
          { p: [-0.6, -0.97, 0.1], t: "Flujo de fluido canalicular", a: 2.3, z: 3, o: [-80, 80], color: C.acento },
          { p: [0.3, 0.3, 0], t: "Esclerostina inhibe la formación", a: 3.2, z: 4, o: [60, -100], color: "#b14dff" },
          { p: RED[3], t: "Osteocito muere → llama al osteoclasto", a: 4.5, z: 5, o: [60, 90], color: "#ffd166" },
        ]}
      />
      <Tarjeta b={b} a={0} z={2} x={1320} y={130} w={540} titulo="Osteocitos" color={C.osteocito} tam={27}>
        <Lista items={["**90–95 %** de las células óseas", "Viven hasta **25 años**", "Forma **dendrítica**, en **lagunas**", "Marcadores: **esclerostina** y **DMP1**"]} />
      </Tarjeta>
      <Tarjeta b={b} a={2} z={5} x={1320} y={130} w={540} titulo="Funciones" color={C.osteocito} tam={27}>
        <Lista
          items={[
            "**Mecanosensores** del esfuerzo",
            b > 3 ? "**Orquestan el remodelado**" : "",
            b > 4 ? "**Homeostasis mineral** (Ca y P)" : "",
            b > 4 ? "Su **apoptosis** señala la resorción" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================

const OsteoclastosEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.6, 4.2], l: [0, 0.2, 0], fov: 40 },
      { b: 1, p: [1.2, 0.9, 2.8], l: [0, 0, 0], fov: 40 },
      { b: 2, p: [0.3, 0.4, 2.4], l: [0, -0.15, 0], fov: 40 },
      { b: 3, p: [0, 2.0, 4.0], l: [0, 0.4, 0], fov: 40 },
    ],
    b,
  );
  const hoyo = entre(b, 1.0, 3.6) * 0.42;
  const hplus = Array.from({ length: 22 }).map((_, i): V3 => {
    const t = (b * 1.5 + rnd(`h${i}`)) % 1;
    const x = (rnd(`hx${i}`) - 0.5) * 1.2;
    return [x, mix(0.05, -hoyo * forma(x, 0) + 0.03, t), (rnd(`hz${i}`) - 0.5) * 0.5];
  });
  const minerales = Array.from({ length: 18 }).map((_, i): V3 => {
    const t = (b * 0.7 + rnd(`m${i}`)) % 1;
    return difusion([(rnd(`mx${i}`) - 0.5) * 0.8, -0.1, 0], [(rnd(`my${i}`) - 0.5) * 3, 2.4, -1.2], t, `mi${i}`, 0.25);
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Superficie hoyo={hoyo} opacidad={0.95} />
        <Osteoclasto pos={[0, -hoyo * 0.55, 0]} brillo={visible(b, 0, 1) * 0.3} />
        {/* vaso sanguineo arriba */}
        {b > 2.8 ? (
          <mesh position={[0, 2.5, -1.2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.35, 0.35, 8, 32, 1, true]} />
            <meshPhysicalMaterial color="#c4162c" transparent opacity={0.45 * entre(b, 2.8, 3.1)} side={2} depthWrite={false} />
          </mesh>
        ) : null}
        {b > 2 && b < 3.2 ? <Particulas pos={hplus} radio={0.025} color="#ff5050" /> : null}
        {b > 3 ? <Particulas pos={minerales} radio={0.035} color={C.calcio} /> : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, 0.55, 0.4], t: "Célula gigante multinucleada", a: 0.1, z: 1, o: [60, -100], color: C.osteoclasto },
          { p: [-0.6, 0.0, 0.45], t: "Borde en cepillo + integrinas", a: 1.1, z: 2, o: [-70, 90], color: "#e3b5ff" },
          { p: [0.3, -0.2, 0.3], t: "Laguna de Howship", a: 1.4, z: 2, o: [80, 90], color: C.hueso },
          { p: [0.2, -0.15, 0.2], t: "H⁺ (bomba H⁺-ATPasa) disuelve hidroxiapatita", a: 2.1, z: 3, o: [80, 80], color: "#ff5050" },
          { p: [-0.3, 0.6, 0.2], t: "Catepsina K + metaloproteinasas: colágeno", a: 2.4, z: 3, o: [-80, -100], color: C.osteoclasto },
          { p: [0, 2.5, -1.2], t: "Calcio y fosfato a la sangre", a: 3.2, z: 4, o: [60, -60], color: C.calcio },
        ]}
      />
      <Tarjeta b={b} a={0} z={1} x={1320} y={130} w={540} titulo="Origen" color={C.osteoclasto} tam={27}>
        <Rico t="Línea **hematopoyética** (como **monocitos y macrófagos**), no mesenquimal." />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================

const Colageno: React.FC<{ y: number; z: number; cristales: number; largo?: number }> = ({ y, z, cristales, largo = 5 }) => {
  const hebra = (s: number): V3[] =>
    Array.from({ length: 50 }).map((_, i) => {
      const x = -largo / 2 + (i / 49) * largo;
      const a = x * 7 + (s * Math.PI * 2) / 3;
      return [x, y + Math.cos(a) * 0.06, z + Math.sin(a) * 0.06];
    });
  return (
    <group>
      {[0, 1, 2].map((s) => (
        <Tubo key={s} puntos={hebra(s)} radio={0.035} color={["#ffd7c9", "#ffc2b0", "#ffe9df"][s]} segmentos={150} />
      ))}
      {cristales > 0
        ? Array.from({ length: 12 }).map((_, i) => (
            <mesh key={i} position={[-largo / 2 + 0.3 + i * (largo / 12), y + 0.14, z]} rotation={[0, 0, Math.PI / 2]} scale={cristales}>
              <cylinderGeometry args={[0.06, 0.06, 0.28, 6]} />
              <meshPhysicalMaterial color="#ffffff" emissive="#cfefff" emissiveIntensity={0.4} roughness={0.15} clearcoat={1} />
            </mesh>
          ))
        : null}
    </group>
  );
};

const MatrizEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-1.2, 0.8, 3.4], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [0.2, 0.7, 2.6], l: [0.2, 0.1, 0], fov: 40 },
      { b: 3, p: [1.6, 1.4, 4.0], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  const cris = entre(b, 1.0, 1.5);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {[-0.6, -0.2, 0.2, 0.6].map((y, i) => (
          <Colageno key={i} y={y} z={(i % 2) * 0.3 - 0.15} cristales={cris} />
        ))}
        {visible(b, 0, 1) > 0
          ? [0, 1, 2, 3, 4, 5].map((i) => (
              <mesh key={i} position={[-1.8 + i * 0.7, -0.95, 0.3]}>
                <sphereGeometry args={[0.07, 12, 10]} />
                <meshStandardMaterial color={["#7cff8a", "#ffd166", "#5ec8ff"][i % 3]} emissive={["#7cff8a", "#ffd166", "#5ec8ff"][i % 3]} emissiveIntensity={0.5} transparent opacity={visible(b, 0, 1)} />
              </mesh>
            ))
          : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.5, 0.6, 0.06], t: "Colágeno tipo I (triple hélice)", a: 0.1, z: 1, o: [-60, -100], color: "#ffc2b0" },
          { p: [-0.4, -0.95, 0.3], t: "Proteínas no colágenas y proteoglicanos", a: 0.3, z: 1, o: [60, 80], color: "#7cff8a" },
          { p: [0.25, 0.74, 0.15], t: "Cristales de hidroxiapatita", a: 1.2, z: 2, o: [60, -90], color: "#cfefff" },
        ]}
      />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-end", padding: "130px 60px" }}>
        <div style={{ width: 520, opacity: visible(b, 0, 2.2), fontFamily: FUENTE, color: C.texto }}>
          <div style={{ display: "flex", height: 70, borderRadius: 12, overflow: "hidden", fontSize: 28, fontWeight: 800 }}>
            <div style={{ width: "30%", background: "#ff9f8f", display: "flex", alignItems: "center", justifyContent: "center", color: "#3a0b0b" }}>30 %</div>
            <div style={{ width: `${70 * Math.max(0.15, entre(b, 0.9, 1.3))}%`, background: "#dff7ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#08263a" }}>70 %</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, marginTop: 8, color: C.suave }}>
            <span>Orgánica (colágeno)</span>
            <span>Inorgánica (mineral)</span>
          </div>
          <div style={{ marginTop: 18, fontSize: 34, fontWeight: 800, color: C.acento, opacity: entre(b, 1, 1.3) }}>
            Ca₁₀(PO₄)₆(OH)₂
          </div>
        </div>
      </AbsoluteFill>
      <Tarjeta b={b} a={2} z={3} x={1320} y={130} w={540} titulo="Importancia" color={C.acento2} tam={26}>
        <Lista items={["**Calidad del colágeno** = resistencia a fracturas (no solo la densidad)", "Libera **señales** de remodelado", "Cambia con nutrición, edad, tratamientos y **hormonas** (la **PTH** ↑ resorción)"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================

const PASOS_REM = ["Activación / señalización", "Resorción (≈ 3 semanas)", "Transición (inversión)", "Formación (≈ 3 meses)", "Mineralización y quiescencia"];
const XS_OB = [-0.9, -0.45, 0, 0.45, 0.9];

const RemodeladoEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.2, 4.4], l: [0, -0.5, 0], fov: 40 },
      { b: 1, p: [0.6, 2.4, 3.4], l: [0, -0.1, 0], fov: 40 },
      { b: 3, p: [-0.4, 2.6, 3.0], l: [0, -0.2, 0], fov: 40 },
      { b: 5, p: [0.4, 2.4, 3.4], l: [0, -0.3, 0], fov: 40 },
    ],
    b,
  );
  const hoyo = entre(b, 1.05, 1.85) * 0.45;
  const relleno = entre(b, 3.1, 3.9);
  const mineral = entre(b, 4.05, 4.6);
  const fusion = entre(b, 0.55, 0.95);
  const ocOp = fusion * (1 - entre(b, 2.05, 2.45));
  const llegaOB = entre(b, 2.55, 3.05);
  const aplana = entre(b, 4.45, 4.9);
  const hunde = entre(b, 4.4, 4.9);
  const precursores = [0, 1, 2, 3].map((k): V3 => {
    const ini: V3 = [k < 2 ? -3 - k * 0.5 : 3 + (k - 2) * 0.5, 1.2, (k % 2) * 0.6 - 0.3];
    return [mix(ini[0], (k - 1.5) * 0.25, entre(b, 0.15, 0.8)), mix(ini[1], 0.35, entre(b, 0.15, 0.8)), mix(ini[2], 0, entre(b, 0.15, 0.8))];
  });
  const senal = [0, 1, 2, 3, 4].map((k): V3 => [(k - 2) * 0.12, mix(-0.85, 0.1, (b * 2 + k * 0.2) % 1), 0]);
  const hplus = Array.from({ length: 16 }).map((_, i): V3 => {
    const x = (rnd(`rh${i}`) - 0.5) * 1.3;
    const t = (b * 1.4 + rnd(`rt${i}`)) % 1;
    return [x, mix(0.1, -hoyo * forma(x, 0), t), (rnd(`rz${i}`) - 0.5) * 0.4];
  });
  const caP = Array.from({ length: 12 }).map((_, i): V3 => difusion([(rnd(`cp${i}`) - 0.5) * 0.8, -0.1, 0], [(rnd(`cq${i}`) - 0.5) * 2, 1.8, -0.6], (b * 0.8 + rnd(`cr${i}`)) % 1, `cp${i}`, 0.2));
  const factores = Array.from({ length: 14 }).map((_, i): V3 => {
    const x = (rnd(`fx${i}`) - 0.5) * 1.4;
    return [x, -hoyo * forma(x, 0) + lineal(b, 2.2, 2.8) * (0.3 + rnd(`fy${i}`) * 0.5), (rnd(`fz${i}`) - 0.5) * 0.4];
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Superficie hoyo={hoyo} relleno={relleno} mineral={mineral} opacidad={0.92} />
        {/* osteocito que detecta la microlesion */}
        <Osteocito pos={[0, -0.95, 0]} brillo={visible(b, 0, 1) * 1.2} dendritas={[[0.6, -0.6, 0.2], [-0.6, -0.7, -0.2], [0, -0.3, 0.1]]} />
        {visible(b, 0, 1) > 0 ? (
          <mesh position={[0.3, -0.5, 0]} rotation={[0, 0, 0.6]}>
            <boxGeometry args={[0.6, 0.02, 0.3]} />
            <meshStandardMaterial color="#ff3b3b" emissive="#ff3b3b" emissiveIntensity={1} transparent opacity={visible(b, 0, 1)} />
          </mesh>
        ) : null}
        {b < 1 ? <Particulas pos={senal} radio={0.04} color="#ffd166" /> : null}
        {b < 1 && fusion < 1 ? <Particulas pos={precursores} radio={0.16} color={C.osteoclasto} opacidad={1 - fusion} brillo={0.4} /> : null}
        <Osteoclasto pos={[0, -hoyo * 0.6, 0]} op={ocOp} escala={1 - entre(b, 2.05, 2.45) * 0.4} />
        {b > 1.1 && b < 2.1 ? <Particulas pos={hplus} radio={0.022} color="#ff5050" /> : null}
        {b > 1.2 && b < 2.2 ? <Particulas pos={caP} radio={0.03} color={C.calcio} /> : null}
        {b > 2.15 && b < 3 ? <Particulas pos={factores} radio={0.03} color="#7cff8a" /> : null}
        {llegaOB > 0
          ? XS_OB.map((x, i) => {
              const yS = altura(x, 0, hoyo, relleno);
              const desde: V3 = [x < 0 ? -3 : 3, 0.8, 0];
              const pos: V3 = [mix(desde[0], x, llegaOB), mix(desde[1], yS, llegaOB) - (i === 2 ? hunde * 0.7 : 0), 0];
              return i === 2 && hunde > 0.7 ? (
                <Osteocito key={i} pos={[x, yS - 0.55, 0]} dendritas={[[x + 0.4, yS - 0.3, 0.1], [x - 0.4, yS - 0.7, 0]]} brillo={0.4} />
              ) : (
                <Osteoblasto key={i} pos={pos} aplanado={i === 2 ? 0 : aplana} brillo={visible(b, 3, 4) * 0.3} />
              );
            })
          : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.3, -0.5, 0], t: "Microlesión", a: 0.05, z: 0.6, o: [80, -60], color: "#ff3b3b" },
          { p: [0, -0.95, 0], t: "Osteocito libera citocinas", a: 0.15, z: 1, o: [-80, 80], color: C.osteocito },
          { p: [-0.6, 0.4, 0], t: "Precursores de osteoclastos", a: 0.3, z: 0.9, o: [-80, -90], color: C.osteoclasto },
          { p: [0, 0.4, 0.3], t: "Osteoclasto: ácido + enzimas", a: 1.1, z: 2, o: [80, -90], color: C.osteoclasto },
          { p: [-0.5, 1.2, -0.3], t: "Ca²⁺ y fosfato a la sangre", a: 1.4, z: 2, o: [-80, -60], color: C.calcio },
          { p: [0, -0.2, 0], t: "Apoptosis + factores de acoplamiento", a: 2.2, z: 3, o: [80, -90], color: "#7cff8a" },
          { p: [-0.45, -0.1, 0], t: "Osteoblastos depositan osteoide", a: 3.15, z: 4, o: [-80, -100], color: "#ff8fb1" },
          { p: [0.8, 0, 0], t: "Células de revestimiento", a: 4.55, z: 5, o: [80, -80], color: "#9fd1ff" },
          { p: [0, -0.55, 0], t: "Nuevo osteocito", a: 4.6, z: 5, o: [-80, 80], color: C.osteocito },
        ]}
      />
      <Pasos titulo="Remodelado óseo" pasos={PASOS_REM} actual={Math.min(4, Math.floor(b))} x={1340} y={130} w={520} tam={26} />
    </AbsoluteFill>
  );
};

// ===================================================================

const EstructuraEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.6, 0.6, 7.6], l: [0.4, 0, 0], fov: 40 },
      { b: 0.9, p: [1.6, 0.6, 7.2], l: [0.4, 0, 0], fov: 40 },
      { b: 1.1, p: [6.6, 2.4, 4.4], l: [6.0, 0, 0], fov: 40 },
      { b: 3, p: [7.2, 2.6, 4.6], l: [6.0, 0, 0], fov: 40 },
      { b: 3.1, p: [-4.6, 1.2, 3.2], l: [-6, 0, 0], fov: 40 },
      { b: 4, p: [-5.2, 1.6, 3.4], l: [-6, 0, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, 0.5, 0.0]}>
          <HuesoLargo corte={1} periostio={1} resalta={b > 1 && b < 3 ? "compacto" : b > 3 ? "esponjoso" : null} />
        </group>
        <group position={[6, 0, 0]} rotation={[0.25, 0.6, 0]}>
          <Osteona pos={[0, 0, 0]} />
          <Osteona pos={[1.4, 0, -0.4]} />
          <Osteona pos={[-1.3, 0, -0.5]} />
          {/* conducto de Volkmann */}
          <mesh position={[0.7, 0.2, -0.2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 1.4, 10]} />
            <meshStandardMaterial color="#e3263a" emissive="#e3263a" emissiveIntensity={0.4} />
          </mesh>
        </group>
        <Trabeculas pos={[-6, 0, 0]} tam={1.1} />
        <Polvo b={b} radio={8} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.3, 1.9, 0.3], t: "Epífisis + cartílago articular", a: 0.05, z: 1, o: [80, -60], color: C.cartilago },
          { p: [0.25, 1.3, 0.2], t: "Metáfisis (línea epifisaria)", a: 0.15, z: 1, o: [100, 0], color: C.hueso },
          { p: [0.27, 0.0, 0.1], t: "Diáfisis + periostio", a: 0.25, z: 1, o: [100, 30], color: "#ffb3a7" },
          { p: [0, -0.5, 0.1], t: "Cavidad medular (médula amarilla)", a: 0.35, z: 1, o: [-90, 60], color: C.medulaAmarilla },
          { p: [0.1, -1.7, 0.2], t: "Hueso esponjoso + médula roja", a: 0.45, z: 1, o: [-90, 40], color: C.medulaRoja },
          { p: [6.05, 1.0, 0.05], t: "Conducto de Havers", a: 1.15, z: 3, o: [60, -90], color: "#e3263a" },
          { p: [6.5, 0.55, 0.5], t: "Osteona (laminillas)", a: 1.25, z: 3, o: [100, 50], color: "#e3cfa7" },
          { p: [6.6, 0.2, -0.1], t: "Conducto de Volkmann", a: 1.35, z: 3, o: [90, 100], color: "#e3263a" },
          { p: [-6, 0.6, 0.6], t: "Trabéculas", a: 3.15, z: 4, o: [80, -80], color: C.hueso },
          { p: [-6.3, -0.4, 0.5], t: "Médula ósea", a: 3.25, z: 4, o: [-80, 80], color: C.medulaRoja },
        ]}
      />
      <Tarjeta b={b} a={1} z={3} x={60} y={130} w={500} titulo="Cortical o compacto · ~80 %" color={C.hueso} tam={27}>
        <Lista items={["Denso y muy calcificado", "**Osteonas** (sistemas de Havers)", "Pared exterior (**diáfisis**)", "Resiste **compresión y torsión**"]} />
      </Tarjeta>
      <Tarjeta b={b} a={3} z={4} x={60} y={130} w={500} titulo="Trabecular o esponjoso · ~20 %" color={C.medulaRoja} tam={27}>
        <Lista items={["Red porosa de **trabéculas**", "Muy vascularizado, con **médula ósea**", "**Alto remodelado**", "**Absorbe impactos** y **reduce el peso**"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================

const HuesoCorto: React.FC = () => (
  <group>
    <mesh scale={[0.6, 0.55, 0.58]}>
      <icosahedronGeometry args={[1, 3]} />
      <meshPhysicalMaterial color={C.hueso} roughness={0.55} clearcoat={0.2} />
    </mesh>
    <mesh position={[0.32, 0.22, 0.25]} scale={[0.25, 0.22, 0.05]} rotation={[0.4, 0.6, 0]}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshPhysicalMaterial color={C.cartilago} transparent opacity={0.8} />
    </mesh>
  </group>
);

const HuesoPlano: React.FC = () => (
  <group rotation={[0.3, 0, 0]}>
    <mesh>
      <sphereGeometry args={[1.6, 48, 24, 0.9, 1.3, 0.6, 0.9]} />
      <meshPhysicalMaterial color={C.hueso} side={THREE.DoubleSide} roughness={0.5} />
    </mesh>
    <mesh>
      <sphereGeometry args={[1.45, 48, 24, 0.9, 1.3, 0.6, 0.9]} />
      <meshPhysicalMaterial color={C.hueso} side={THREE.DoubleSide} roughness={0.5} />
    </mesh>
    {Array.from({ length: 50 }).map((_, i) => {
      const ph = 0.9 + 0.03 + rnd(`pp${i}`) * 1.24;
      const th = 0.6 + 0.02 + rnd(`pt${i}`) * 0.86;
      const r = 1.525;
      const enBorde = i < 18;
      const phh = enBorde ? 0.92 : ph;
      return (
        <mesh key={i} position={[-r * Math.cos(phh) * Math.sin(th), r * Math.cos(th), r * Math.sin(phh) * Math.sin(th)]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshStandardMaterial color={C.medulaRoja} emissive={C.medulaRoja} emissiveIntensity={0.3} />
        </mesh>
      );
    })}
  </group>
);

const Vertebra: React.FC = () => (
  <group>
    <mesh>
      <cylinderGeometry args={[0.5, 0.5, 0.45, 32]} />
      <meshPhysicalMaterial color={C.hueso} roughness={0.55} />
    </mesh>
    <mesh position={[0, 0, -0.75]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.32, 0.09, 12, 32]} />
      <meshPhysicalMaterial color={C.hueso} roughness={0.55} />
    </mesh>
    <mesh position={[0, -0.1, -1.35]} rotation={[0.5, 0, 0]}>
      <boxGeometry args={[0.14, 0.18, 0.6]} />
      <meshPhysicalMaterial color={C.hueso} />
    </mesh>
    {[1, -1].map((s) => (
      <mesh key={s} position={[s * 0.6, 0, -0.75]} rotation={[0, 0, s * 0.2]}>
        <boxGeometry args={[0.5, 0.14, 0.16]} />
        <meshPhysicalMaterial color={C.hueso} />
      </mesh>
    ))}
  </group>
);

const Sesamoideo: React.FC = () => (
  <group>
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.32, 0.32, 3.2, 24, 1, true]} />
      <meshPhysicalMaterial color="#f1f1e6" transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
    <mesh position={[0, 0.1, 0.05]} scale={[0.42, 0.5, 0.2]}>
      <sphereGeometry args={[1, 24, 18]} />
      <meshPhysicalMaterial color={C.hueso} roughness={0.5} clearcoat={0.3} />
    </mesh>
  </group>
);

const TIPOS_X = [-6, -3, 0, 3, 6];

const tablaTipo = (i: number) =>
  [
    {
      titulo: "Huesos largos",
      filas: [
        ["Fémur", "Muslo", "Soporta la mayor parte del peso; palanca principal"],
        ["Tibia", "Pierna (medial)", "Recibe el peso del fémur y lo lleva al pie"],
        ["Peroné", "Pierna (lateral)", "Estabiliza el tobillo; inserción muscular"],
        ["Húmero", "Brazo", "Movilidad del hombro y codo"],
        ["Radio", "Antebrazo (pulgar)", "Pronación y supinación"],
        ["Cúbito", "Antebrazo (meñique)", "Estabiliza el codo"],
        ["Clavícula", "Cintura escapular", "Puntal: une miembro superior y esqueleto axial"],
        ["Metacarpianos", "Mano", "Transmiten fuerzas hacia los dedos"],
        ["Metatarsianos", "Pie", "Distribuyen el peso; arcos del pie"],
        ["Falanges", "Dedos", "Prensión fina / propulsión y equilibrio"],
      ],
    },
    {
      titulo: "Huesos cortos",
      filas: [
        ["Escafoides, semilunar, piramidal, pisiforme", "Carpo proximal", "Unen antebrazo y mano; movilidad fina"],
        ["Trapecio, trapezoide, grande, ganchoso", "Carpo distal", "Estabilidad de la base de la mano"],
        ["Astrágalo", "Tobillo", "Transfiere el peso de la tibia al pie"],
        ["Calcáneo", "Talón", "Apoyo posterior; recibe el impacto"],
        ["Navicular, cuboides, cuneiformes", "Tarso medio y anterior", "Mantienen el arco plantar"],
      ],
    },
    {
      titulo: "Huesos planos",
      filas: [
        ["Frontal", "Cráneo anterior", "Protege lóbulo frontal y ojos"],
        ["Parietales", "Cráneo sup./lateral", "Techo del cráneo; protegen la corteza"],
        ["Occipital", "Cráneo posterior", "Protege el cerebelo; articula con el atlas"],
        ["Escápula", "Tórax posterior", "Inserción de músculos del hombro y brazo"],
        ["Esternón", "Tórax anterior", "Protege corazón; médula ósea roja"],
        ["Costillas (12 pares)", "Caja torácica", "Protegen pulmones y corazón; respiración"],
        ["Ilion", "Pelvis", "Soporta vísceras; anclaje muscular"],
        ["Vómer", "Tabique nasal", "Divide las fosas nasales"],
      ],
    },
    {
      titulo: "Huesos irregulares",
      filas: [
        ["Vértebras (33)", "Columna", "Protegen la médula; soportan peso; flexibilidad"],
        ["Sacro", "Base de la columna", "Transfiere el peso a la pelvis"],
        ["Cóccix", "Extremo inferior", "Anclaje del suelo pélvico"],
        ["Esfenoides", "Base del cráneo", "“Piedra angular”; aloja la hipófisis"],
        ["Etmoides", "Base del cráneo / nariz", "Tabique, órbitas, olfación"],
        ["Maxilar superior", "Cara", "Dientes superiores; piso de las órbitas"],
        ["Mandíbula", "Cara inferior", "Único hueso móvil del cráneo: masticación"],
        ["Cigomáticos", "Pómulos", "Pared lateral de la órbita; absorben impactos"],
        ["Martillo, yunque, estribo", "Oído medio", "Transmiten y amplifican el sonido"],
      ],
    },
    {
      titulo: "Huesos sesamoideos",
      filas: [
        ["Rótula (patela)", "Tendón del cuádriceps", "↑ brazo de palanca: más fuerza de extensión de rodilla"],
        ["Sesamoideos del 1.er metatarsiano", "Flexor corto del dedo gordo", "Soportan el impacto; propulsión al caminar"],
        ["Sesamoideos del 1.er metacarpiano", "Flexor corto y aductor del pulgar", "Más fuerza de prensión y pinza fina"],
        ["Pisiforme (funcional)", "Flexor cubital del carpo", "Punto de apoyo: mejora la tracción"],
      ],
    },
  ][i];

const TiposHueso: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const tipo = Math.min(4, Math.floor(b / 2));
  const keys = TIPOS_X.flatMap((x, i) => [
    { b: i * 2, p: [x + 1.4, 0.8, 4.6] as V3, l: [x + 1.3, 0, 0] as V3, fov: 40 },
    { b: i * 2 + 1.85, p: [x + 1.2, 1.0, 4.4] as V3, l: [x + 1.3, 0, 0] as V3, fov: 40 },
  ]);
  const cam = camara(keys, b);
  const t = tablaTipo(tipo);
  const op = Math.min(entre(b - tipo * 2, 0.02, 0.15), 1 - entre(b - tipo * 2, 1.9, 2));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[TIPOS_X[0], 0, 0]} rotation={[0.2, b * 0.8, 0.2]} scale={0.55}>
          <HuesoLargo corte={visible(b, 0.6, 2.2)} />
        </group>
        <group position={[TIPOS_X[1], 0, 0]} rotation={[0.3, b * 0.6, 0]}>
          <HuesoCorto />
        </group>
        <group position={[TIPOS_X[2] + 0.4, -0.6, 0]} rotation={[0, b * 0.4, 0]}>
          <HuesoPlano />
        </group>
        <group position={[TIPOS_X[3], 0, 0]} rotation={[0.6, b * 0.6, 0]}>
          <Vertebra />
        </group>
        <group position={[TIPOS_X[4], 0, 0]} rotation={[0, b * 0.5, 0.1]}>
          <Sesamoideo />
        </group>
        <Polvo b={b} radio={8} />
      </Escena3D>
      <div
        style={{
          position: "absolute",
          right: 50,
          top: 110,
          width: 1000,
          opacity: op,
          background: "rgba(4,9,20,0.9)",
          borderRadius: 16,
          padding: "16px 22px",
          fontFamily: FUENTE,
          color: C.texto,
          borderTop: `6px solid ${C.hueso}`,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800, color: C.hueso, marginBottom: 6 }}>{t.titulo}</div>
        <Tabla tam={t.filas.length > 8 ? 20 : 22} anchos="1.1fr 1fr 1.9fr" cab={["Hueso", "Ubicación", "Función biomecánica"]} filas={t.filas} />
      </div>
    </AbsoluteFill>
  );
};

// ===================================================================

export const CAP3: PlanoDef[] = [
  {
    id: "hueso-intro",
    seccion: SEC,
    textos: [
      "**1.3 Estructura y función del sistema óseo.** El hueso es un **tejido conectivo mineralizado**. Sus funciones: **locomoción**, **soporte y protección** de tejidos blandos, **almacenamiento de calcio y fosfato** y **alojamiento de la médula ósea**.",
      "Sus células: la **célula osteogénica** (célula madre), el **osteoblasto** (forma la matriz ósea), el **osteocito** (mantiene el tejido), el **osteoclasto** (reabsorbe el hueso) y las **células de revestimiento óseo**.",
    ],
    Escena: HuesoIntro,
  },
  {
    id: "osteoblastos",
    seccion: SEC + " · Osteoblastos",
    textos: [
      "**Osteoblastos**: son entre el **4 % y 6 %** de las células del hueso. Forman una **capa continua** sobre las superficies donde se está formando **hueso nuevo**.",
      "**Origen**: derivan de las **células madre mesenquimales (MSC)**. Su diferenciación depende de los genes **Runx2** (el gen maestro) y **Osterix (Osx)**.",
      "**Morfología**: células **cúbicas y polarizadas**, con **retículo endoplásmico rugoso** y **aparato de Golgi** muy desarrollados, típicos de las células que **sintetizan proteínas**.",
      "**Función 1 – síntesis del osteoide**: secretan la parte orgánica de la matriz: **colágeno tipo I** y proteínas no colágenas (**osteocalcina, osteonectina y sialoproteína ósea**).",
      "**Función 2 – mineralización**: liberan **vesículas de matriz** ricas en **fosfatasa alcalina (FA)**, que acumulan **calcio y fosfato** hasta que cristalizan como **hidroxiapatita** sobre el colágeno y **endurecen el hueso**.",
      "**Función 3 – regulación del remodelado**: producen señales que controlan la **diferenciación y activación de los osteoclastos**, coordinando la pérdida y la formación de hueso.",
      "Al terminar de formar hueso, el osteoblasto tiene **3 caminos**: entrar en **apoptosis** (muerte programada), **aplanarse** como **célula de revestimiento óseo**, o **quedar atrapado** en su matriz calcificada y madurar a **osteocito**.",
    ],
    Escena: OsteoblastosEscena,
  },
  {
    id: "revestimiento",
    seccion: SEC + " · Células de revestimiento",
    textos: [
      "**Células de revestimiento óseo**: son **osteoblastos inactivos** (en reposo) que ya terminaron de formar matriz.",
      "Son **aplanadas (fusiformes)**, con poco citoplasma, y **cubren la mayoría de las superficies óseas** del adulto que no están en remodelado. Se comunican con los **osteocitos** mediante prolongaciones que atraviesan los **canalículos**.",
      "**Función 1 – barrera de protección**: separan el hueso mineralizado del **líquido intersticial** y de las células de la **médula ósea**, regulando el **paso de iones**.",
      "**Función 2 – preparan la resorción**: antes de que llegue el osteoclasto, **limpian y digieren la capa de osteoide** no mineralizado con **metaloproteinasas**, dejando expuesto el hueso para que los **osteoclastos se adhieran**.",
    ],
    Escena: RevestimientoEscena,
  },
  {
    id: "osteocitos",
    seccion: SEC + " · Osteocitos",
    textos: [
      "**Osteocitos**: son el **90–95 %** de las células óseas, las más **abundantes y longevas** (viven hasta **25 años**). Son **osteoblastos maduros** que quedaron **dentro de la matriz mineralizada**.",
      "Viven en cavidades llamadas **lagunas** y tienen forma **dendrítica**: sus prolongaciones viajan por finos túneles llamados **canalículos**. Al madurar expresan **esclerostina** y **DMP1**.",
      "**Función 1 – mecanosensores**: detectan las **deformaciones mecánicas** y el **flujo de fluido canalicular** que produce la **carga física o el ejercicio**.",
      "**Función 2 – orquestadores del remodelado**: regulan a osteoblastos y osteoclastos con señales. Por ejemplo, liberan **esclerostina** para **inhibir la formación de hueso** cuando **no hay carga mecánica**.",
      "**Función 3**: regulan la **homeostasis mineral** (calcio y fosfato). **Función 4**: cuando un osteocito muere por **falta de uso o envejecimiento**, su apoptosis **llama a los osteoclastos** para reabsorber esa zona.",
    ],
    Escena: OsteocitosEscena,
  },
  {
    id: "osteoclastos",
    seccion: SEC + " · Osteoclastos",
    textos: [
      "**Osteoclastos**: a diferencia de osteoblastos y osteocitos, derivan de la **línea hematopoyética** (la misma de **monocitos y macrófagos**). Son células **gigantes, multinucleadas** y muy **polarizadas**.",
      "Se adhieren al hueso mineralizado que van a reabsorber y crean una cavidad llamada **laguna de Howship**. Su **borde en cepillo** se fija al hueso con **integrinas** y forma un **microambiente sellado**.",
      "**Resorción**: con **bombas de protones (H⁺-ATPasa)** acidifican la laguna y **disuelven la hidroxiapatita**; con **catepsina K** y **metaloproteinasas** digieren las **fibras de colágeno**.",
      "Así **liberan calcio y fosfato a la sangre** (homeostasis mineral) y **retiran el hueso viejo, dañado o con microfracturas**, iniciando el ciclo de remodelado.",
    ],
    Escena: OsteoclastosEscena,
  },
  {
    id: "matriz-osea",
    seccion: SEC + " · Matriz ósea",
    textos: [
      "**Matriz ósea extracelular. Fase orgánica (~30 %)**: **90 % colágeno tipo I** (resistencia a la tracción y flexibilidad) más proteínas no colágenas (**osteocalcina, osteonectina, BMPs**) y **proteoglicanos**.",
      "**Fase inorgánica (~70 %)**: cristales de **hidroxiapatita, Ca₁₀(PO₄)₆(OH)₂**, de calcio y fosfato, más **magnesio, sodio y citrato**: dan **rigidez y dureza**.",
      "**Importancia**: la **integridad del colágeno** determina la resistencia a fracturas, no solo la densidad mineral. La matriz **libera señales** de remodelado y cambia con la **nutrición, la edad, los tratamientos y las hormonas** (la **PTH aumenta la resorción**).",
    ],
    Escena: MatrizEscena,
  },
  {
    id: "remodelado",
    seccion: SEC + " · Remodelado óseo",
    textos: [
      "**1. Activación / señalización**: los **osteocitos detectan microlesiones** o cambios de carga y liberan **citocinas** que **reclutan a los precursores de los osteoclastos**.",
      "**2. Resorción**: los osteoclastos se adhieren y secretan **ácido y enzimas lisosómicas**: disuelven el mineral y degradan el colágeno, retirando el **tejido envejecido o dañado** (≈ 3 semanas).",
      "**3. Transición (inversión)**: los osteoclastos terminan y entran en **apoptosis**. Se liberan **factores de acoplamiento** guardados en la matriz, que **detienen la resorción y atraen a los osteoblastos**.",
      "**4. Formación**: los osteoblastos depositan **nueva matriz orgánica no mineralizada** (**osteoide**, sobre todo **colágeno tipo I**) en la cavidad (≈ 3 meses).",
      "**5. Mineralización y quiescencia**: se depositan cristales de **hidroxiapatita** que devuelven la **rigidez** al hueso. Al final, los osteoblastos maduran a **osteocitos** o quedan en reposo como **células de revestimiento**.",
    ],
    Escena: RemodeladoEscena,
  },
  {
    id: "estructura-hueso",
    seccion: SEC + " · Anatomía tisular",
    textos: [
      "**Hueso largo**: **epífisis** (extremos, con **cartílago articular** y hueso esponjoso), **metáfisis** (con la línea epifisaria) y **diáfisis** (cuerpo, cubierta por el **periostio**, con la **cavidad medular** y médula amarilla).",
      "**Hueso cortical o compacto (~80 % de la masa ósea)**: estructura **densa, sólida y muy calcificada**, formada por **osteonas (sistemas de Havers)** con **conductos de Havers y de Volkmann** para vasos y nervios.",
      "Forma la **pared exterior** de los huesos (la **diáfisis**) y brinda resistencia contra la **compresión y la torsión**.",
      "**Hueso trabecular o esponjoso (~20 %)**: red porosa de láminas llamadas **trabéculas**, muy **vascularizada**, con **médula ósea** (roja o amarilla). Tiene **alto remodelado**, **absorbe impactos** y **reduce el peso** del esqueleto.",
    ],
    Escena: EstructuraEscena,
  },
  {
    id: "tipos-hueso",
    seccion: SEC + " · Tipos de huesos",
    textos: [
      "**Huesos largos**: la **longitud predomina**. Patrón tubular: **diáfisis** de hueso compacto alrededor de un **canal medular** y dos **epífisis** de hueso esponjoso. Actúan como **palancas** para la locomoción y la fuerza.",
      "Ejemplos: **fémur, tibia, peroné, húmero, radio, cúbito, clavícula, metacarpianos, metatarsianos y falanges**. El **fémur** soporta la mayor parte del peso corporal y el **radio** permite la **pronación y supinación**.",
      "**Huesos cortos**: miden casi lo mismo en sus tres ejes, como un **cubo**. Núcleo de **hueso esponjoso** con fina cubierta compacta, **sin diáfisis ni cavidad medular**. **Disipan cargas** y permiten **movimientos finos y multidireccionales**.",
      "Ejemplos: los huesos del **carpo** (escafoides, semilunar, piramidal, pisiforme, trapecio, trapezoide, grande y ganchoso) y del **tarso** (**astrágalo**, que recibe el peso de la tibia; **calcáneo**, el talón; navicular, cuboides y cuneiformes).",
      "**Huesos planos**: predominan **largo y ancho** sobre el grosor. Estructura en **sándwich**: dos capas de hueso compacto con hueso esponjoso en medio (el **diploe** en el cráneo). Dan **protección** y amplias zonas de **inserción muscular**.",
      "Ejemplos: **frontal, parietales, occipital, escápula, esternón** (fuente de **médula ósea roja**), **costillas** (12 pares), **ilion** y **vómer**.",
      "**Huesos irregulares**: formas **complejas y asimétricas** adaptadas a funciones específicas. Dan **soporte axial**, **protección neurológica** e inserción a músculos y ligamentos.",
      "Ejemplos: **vértebras** (33), **sacro, cóccix, esfenoides** (aloja la **hipófisis**), **etmoides, maxilar, mandíbula** (el **único hueso móvil del cráneo**), **cigomáticos** y los **huesecillos del oído**.",
      "**Huesos sesamoideos**: pequeños nódulos **dentro de un tendón** o cápsula articular. Cambian el ángulo del tendón para **aumentar el brazo de palanca** del músculo y **reducir la fricción** sobre la articulación.",
      "Ejemplos: la **rótula** (en el tendón del **cuádriceps**: más fuerza de extensión de la rodilla), los sesamoideos del **1.er metatarsiano** y del **1.er metacarpiano**, y el **pisiforme** (sesamoideo funcional).",
    ],
    Escena: TiposHueso,
  },
];
