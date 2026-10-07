import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, PlanoDef, useBeat, V3, visible } from "../motor";
import { Particulas, Polvo, rnd, texCorte, Tubo } from "../modelos/comun";
import { CilindroX } from "../modelos/musculo";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Rico, Tabla, Tarjeta } from "../ui";

const SEC_T = "Tendones";
const SEC_L = "Ligamentos";
const TENDON = "#f3efe4";

// ---- Pierna con tendon de Aquiles ----------------------------------------

const Pierna: React.FC<{ apoyo: number }> = ({ apoyo }) => {
  // apoyo 0..1: el tobillo se flexiona y el tendon se estira (almacena energia)
  const ang = -0.35 * apoyo;
  const estira = apoyo;
  const talon: V3 = [-0.42, -2.0 + 0.12 * apoyo, 0];
  return (
    <group>
      {/* tibia */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 2.8, 20]} />
        <meshStandardMaterial color={C.hueso} />
      </mesh>
      {/* gemelos */}
      <mesh position={[-0.28, 0.1, 0]} scale={[0.32, 0.85, 0.32]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshPhysicalMaterial color={C.musculo} emissive={C.musculoClaro} emissiveIntensity={0.2 + estira * 0.3} roughness={0.45} clearcoat={0.4} />
      </mesh>
      {/* tendon de Aquiles */}
      <Tubo
        puntos={[[-0.3, -0.6, 0], [-0.38, -1.2, 0], [-0.42, -1.7, 0], talon]}
        radio={0.06 - estira * 0.012}
        color={TENDON}
        emisivo={0.15 + estira * 1.2}
        segmentos={30}
      />
      {/* pie */}
      <group position={[0, -2.05, 0]} rotation={[0, 0, ang]}>
        <mesh position={[0.35, -0.05, 0]}>
          <boxGeometry args={[1.3, 0.22, 0.42]} />
          <meshStandardMaterial color={C.hueso} />
        </mesh>
        <mesh position={[-0.38, 0.05, 0]}>
          <sphereGeometry args={[0.16, 16, 12]} />
          <meshStandardMaterial color={C.hueso} />
        </mesh>
      </group>
      <mesh position={[0, -2.32, 0]}>
        <boxGeometry args={[4, 0.05, 1.5]} />
        <meshStandardMaterial color="#26324a" />
      </mesh>
    </group>
  );
};

