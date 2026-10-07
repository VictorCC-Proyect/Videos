import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { camara, entre, PlanoDef, useBeat, V3, visible } from "../motor";
import { Particulas, Polvo } from "../modelos/comun";
import { Humano } from "../modelos/cuerpo";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Rico, Tarjeta } from "../ui";

const SEC = "Articulaciones";

const MatHueso: React.FC<{ e?: number; op?: number }> = ({ e = 0, op = 1 }) => (
  <meshPhysicalMaterial
    color={C.hueso}
    emissive={C.hueso}
    emissiveIntensity={e}
    roughness={0.5}
    clearcoat={0.25}
    transparent={op < 1}
    opacity={op}
  />
);

// ---- Modelos de articulaciones ------------------------------------------

/** Sutura: dos placas con borde dentado que encajan. */
const Sutura: React.FC<{ abre?: number; osifica?: number }> = ({ abre = 0, osifica = 0 }) => {
  const dientes = 9;
  return (
    <group>
      {[-1, 1].map((lado) => (
        <group key={lado} position={[lado * (0.02 + abre * 0.3), 0, 0]}>
          <mesh position={[lado * 0.75, 0, 0]}>
            <boxGeometry args={[1.3, 0.18, 1.8]} />
            <MatHueso />
          </mesh>
          {Array.from({ length: dientes }).map((_, i) => {
            const z = -0.8 + (i * 1.6) / (dientes - 1);
            const sale = (i % 2 === 0) === lado > 0;
            return sale ? (
              <mesh key={i} position={[lado * 0.02 - lado * 0.1 + (lado > 0 ? 0 : 0), 0, z]} rotation={[0, 0, lado * Math.PI / 2]}>
                <coneGeometry args={[0.1, 0.24, 4]} />
                <MatHueso />
              </mesh>
            ) : null;
          })}
        </group>
      ))}
      {/* fibras cortas de tejido conectivo */}
      {osifica < 1
        ? Array.from({ length: 14 }).map((_, i) => (
            <mesh key={i} position={[0, 0.095, -0.8 + i * 0.123]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.22 + abre * 0.6, 5]} />
              <meshStandardMaterial color={C.colageno} emissive="#ffffff" emissiveIntensity={0.3} transparent opacity={1 - osifica} />
            </mesh>
          ))
        : null}
      {osifica > 0 ? (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 0.181, 1.8]} />
          <MatHueso op={osifica} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Sindesmosis: dos huesos paralelos unidos por una membrana interosea. */
const Sindesmosis: React.FC<{ giro?: number }> = ({ giro = 0 }) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(0.5, 2.6, 8, 20), []);
  return (
    <group>
      <mesh position={[-0.35, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 3, 20]} />
        <MatHueso />
      </mesh>
      <group position={[0.35, 0, 0]} rotation={[0, 0, giro * 0.12]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.1, 3, 20]} />
          <MatHueso />
        </mesh>
      </group>
      <mesh geometry={geo} rotation={[0, 0, giro * 0.06]}>
        <meshPhysicalMaterial color="#f6e2d2" transparent opacity={0.65} side={THREE.DoubleSide} roughness={0.6} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[0, -1.2 + i * 0.22, 0.01]} rotation={[0, 0, 1.0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.6, 4]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
};

/** Gonfosis: diente en su alveolo con ligamento periodontal. */
const Gonfosis: React.FC = () => (
  <group>
    {/* hueso alveolar (corte) */}
    <mesh position={[0, -0.5, 0]}>
      <boxGeometry args={[1.6, 1.2, 0.9]} />
      <meshPhysicalMaterial color={C.hueso} transparent opacity={0.45} depthWrite={false} roughness={0.6} />
    </mesh>
    {/* corona */}
    <mesh position={[0, 0.45, 0]} scale={[0.42, 0.42, 0.38]}>
      <sphereGeometry args={[1, 24, 18]} />
      <meshPhysicalMaterial color="#fbfbf7" roughness={0.1} clearcoat={1} />
    </mesh>
    {/* raiz */}
    <mesh position={[0, -0.35, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[0.32, 1.1, 24]} />
      <meshPhysicalMaterial color="#f3ead6" roughness={0.3} />
    </mesh>
    {/* ligamento periodontal */}
    {Array.from({ length: 16 }).map((_, i) => {
      const a = (i / 16) * Math.PI * 2;
      const y = -0.1 - (i % 4) * 0.2;
      const r = 0.3 - (i % 4) * 0.06;
      return (
        <mesh key={i} position={[Math.cos(a) * (r + 0.06), y, Math.sin(a) * (r + 0.06)]} rotation={[0, -a, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.14, 4]} />
          <meshStandardMaterial color="#ff9aa8" emissive="#ff6b7d" emissiveIntensity={0.4} />
        </mesh>
      );
    })}
  </group>
);

/** Columna con discos intervertebrales (sinfisis). */
const Columna: React.FC<{ flexion?: number }> = ({ flexion = 0 }) => (
  <group>
    {Array.from({ length: 5 }).map((_, i) => {
      const a = (i - 2) * flexion * 0.12;
      const y = (i - 2) * 0.55;
      return (
        <group key={i} position={[Math.sin(a) * 0.6, y, 0]} rotation={[0, 0, -a]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 0.34, 32]} />
            <MatHueso />
          </mesh>
          <mesh position={[0, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.06, 10, 24]} />
            <MatHueso />
          </mesh>
          {i < 4 ? (
            <mesh position={[0, 0.275, 0]} scale={[1, 1 - Math.abs(flexion) * 0.15, 1]}>
              <cylinderGeometry args={[0.39, 0.39, 0.2, 32]} />
              <meshPhysicalMaterial color="#9fd8ff" transparent opacity={0.85} roughness={0.2} clearcoat={0.8} emissive="#5ec8ff" emissiveIntensity={0.15} />
            </mesh>
          ) : null}
        </group>
      );
    })}
  </group>
);

