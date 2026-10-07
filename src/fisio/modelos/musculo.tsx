import React, { useMemo } from "react";
import * as THREE from "three";
import { V3 } from "../motor";
import { C } from "../tema";
import { hexPack, rnd, texCorte, texEstriada, Tubo } from "./comun";

// Todos los cilindros van a lo largo del eje X; la cara de corte mira hacia +X.

const ROT_X: [number, number, number] = [0, 0, -Math.PI / 2];

export const CilindroX: React.FC<{
  radio: number;
  largo: number;
  x?: number; // posicion de la cara de corte
  y?: number;
  z?: number;
  color: string;
  opacidad?: number;
  tapa?: THREE.Texture | string;
  estriado?: number; // repeticiones de la textura estriada
  emisivo?: number;
  rugosidad?: number;
}> = ({
  radio,
  largo,
  x = 0,
  y = 0,
  z = 0,
  color,
  opacidad = 1,
  tapa,
  estriado,
  emisivo = 0,
  rugosidad = 0.5,
}) => {
  const tex = useMemo(() => {
    if (!estriado) return null;
    const t = texEstriada().clone();
    t.needsUpdate = true;
    t.repeat.set(1, estriado);
    return t;
  }, [estriado]);
  const trans = opacidad < 1;
  return (
    <group position={[x, y, z]}>
      <mesh position={[-largo / 2, 0, 0]} rotation={ROT_X}>
        <cylinderGeometry args={[radio, radio, largo, 40, 1, true]} />
        <meshPhysicalMaterial
          color={tex ? "#ffffff" : color}
          map={tex ?? undefined}
          emissive={color}
          emissiveIntensity={emisivo}
          roughness={rugosidad}
          clearcoat={0.35}
          transparent={trans}
          opacity={opacidad}
          depthWrite={!trans}
          side={THREE.DoubleSide}
        />
      </mesh>
      {tapa ? (
        <mesh rotation={[0, Math.PI / 2, 0]} position={[0.0005, 0, 0]}>
          <circleGeometry args={[radio, 40]} />
          {typeof tapa === "string" ? (
            <meshStandardMaterial
              color={tapa}
              transparent={trans}
              opacity={opacidad}
              roughness={0.6}
            />
          ) : (
            <meshStandardMaterial
              map={tapa}
              transparent={trans}
              opacity={opacidad}
              roughness={0.6}
            />
          )}
        </mesh>
      ) : null}
    </group>
  );
};

// ---- Niveles del zoom: musculo > fasciculo > fibra > miofibrilla --------

export const NivelMusculo: React.FC<{ brilla?: number }> = ({ brilla = 0 }) => {
  const hijos = useMemo(() => hexPack(0.8, 0.36), []);
  const corte = texCorte("#5a0f18", "#c0353f", "#f4d3c6", 7);
  return (
    <group>
      {/* epimisio */}
      <CilindroX radio={1.02} largo={5} color={C.tejido} opacidad={0.28} emisivo={brilla * 0.5} />
      {hijos.map(([y, z], i) => (
        <CilindroX
          key={i}
          radio={0.17}
          largo={5}
          x={rnd(`m${i}`) * 0.25}
          y={y}
          z={z}
          color="#a3202c"
          tapa={corte}
          emisivo={Math.hypot(y, z) < 1e-6 ? brilla * 0.6 : 0}
        />
      ))}
      <CilindroX radio={0.99} largo={5} x={-0.05} color="#7a1420" tapa="#f3d6c8" />
    </group>
  );
};

export const NivelFasciculo: React.FC<{ brilla?: number }> = ({ brilla = 0 }) => {
  const hijos = useMemo(() => hexPack(0.82, 0.2), []);
  const corte = texCorte("#6d1220", "#d0505a", "#5a0c16", 10);
  return (
    <group>
      {/* perimisio */}
      <CilindroX radio={1.0} largo={5} color={C.tejido} opacidad={0.3} />
      {hijos.map(([y, z], i) => (
        <CilindroX
          key={i}
          radio={0.088}
          largo={5}
          x={rnd(`f${i}`) * 0.3}
          y={y}
          z={z}
          color="#b52a36"
          tapa={corte}
          emisivo={Math.hypot(y, z) < 1e-6 ? brilla * 0.6 : 0}
        />
      ))}
      <CilindroX radio={0.97} largo={5} x={-0.05} color="#f1d2c4" tapa="#e8c3b4" />
    </group>
  );
};