const TendonIntro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.8, -0.3, 6.6], l: [-0.2, -0.6, 0], fov: 40 },
      { b: 2, p: [0.4, -0.8, 5.0], l: [-0.3, -1.1, 0], fov: 40 },
    ],
    b,
  );
  const ciclo = b > 2 ? Math.max(0, Math.sin((b - 2) * 9)) : Math.max(0, Math.sin(b * 6)) * 0.6;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Pierna apoyo={ciclo} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.28, 0.4, 0.3], t: "Músculo (gemelos)", a: 0, z: 3, o: [-80, -70], color: C.musculoClaro },
          { p: [-0.4, -1.4, 0.05], t: "Tendón de Aquiles", a: 0, z: 3, o: [-90, 20], color: TENDON },
          { p: [-0.42, -2.0, 0], t: "Hueso (calcáneo)", a: 0.2, z: 3, o: [-90, 70], color: C.hueso },
        ]}
      />
      {b > 2 ? (
        <div style={{ position: "absolute", right: 120, top: 200, width: 80, height: 420, borderRadius: 16, border: `3px solid ${C.acento2}`, overflow: "hidden", background: "rgba(0,0,0,0.4)" }}>
          <div style={{ position: "absolute", bottom: 0, width: "100%", height: `${ciclo * 100}%`, background: C.acento2 }} />
        </div>
      ) : null}
      {b > 2 ? (
        <div style={{ position: "absolute", right: 40, top: 640, width: 240, textAlign: "center", fontFamily: FUENTE, fontSize: 28, color: C.acento2, fontWeight: 800 }}>
          {ciclo > 0.5 ? "Apoyo: almacena energía" : "Impulso: la libera"}
        </div>
      ) : null}
      <Tarjeta b={b} a={1} z={2} x={60} y={130} w={500} titulo="Se adaptan a" color={TENDON} tam={28}>
        <Lista items={["**Tensión**", "**Frecuencia**", "**Duración** del ejercicio"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ---- Estructura del tendon ----------------------------------------------

const Fibrilla: React.FC<{ y: number; z: number; ondula: number; largo?: number; desorden?: number; roto?: boolean }> = ({
  y,
  z,
  ondula,
  largo = 4,
  desorden = 0,
  roto = false,
}) => {
  const pts: V3[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = -largo / 2 + (i / 40) * largo;
    const d = desorden * (rnd(`d${y}${z}${i}`) - 0.5) * 0.25;
    pts.push([x, y + Math.sin(x * 9) * 0.04 * ondula + d, z + d * 0.6]);
  }
  if (roto) {
    return (
      <>
        <Tubo puntos={pts.slice(0, 18)} radio={0.022} color={TENDON} segmentos={40} />
        <Tubo puntos={pts.slice(23)} radio={0.022} color={TENDON} segmentos={40} />
      </>
    );
  }
  return <Tubo puntos={pts} radio={0.022} color={TENDON} segmentos={80} />;
};

const ComposicionTendon: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [4.4, 1.9, 3.8], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [2.2, 0.8, 2.6], l: [-0.5, 0, 0], fov: 40 },
      { b: 2, p: [2.4, 1.0, 2.9], l: [-0.5, 0, 0], fov: 40 },
    ],
    b,
  );
  const corte = texCorte("#e9dfcc", "#fbf8f0", "#d8cbb0", 12);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {/* tendon completo con haces */}
        <CilindroX radio={0.95} largo={5} x={1.2} color={TENDON} opacidad={0.25} />
        {[[0, 0], [0.45, 0.2], [-0.4, 0.3], [0.1, -0.5], [-0.35, -0.35], [0.5, -0.3]].map(([y, z], i) => (
          <CilindroX key={i} radio={0.3} largo={5} x={1.2 + (i ? 0.2 : 0.6)} y={y} z={z} color={TENDON} tapa={corte} />
        ))}
        {/* fibrillas onduladas saliendo del haz central */}
        {b > 0.8
          ? [-0.12, -0.04, 0.04, 0.12].flatMap((y) => [-0.08, 0.08].map((z) => (
              <group key={`${y}${z}`} position={[-0.3, 0, 0]}>
                <Fibrilla y={y} z={z} ondula={1} largo={2.2} />
              </group>
            )))
          : null}
        {/* tenocitos */}
        {b > 0.8
          ? [0, 1, 2].map((i) => (
              <mesh key={i} position={[-0.9 + i * 0.6, 0.0, 0.0 + (i % 2) * 0.04]} scale={[0.22, 0.03, 0.04]}>
                <sphereGeometry args={[1, 16, 10]} />
                <meshStandardMaterial color="#5a7cff" emissive="#5a7cff" emissiveIntensity={0.6} />
              </mesh>
            ))
          : null}
        {b > 0.8 ? (
          <Particulas
            pos={Array.from({ length: 16 }).map((_, i): V3 => [-1.2 + rnd(`w${i}`) * 2, (rnd(`wy${i}`) - 0.5) * 0.3, (rnd(`wz${i}`) - 0.5) * 0.25])}
            radio={0.015}
            color="#7fd6ff"
            opacidad={0.8}
          />
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [1.4, 0.0, 0], t: "Haces (fascículos)", a: 0, z: 1, o: [80, -90], color: TENDON },
          { p: [-0.6, 0.12, 0.08], t: "Fibras de colágeno tipo I", a: 1, z: 2.1, o: [-60, -110], color: TENDON },
          { p: [-0.3, 0, 0.0], t: "Tenocitos", a: 1.1, z: 2.1, o: [60, 100], color: "#5a7cff" },
          { p: [-1.1, -0.1, 0.1], t: "Matriz: proteoglicanos + agua", a: 1.2, z: 2.1, o: [-60, 100], color: "#7fd6ff" },
        ]}
      />
      <Tarjeta b={b} a={1} z={2.1} x={1320} y={130} w={540} titulo="Composición" color={TENDON} tam={26}>
        <Lista items={["**Colágeno tipo I**: principal componente, resistencia a la tracción", "**Tenocitos**: mantenimiento y reparación", "**Matriz extracelular** (proteoglicanos y agua): elasticidad y deformación"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

const PropiedadesTendon: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.8, 4.2], l: [0, 0, 0], fov: 40 },
      { b: 3, p: [0.4, 1.0, 4.0], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  // b0 elasticidad, b1 viscoelasticidad (rapido vs lento), b2 adaptacion (engrosa), b3 protege articulacion
  const tira = b < 1 ? Math.max(0, Math.sin(b * 8)) : b < 2 ? Math.max(0, Math.sin((b - 1) * (b < 1.5 ? 6 : 18))) * (b < 1.5 ? 1 : 0.55) : 0;
  const grosor = 0.25 + entre(b, 2.1, 2.8) * 0.12;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <mesh position={[-1.9 - tira * 0.2, 0, 0]}>
          <boxGeometry args={[0.6, 1.0, 0.8]} />
          <meshStandardMaterial color={C.musculo} />
        </mesh>
        <mesh position={[1.9, 0, 0]}>
          <boxGeometry args={[0.6, 1.0, 0.8]} />
          <meshStandardMaterial color={C.hueso} />
        </mesh>
        <group position={[-tira * 0.1, 0, 0]} scale={[1 + tira * 0.08, 1 - tira * 0.08, 1 - tira * 0.08]}>
          <CilindroX radio={grosor} largo={3.2} x={1.6} color={TENDON} emisivo={tira * 0.5} />
        </group>
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Tarjeta b={b} a={0} z={4} x={1320} y={130} w={540} titulo="Propiedades mecánicas" color={TENDON} tam={26}>
        <Lista
          items={[
            "**Elasticidad**: vuelve a su forma tras deformarse",
            b > 1 ? "**Viscoelasticidad**: depende del tiempo; la **resistencia aumenta con la velocidad** de carga" : "",
            b > 2 ? "**Plasticidad y adaptación**: con fuerza progresiva se **engrosa** y se hace más resistente" : "",
            b > 3 ? "**Prevención**: absorbe carga y **reduce el estrés** sobre las articulaciones" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
      {b > 1 && b < 2 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: FUENTE, fontSize: 44, fontWeight: 900, color: C.acento2 }}>
          {b < 1.5 ? "Carga lenta: se estira más" : "Carga rápida: más rígido, se estira menos"}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const LesionesTendon: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.0, 4.6], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [0.4, 0.8, 3.6], l: [0, 0, 0], fov: 40 },
      { b: 2, p: [0, 1.2, 4.4], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  const inflama = visible(b, 0, 0.5);
  const deg = visible(b, 0.5, 1.0);
  const rup = visible(b, 1.0, 2.0);
  const filas = [-0.18, -0.06, 0.06, 0.18];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {filas.flatMap((y, i) =>
          [-0.1, 0.1].map((z, k) => (
            <Fibrilla key={`${i}${k}`} y={y} z={z} ondula={0.3} largo={3.6} desorden={deg} roto={rup > 0.5 && (i + k) % 2 === 0} />
          )),
        )}
        {inflama > 0 ? (
          <mesh scale={[1.5, 0.45, 0.4]}>
            <sphereGeometry args={[1, 32, 24]} />
            <meshBasicMaterial color="#ff3030" transparent opacity={0.25 * inflama * (0.7 + 0.3 * Math.sin(b * 20))} depthWrite={false} />
          </mesh>
        ) : null}
        {/* vasos: menos en la tendinosis */}
        {[0, 1, 2, 3].map((i) =>
          i < 4 - Math.round(deg * 3) ? (
            <Tubo key={i} puntos={[[-1.6 + i * 1.0, 0.35, 0.2], [-1.3 + i * 1.0, 0.3, 0.1], [-1.0 + i * 1.0, 0.36, 0.2]]} radio={0.02} color="#ff2440" emisivo={0.4} segmentos={10} />
          ) : null,
        )}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: FUENTE, fontSize: 48, fontWeight: 900, color: "#ff7a7a" }}>
        {b < 0.5 ? "Tendinitis: inflamación aguda por sobreuso" : b < 1 ? "Tendinosis: degeneración crónica" : b < 2 ? "Rupturas parciales" : ""}
      </div>
      <Tarjeta b={b} a={2} z={3} x={1320} y={130} w={540} titulo="Factores de riesgo" color="#ff7a7a" tam={28}>
        <Lista items={["**Edad**", "**Desequilibrio muscular**", "**Entrenamiento excesivo sin progresión**"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ---- Ligamentos ----------------------------------------------------------

/** Ligamento entre dos huesos; e = elongacion 0..1 (fases de la curva). */
const Ligamento: React.FC<{ e: number; fibras?: number }> = ({ e, fibras = 12 }) => {
  const sep = 1.2 + e * 0.5;
  const ondula = Math.max(0, 1 - e * 4);
  const rotas = e < 0.55 ? 0 : e < 0.85 ? Math.round(((e - 0.55) / 0.3) * fibras * 0.5) : fibras;
  return (
    <group>
      <mesh position={[-sep - 0.6, 0, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.0]} />
        <meshPhysicalMaterial color={C.hueso} roughness={0.5} />
      </mesh>
      <mesh position={[sep + 0.6, 0, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.0]} />
        <meshPhysicalMaterial color={C.hueso} roughness={0.5} />
      </mesh>
      {Array.from({ length: fibras }).map((_, i) => {
        const y = -0.4 + (i % 6) * 0.16;
        const z = i < 6 ? -0.12 : 0.12;
        const rota = ((i * 7) % fibras) < rotas;
        const pts: V3[] = [];
        for (let k = 0; k <= 30; k++) {
          const t = k / 30;
          const x = -sep + t * 2 * sep;
          pts.push([x, y + Math.sin(t * Math.PI * 10 + i) * 0.05 * ondula, z]);
        }
        if (rota) {
          const corte = 12 + (i % 5);
          return (
            <group key={i}>
              <Tubo puntos={pts.slice(0, corte)} radio={0.025} color="#ff8a8a" segmentos={20} />
              <Tubo puntos={pts.slice(corte + 3)} radio={0.025} color="#ff8a8a" segmentos={20} />
            </group>
          );
        }
        return <Tubo key={i} puntos={pts} radio={0.025} color="#ffffff" emisivo={0.1 + e * 0.5} segmentos={60} />;
      })}
    </group>
  );
};

const LigamentosIntro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.0, 5.0], l: [0, 0, 0], fov: 40 },
      { b: 2, p: [0.3, 0.5, 3.6], l: [0, 0, 0], fov: 40 },
      { b: 4, p: [-0.4, 0.9, 3.8], l: [0, 0.2, 0], fov: 40 },
    ],
    b,
  );
  const vasos = visible(b, 3, 4.1);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Ligamento e={0} />
        {vasos > 0 ? (
          <>
            <mesh position={[0, 0.62, 0]}>
              <boxGeometry args={[2.4, 0.04, 0.6]} />
              <meshPhysicalMaterial color="#ffd0c4" transparent opacity={0.6 * vasos} />
            </mesh>
            <Tubo puntos={[[-1.2, 0.68, 0.1], [-0.4, 0.72, -0.1], [0.4, 0.68, 0.15], [1.2, 0.7, 0]]} radio={0.03} color="#ff2440" emisivo={0.4} opacidad={vasos} segmentos={30} />
            <Tubo puntos={[[-1.2, 0.7, -0.15], [0, 0.66, 0.05], [1.2, 0.72, -0.1]]} radio={0.02} color={C.nervio} emisivo={0.6} opacidad={vasos} segmentos={30} />
          </>
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.8, 0.4, 0.5], t: "Hueso", a: 0, z: 1, o: [-60, -80], color: C.hueso },
          { p: [1.8, 0.4, 0.5], t: "Hueso", a: 0, z: 1, o: [60, -80], color: C.hueso },
          { p: [0, 0.4, 0.12], t: "Ligamento: une dos huesos", a: 0.1, z: 2, o: [60, -110], color: "#ffffff" },
          { p: [-0.5, 0.0, 0.12], t: "Fascículos paralelos", a: 1, z: 2, o: [-80, 100], color: "#ffffff" },
          { p: [0.3, -0.24, 0.12], t: "Fibras onduladas (amortiguan)", a: 2, z: 3, o: [80, 90], color: "#ffffff" },
          { p: [0.4, 0.68, 0.15], t: "Epiligamento: vasos y nervios", a: 3.1, z: 4, o: [80, -80], color: C.nervio },
        ]}
      />
      <Tarjeta b={b} a={0} z={2} x={1320} y={130} w={540} titulo="Ligamentos" color="#ffffff" tam={26}>
        <Lista items={["Esenciales para la **estabilidad articular**", "Controlan el **rango de movilidad** y la **propiocepción**", "**Colágeno + fibras elásticas**", "Macroscópico: bandas **blancas, densas, brillantes y tensas**; pueden reforzar la cápsula"]} />
      </Tarjeta>
      <Tarjeta b={b} a={2} z={4} x={1320} y={130} w={540} titulo="Microscópico" color="#ffffff" tam={26}>
        <Lista items={["Fibras de colágeno **onduladas**: amortiguan el estiramiento", "**Escasa vascularización**: desde el epiligamento o la membrana sinovial", "**Extra** e **intraarticulares**", b > 3 ? "**Epiligamento**: vasos y nervios → **propiocepción, sensibilidad y nocicepción**" : ""].filter(Boolean)} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