/** Hueso largo con placa epifisaria (sincondrosis temporal). */
const PlacaEpifisaria: React.FC<{ crece: number; osifica: number }> = ({ crece, osifica }) => (
  <group>
    <mesh position={[0, -0.6 - crece * 0.25, 0]}>
      <cylinderGeometry args={[0.22, 0.22, 1.6 + crece * 0.5, 24]} />
      <MatHueso />
    </mesh>
    <mesh position={[0, 0.32, 0]}>
      <cylinderGeometry args={[0.36, 0.3, 0.1, 32]} />
      <meshPhysicalMaterial color={osifica > 0.5 ? C.hueso : "#7cc8ff"} emissive="#5ec8ff" emissiveIntensity={0.4 * (1 - osifica)} roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.62, 0]} scale={[1, 0.8, 1]}>
      <sphereGeometry args={[0.42, 32, 24]} />
      <MatHueso />
    </mesh>
  </group>
);

/** Articulacion sinovial en corte: rodilla esquematica. */
const Sinovial: React.FC<{ flex: number; resalta?: string }> = ({ flex, resalta = "" }) => {
  const e = (k: string) => (resalta === k ? 0.6 : 0);
  return (
    <group>
      {/* hueso inferior (tibia) */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.32, 0.26, 1.8, 32]} />
        <MatHueso />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.55, 0.4, 0.2, 40]} />
        <MatHueso />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.53, 0.53, 0.05, 40]} />
        <meshPhysicalMaterial color={C.cartilago} emissive={C.cartilago} emissiveIntensity={e("cartilago")} roughness={0.2} clearcoat={0.8} transparent opacity={0.92} />
      </mesh>
      {/* hueso superior (femur) que se flexiona */}
      <group position={[0, 0.32, 0]} rotation={[0, 0, flex]}>
        <mesh position={[0, 0, 0]} scale={[1.2, 0.6, 0.9]}>
          <sphereGeometry args={[0.45, 32, 24]} />
          <MatHueso />
        </mesh>
        <mesh position={[0, -0.02, 0]} scale={[1.22, 0.6, 0.92]}>
          <sphereGeometry args={[0.45, 32, 24]} />
          <meshPhysicalMaterial color={C.cartilago} emissive={C.cartilago} emissiveIntensity={e("cartilago")} roughness={0.2} clearcoat={0.8} />
        </mesh>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.28, 0.34, 1.8, 32]} />
          <MatHueso />
        </mesh>
      </group>
      {/* liquido sinovial */}
      <Particulas
        pos={Array.from({ length: 22 }).map((_, i): V3 => {
          const a = (i / 22) * Math.PI * 2;
          return [Math.cos(a) * 0.45 + Math.sin(flex * 6 + i) * 0.03, 0.04 + (i % 3) * 0.03, Math.sin(a) * 0.35];
        })}
        radio={0.025}
        color="#7fd6ff"
        brillo={0.4 + e("liquido") * 2}
      />
      {/* membrana sinovial y capsula */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.72, 0.68, 0.75, 48, 1, true]} />
        <meshPhysicalMaterial color="#ff9fb3" emissive="#ff9fb3" emissiveIntensity={e("membrana")} transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.8, 0.76, 0.9, 48, 1, true, 0, Math.PI * 1.4]} />
        <meshPhysicalMaterial color="#f6e7d8" emissive="#f6e7d8" emissiveIntensity={e("capsula") * 0.5} transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* ligamentos colaterales */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * 0.84, 0.05, 0.1]} rotation={[0, 0, s * 0.05]}>
          <boxGeometry args={[0.06, 1.2, 0.18]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={e("ligamento")} />
        </mesh>
      ))}
      {/* bolsa sinovial */}
      <mesh position={[0, 0.65, 0.75]} scale={[0.35, 0.2, 0.15]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshPhysicalMaterial color="#7fd6ff" transparent opacity={0.6} emissive="#7fd6ff" emissiveIntensity={e("bolsa")} />
      </mesh>
    </group>
  );
};