export const NivelFibra: React.FC<{ brilla?: number }> = ({ brilla = 0 }) => {
  const hijos = useMemo(() => hexPack(0.78, 0.17), []);
  const nucleos = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => {
        const a = rnd(`na${i}`) * Math.PI * 2;
        return { x: -0.4 - i * 0.5, a };
      }),
    [],
  );
  return (
    <group>
      {/* endomisio: red fina por fuera */}
      <mesh position={[-2.5, 0, 0]} rotation={ROT_X}>
        <cylinderGeometry args={[1.06, 1.06, 5, 24, 12, true]} />
        <meshBasicMaterial color={C.tejido} wireframe transparent opacity={0.25} />
      </mesh>
      {/* sarcolema */}
      <CilindroX radio={1.0} largo={5} color="#f39aa0" opacidad={0.35} emisivo={0.1} />
      {/* nucleos en la periferia (celula multinucleada) */}
      {nucleos.map((n, i) => (
        <mesh
          key={i}
          position={[n.x, Math.cos(n.a) * 0.97, Math.sin(n.a) * 0.97]}
          rotation={[n.a, 0, 0]}
          scale={[0.28, 0.06, 0.12]}
        >
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#5b3fc4" emissive="#3a1f9a" emissiveIntensity={0.5} />
        </mesh>
      ))}
      {hijos.map(([y, z], i) => (
        <CilindroX
          key={i}
          radio={0.075}
          largo={5}
          x={0.05 + rnd(`fb${i}`) * 0.2}
          y={y}
          z={z}
          color="#c03a46"
          estriado={14}
          tapa="#d75b65"
          emisivo={Math.hypot(y, z) < 1e-6 ? brilla * 0.6 : 0}
        />
      ))}
      {/* mitocondrias entre miofibrillas */}
      {hijos.slice(0, 14).map(([y, z], i) => (
        <mesh
          key={`m${i}`}
          position={[-0.3 - rnd(`mx${i}`) * 3, y + 0.085, z + 0.02]}
          rotation={ROT_X}
        >
          <capsuleGeometry args={[0.025, 0.16, 6, 10]} />
          <meshStandardMaterial color={C.mitocondria} emissive={C.mitocondria} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
};

export const NivelMiofibrilla: React.FC<{ brilla?: number }> = ({ brilla = 0 }) => (
  <group>
    <CilindroX
      radio={0.5}
      largo={10}
      x={2}
      color="#c03a46"
      estriado={7}
      tapa={texCorte("#8e1d2a", "#c88a3a", "#5a1a6a", 22)}
      emisivo={brilla * 0.2}
      rugosidad={0.35}
    />
  </group>
);

// ---- Sarcomero en 3D ---------------------------------------------------

export const SARC = {
  grueso: 2.6, // longitud de la banda A (constante)
  fino: 1.6, // longitud de cada filamento fino
  reposo: 4.0, // Z a Z en reposo
  contraido: 3.1,
  sep: 0.34, // separacion de la red hexagonal
};

export const Sarcomero: React.FC<{
  L: number; // distancia entre discos Z
  radio?: number;
  titina?: number; // opacidad
  nebulina?: number;
  cabezas?: boolean;
  resaltaFinos?: number;
  resaltaGruesos?: number;
  zOp?: number;
}> = ({
  L,
  radio = 0.75,
  titina = 0,
  nebulina = 0,
  cabezas = true,
  resaltaFinos = 0,
  resaltaGruesos = 0,
  zOp = 1,
}) => {
  const gruesos = useMemo(() => hexPack(radio, SARC.sep), [radio]);
  // filamentos finos en los centros de los triangulos de la red
  const finos = useMemo(() => {
    const s = SARC.sep;
    const pts: [number, number][] = [];
    for (const [y, z] of hexPack(radio + s, s)) {
      for (const [dy, dz] of [
        [s / 2, s / (2 * Math.sqrt(3))],
        [0, s / Math.sqrt(3)],
      ]) {
        const p: [number, number] = [y + dy, z + dz];
        if (Math.hypot(p[0], p[1]) <= radio + 0.05 && !pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.01))
          pts.push(p);
      }
    }
    return pts;
  }, [radio]);
  const zx = L / 2;
  const geoCabeza = useMemo(() => new THREE.SphereGeometry(0.035, 8, 6), []);
  const matCabeza = useMemo(
    () => new THREE.MeshStandardMaterial({ color: C.cabeza, roughness: 0.4 }),
    [],
  );
  const nCab = 9;
  return (
    <group>
      {/* discos Z */}
      {[-zx, zx].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[radio + 0.18, 48]} />
            <meshStandardMaterial
              color="#2a3550"
              transparent
              opacity={0.55 * zOp}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[radio + 0.18, 0.025, 8, 48]} />
            <meshStandardMaterial color="#c8d6ff" emissive="#7f9cff" emissiveIntensity={0.4} transparent opacity={zOp} />
          </mesh>
        </group>
      ))}
      {/* linea M */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[radio + 0.1, 0.012, 8, 48]} />
        <meshStandardMaterial color="#ffb3ff" emissive="#ff6bff" emissiveIntensity={0.5} />
      </mesh>
      {/* filamentos gruesos (miosina) */}
      {gruesos.map(([y, z], i) => (
        <group key={`g${i}`} position={[0, y, z]}>
          <mesh rotation={ROT_X}>
            <cylinderGeometry args={[0.045, 0.045, SARC.grueso, 10]} />
            <meshStandardMaterial
              color={C.miosina}
              emissive={C.miosina}
              emissiveIntensity={0.15 + resaltaGruesos * 0.8}
              roughness={0.4}
            />
          </mesh>
          {cabezas
            ? [-1, 1].flatMap((lado) =>
                Array.from({ length: nCab }).map((_, k) => {
                  const x = lado * (0.25 + (k * (SARC.grueso / 2 - 0.3)) / (nCab - 1));
                  const a = k * 2.1 + i + (lado > 0 ? 0 : 1);
                  return (
                    <mesh
                      key={`${lado}-${k}`}
                      geometry={geoCabeza}
                      material={matCabeza}
                      position={[x, Math.cos(a) * 0.07, Math.sin(a) * 0.07]}
                    />
                  );
                }),
              )
            : null}
        </group>
      ))}
      {/* filamentos finos (actina), anclados a cada disco Z */}
      {finos.map(([y, z], i) =>
        [-1, 1].map((lado) => (
          <mesh
            key={`f${i}${lado}`}
            position={[lado * (zx - SARC.fino / 2), y, z]}
            rotation={ROT_X}
          >
            <cylinderGeometry args={[0.022, 0.022, SARC.fino, 8]} />
            <meshStandardMaterial
              color={C.actina}
              emissive={C.actina}
              emissiveIntensity={0.15 + resaltaFinos * 0.8}
              roughness={0.4}
            />
          </mesh>
        )),
      )}
      {/* nebulina a lo largo de algunos filamentos finos */}
      {nebulina > 0
        ? [...finos].sort((p, q) => q[1] - p[1]).slice(0, 5).map(([y, z], i) =>
            [-1, 1].map((lado) => (
              <mesh
                key={`n${i}${lado}`}
                position={[lado * (zx - SARC.fino / 2), y, z + 0.035]}
                rotation={ROT_X}
              >
                <cylinderGeometry args={[0.013, 0.013, SARC.fino, 6]} />
                <meshStandardMaterial
                  color={C.nebulina}
                  emissive={C.nebulina}
                  emissiveIntensity={0.6}
                  transparent
                  opacity={nebulina}
                />
              </mesh>
            )),
          )
        : null}
      {/* titina: resorte en la banda I y recta hasta la linea M */}
      {titina > 0
        ? [...gruesos].sort((p, q) => q[1] - p[1]).slice(0, 3).map(([y, z], i) =>
            [-1, 1].map((lado) => (
              <Titina
                key={`t${i}${lado}`}
                desde={lado * zx}
                hasta={lado * (SARC.grueso / 2)}
                y={y}
                z={z + 0.07}
                opacidad={titina}
              />
            )),
          )
        : null}
    </group>
  );
};

