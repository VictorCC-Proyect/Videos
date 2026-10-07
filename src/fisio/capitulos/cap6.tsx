import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../motor";
import { hexPack, Particulas, Polvo, rnd, Tubo } from "../modelos/comun";
import { Humano } from "../modelos/cuerpo";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Tarjeta, TituloGrande } from "../ui";
import { PlacaMotoraEscena } from "./cap1";

const SEC = "1.4 Sistema nervioso en el movimiento";

// ---- Cerebro procedural --------------------------------------------------

const Hemisferio: React.FC<{ lado: number; motor: number; op: number }> = ({ lado, motor, op }) => {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 96, 64);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
      const n = Math.sin(v.x * 11 + v.z * 7) * Math.sin(v.y * 13 - v.z * 5) * 0.035 + Math.sin(v.z * 17 + v.y * 9) * 0.02;
      v.multiplyScalar(1 + n);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useMemo(() => {
    const p = geo.attributes.position as THREE.BufferAttribute;
    const cols = new Float32Array(p.count * 3);
    const base = new THREE.Color("#e9a9a9");
    const mot = new THREE.Color("#ffd166");
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const z = p.getZ(i);
      const enBanda = y > 0.1 && Math.abs(z - 0.1) < 0.16 ? 1 : 0;
      const c = base.clone().lerp(mot, enBanda * motor);
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  }, [geo, motor]);
  return (
    <mesh geometry={geo} position={[lado * 0.44, 0, 0]} scale={[0.46, 0.72, 1.05]}>
      <meshPhysicalMaterial vertexColors roughness={0.55} clearcoat={0.3} transparent={op < 1} opacity={op} depthWrite={op > 0.9} emissive="#ffd166" emissiveIntensity={motor * 0.08} />
    </mesh>
  );
};

const Cerebro: React.FC<{ motor?: number; cerebelo?: number; ganglios?: number; op?: number }> = ({
  motor = 0,
  cerebelo = 0,
  ganglios = 0,
  op = 1,
}) => {
  const geoCb = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 64, 48);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
      v.multiplyScalar(1 + Math.sin(v.y * 40) * 0.025);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <Hemisferio lado={1} motor={motor} op={op} />
      <Hemisferio lado={-1} motor={motor} op={op} />
      <mesh geometry={geoCb} position={[0, -0.62, -0.72]} scale={[0.62, 0.3, 0.38]}>
        <meshPhysicalMaterial color="#d98f9a" emissive="#7cff8a" emissiveIntensity={cerebelo * 0.6} roughness={0.5} />
      </mesh>
      {/* tronco del encefalo y medula */}
      <mesh position={[0, -0.85, -0.3]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.09, 1.0, 20]} />
        <meshPhysicalMaterial color="#e3b0b0" roughness={0.5} />
      </mesh>
      {/* ganglios basales (dentro) */}
      {ganglios > 0
        ? [1, -1].map((s) => (
            <group key={s} position={[s * 0.25, -0.05, 0.05]}>
              <mesh scale={[0.12, 0.2, 0.32]}>
                <sphereGeometry args={[1, 24, 16]} />
                <meshStandardMaterial color="#5ec8ff" emissive="#5ec8ff" emissiveIntensity={0.6 * ganglios} transparent opacity={ganglios} />
              </mesh>
              <mesh position={[s * 0.12, -0.1, 0]} scale={[0.1, 0.14, 0.22]}>
                <sphereGeometry args={[1, 20, 14]} />
                <meshStandardMaterial color="#b48cff" emissive="#b48cff" emissiveIntensity={0.6 * ganglios} transparent opacity={ganglios} />
              </mesh>
            </group>
          ))
        : null}
    </group>
  );
};

const CerebroEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [3.6, 2.0, 3.4], l: [-0.4, -0.1, 0], fov: 40 },
      { b: 1, p: [3.4, -0.1, -3.8], l: [-0.4, -0.4, -0.4], fov: 40 },
      { b: 2, p: [3.2, 1.0, 3.6], l: [-0.4, -0.1, 0], fov: 40 },
      { b: 3, p: [3.6, 1.4, 3.2], l: [-0.4, -0.1, 0], fov: 40 },
    ],
    b,
  );
  const motor = visible(b, 0, 1);
  const cb = visible(b, 1, 2);
  const gb = visible(b, 2, 3);
  // senal que baja de la corteza motora
  const senal: V3[] = [0, 1, 2].map((k) => {
    const t = (b * 1.2 + k / 3) % 1;
    return mix3([0.35, 0.65, 0.1], [0, -1.3, -0.45], t);
  });
  // senal de ida y vuelta al cerebelo
  const bucle: V3[] = [0, 1, 2, 3].map((k) => {
    const a = (b * 2 + k / 4) * Math.PI * 2;
    return [Math.cos(a) * 0.5, -0.35 + Math.sin(a) * 0.3, -0.5];
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, b * 0.15, 0]}>
          <Cerebro motor={motor} cerebelo={cb} ganglios={gb} op={gb > 0.05 ? 0.35 : 1} />
          {motor > 0.1 ? <Particulas pos={senal} radio={0.05} color={C.nervio} /> : null}
          {cb > 0.1 ? <Particulas pos={bucle} radio={0.045} color="#7cff8a" /> : null}
        </group>
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.4, 0.68, 0.1], t: "Corteza motora primaria (lóbulo frontal)", a: 0.1, z: 1, o: [60, -90], color: C.nervio },
          { p: [0, -0.62, -0.95], t: "Cerebelo", a: 1.1, z: 2, o: [-60, 90], color: "#7cff8a" },
          { p: [0.25, -0.05, 0.3], t: "Ganglios basales", a: 2.1, z: 3, o: [80, 80], color: "#5ec8ff" },
        ]}
      />
      <Tarjeta b={b} a={0} z={1} x={60} y={130} w={520} titulo="Corteza motora primaria" color={C.nervio} tam={27}>
        <Lista items={["**Planifica, programa y ejecuta** los movimientos voluntarios", "Envía la **orden inicial** por las vías nerviosas"]} />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={2} x={60} y={130} w={520} titulo="Cerebelo: calibración fina" color="#7cff8a" tam={27}>
        <Lista items={["Recibe la **posición del cuerpo**", "**Compara** la orden con lo que ocurre", "**Ajusta en tiempo real**: coordinación y equilibrio"]} />
      </Tarjeta>
      <Tarjeta b={b} a={2} z={3} x={60} y={130} w={520} titulo="Ganglios basales" color="#5ec8ff" tam={27}>
        <Lista items={["**Seleccionan** los movimientos deseados", "**Inhiben** los involuntarios", "Dan **fluidez y tono**"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ---- Via motora ---------------------------------------------------------

const MEDULA: V3[] = [
  [0, 1.58, -0.02],
  [0, 1.4, -0.05],
  [0, 1.2, -0.06],
  [0, 1.02, -0.05],
];
const NERVIO: V3[] = [
  [0, 1.02, -0.05],
  [0.08, 0.95, -0.02],
  [0.11, 0.85, 0.02],
  [0.12, 0.72, 0.06],
];

const ViaEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.6, 1.5, 2.6], l: [0, 1.3, 0], fov: 38 },
      { b: 1, p: [1.4, 1.0, 2.4], l: [0.05, 0.95, 0], fov: 38 },
      { b: 2, p: [1.2, 0.9, 2.0], l: [0.08, 0.85, 0], fov: 38 },
    ],
    b,
  );
  const t = (b * 0.9) % 1;
  const camino = [...MEDULA, ...NERVIO.slice(1)];
  const f = Math.min(camino.length - 1.001, t * (camino.length - 1));
  const i = Math.floor(f);
  const pulso = mix3(camino[i], camino[i + 1], f - i);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Humano musculo={0.3} brillaMuslo={Math.max(0, 1 - Math.abs(t - 0.95) * 8)} />
        <mesh position={[0, 1.67, 0]}>
          <sphereGeometry args={[0.09, 24, 18]} />
          <meshStandardMaterial color="#e9a9a9" emissive={C.nervio} emissiveIntensity={visible(b, 0, 1) * 0.6} />
        </mesh>
        <Tubo puntos={MEDULA} radio={0.012} color={C.nervio} emisivo={0.4 + visible(b, 0, 1) * 0.8} segmentos={20} />
        <Tubo puntos={NERVIO} radio={0.007} color={C.nervio} emisivo={0.4 + visible(b, 1, 2) * 0.8} segmentos={20} />
        <Particulas pos={[pulso]} radio={0.016} color="#ffffff" brillo={3} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, 1.67, 0.05], t: "Cerebro", a: 0, z: 1, o: [80, -60], color: C.nervio },
          { p: [0, 1.25, -0.06], t: "Médula espinal", a: 0.1, z: 1, o: [-90, 0], color: C.nervio },
          { p: [0.11, 0.85, 0.02], t: "Motoneurona (SNP)", a: 1, z: 2, o: [80, -40], color: C.nervio },
          { p: [0.12, 0.72, 0.06], t: "Fibras musculares", a: 1.2, z: 2, o: [80, 60], color: C.musculoClaro },
        ]}
      />
      <Tarjeta b={b} a={0} z={1} x={60} y={130} w={500} titulo="SNC" color={C.nervio} tam={28}>
        <Lista items={["**Cerebro + médula espinal**", "Aquí **nace el impulso** eléctrico"]} />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={2} x={60} y={130} w={500} titulo="SNP" color={C.nervio} tam={28}>
        <Lista items={["**Motoneuronas**: de la médula a las **fibras musculares**"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ---- Unidad motora ------------------------------------------------------

const UnidadMotoraEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const celdas = useMemo(() => hexPack(1.5, 0.2), []);
  const unidad = (i: number) => Math.floor(rnd(`u${i}`) * 3);
  const cam = camara(
    [
      { b: 0, p: [0, 3.6, 3.4], l: [0, 0.3, 0], fov: 40 },
      { b: 2, p: [0.8, 3.2, 3.0], l: [0, 0.3, 0], fov: 40 },
    ],
    b,
  );
  // b1: dispara la unidad 0 (todas sus fibras a la vez); luego la 1
  const disp0 = b > 1 ? Math.max(0, Math.sin((b - 1) * 14)) : 0;
  const disp1 = b > 1.5 ? Math.max(0, Math.sin((b - 1.5) * 10)) : 0;
  const colU = ["#ffd166", "#5ec8ff", "#7cff8a"];
  const fibrasU0 = celdas.map((c, i) => ({ c, i })).filter(({ i }) => unidad(i) === 0).slice(0, 14);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {celdas.map(([x, z], i) => {
          const u = unidad(i);
          const brillo = u === 0 ? disp0 : u === 1 ? disp1 : 0;
          const marca = b < 1 ? visible(b, 0.3, 1.1) : 1;
          const col = brillo > 0.1 ? colU[u] : C.musculo;
          return (
            <mesh key={i} position={[x, 0, z]} scale={[1, 1 + brillo * 0.15, 1]}>
              <cylinderGeometry args={[0.093, 0.093, 0.3, 7]} />
              <meshPhysicalMaterial color={col} emissive={colU[u]} emissiveIntensity={brillo * 1.2 + (u === 0 ? marca * 0.15 : 0)} roughness={0.45} />
            </mesh>
          );
        })}
        {/* motoneurona de la unidad 0 con sus ramas */}
        <Tubo puntos={[[-0.2, 2.2, -0.4], [-0.1, 1.4, -0.2], [0, 0.9, 0]]} radio={0.03} color={colU[0]} emisivo={0.4 + disp0} segmentos={20} />
        {fibrasU0.map(({ c: [x, z], i }) => (
          <Tubo key={i} puntos={[[0, 0.9, 0], [x * 0.5, 0.55, z * 0.5], [x, 0.16, z]]} radio={0.012} color={colU[0]} emisivo={0.3 + disp0} segmentos={10} />
        ))}
        <mesh position={[-0.2, 2.25, -0.4]}>
          <sphereGeometry args={[0.12, 20, 16]} />
          <meshStandardMaterial color={colU[0]} emissive={colU[0]} emissiveIntensity={0.4 + disp0} />
        </mesh>
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.2, 2.25, -0.4], t: "1 motoneurona", a: 0.1, z: 2, o: [80, -40], color: colU[0] },
          { p: [fibrasU0[0].c[0], 0.16, fibrasU0[0].c[1]], t: "+ todas las fibras que inerva", a: 0.3, z: 2, o: [80, 80], color: colU[0] },
        ]}
      />
      {b > 1 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FUENTE, fontSize: 48, fontWeight: 900, color: C.acento2 }}>
          Ley del todo o nada
        </div>
      ) : null}
      <Tarjeta b={b} a={0} z={1} x={1300} y={130} w={560} titulo="Tamaño de la unidad motora" color={colU[0]} tam={27}>
        <Lista items={["**Pocas fibras**: músculos finos (ojo) → precisión", "**Cientos de fibras**: músculos grandes (cuádriceps) → fuerza"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ---- Propiocepcion -----------------------------------------------------

const PropiocepcionEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.8, 5.4], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [-0.3, 0.6, 2.8], l: [-0.2, 0, 0], fov: 40 },
      { b: 2, p: [1.6, 0.6, 3.0], l: [1.6, 0, 0], fov: 40 },
      { b: 3, p: [1.6, 0.6, 3.0], l: [1.6, 0, 0], fov: 40 },
    ],
    b,
  );
  // b1: estiramiento -> huso se activa -> reflejo (contraccion)
  const estira = b > 1 && b < 2 ? Math.max(0, Math.sin((b - 1) * Math.PI * 2)) : 0;
  const reflejo = b > 1 && b < 2 ? Math.max(0, Math.sin((b - 1.25) * Math.PI * 2)) * 0.6 : 0;
  // b2: contraccion fuerte -> tension -> OTG -> inhibicion -> relajacion
  const tension = b > 2 && b < 3 ? entre(b, 2.05, 2.4) * (1 - entre(b, 2.6, 2.85)) : 0;
  const largoMus = 1 + estira * 0.18 - reflejo * 0.1 - tension * 0.12;
  const senalHuso = estira > 0.4 ? [0, 1, 2].map((k): V3 => [-0.2, mix(0.2, 2.0, ((b * 2 + k / 3) % 1)), 0.25]) : [];
  const senalOTG = tension > 0.5 ? [0, 1, 2].map((k): V3 => [1.65, mix(0.25, 2.0, ((b * 2 + k / 3) % 1)), 0.2]) : [];
  const inhibe = b > 2.4 && b < 2.85 ? [0, 1, 2].map((k): V3 => [0.4, mix(2.0, 0.3, lineal((b * 2.5 + k / 3) % 1, 0, 1)), 0.3]) : [];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {/* huesos de los extremos */}
        <mesh position={[-2.6, 0, 0]}>
          <boxGeometry args={[0.5, 1.2, 0.8]} />
          <meshStandardMaterial color={C.hueso} />
        </mesh>
        <mesh position={[2.6, 0, 0]}>
          <boxGeometry args={[0.5, 1.2, 0.8]} />
          <meshStandardMaterial color={C.hueso} />
        </mesh>
        {/* musculo */}
        <group scale={[largoMus, 1 / Math.sqrt(largoMus), 1 / Math.sqrt(largoMus)]} position={[-0.25, 0, 0]}>
          <mesh scale={[1.4, 0.5, 0.45]}>
            <sphereGeometry args={[1, 40, 28]} />
            <meshPhysicalMaterial color={C.musculo} emissive={C.musculoClaro} emissiveIntensity={reflejo * 0.6 + tension * 0.5} transparent opacity={0.45} roughness={0.4} clearcoat={0.4} depthWrite={false} />
          </mesh>
          {/* huso neuromuscular */}
          <group position={[0, 0, 0.1]}>
            <mesh scale={[0.6, 0.09, 0.09]}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshPhysicalMaterial color="#c8e6ff" transparent opacity={0.5} />
            </mesh>
            {Array.from({ length: 30 }).map((_, i) => {
              const a = i * 0.9;
              return (
                <mesh key={i} position={[-0.15 + i * 0.01, Math.cos(a) * 0.06, Math.sin(a) * 0.06]}>
                  <sphereGeometry args={[0.012, 6, 4]} />
                  <meshStandardMaterial color={C.nervio} emissive={C.nervio} emissiveIntensity={0.4 + estira * 2} />
                </mesh>
              );
            })}
          </group>
        </group>
        {/* tendones */}
        <Tubo puntos={[[-2.35, 0, 0], [-1.9, 0, 0], [-1.55 * largoMus - 0.25, 0, 0]]} radio={0.08} color="#f3efe4" segmentos={10} />
        <Tubo puntos={[[1.15 * largoMus, 0, 0], [1.8, 0, 0], [2.35, 0, 0]]} radio={0.08} color="#f3efe4" emisivo={tension * 0.4} segmentos={10} />
        {/* organo tendinoso de Golgi */}
        <group position={[1.65, 0, 0]}>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = i * 1.2;
            return (
              <mesh key={i} position={[-0.15 + i * 0.02, Math.cos(a) * 0.1, Math.sin(a) * 0.1]}>
                <sphereGeometry args={[0.014, 6, 4]} />
                <meshStandardMaterial color="#ff7ad9" emissive="#ff7ad9" emissiveIntensity={0.4 + tension * 2} />
              </mesh>
            );
          })}
        </group>
        {/* nervios sensitivos hacia la medula */}
        <Tubo puntos={[[-0.2, 0.2, 0.25], [-0.2, 1.0, 0.25], [-0.1, 2.0, 0.2]]} radio={0.015} color={C.nervio} emisivo={0.3} segmentos={10} />
        <Tubo puntos={[[1.65, 0.12, 0.2], [1.6, 1.0, 0.2], [1.4, 2.0, 0.2]]} radio={0.015} color="#ff7ad9" emisivo={0.3} segmentos={10} />
        {senalHuso.length ? <Particulas pos={senalHuso} radio={0.04} color={C.nervio} /> : null}
        {senalOTG.length ? <Particulas pos={senalOTG} radio={0.04} color="#ff7ad9" /> : null}
        {inhibe.length ? <Particulas pos={inhibe} radio={0.045} color="#ff4d4d" /> : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.25, 0.08, 0.1], t: "Huso neuromuscular", a: 0.1, z: 2, o: [-60, -110], color: C.nervio },
          { p: [1.65, 0.1, 0.1], t: "Órgano tendinoso de Golgi", a: 0.2, z: 3, o: [60, -110], color: "#ff7ad9" },
          { p: [-0.2, 1.2, 0.25], t: estira > 0.3 ? "¡Estiramiento! → reflejo" : "Longitud y velocidad", a: 1.05, z: 2, o: [-80, -40], color: C.nervio },
          { p: [1.6, 1.2, 0.2], t: tension > 0.4 ? "¡Tensión peligrosa! → inhibe y relaja" : "Mide la tensión", a: 2.05, z: 3, o: [80, -40], color: "#ff7ad9" },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---- Cierre ---------------------------------------------------------------

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
          <Humano fase={b * 6} marcha={1} musculo={0.55} />
        </group>
      </Escena3D>
      <Tarjeta b={b} a={0} z={1.5} x={80} y={150} w={760} titulo="Resumen del aparato locomotor" tam={28}>
        <Lista
          b={b}
          a={0.05}
          paso={0.12}
          items={[
            "**Músculo**: sarcómero, actina-miosina, calcio y ATP",
            "**Fibras**: Tipo I, IIA, IIX y su transición",
            "**Hueso**: células, matriz y remodelado",
            "**Articulaciones**: fibrosas, cartilaginosas y sinoviales",
            "**Tendones y ligamentos**: fuerza, elasticidad y estabilidad",
            "**Sistema nervioso**: orden, unidad motora y propiocepción",
          ]}
        />
      </Tarjeta>
      <TituloGrande b={b} a={1.5} z={2.2} sup="Fisiología del ejercicio" t="¡Éxito en tu examen!" />
    </AbsoluteFill>
  );
};