// Tipos de articulacion sinovial

const Pivote: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.42, 0.12, 16, 40]} />
      <MatHueso />
    </mesh>
    <group rotation={[0, Math.sin(t * 3) * 1.1, 0]}>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 1.2, 32]} />
        <MatHueso e={0.15} />
      </mesh>
      <mesh position={[0, -0.65, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.18, 0.5, 0.12]} />
        <MatHueso />
      </mesh>
    </group>
  </group>
);

const Bisagra: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.3, 0.3, 0.8, 32]} />
      <MatHueso />
    </mesh>
    <mesh position={[0, 0.85, 0]}>
      <cylinderGeometry args={[0.18, 0.2, 1.2, 24]} />
      <MatHueso />
    </mesh>
    <group rotation={[-0.4 - (0.5 + 0.5 * Math.sin(t * 3)) * 1.6, 0, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 0.6, 32, 1, true, 0, Math.PI]} />
        <MatHueso e={0.15} />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 1.2, 24]} />
        <MatHueso e={0.15} />
      </mesh>
    </group>
  </group>
);

const Condilea: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh scale={[1.4, 0.45, 0.9]} position={[0, -0.02, 0]}>
      <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshPhysicalMaterial color={C.hueso} side={THREE.DoubleSide} roughness={0.5} />
    </mesh>
    <mesh position={[0, -0.6, 0]}>
      <cylinderGeometry args={[0.3, 0.25, 0.9, 24]} />
      <MatHueso />
    </mesh>
    <group rotation={[Math.sin(t * 3) * 0.45, 0, Math.sin(t * 2.2) * 0.3]}>
      <mesh scale={[1.3, 0.55, 0.8]} position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.38, 32, 24]} />
        <MatHueso e={0.15} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 1.0, 24]} />
        <MatHueso e={0.15} />
      </mesh>
    </group>
  </group>
);

const Silla: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1, 24, 24);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      p.setY(i, 0.6 * (x * x - z * z));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={geo}>
        <meshPhysicalMaterial color={C.hueso} side={THREE.DoubleSide} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.6]} />
        <MatHueso />
      </mesh>
      <group rotation={[Math.sin(t * 3) * 0.3, 0, Math.sin(t * 2) * 0.3]}>
        <mesh geometry={geo} rotation={[0, Math.PI / 2, 0]} position={[0, 0.06, 0]}>
          <meshPhysicalMaterial color="#f6efe0" emissive={C.hueso} emissiveIntensity={0.15} side={THREE.DoubleSide} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.2, 0.3, 1.0, 24]} />
          <MatHueso e={0.15} />
        </mesh>
      </group>
    </group>
  );
};

const Esferoidea: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh>
      <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55]} />
      <meshPhysicalMaterial color={C.hueso} side={THREE.DoubleSide} roughness={0.5} />
    </mesh>
    <mesh position={[0, -0.75, 0]}>
      <cylinderGeometry args={[0.3, 0.25, 0.7, 24]} />
      <MatHueso />
    </mesh>
    <group rotation={[Math.sin(t * 2.4) * 0.6, t * 2, Math.cos(t * 2.4) * 0.6]}>
      <mesh>
        <sphereGeometry args={[0.42, 32, 24]} />
        <MatHueso e={0.15} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 1.2, 24]} />
        <MatHueso e={0.15} />
      </mesh>
    </group>
  </group>
);

const Plana: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <mesh position={[0, -0.2, 0]}>
      <boxGeometry args={[0.9, 0.4, 0.7]} />
      <MatHueso />
    </mesh>
    <mesh position={[Math.sin(t * 3) * 0.15, 0.21, Math.cos(t * 2) * 0.08]}>
      <boxGeometry args={[0.8, 0.4, 0.65]} />
      <MatHueso e={0.15} />
    </mesh>
  </group>
);

// ===================================================================

const ClasificacionEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.6, 7.2], l: [0, 0, 0], fov: 40 },
      { b: 3, p: [0.6, 2.0, 6.8], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  const fila = visible(b, 0, 3.2);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[-3, 0.2, 0]} rotation={[0.6, b * 0.3, 0]} scale={0.8}>
          <Sutura />
        </group>
        <group position={[0, 0, 0]} rotation={[0.1, 0.4 + b * 0.2, 0]} scale={0.6}>
          <Columna flexion={Math.sin(b * 3) * 0.6} />
        </group>
        <group position={[3, 0, 0]} rotation={[0, -0.4 + b * 0.15, 0]} scale={0.7}>
          <Sinovial flex={Math.sin(b * 3) * 0.4 + 0.2} />
        </group>
        <Polvo b={b} radio={6} />
      </Escena3D>
      <AbsoluteFill style={{ fontFamily: FUENTE, opacity: fila }}>
        {[
          ["Fibrosa", "Sinartrosis · inmóvil", 330],
          ["Cartilaginosa", "Anfiartrosis · semimóvil", 960],
          ["Sinovial", "Diartrosis · móvil", 1590],
        ].map(([t, f, x], i) => (
          <div key={i} style={{ position: "absolute", left: (x as number) - 230, width: 460, top: 170, textAlign: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: C.acento, opacity: entre(b, 1, 1.2) }}>{t}</div>
            <div style={{ fontSize: 30, color: C.acento2, fontWeight: 700, opacity: entre(b, 2, 2.2) }}>{f}</div>
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FibrosasEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 2.4, 7.4], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [-3.4, 2.2, 2.8], l: [-3.6, 0, 0], fov: 40 },
      { b: 2, p: [0.6, 0.6, 3.6], l: [0, 0, 0], fov: 40 },
      { b: 3, p: [4.0, 1.4, 3.2], l: [3.6, -0.1, 0], fov: 40 },
      { b: 4, p: [4.0, 1.4, 3.2], l: [3.6, -0.1, 0], fov: 40 },
    ],
    b,
  );
  const infancia = visible(b, 1.05, 1.5);
  const osifica = entre(b, 1.55, 1.9);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[-3.6, 0, 0]}>
          <Sutura abre={infancia * Math.max(0, Math.sin((b - 1) * 20)) * 0.12} osifica={osifica} />
        </group>
        <group position={[0, 0, 0]} rotation={[0, 0, 0.0]}>
          <Sindesmosis giro={Math.sin(b * 4) * visible(b, 2, 3)} />
        </group>
        <group position={[3.6, 0, 0]}>
          <Gonfosis />
        </group>
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-3.6, 0.1, 0.4], t: "Sutura (cráneo)", a: 0.1, z: 1, o: [-60, -100], color: C.acento },
          { p: [0, 0.8, 0], t: "Sindesmosis", a: 0.2, z: 1, o: [60, -80], color: C.acento },
          { p: [3.6, 0.7, 0], t: "Gonfosis", a: 0.3, z: 1, o: [60, -80], color: C.acento },
          { p: [-3.6, 0.1, 0.2], t: "Bordes dentados + fibras cortas", a: 1.05, z: 1.6, o: [60, -110], color: C.colageno },
          { p: [-3.6, 0.1, 0.2], t: "Adulto: se osifica (sinostosis)", a: 1.6, z: 2, o: [60, -110], color: C.hueso },
          { p: [0, 0.3, 0.02], t: "Membrana interósea / ligamento", a: 2.1, z: 3, o: [80, -60], color: "#f6e2d2" },
          { p: [3.6, 0.45, 0.4], t: "Diente (raíz = clavo)", a: 3.1, z: 4, o: [80, -90], color: "#fbfbf7" },
          { p: [3.85, -0.25, 0.2], t: "Ligamento periodontal", a: 3.2, z: 4, o: [80, 60], color: "#ff9aa8" },
          { p: [3.0, -0.6, 0.45], t: "Alvéolo dental", a: 3.3, z: 4, o: [-80, 60], color: C.hueso },
        ]}
      />
      <Tarjeta b={b} a={0} z={1} x={1320} y={130} w={540} titulo="Articulaciones fibrosas" tam={27}>
        <Lista items={["Tejido conectivo **fibroso denso** (colágeno)", "**Sin cavidad** articular", "Movilidad **mínima o nula**", "Dan **estabilidad y protección**", "3 tipos: **suturas, sindesmosis, gonfosis**"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

const CartilaginosasEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.4, 6.6], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [-1.6, 1.2, 4.4], l: [-2, 0.2, 0], fov: 40 },
      { b: 2, p: [2.4, 1.0, 4.6], l: [2, 0, 0], fov: 40 },
      { b: 3, p: [2.4, 1.0, 4.6], l: [2, 0, 0], fov: 40 },
    ],
    b,
  );
  const crece = entre(b, 1.1, 1.6);
  const osifica = entre(b, 1.65, 1.85);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[-2, 0.3, 0]}>
          <PlacaEpifisaria crece={crece} osifica={osifica} />
        </group>
        <group position={[2, 0, 0]} rotation={[0, 0.5, 0]} scale={0.8}>
          <Columna flexion={Math.sin(b * 3) * visible(b, 2, 3)} />
        </group>
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-2, 0.62, 0.36], t: "Placa epifisaria (cartílago hialino)", a: 1.05, z: 2, o: [-60, -100], color: "#7cc8ff" },
          { p: [-2, -0.6, 0.22], t: "El hueso se alarga", a: 1.2, z: 1.65, o: [-80, 60], color: C.hueso },
          { p: [-2, 0.62, 0.36], t: "Madurez: se osifica", a: 1.7, z: 2, o: [60, 60], color: C.hueso },
          { p: [2.1, 0.22, 0.3], t: "Disco intervertebral (fibrocartílago)", a: 2.1, z: 3, o: [60, -100], color: "#9fd8ff" },
        ]}
      />
      <Tarjeta b={b} a={0} z={1} x={1320} y={130} w={540} titulo="Articulaciones cartilaginosas" tam={27}>
        <Lista items={["Unidas por **cartílago** (hialino o fibrocartílago)", "**Sin cavidad** articular", "2 tipos: **sincondrosis** y **sínfisis**"]} />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={2} x={1320} y={130} w={540} titulo="Sincondrosis · cartílago hialino" color="#7cc8ff" tam={26}>
        <Lista items={["**Temporal**: placa epifisaria; el hueso crece hasta la madurez", "**Permanente**: 1.ª costilla con el esternón", "Unión firme, **poco o ningún** movimiento"]} />
      </Tarjeta>
      <Tarjeta b={b} a={2} z={3} x={1320} y={130} w={540} titulo="Sínfisis · fibrocartílago" color="#9fd8ff" tam={26}>
        <Lista items={["Movimiento **limitado** (anfiartrosis)", "**Sínfisis púbica**: estabilidad de la pelvis", "**Discos intervertebrales**: flexibilidad y amortiguación"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

const SinovialEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.2, 0.9, 4.8], l: [0, 0.1, 0], fov: 40 },
      { b: 2, p: [-1.0, 0.7, 4.4], l: [0, 0.1, 0], fov: 40 },
    ],
    b,
  );
  const flex = Math.max(0, Math.sin(b * 2.4)) * 0.7;
  const partes = ["cartilago", "liquido", "membrana", "capsula", "ligamento", "bolsa"];
  const resalta = b > 1 ? partes[Math.min(5, Math.floor((b - 1) * 6))] : "";
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Sinovial flex={flex} resalta={resalta} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, 0.05, 0.4], t: "Cavidad articular", a: 0.2, z: 1, o: [-80, -60], color: C.acento },
          { p: [0.3, -0.06, 0.4], t: "Cartílago articular", a: 1.0, z: 2, o: [80, 60], color: C.cartilago },
          { p: [-0.4, 0.07, 0.25], t: "Líquido sinovial", a: 1.15, z: 2, o: [-90, 40], color: "#7fd6ff" },
          { p: [-0.68, 0.3, 0.1], t: "Membrana sinovial", a: 1.3, z: 2, o: [-80, -60], color: "#ff9fb3" },
          { p: [0.5, 0.45, 0.55], t: "Cápsula articular", a: 1.45, z: 2, o: [80, -70], color: "#f6e7d8" },
          { p: [0.84, -0.3, 0.1], t: "Ligamento", a: 1.6, z: 2, o: [80, 40], color: "#ffffff" },
          { p: [0, 0.65, 0.85], t: "Bolsa sinovial", a: 1.75, z: 2, o: [-80, -60], color: "#7fd6ff" },
        ]}
      />
    </AbsoluteFill>
  );
};