const Titina: React.FC<{
  desde: number;
  hasta: number;
  y: number;
  z: number;
  opacidad: number;
}> = ({ desde, hasta, y, z, opacidad }) => {
  const pts: V3[] = [];
  const vueltas = 7;
  const n = 70;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * vueltas * Math.PI * 2;
    pts.push([desde + (hasta - desde) * t, y + Math.cos(a) * 0.035, z + Math.sin(a) * 0.035]);
  }
  pts.push([hasta * 0.5, y, z]);
  pts.push([0, y, z]);
  return <Tubo puntos={pts} radio={0.012} color={C.titina} emisivo={0.8} opacidad={opacidad} segmentos={160} />;
};

// ---- Filamento fino detallado (actina + tropomiosina + troponina) -------

export const ACT = { paso: 0.11, radio: 0.055, giro: 1.54 };

export const posActina = (i: number, s: number): V3 => {
  const x = i * ACT.paso + s * ACT.paso * 0.5;
  const a = (x / ACT.giro) * Math.PI * 2 + s * Math.PI;
  return [x, Math.cos(a) * ACT.radio, Math.sin(a) * ACT.radio];
};

/** Posicion de un complejo de troponina (para etiquetas y para los iones). */
export const posTroponina = (k: number, s: number, bloqueo: number): V3 => {
  const x = (k * 7 + 3) * ACT.paso + s * 0.35;
  const a = (x / ACT.giro) * Math.PI * 2 + s * Math.PI + Math.PI / 2 + 0.6 * (1 - bloqueo);
  const r = ACT.radio * 1.9;
  return [x, Math.cos(a) * r, Math.sin(a) * r];
};