export const CAP6: PlanoDef[] = [
  {
    id: "cerebro",
    seccion: SEC,
    textos: [
      "**El cerebro como centro de mando. Corteza motora primaria**: ubicada en el **lóbulo frontal**, **planifica, programa y ejecuta** los movimientos voluntarios y envía la **orden inicial** por las vías nerviosas.",
      "**Cerebelo**: el **centro de control y calibración fina**. Recibe información de la **posición del cuerpo**, **compara lo que el cerebro ordenó con lo que ocurre** y **ajusta el movimiento en tiempo real** para la **coordinación y el equilibrio**.",
      "**Ganglios basales**: ayudan a **seleccionar los movimientos deseados** e **inhiben los involuntarios**, dando **fluidez y tono** a la acción motora.",
    ],
    Escena: CerebroEscena,
  },
  {
    id: "via-motora",
    seccion: SEC + " · Del cerebro al músculo",
    textos: [
      "**Sistema nervioso central (SNC)**: formado por el **cerebro y la médula espinal**. Aquí **nace el impulso eléctrico**.",
      "**Sistema nervioso periférico (SNP)**: las **neuronas motoras (motoneuronas)** salen de la médula espinal y extienden sus **axones** hasta llegar directamente a las **fibras musculares**.",
    ],
    Escena: ViaEscena,
  },
  {
    id: "unidad-motora",
    seccion: SEC + " · Unidad motora",
    textos: [
      "**La unidad motora** es la **unidad funcional del movimiento**: **una única motoneurona y todas las fibras musculares que inerva**. Pueden ser **pocas** (músculos finos como los del **ojo**) o **cientos** (músculos grandes como el **cuádriceps**).",
      "**Ley del todo o nada**: cuando una motoneurona se activa, **todas las fibras de su unidad motora se contraen al mismo tiempo**.",
    ],
    Escena: UnidadMotoraEscena,
  },
  {
    id: "placa-motora-sn",
    seccion: SEC + " · La sinapsis: placa motora",
    textos: [
      "**La placa motora (unión neuromuscular)** es el punto de encuentro entre la **terminal de la neurona motora** y el **sarcolema** de la célula muscular. Hasta allí llega el impulso.",
      "**El mensajero químico**: cuando el impulso llega al final de la neurona, se libera el neurotransmisor **acetilcolina (ACh)** al **espacio sináptico**.",
      "La **acetilcolina se une a los receptores** de la célula muscular y genera un **nuevo estímulo eléctrico (potencial de acción)**…",
      "…que **viaja por todo el sarcolema** y **penetra hacia los sarcómeros** para **desencadenar la contracción**.",
    ],
    Escena: PlacaMotoraEscena,
  },
  {
    id: "propiocepcion",
    seccion: SEC + " · Propiocepción",
    textos: [
      "**Los oídos y ojos del músculo: propiocepción.** El sistema nervioso necesita saber **constantemente dónde está el cuerpo** en el espacio para regular el movimiento.",
      "**Huso neuromuscular**: receptores **dentro del músculo** que detectan los **cambios de longitud** y la **velocidad de estiramiento**. Protegen contra la **distensión excesiva** e inician el **reflejo de estiramiento**.",
      "**Órgano tendinoso de Golgi (OTG)**: receptores **en los tendones** que miden la **tensión mecánica**. Si la tensión es **peligrosa**, envían una **señal inhibitoria** que **relaja el músculo** para **evitar lesiones**.",
    ],
    Escena: PropiocepcionEscena,
  },
  {
    id: "cierre",
    seccion: "",
    textos: [
      "Repasamos todo el **aparato locomotor**: del **sarcómero** al **hueso**, las **articulaciones**, los **tendones y ligamentos** y el **control nervioso** del movimiento.",
      "Bibliografía: Guyton y Hall (2021); Wilmore, Costill y Kenney (2019); Kandel y col. (2021); Stewart (2024); Harrison (2018). ¡Mucho éxito en tu examen!",
    ],
    Escena: Cierre,
  },
];