const ZONAS = [
  { n: "Fibrosa", d: "fibroblastos · colágeno I y III", c: "#ffffff" },
  { n: "Fibrocartílago", d: "condrocitos hipertróficos · colágeno X", c: "#bfe6ff" },
  { n: "Fibrocartílago mineralizado", d: "fibrocondrocitos · colágeno I y II", c: "#d9cfae" },
  { n: "Hueso mineralizado", d: "colágeno I · alto contenido mineral", c: C.hueso },
];

const EntesisEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [2.6, 1.6, 4.8], l: [0.6, 0, 0], fov: 40 },
      { b: 1, p: [2.2, 0.8, 4.4], l: [0.8, 0, 0], fov: 40 },
      { b: 3, p: [2.4, 1.2, 4.6], l: [0.8, 0, 0], fov: 40 },
    ],
    b,
  );
  const tira = Math.max(0, Math.sin(b * 5)) * visible(b, 1, 3);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {ZONAS.map((z, i) => (
          <mesh key={i} position={[-1.5 + i * 0.75 + (i === 0 ? -tira * 0.08 : 0), 0, 0]}>
            <boxGeometry args={[0.74, 1.4, 1.2]} />
            <meshPhysicalMaterial color={z.c} roughness={0.5} emissive={z.c} emissiveIntensity={0.08 + (Math.floor(b * 4) % 4 === i && b > 1 ? 0.3 : 0)} />
          </mesh>
        ))}
        {/* celulas de cada zona */}
        {ZONAS.flatMap((_, i) =>
          Array.from({ length: 6 }).map((__, k) => (
            <mesh key={`${i}${k}`} position={[-1.5 + i * 0.75 + (rnd(`ex${i}${k}`) - 0.5) * 0.5, (rnd(`ey${i}${k}`) - 0.5) * 1.1, 0.61]} scale={i === 0 ? [0.12, 0.03, 0.02] : [0.05, 0.05, 0.02]}>
              <sphereGeometry args={[1, 10, 8]} />
              <meshStandardMaterial color={["#5a7cff", "#ff8a5c", "#c08cff", C.osteocito][i]} emissive={["#5a7cff", "#ff8a5c", "#c08cff", C.osteocito][i]} emissiveIntensity={0.5} />
            </mesh>
          )),
        )}
        {/* ligamento que llega por la izquierda */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Tubo key={i} puntos={[[-4, -0.5 + i * 0.2, 0], [-2.8, -0.5 + i * 0.2 + Math.sin(i) * 0.03, 0], [-1.86, -0.5 + i * 0.2, 0]]} radio={0.04} color="#ffffff" segmentos={20} />
        ))}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={ZONAS.map((z, i) => ({ p: [-1.5 + i * 0.75, 0.7, 0.6] as V3, t: `${i + 1}. ${z.n}`, a: 1.05 + i * 0.05, z: 3, o: [i < 2 ? -40 : 40, -90 - (i % 2) * 60] as [number, number], color: z.c }))}
      />
      <Tarjeta b={b} a={0} z={1} x={1300} y={130} w={560} titulo="Entesis" color="#ffffff" tam={27}>
        <Rico t="Zona de **inserción** del ligamento (o tendón) en el hueso: **transfiere las fuerzas** de los tejidos blandos al esqueleto." />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={3} x={1300} y={130} w={560} titulo="Tipos de entesis" color="#bfe6ff" tam={25}>
        <Lista
          items={[
            "**Fibrosa (indirecta)**: tejido denso al **periostio**; zonas de **bajo estrés**",
            "**Fibrocartilaginosa (directa)**: grandes tendones y ligamentos; **4 zonas** escalonadas que **disipan el estrés** y el riesgo de desgarro",
          ]}
        />
        <div style={{ marginTop: 12, fontSize: 22, color: C.suave }}>
          {ZONAS.map((z, i) => (
            <div key={i}>
              <b style={{ color: z.c }}>{i + 1}.</b> {z.n}: {z.d}
            </div>
          ))}
        </div>
      </Tarjeta>
    </AbsoluteFill>
  );
};