export const FilamentoFino: React.FC<{
  n: number; // actinas por hebra
  desliza?: number; // desplazamiento en X
  bloqueo?: number; // 1 = tropomiosina tapando, 0 = sitios expuestos
  sitios?: number; // brillo de los sitios de union
  tropomiosina?: number;
  troponina?: number;
  caUnido?: number;
  resaltaG?: number; // resalta una actina G
  hebras?: number; // 1 = solo una hebra (para explicar la polimerizacion)
  armado?: number; // 0..1 cuantas actinas ya se ven
}> = ({
  n,
  desliza = 0,
  bloqueo = 1,
  sitios = 0,
  tropomiosina = 1,
  troponina = 1,
  caUnido = 0,
  resaltaG = -1,
  hebras = 2,
  armado = 1,
}) => {
  const geo = useMemo(() => new THREE.SphereGeometry(ACT.radio * 1.08, 16, 12), []);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: C.actina, roughness: 0.35, clearcoat: 0.5 }),
    [],
  );
  const matB = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#d99a1e", roughness: 0.35, clearcoat: 0.5 }),
    [],
  );
  const giroTm = 0.6 * (1 - bloqueo); // la tropomiosina rota al desbloquear
  const tm = (s: number): V3[] => {
    const pts: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const x = i * ACT.paso;
      const a = (x / ACT.giro) * Math.PI * 2 + s * Math.PI + Math.PI / 2 + giroTm;
      pts.push([x, Math.cos(a) * ACT.radio * 1.55, Math.sin(a) * ACT.radio * 1.55]);
    }
    return pts;
  };
  const visibles = Math.round(n * armado);
  return (
    <group position={[desliza, 0, 0]}>
      {Array.from({ length: hebras }).flatMap((_, s) =>
        Array.from({ length: visibles }).map((__, i) => {
          const p = posActina(i, s);
          const res = i === resaltaG && s === 0;
          return (
            <mesh
              key={`${s}-${i}`}
              geometry={geo}
              material={res ? undefined : s ? matB : mat}
              position={p}
              scale={res ? 1.25 : 1}
            >
              {res ? (
                <meshStandardMaterial color="#fff2b0" emissive={C.actina} emissiveIntensity={1} />
              ) : null}
            </mesh>
          );
        }),
      )}
      {/* sitios de union para la miosina */}
      {sitios > 0
        ? Array.from({ length: hebras }).flatMap((_, s) =>
            Array.from({ length: visibles }).map((__, i) => {
              const [x, y, z] = posActina(i, s);
              const k = 1 + 0.06 / Math.hypot(y, z);
              return (
                <mesh key={`s${s}-${i}`} position={[x, y * k, z * k]}>
                  <sphereGeometry args={[0.022, 8, 6]} />
                  <meshStandardMaterial
                    color="#ff3d6e"
                    emissive="#ff3d6e"
                    emissiveIntensity={1.5}
                    transparent
                    opacity={sitios}
                  />
                </mesh>
              );
            }),
          )
        : null}
      {tropomiosina > 0
        ? [0, 1].map((s) => (
            <Tubo
              key={`tm${s}`}
              puntos={tm(s)}
              radio={0.018}
              color={C.tropomiosina}
              emisivo={0.25}
              opacidad={tropomiosina}
              segmentos={n * 6}
            />
          ))
        : null}
      {troponina > 0
        ? Array.from({ length: Math.floor(n / 7) }).flatMap((_, k) =>
            [0, 1].map((s) => {
              const x = (k * 7 + 3) * ACT.paso + s * 0.35;
              const a = (x / ACT.giro) * Math.PI * 2 + s * Math.PI + Math.PI / 2 + giroTm;
              const r = ACT.radio * 1.9;
              const base: V3 = [x, Math.cos(a) * r, Math.sin(a) * r];
              return (
                <group key={`tn${k}${s}`} position={base}>
                  <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.04, 14, 10]} />
                    <meshStandardMaterial color={C.troponina} emissive={C.troponina} emissiveIntensity={0.3 + caUnido} transparent opacity={troponina} />
                  </mesh>
                  <mesh position={[0.05, 0.02, 0]}>
                    <sphereGeometry args={[0.03, 12, 8]} />
                    <meshStandardMaterial color="#ff6b6b" transparent opacity={troponina} />
                  </mesh>
                  <mesh position={[-0.05, -0.01, 0.01]}>
                    <sphereGeometry args={[0.03, 12, 8]} />
                    <meshStandardMaterial color="#ffd23b" transparent opacity={troponina} />
                  </mesh>
                  {caUnido > 0 ? (
                    <mesh position={[0, 0.045, 0.02]}>
                      <sphereGeometry args={[0.018, 10, 8]} />
                      <meshStandardMaterial color={C.calcio} emissive={C.calcio} emissiveIntensity={2} transparent opacity={caUnido} />
                    </mesh>
                  ) : null}
                </group>
              );
            }),
          )
        : null}
    </group>
  );
};