const TIPOS_SIN = [
  { n: "Pivote", C: Pivote, ej: "Atlantoaxial (C1-C2)", ejes: "Uniaxial: rotación" },
  { n: "Bisagra", C: Bisagra, ej: "Codo", ejes: "Uniaxial: flexión-extensión" },
  { n: "Condílea / elipsoidea", C: Condilea, ej: "Muñeca (radiocarpiana), nudillos", ejes: "Biaxial" },
  { n: "Silla de montar", C: Silla, ej: "Trapecio – 1.er metacarpiano", ejes: "Biaxial + oposición" },
  { n: "Esferoidea", C: Esferoidea, ej: "Cadera y hombro", ejes: "Multiaxial (3 ejes)" },
  { n: "Plana", C: Plana, ej: "Huesos del tarso", ejes: "Deslizamiento" },
];

const TiposSinovialesEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const i = Math.min(5, Math.floor(b));
  const x = (k: number) => (k - 2.5) * 3;
  const keys = TIPOS_SIN.flatMap((_, k) => [
    { b: k, p: [x(k) + 1.0, 1.0, 5.0] as V3, l: [x(k) + 0.9, 0.1, 0] as V3, fov: 40 },
    { b: k + 0.85, p: [x(k) + 0.6, 1.2, 4.8] as V3, l: [x(k) + 0.9, 0.1, 0] as V3, fov: 40 },
  ]);
  const cam = camara(keys, b);
  const t = TIPOS_SIN[i];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {TIPOS_SIN.map((T, k) => (
          <group key={k} position={[x(k), 0, 0]} rotation={[0.25, -0.5, 0]}>
            <T.C t={b} />
          </group>
        ))}
        <Polvo b={b} radio={8} />
      </Escena3D>
      <div
        style={{
          position: "absolute",
          right: 60,
          top: 140,
          width: 520,
          fontFamily: FUENTE,
          color: C.texto,
          background: "rgba(4,9,20,0.85)",
          borderRadius: 16,
          padding: "20px 26px",
          borderTop: `6px solid ${C.acento}`,
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 900, color: C.acento }}>{t.n}</div>
        <div style={{ fontSize: 30, color: C.acento2, fontWeight: 700, marginTop: 8 }}>{t.ejes}</div>
        <div style={{ fontSize: 28, marginTop: 8 }}>
          <Rico t={`Ejemplo: **${t.ej}**`} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MovimientosEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [2.4, 1.2, 2.6], l: [0, 1.0, 0], fov: 38 },
      { b: 0.85, p: [3.4, 1.2, 0.6], l: [0, 1.0, 0], fov: 38 },
      { b: 1.9, p: [3.4, 1.2, 0.6], l: [0, 1.0, 0], fov: 38 },
      { b: 2.05, p: [0, 1.2, 3.6], l: [0, 1.0, 0], fov: 38 },
      { b: 2.9, p: [0, 1.2, 3.6], l: [0, 1.0, 0], fov: 38 },
      { b: 3.05, p: [0.8, 1.5, 3.0], l: [0, 1.1, 0], fov: 38 },
      { b: 3.9, p: [0.8, 1.5, 3.0], l: [0, 1.1, 0], fov: 38 },
      { b: 4.05, p: [1.5, 1.25, 1.5], l: [0.3, 1.05, 0.1], fov: 38 },
    ],
    b,
  );
  const ph = (b % 1) * Math.PI * 4;
  const seg = Math.floor(b);
  let pose: React.ComponentProps<typeof Humano>["pose"] = {};
  let etiqueta = "";
  if (seg === 0) {
    pose = {};
    etiqueta = "Deslizamiento (lineal)";
  } else if (seg === 1) {
    const s = Math.sin(ph);
    pose = { hombroD: [-Math.max(0, s) * 1.6 + Math.max(0, -s) * 0.5, 0, 0.1], caderaI: [-Math.max(0, s) * 1.0 + Math.max(0, -s) * 0.3, 0, 0], rodillaI: Math.max(0, s) * 0.9 };
    etiqueta = Math.sin(ph) > 0 ? "Flexión" : "Extensión / hiperextensión";
  } else if (seg === 2) {
    const s = 0.5 + 0.5 * Math.sin(ph);
    const sub = (b % 1) < 0.55;
    pose = sub
      ? { hombroD: [0, 0, 0.1 + s * 1.4], hombroI: [0, 0, -0.1 - s * 1.4], caderaD: [0, 0, s * 0.5], caderaI: [0, 0, -s * 0.5] }
      : { hombroD: [Math.sin(ph * 1.5) * 1.0, 0, 0.9 + Math.cos(ph * 1.5) * 0.6] };
    etiqueta = sub ? (Math.sin(ph) > 0 ? "Abducción" : "Aducción") : "Circunducción";
  } else if (seg === 3) {
    pose = { hombroD: [0, Math.sin(ph) * 1.1, 0.15], codoD: -1.4, caderaD: [0, Math.sin(ph) * 0.6, 0] };
    etiqueta = Math.sin(ph) > 0 ? "Rotación externa (lateral)" : "Rotación interna (medial)";
  } else {
    pose = { hombroD: [-0.3, 0, 0.12], codoD: -1.4, antebrazoD: Math.sin(ph) * 1.4 };
    etiqueta = Math.sin(ph) > 0 ? "Supinación" : "Pronación";
  }
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[seg === 0 ? Math.sin(b * 8) * 0.04 : 0, 0, 0]}>
          <Humano musculo={0.4} pose={pose} />
        </group>
      </Escena3D>
      <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: FUENTE, fontSize: 54, fontWeight: 900, color: C.acento2, textShadow: "0 4px 20px #000" }}>
        {etiqueta}
      </div>
      <Tarjeta b={b} a={0} z={5} x={60} y={250} w={520} titulo="Movimientos sinoviales" tam={25}>
        <Lista
          items={[
            "**Lineales**: deslizamiento",
            "**Angulares**: flexión, extensión, hiperextensión, abducción, aducción, circunducción",
            "**Rotatorios**: rotación interna (medial) y externa (lateral)",
            "**Especiales**: pronación, supinación, inversión, eversión, protracción, retracción, elevación, depresión, oposición",
          ]}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

const FuncionalEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-3.2, 1.0, 4.6], l: [-3.4, 0.2, 0], fov: 40 },
      { b: 0.85, p: [-3.2, 1.0, 4.6], l: [-3.4, 0.2, 0], fov: 40 },
      { b: 1.05, p: [0, 0.8, 4.2], l: [0, 0.2, 0], fov: 40 },
      { b: 1.85, p: [0, 0.8, 4.2], l: [0, 0.2, 0], fov: 40 },
      { b: 2.05, p: [3.6, 1.3, 2.6], l: [3.2, 1.1, 0], fov: 38 },
      { b: 3.2, p: [3.0, 1.5, 2.2], l: [3.2, 1.2, 0], fov: 38 },
    ],
    b,
  );
  const ph = b * Math.PI * 3;
  const eje = Math.floor(((b - 2) % 1) * 3);
  const hombro: [number, number, number] =
    b < 2 ? [0, 0, 0.12] : eje === 0 ? [Math.sin(ph) * 1.2, 0, 0.15] : eje === 1 ? [0, 0, 0.15 + (0.5 + 0.5 * Math.sin(ph)) * 1.3] : [-0.2, Math.sin(ph) * 1.0, 0.2];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[-3.4, 0.2, 0]} rotation={[0.7, 0, 0]} scale={0.8}>
          <Sutura />
        </group>
        <group position={[0, 0.2, 0]} scale={0.5}>
          <Columna flexion={Math.sin(b * 4) * 0.6} />
        </group>
        <group position={[3.2, 0, 0]}>
          <Humano musculo={0.35} pose={{ hombroD: hombro, codoD: -0.2 }} />
        </group>
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-3.4, 0.3, 0], t: "Sinartrosis: inmóvil", a: 0, z: 1, o: [60, -110], color: C.acento },
          { p: [0, 0.4, 0.2], t: "Anfiartrosis: movilidad limitada", a: 1, z: 2, o: [60, -110], color: C.acento },
          { p: [3.43, 1.47, 0], t: "Diartrosis multiaxial (hombro)", a: 2, z: 3, o: [80, -90], color: C.acento2 },
        ]}
      />
      {b > 2 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: FUENTE, fontSize: 44, fontWeight: 900, color: C.acento2 }}>
          {eje === 0 ? "Eje 1: anteroposterior (flexión-extensión)" : eje === 1 ? "Eje 2: medial-lateral (abducción-aducción)" : "Eje 3: longitudinal (rotación)"}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ===================================================================