const HistologiaLig: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.4, 0.8, 2.6], l: [0, 0, 0], fov: 40 },
      { b: 2, p: [-0.4, 0.6, 2.2], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  const fluye = Array.from({ length: 10 }).map((_, i): V3 => [mix(-1.6, 1.6, ((b * 0.6 + i / 10) % 1)), (i % 3) * 0.12 - 0.12, 0.25]);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {[-0.24, -0.08, 0.08, 0.24].map((y) => <Fibrilla key={y} y={y} z={0} ondula={1} largo={3.4} />)}
        {[-0.9, -0.1, 0.7].map((x, i) => (
          <mesh key={i} position={[x, 0.0, 0.05]} scale={[0.25, 0.05, 0.06]}>
            <sphereGeometry args={[1, 16, 10]} />
            <meshStandardMaterial color="#5a7cff" emissive="#5a7cff" emissiveIntensity={0.6} />
          </mesh>
        ))}
        <mesh position={[0.4, -0.16, 0.06]}>
          <sphereGeometry args={[0.06, 12, 10]} />
          <meshStandardMaterial color="#ff7ad9" emissive="#ff7ad9" emissiveIntensity={0.5} />
        </mesh>
        <Particulas pos={Array.from({ length: 18 }).map((_, i): V3 => [-1.5 + rnd(`hp${i}`) * 3, (rnd(`hq${i}`) - 0.5) * 0.6, (rnd(`hr${i}`) - 0.5) * 0.3])} radio={0.018} color="#7fd6ff" opacidad={0.7} />
        {b > 1 ? <Particulas pos={fluye} radio={0.03} color={C.acento2} /> : null}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.1, 0, 0.05], t: "Fibroblastos", a: 0, z: 1, o: [60, -100], color: "#5a7cff" },
          { p: [0.4, -0.16, 0.06], t: "Célula inflamatoria", a: 0.2, z: 1, o: [80, 80], color: "#ff7ad9" },
          { p: [1.2, 0.24, 0], t: "Colágeno", a: 1, z: 2, o: [60, -80], color: "#ffffff" },
          { p: [-1.2, 0.0, 0.25], t: "Fuerza → ligamento → hueso", a: 1.2, z: 2, o: [-60, 100], color: C.acento2 },
        ]}
      />
      <Tarjeta b={b} a={1} z={2} x={1320} y={130} w={540} titulo="Matriz extracelular (MEC)" color="#7fd6ff" tam={26}>
        <Lista items={["**Colágeno**: resistencia a la tensión", "**Elastina**: deformación reversible", "**Enzimas y factores de crecimiento**: remodelación y reparación", "**Proteoglicanos y glicoproteínas**: hidratación y amortiguación"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// Curva fuerza-elongacion (SVG)
const curva = (t: number) => {
  // t 0..1 -> punto (x,y) en coordenadas 0..1
  if (t < 0.2) return [t, 0.6 * (t / 0.2) ** 2 * 0.2];
  if (t < 0.65) return [t, 0.12 + ((t - 0.2) / 0.45) * 0.65];
  if (t < 0.85) return [t, 0.77 + Math.sin(((t - 0.65) / 0.2) * Math.PI * 0.5) * 0.15];
  return [t, 0.92 - ((t - 0.85) / 0.15) ** 1.5 * 0.85];
};

const Grafica: React.FC<{ hasta: number; x: number; y: number; w: number; h: number; desplaza?: number; histeresis?: number }> = ({
  hasta,
  x,
  y,
  w,
  h,
  desplaza = 0,
  histeresis = 0,
}) => {
  const n = 120;
  const pts = (d: number) =>
    Array.from({ length: n + 1 })
      .map((_, i) => (i / n) * hasta)
      .map((t) => curva(t))
      .map(([cx, cy]) => `${40 + (cx + d) * (w - 60)},${h - 40 - cy * (h - 70)}`)
      .join(" ");
  const [px, py] = curva(hasta);
  const fases = [
    [0, 0.2, "I"],
    [0.2, 0.65, "II"],
    [0.65, 0.85, "III"],
    [0.85, 1, "IV"],
  ] as const;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, background: "rgba(4,9,20,0.85)", borderRadius: 16 }}>
      {fases.map(([a, z, l], i) => (
        <g key={i} opacity={hasta > a ? 1 : 0.25}>
          <rect x={40 + a * (w - 60)} y={20} width={(z - a) * (w - 60)} height={h - 60} fill={["#5ec8ff", "#7cff8a", "#ffcf5a", "#ff5a5a"][i]} opacity={0.08} />
          <text x={40 + ((a + z) / 2) * (w - 60)} y={46} fill={["#5ec8ff", "#7cff8a", "#ffcf5a", "#ff5a5a"][i]} fontSize={28} fontWeight={800} textAnchor="middle" fontFamily={FUENTE}>
            {l}
          </text>
        </g>
      ))}
      <line x1={40} y1={h - 40} x2={w - 10} y2={h - 40} stroke="#9fb0c8" strokeWidth={3} />
      <line x1={40} y1={h - 40} x2={40} y2={10} stroke="#9fb0c8" strokeWidth={3} />
      <text x={w - 20} y={h - 12} fill="#9fb0c8" fontSize={22} textAnchor="end" fontFamily={FUENTE}>
        Elongación
      </text>
      <text x={50} y={h - 50} fill="#9fb0c8" fontSize={22} fontFamily={FUENTE} transform={`rotate(-90 ${24} ${h / 2})`}>
        Fuerza
      </text>
      {desplaza > 0 ? <polyline points={pts(0)} fill="none" stroke="#9fb0c8" strokeWidth={3} strokeDasharray="8 8" /> : null}
      <polyline points={pts(desplaza)} fill="none" stroke={C.acento} strokeWidth={5} />
      {histeresis > 0 ? (
        <polyline
          points={Array.from({ length: 61 })
            .map((_, i) => (i / 60) * 0.6)
            .map((t) => curva(t))
            .map(([cx, cy]) => `${40 + (cx + 0.05) * (w - 60)},${h - 40 - cy * 0.82 * (h - 70)}`)
            .join(" ")}
          fill="none"
          stroke={C.acento2}
          strokeWidth={4}
          strokeDasharray="10 6"
          opacity={histeresis}
        />
      ) : null}
      {hasta > 0 && desplaza === 0 && histeresis === 0 ? <circle cx={40 + px * (w - 60)} cy={h - 40 - py * (h - 70)} r={10} fill="#fff" /> : null}
    </svg>
  );
};

const CurvaEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  // b0 intro, b1 fase I, b2 fase II, b3 fase III, b4 fase IV
  const hasta = b < 1 ? 0 : b < 2 ? 0.2 * lineal(b, 1, 1.8) : b < 3 ? 0.2 + 0.45 * lineal(b, 2, 2.8) : b < 4 ? 0.65 + 0.2 * lineal(b, 3, 3.8) : 0.85 + 0.15 * lineal(b, 4, 4.6);
  const cam = camara(
    [
      { b: 0, p: [0, 1.2, 5.2], l: [0, 0, 0], fov: 40 },
      { b: 5, p: [0.3, 1.0, 4.8], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={{ ...cam, p: [cam.p[0] + 2.0, cam.p[1], cam.p[2] + 1.4], l: [cam.l[0] + 2.0, cam.l[1], cam.l[2]] }}>
        <Ligamento e={hasta} />
      </Escena3D>
      <Grafica hasta={Math.max(0.001, hasta)} x={1080} y={150} w={780} h={520} />
    </AbsoluteFill>
  );
};

const HisteresisEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.fondo2} 0%, ${C.fondo} 75%)` }}>
      {b < 2 ? (
        <>
          <Grafica hasta={0.6} x={60} y={150} w={760} h={480} histeresis={entre(b, 0.1, 0.5)} />
          <div style={{ position: "absolute", left: 80, top: 640, width: 720, fontFamily: FUENTE, fontSize: 26, color: C.suave }}>
            <span style={{ color: C.acento }}>━ carga</span> &nbsp;&nbsp; <span style={{ color: C.acento2 }}>╍ descarga</span>: la curva de vuelta queda desplazada (energía disipada)
          </div>
          <div style={{ position: "absolute", right: 50, top: 150, width: 1000, background: "rgba(4,9,20,0.9)", borderRadius: 16, padding: "16px 20px", fontFamily: FUENTE, color: C.texto }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.acento2, marginBottom: 6 }}>Histéresis del ligamento</div>
            <Tabla
              tam={22}
              anchos="0.9fr 1.5fr 1.5fr"
              cab={["Aspecto", "Ventajas", "Desventajas"]}
              filas={[
                ["Definición", "Disipación de energía al estirarse y volver: curva ligeramente desplazada", "—"],
                ["Función biomecánica", "Amortiguador: protege de movimientos bruscos o impactos", "Fatiga tisular si se repite mucho o con cargas excesivas"],
                ["Seguridad articular", "Movimientos dinámicos sin dañar el colágeno", "La elongación progresiva por fatiga ↑ microrroturas"],
                ["Recuperación", "Vuelve casi a su longitud original tras cargas normales", "Recuperación incompleta si hay sobrecarga continua"],
              ]}
            />
          </div>
        </>
      ) : (
        <>
          <Grafica hasta={0.85} x={420} y={150} w={1080} h={560} desplaza={0.12 * entre(b, 2.2, 2.9)} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 730, textAlign: "center", fontFamily: FUENTE, fontSize: 34, fontWeight: 800, color: C.acento }}>
            Estiramiento constante → la curva se desplaza a la derecha
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

const AplicacionesTendon: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.4, -0.3, 6.6], l: [0.4, -0.6, 0], fov: 40 },
      { b: 2, p: [1.6, -0.2, 6.8], l: [0.6, -0.6, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Pierna apoyo={Math.max(0, Math.sin(b * 8)) * visible(b, 0, 1)} />
        {b > 1 ? (
          <group position={[1.6, -1.0, 0]}>
            <CilindroX radio={mix(0.12, 0.2, entre(b, 1.2, 1.9))} largo={2} x={1} color={TENDON} emisivo={0.2} />
          </group>
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Tarjeta b={b} a={0} z={2} x={1320} y={130} w={540} titulo="Aplicaciones en el rendimiento" color={TENDON} tam={26}>
        <Lista
          items={[
            "**Tendones largos** (Aquiles, rotuliano): almacenan **energía elástica** → movimiento más eficiente",
            "**Tendones cortos y fuertes** (manos y muñecas): **precisión y estabilidad** al manipular cargas",
            b > 1 ? "**Fuerza progresiva**: ↑ **grosor y rigidez** del tendón → mejor transmisión de fuerza y **menos lesiones**" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

export const CAP5: PlanoDef[] = [
  {
    id: "tendones-intro",
    seccion: SEC_T,
    textos: [
      "**Tendones**: estructuras de **tejido conectivo denso** que **unen los músculos a los huesos** y **transmiten la fuerza** de la contracción para producir movimiento.",
      "Son estructuras **dinámicas y adaptables**: responden a estímulos mecánicos como la **tensión**, la **frecuencia** y la **duración** del ejercicio.",
      "Además de transmitir fuerza, **almacenan energía elástica** para movimientos explosivos y una locomoción eficiente. El **tendón de Aquiles** actúa como un **resorte** en la carrera: **almacena energía en el apoyo** y la **libera en el impulso**.",
    ],
    Escena: TendonIntro,
  },
  {
    id: "tendon-composicion",
    seccion: SEC_T + " · Composición",
    textos: [
      "**Composición y organización**: el tendón está formado por haces paralelos de fibras, organizados para resistir **cargas longitudinales** y adaptarse a **fuerzas repetitivas**.",
      "**Fibras de colágeno tipo I**: principal componente, dan **resistencia a la tracción**. **Tenocitos**: células que **mantienen y reparan** el tejido. **Matriz extracelular**, rica en **proteoglicanos y agua**: da **elasticidad y capacidad de deformación**.",
    ],
    Escena: ComposicionTendon,
  },
  {
    id: "tendon-propiedades",
    seccion: SEC_T + " · Propiedades mecánicas",
    textos: [
      "**Elasticidad**: capacidad de **volver a su forma original** después de una deformación.",
      "**Viscoelasticidad**: comportamiento **dependiente del tiempo**: la **resistencia aumenta con la velocidad de carga**.",
      "**Plasticidad y adaptación**: con **entrenamiento progresivo de fuerza**, el tendón **se engrosa** y aumenta su resistencia.",
      "**Prevención**: el tendón **absorbe parte de la carga**, disminuyendo el estrés directo sobre las **articulaciones**.",
    ],
    Escena: PropiedadesTendon,
  },
  {
    id: "tendon-lesiones",
    seccion: SEC_T + " · Lesiones comunes",
    textos: [
      "**Tendinitis**: inflamación, generalmente **aguda por sobreuso**. **Tendinosis**: **degeneración crónica**, con **alteración del colágeno** y **menor vascularización**.",
      "**Rupturas parciales**: requieren **intervención quirúrgica** y **rehabilitación prolongada**.",
      "**Factores de riesgo**: la **edad**, el **desequilibrio muscular** y el **entrenamiento excesivo sin progresión**.",
    ],
    Escena: LesionesTendon,
  },
  {
    id: "tendon-aplicaciones",
    seccion: SEC_T + " · Ejercicio y rendimiento",
    textos: [
      "**Tendones largos** (Aquiles, rotuliano): su **almacenamiento de energía elástica** mejora la **eficiencia** del movimiento. **Tendones cortos y fuertes** (manos y muñecas): dan **precisión y estabilidad** al manipular cargas.",
      "El **entrenamiento progresivo de fuerza** aumenta el **grosor y la rigidez** del tendón: mejora la **transmisión de fuerza** y **reduce el riesgo de lesión**.",
    ],
    Escena: AplicacionesTendon,
  },
  {
    id: "ligamentos",
    seccion: SEC_L,
    textos: [
      "**Ligamentos**: esenciales para la **estabilidad articular**; controlan el **rango de movilidad** y la **propiocepción**. Formados por **colágeno y fibras elásticas**, **unen dos huesos** adyacentes alrededor de las articulaciones.",
      "**Macroscópicamente**: bandas o cordones **blancos, densos, brillantes y tensos**, formados por **fascículos de fibras paralelas** cuya función depende de su orientación. Pueden ser **refuerzos de la cápsula** articular.",
      "**Microscópicamente**: fibras de colágeno **onduladas** que **amortiguan el estrés** del estiramiento. Tienen **escasa vascularización**, que llega desde el **epiligamento** o la **membrana sinovial**. Pueden ser **extraarticulares o intraarticulares**.",
      "El **epiligamento** es rico en **vasos y nervios**: por eso el ligamento tiene **propiocepción, sensibilidad y nocicepción** (dolor).",
    ],
    Escena: LigamentosIntro,
  },
  {
    id: "entesis",
    seccion: SEC_L + " · Entesis",
    textos: [
      "**Entesis**: zona de **inserción entre el hueso y el ligamento** (o tendón). Su función es **transferir las fuerzas mecánicas** de los tejidos blandos al esqueleto.",
      "**Entesis fibrosa (indirecta)**: tejido conectivo denso que se inserta en el **periostio** o el hueso; suele estar en zonas de **bajo estrés mecánico**.",
      "**Entesis fibrocartilaginosa (directa)**: la más común en grandes tendones y ligamentos. Tiene **4 zonas**: **fibrosa** (fibroblastos, colágeno I y III), **fibrocartílago** (condrocitos hipertróficos, colágeno X), **fibrocartílago mineralizado** (colágeno I y II) y **hueso**. Este diseño escalonado **disipa el estrés** y el riesgo de desgarro.",
    ],
    Escena: EntesisEscena,
  },
  {
    id: "ligamento-histologia",
    seccion: SEC_L + " · Histología",
    textos: [
      "**Histología**: los ligamentos están formados por **fibroblastos**, que **sintetizan colágeno** y mantienen la **homeostasis de la matriz extracelular (MEC)**, y en menor proporción **células inflamatorias**.",
      "La MEC contiene **colágeno** (resistencia a la tensión), **elastina** (deformación reversible), **enzimas y factores de crecimiento** (remodelación y reparación) y **proteoglicanos y glicoproteínas** (hidratación y amortiguación). La MEC **distribuye las fuerzas** al ligamento y luego al **hueso**.",
    ],
    Escena: HistologiaLig,
  },
  {
    id: "curva-fuerza-elongacion",
    seccion: SEC_L + " · Propiedades biomecánicas",
    textos: [
      "**Curva fuerza-elongación**: al aplicar una fuerza creciente a velocidad constante, el ligamento se deforma. Veamos sus **4 fases**.",
      "**Fase I**: se estiran las fibras de colágeno, que en reposo están **onduladas**. Requiere **fuerza mínima** y la **elongación es rápida**.",
      "**Fase II**: las fibras ya alineadas se tensan **en proporción a la carga**. La deformación es **reversible**: es el **rango fisiológico seguro** del movimiento articular.",
      "**Fase III**: superado el **límite elástico**, comienzan a **romperse algunas fibras** y el daño aumenta. Es la **fase inicial de la lesión** ligamentaria.",
      "**Fase IV**: **rotura completa** del ligamento. Clínicamente: **desgarros o rupturas completas**.",
    ],
    Escena: CurvaEscena,
  },
  {
    id: "histeresis",
    seccion: SEC_L + " · Histéresis y estiramiento",
    textos: [
      "**Histéresis**: cuando el ligamento se estira y vuelve, **disipa energía** y la curva de vuelta queda **ligeramente desplazada**. Funciona como **amortiguador** que protege la articulación de movimientos bruscos o impactos.",
      "Ventajas: permite **movimientos dinámicos** sin dañar el colágeno y el ligamento **vuelve casi a su longitud** tras cargas normales. Desventajas: si se repite demasiado o con **cargas excesivas** produce **fatiga tisular**, **microrroturas** y **recuperación incompleta**.",
      "**Aplicación práctica: estiramiento articular**. En articulaciones rígidas, el estiramiento máximo genera **dolor y resistencia** al inicio. Con el tiempo disminuyen, porque la **curva fuerza-elongación se desplaza a la derecha**.",
    ],
    Escena: HisteresisEscena,
  },
];