// ---- Molecula de miosina ------------------------------------------------

export const MoleculaMiosina: React.FC<{
  colaLargo?: number;
  colorCola?: string;
  colorS2?: string;
  colorCabeza?: string;
  ligeras?: number;
  dominios?: number;
  angulo?: number; // giro de las cabezas en la bisagra
  escala?: number;
}> = ({
  colaLargo = 2.4,
  colorCola = C.miosina,
  colorS2 = C.miosina,
  colorCabeza = C.cabeza,
  ligeras = 1,
  dominios = 0,
  angulo = 0,
  escala = 1,
}) => {
  const hebra = (s: number, x0: number, x1: number): V3[] => {
    const pts: V3[] = [];
    const n = 40;
    for (let i = 0; i <= n; i++) {
      const x = x0 + ((x1 - x0) * i) / n;
      const a = x * 9 + s * Math.PI;
      pts.push([x, Math.cos(a) * 0.035, Math.sin(a) * 0.035]);
    }
    return pts;
  };
  return (
    <group scale={escala}>
      {/* meromiosina ligera (cola rigida) */}
      <Tubo puntos={hebra(0, -colaLargo, -0.55)} radio={0.03} color={colorCola} segmentos={120} />
      <Tubo puntos={hebra(1, -colaLargo, -0.55)} radio={0.03} color={colorCola} segmentos={120} />
      {/* S2: bisagra */}
      <Tubo puntos={hebra(0, -0.55, 0)} radio={0.03} color={colorS2} emisivo={0.2} segmentos={40} />
      <Tubo puntos={hebra(1, -0.55, 0)} radio={0.03} color={colorS2} emisivo={0.2} segmentos={40} />
      {/* dos cabezas S1 */}
      {[1, -1].map((lado) => (
        <group key={lado} rotation={[0, 0, lado * (0.5 + angulo)]}>
          {/* cuello (brazo de palanca) */}
          <mesh position={[0.2, 0, 0]} rotation={ROT_X}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 12]} />
            <meshStandardMaterial
              color={dominios ? "#8ec5ff" : colorCabeza}
              emissive={dominios ? "#8ec5ff" : colorCabeza}
              emissiveIntensity={0.15 + dominios * 0.4}
            />
          </mesh>
          {/* dominio conversor */}
          <mesh position={[0.42, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 12]} />
            <meshStandardMaterial
              color={dominios ? "#7cff8a" : colorCabeza}
              emissive={dominios ? "#7cff8a" : colorCabeza}
              emissiveIntensity={0.15 + dominios * 0.4}
            />
          </mesh>
          {/* dominio catalitico (motor) */}
          <mesh position={[0.68, 0.02, 0]} scale={[1.5, 0.9, 0.9]}>
            <sphereGeometry args={[0.16, 24, 18]} />
            <meshPhysicalMaterial
              color={dominios ? "#ff8a5c" : colorCabeza}
              emissive={dominios ? "#ff8a5c" : colorCabeza}
              emissiveIntensity={0.15 + dominios * 0.35}
              clearcoat={0.6}
              roughness={0.3}
            />
          </mesh>
          {/* cadenas ligeras: esencial y reguladora */}
          {ligeras > 0 ? (
            <>
              <mesh position={[0.3, 0.06 * lado, 0.04]}>
                <sphereGeometry args={[0.055, 14, 10]} />
                <meshStandardMaterial color="#5ef0c8" emissive="#5ef0c8" emissiveIntensity={0.3} transparent opacity={ligeras} />
              </mesh>
              <mesh position={[0.13, 0.06 * lado, -0.04]}>
                <sphereGeometry args={[0.05, 14, 10]} />
                <meshStandardMaterial color="#ffd166" emissive="#ffd166" emissiveIntensity={0.3} transparent opacity={ligeras} />
              </mesh>
            </>
          ) : null}
        </group>
      ))}
    </group>
  );
};