export const CAP4: PlanoDef[] = [
  {
    id: "articulaciones-intro",
    seccion: SEC,
    textos: [
      "**Articulaciones**: son los puntos donde **dos elementos esqueléticos contactan**. Sus funciones principales: **permitir el movimiento** y **brindar estabilidad** al esqueleto. Las hay **inmóviles, semimóviles y muy móviles**.",
      "**Clasificación estructural**: según si los huesos están unidos por **tejido conectivo fibroso** (fibrosas), por **cartílago** (cartilaginosas), o si contactan dentro de una **cavidad llena de líquido** lubricante (sinoviales).",
      "**Clasificación funcional**: según la movilidad: **sinartrosis** (inmóviles), **anfiartrosis** (semimóviles) y **diartrosis** (móviles). Las fibrosas suelen ser sinartrosis, las cartilaginosas anfiartrosis y **todas las sinoviales son diartrosis**.",
    ],
    Escena: ClasificacionEscena,
  },
  {
    id: "fibrosas",
    seccion: SEC + " · Fibrosas",
    textos: [
      "**Articulaciones fibrosas**: los huesos se unen por **tejido conectivo fibroso denso**, rico en **colágeno**. **No tienen cavidad** articular. Su movilidad es **mínima o nula**, según la longitud de las fibras. Son clave para la **estabilidad y la protección**.",
      "**1. Suturas**: exclusivas del **cráneo**. Los bordes óseos encajan como **piezas dentadas**, reforzados por **fibras cortas**. En la **infancia** permiten un ligero movimiento y el **crecimiento del cráneo**; en el adulto **se osifican (sinostosis)**.",
      "**2. Sindesmosis**: los huesos se unen por un **ligamento o una membrana interósea**. **Cuanto más largas las fibras, mayor movimiento**. Dan cierta movilidad y superficie de **inserción muscular**.",
      "**3. Gonfosis**: encaje tipo **“clavo y cavidad”**, solo entre las **raíces de los dientes** y los **alvéolos** del maxilar o la mandíbula. El **ligamento periodontal** fija el diente: son **prácticamente inmóviles**.",
    ],
    Escena: FibrosasEscena,
  },
  {
    id: "cartilaginosas",
    seccion: SEC + " · Cartilaginosas",
    textos: [
      "**Articulaciones cartilaginosas**: los huesos se unen por **cartílago**, un tejido resistente pero flexible (**hialino o fibrocartílago**). **No tienen cavidad** articular. Hay 2 tipos.",
      "**1. Sincondrosis (cartílago hialino)**: **temporal**, como la **placa epifisaria** de los huesos largos en crecimiento, que permite al hueso **alargarse hasta la madurez**; o **permanente**, como la unión de la **primera costilla con el esternón**. Unión firme con poco o ningún movimiento.",
      "**2. Sínfisis (fibrocartílago)**: permiten **movimiento limitado (anfiartrosis)**. Ejemplos: la **sínfisis púbica**, que da estabilidad a la pelvis, y los **discos intervertebrales**, que dan **flexibilidad y absorben impactos**.",
    ],
    Escena: CartilaginosasEscena,
  },
  {
    id: "sinoviales",
    seccion: SEC + " · Sinoviales",
    textos: [
      "**Articulaciones sinoviales**: las **más comunes** del cuerpo. Tienen una **cavidad articular** llena de líquido donde las superficies óseas entran en contacto **sin estar unidas directamente**: por eso se mueven **suavemente y con gran movilidad**.",
      "Sus partes: **cartílago articular** que cubre los huesos, **líquido sinovial** que lubrica, **membrana sinovial** que lo produce, **cápsula articular**, **ligamentos** que estabilizan y **bolsas sinoviales** que reducen la fricción.",
    ],
    Escena: SinovialEscena,
  },
  {
    id: "tipos-sinoviales",
    seccion: SEC + " · Tipos de articulación sinovial",
    textos: [
      "**Pivote**: una porción redondeada de un hueso gira dentro de un **anillo** formado por otro hueso y un ligamento. Rotación en **un solo eje (uniaxial)**. Ejemplo: la **atlantoaxial**, entre **C1 (atlas) y C2 (axis)**.",
      "**Bisagra**: el extremo **convexo** de un hueso se articula con el **cóncavo** del otro. Solo permite **flexión y extensión** en un eje (**uniaxial**). Ejemplo: el **codo**.",
      "**Condílea (elipsoidea)**: una superficie **ovalada** encaja en una **cavidad elíptica**. **Biaxial**: flexión, extensión, abducción, aducción y circunducción. Ejemplos: la **muñeca (radiocarpiana)** y los **nudillos (metacarpofalángicas)**.",
      "**Silla de montar**: superficies **cóncavas en un sentido y convexas en el otro**, como una silla. Flexión, extensión, abducción, aducción, circunducción y **oposición del pulgar**. Ejemplo: **trapecio con el 1.er metacarpiano**.",
      "**Esferoidea**: una **cabeza esférica** encaja en una **cavidad en copa**. **Multiaxial**: flexión, extensión, abducción, aducción, **rotación** y circunducción. Ejemplos: **cadera y hombro**.",
      "**Plana**: superficies **planas** que **se deslizan** entre sí. Ejemplo: entre los **huesos del tarso**.",
    ],
    Escena: TiposSinovialesEscena,
  },
  {
    id: "movimientos",
    seccion: SEC + " · Movimientos",
    textos: [
      "**Movimientos lineales**: el **deslizamiento** de una superficie sobre otra, como en las articulaciones planas.",
      "**Movimientos angulares**: **flexión** (disminuye el ángulo), **extensión** (lo aumenta) e **hiperextensión** (más allá de la posición anatómica).",
      "También angulares: **abducción** (alejar de la línea media), **aducción** (acercar) y **circunducción** (movimiento en cono).",
      "**Movimientos rotatorios**: **rotación interna (medial)** y **rotación externa (lateral)** alrededor del eje longitudinal.",
      "**Movimientos especiales**: **pronación y supinación** del antebrazo, **inversión y eversión** y **dorsiflexión / flexión plantar** del pie, **protracción y retracción**, **elevación y depresión**, y **oposición** del pulgar.",
    ],
    Escena: MovimientosEscena,
  },
  {
    id: "clasificacion-funcional",
    seccion: SEC + " · Clasificación funcional",
    textos: [
      "**Sinartrosis**: **inmóvil o casi inmóvil**. Da una **unión sólida** entre los huesos, importante donde protegen **órganos internos** (como las suturas del cráneo).",
      "**Anfiartrosis**: **movilidad limitada**. Los **discos intervertebrales** permiten pequeños movimientos individuales que juntos dan **flexibilidad a la columna**; la **sínfisis púbica** da estabilidad con mínima movilidad.",
      "**Diartrosis**: **movilidad libre**. Incluye **todas las articulaciones sinoviales**, la mayoría en el **esqueleto apendicular**. Las **multiaxiales**, como **hombro y cadera**, se mueven en **3 ejes**: anteroposterior, medial-lateral y **rotación** sobre su eje longitudinal.",
    ],
    Escena: FuncionalEscena,
  },
];