/** Cabeza de miosina individual articulada, para el ciclo de puentes cruzados. */
export const CabezaMiosina: React.FC<{
  angulo: number; // 0 = vertical; negativo = "armada" hacia la izquierda
  estira?: number;
  color?: string;
}> = ({ angulo, estira = 1, color = C.cabeza }) => (
  <group rotation={[0, 0, angulo]}>
    <mesh position={[0, 0.25 * estira, 0]}>
      <cylinderGeometry args={[0.045, 0.045, 0.5 * estira, 12]} />
      <meshStandardMaterial color="#8ec5ff" />
    </mesh>
    <mesh position={[0, 0.52 * estira, 0]}>
      <sphereGeometry args={[0.08, 16, 12]} />
      <meshStandardMaterial color="#7cff8a" />
    </mesh>
    <mesh position={[0, 0.5 * estira + 0.28, 0]} scale={[0.9, 1.5, 0.9]}>
      <sphereGeometry args={[0.16, 24, 18]} />
      <meshPhysicalMaterial color={color} clearcoat={0.6} roughness={0.3} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  </group>
);

// ---- Mitocondria ------------------------------------------------------------

export const Mitocondria: React.FC<{ pos: V3; rot?: V3; escala?: number }> = ({
  pos,
  rot = [0, 0, 0],
  escala = 1,
}) => (
  <group position={pos} rotation={rot} scale={escala}>
    <mesh rotation={ROT_X}>
      <capsuleGeometry args={[0.12, 0.45, 8, 20]} />
      <meshPhysicalMaterial color={C.mitocondria} transparent opacity={0.75} clearcoat={0.5} roughness={0.3} depthWrite={false} />
    </mesh>
    {Array.from({ length: 6 }).map((_, i) => (
      <mesh key={i} position={[-0.25 + i * 0.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.07, 0.015, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#ffd0b0" emissive="#ff7b54" emissiveIntensity={0.3} />
      </mesh>
    ))}
  </group>
);
