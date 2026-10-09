// Short: Déficit calórico: por qué no bajas de peso
// Del atleta en la báscula a la grasa que se quema en la mitocondria, y los 3 errores típicos.
import React from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { Cam, camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd, Tubo } from "../fisio/modelos/comun";
import { Cadena, Esfera, MitocondriaGrande, Mol, Vaso } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { Humano } from "../fisio/modelos/cuerpo";
import { MiniATP } from "../fisio/energia/e1";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaCierre } from "./cierre";
import { ANTON, Chip, Dato, Destello, INTER, K, pop, ShortDef, Titular } from "./marco";
import { AguaMol, Atleta, Bascula, Pechuga, Piso, Plato } from "./modelos";
import { Adipocito, CelulaSimple } from "./modelos-ayuno";

const GRASO = K.amarillo;

const camAtleta = (b: number, a = 0, z = 1): Cam =>
  camara(
    [
      { b: a, p: [2.6, 1.4, 6.2], l: [0, 0.62, 0], fov: 36 },
      { b: z, p: [-2.2, 1.3, 5.9], l: [0, 0.65, 0], fov: 36 },
    ],
    b,
  );

/** Escala de entrada con rebote (0 antes de a). */
const sale = (b: number, a: number) => (b < a ? 0 : Math.max(0, pop(b, a)));

// ---- Modelos propios ---------------------------------------------------------------

/** Llama estilizada (gasto de energia). */
const Llama: React.FC<{ p: V3; escala?: number; b: number }> = ({ p, escala = 1, b }) => {
  const f = 1 + Math.sin(b * 40) * 0.06;
  return (
    <group position={p} scale={[escala, escala * f, escala]}>
      <mesh position={[0, 0.28, 0]}>
        <coneGeometry args={[0.18, 0.56, 24]} />
        <meshStandardMaterial color={K.naranja} emissive={K.naranja} emissiveIntensity={1.2} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.2, 0.02]}>
        <coneGeometry args={[0.1, 0.36, 20]} />
        <meshStandardMaterial color={K.amarillo} emissive={K.amarillo} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
};

/** Balanza: pilar, barra que se inclina y dos platillos colgantes. ang > 0 baja el lado derecho. */
const Balanza: React.FC<{ ang: number; izq: React.ReactNode; der: React.ReactNode }> = ({ ang, izq, der }) => {
  const alto = 2.1;
  const L = 1.2;
  const cuelga = 0.95;
  const ext = (s: number): V3 => [s * L * Math.cos(ang), alto - s * L * Math.sin(ang), 0];
  const metal = <meshPhysicalMaterial color="#cfd8dc" metalness={0.7} roughness={0.25} clearcoat={0.6} />;
  const platillo = (s: number, cont: React.ReactNode) => {
    const e = ext(s);
    const pp: V3 = [e[0], e[1] - cuelga, 0];
    return (
      <group key={s}>
        {[-1, 1].map((q) => (
          <Tubo key={q} puntos={[e, [pp[0] + q * 0.25, pp[1] + 0.02, 0]]} radio={0.012} color="#cfd8dc" />
        ))}
        <mesh position={pp}>
          <cylinderGeometry args={[0.6, 0.45, 0.06, 48]} />
          {metal}
        </mesh>
        <group position={[pp[0], pp[1] + 0.03, 0]}>{cont}</group>
      </group>
    );
  };
  return (
    <group>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.12, 48]} />
        {metal}
      </mesh>
      <mesh position={[0, alto / 2, 0]}>
        <cylinderGeometry args={[0.07, 0.09, alto, 24]} />
        {metal}
      </mesh>
      <mesh position={[0, alto, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 24]} />
        <meshStandardMaterial color={K.lima} emissive={K.lima} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, alto, 0]} rotation={[0, 0, -ang]}>
        <boxGeometry args={[L * 2, 0.07, 0.07]} />
        {metal}
      </mesh>
      {platillo(-1, izq)}
      {platillo(1, der)}
    </group>
  );
};

/** Botella de aceite (cilindro dorado). */
const Aceite: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.32, 0]}>
      <cylinderGeometry args={[0.15, 0.17, 0.64, 32]} />
      <meshPhysicalMaterial color="#f2b81f" emissive="#c98a00" emissiveIntensity={0.25} transparent opacity={0.85} clearcoat={1} roughness={0.1} />
    </mesh>
    <mesh position={[0, 0.72, 0]}>
      <cylinderGeometry args={[0.05, 0.13, 0.18, 24]} />
      <meshPhysicalMaterial color="#f2b81f" transparent opacity={0.85} clearcoat={1} roughness={0.1} />
    </mesh>
    <mesh position={[0, 0.84, 0]}>
      <cylinderGeometry args={[0.055, 0.055, 0.07, 20]} />
      <meshStandardMaterial color="#2f6b2a" />
    </mesh>
  </group>
);

/** Botella de refresco (cilindro rojo con etiqueta). */
const Refresco: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.3, 0]}>
      <cylinderGeometry args={[0.14, 0.14, 0.6, 32]} />
      <meshPhysicalMaterial color="#3a0f0c" transparent opacity={0.9} clearcoat={1} roughness={0.1} />
    </mesh>
    <mesh position={[0, 0.32, 0]}>
      <cylinderGeometry args={[0.145, 0.145, 0.2, 32]} />
      <meshStandardMaterial color={K.rojo} emissive={K.rojo} emissiveIntensity={0.3} />
    </mesh>
    <mesh position={[0, 0.7, 0]}>
      <cylinderGeometry args={[0.04, 0.14, 0.2, 24]} />
      <meshPhysicalMaterial color="#3a0f0c" transparent opacity={0.9} clearcoat={1} />
    </mesh>
    <mesh position={[0, 0.82, 0]}>
      <cylinderGeometry args={[0.05, 0.05, 0.05, 20]} />
      <meshStandardMaterial color={K.rojo} />
    </mesh>
  </group>
);

/** Tazon con salsa cremosa. */
const Salsa: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]}>
      <sphereGeometry args={[0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#e9eef0" side={THREE.DoubleSide} clearcoat={0.8} />
    </mesh>
    <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.18, 32]} />
      <meshPhysicalMaterial color="#fff2c4" emissive="#ffe08a" emissiveIntensity={0.2} clearcoat={0.8} />
    </mesh>
  </group>
);

/** Tazon de botanas (papas fritas). */
const Botanas: React.FC<{ p: V3; s: number }> = ({ p, s }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.14, 0]} rotation={[Math.PI, 0, 0]}>
      <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial color="#2d6f8f" side={THREE.DoubleSide} clearcoat={0.6} />
    </mesh>
    {Array.from({ length: 16 }).map((_, i) => (
      <mesh
        key={i}
        position={[(rnd(`bt${i}`) - 0.5) * 0.4, 0.15 + rnd(`by${i}`) * 0.12, (rnd(`bz${i}`) - 0.5) * 0.4]}
        rotation={[rnd(`br${i}`) * 2, rnd(`bs${i}`) * 3, rnd(`bu${i}`)]}
        scale={[0.09, 0.012, 0.07]}
      >
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#f5c542" emissive="#d99a1c" emissiveIntensity={0.15} />
      </mesh>
    ))}
  </group>
);

// 0 · Gancho: la bascula no se mueve -------------------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camAtleta(b);
  const dia = 1 + Math.floor(lineal(b, 0.05, 0.85) * 29);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0, 0.06, 0]}>
          <Atleta ej="parado" brilla={0.15} />
        </group>
        <Bascula />
        <Piso color={K.rojo} />
      </Escena3D>
      <Titular b={b} a={0.03} z={1.2} y={270} tam={140} t="¿No bajas?" />
      <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: visible(b, 0.02, 1.2) }}>
        <div
          style={{
            background: "#0b1d21",
            border: `5px solid ${K.lima}`,
            borderRadius: 26,
            padding: "10px 40px",
            display: "flex",
            alignItems: "baseline",
            gap: 30,
            boxShadow: `0 0 40px ${K.lima}44`,
          }}
        >
          <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 40, color: K.suave }}>DÍA {dia}</span>
          <span style={{ fontFamily: ANTON, fontSize: 96, color: K.lima, letterSpacing: 2 }}>72.0 kg</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 1 · Balanza: entra menos de lo que sale -------------------------------------------
const Balance: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const inclina = entre(b, 0.45, 0.8);
  const ang = mix(0, 0.22, inclina) + Math.sin(b * 6) * 0.01;
  const cam = camara(
    [
      { b: 0, p: [1.0, 2.4, 10.6], l: [0, 0.75, 0], fov: 38 },
      { b: 1, p: [-0.9, 2.2, 10.0], l: [0, 0.75, 0], fov: 38 },
    ],
    b,
  );
  const comida = (
    <group>
      <Plato p={[0, 0.03, 0]} escala={0.8} />
      <Pechuga p={[-0.12, 0.1, 0]} escala={0.55} />
      <Esfera p={[0.22, 0.14, 0.1]} r={0.1} color="#7bc043" brillo={0.2} />
      <Esfera p={[0.26, 0.12, -0.14]} r={0.08} color="#f5f0e1" brillo={0.2} />
    </group>
  );
  const gasto = (
    <group>
      <group scale={0.32}>
        <Atleta ej="sprint" fase={b * 30} brilla={0.6} colorBrillo={K.naranja} />
      </group>
      <Llama p={[0.36, 0, 0.1]} escala={0.6} b={b} />
      <Llama p={[-0.38, 0, -0.05]} escala={0.45} b={b + 0.3} />
    </group>
  );
  const L = 1.2;
  const izq: V3 = [-L * Math.cos(ang), 2.1 + L * Math.sin(ang) - 0.95, 0];
  const der: V3 = [L * Math.cos(ang), 2.1 - L * Math.sin(ang) - 0.95, 0];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Balanza ang={ang} izq={comida} der={gasto} />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [izq[0], izq[1] + 0.25, 0], t: "Lo que comes", a: 0.12, z: 1.2, o: [10, 190], color: K.cian },
          { p: [der[0], der[1] + 0.6, 0], t: "Lo que gastas", a: 0.25, z: 1.2, o: [-10, 170], color: K.naranja },
        ]}
      />
      <Dato b={b} a={0.08} z={1.2} t="Déficit calórico" sub="gastas más de lo que comes" color={K.lima} y={250} tam={100} />
    </AbsoluteFill>
  );
};

// 2 · Del cuerpo a la grasa: lipolisis y oxidacion -------------------------------------
const Grasa: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.24;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [1.4, 1.2, 5.8], l: [0, 0.75, 0], fov: 36 },
          { b: 0.24, p: [0.35, 1.1, 1.5], l: [0, 1.0, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.24, p: [0, 0.9, 17], l: [0, 0.9, 0], fov: 40 },
          { b: 1, p: [0.9, 0.8, 18.5], l: [0, 0.9, 0], fov: 40 },
        ],
        b,
      );
  const libera = entre(b, 0.38, 0.95);
  const ad: V3 = [-0.6, 2.0, 0];
  const vy = 0.2;
  const mito: V3 = [0.4, -1.75, 0];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [12, 34]}>
        {fuera ? (
          <>
            <Atleta ej="parado" brilla={0.2 + entre(b, 0.08, 0.22) * 0.8} colorBrillo={GRASO} />
            <Piso />
          </>
        ) : (
          <>
            <Adipocito p={ad} r={1.0} gota={mix(0.8, 0.5, libera)} brillo={0.12 * libera} />
            <Adipocito p={[-2.3, 2.6, -1.4]} r={0.8} gota={mix(0.75, 0.55, libera)} />
            <Adipocito p={[1.5, 2.8, -1.6]} r={0.75} gota={mix(0.75, 0.55, libera)} />
            <Vaso desde={[-3.4, vy, 0]} hasta={[3.4, vy, 0]} t={b * 1.2} radio={0.5} />
            <CelulaSimple p={mito} r={1.5} color="#c03a46" />
            <group position={mito} scale={0.5} rotation={[0.3, 0.2, 0]}>
              <MitocondriaGrande brillo={0.15 + 0.5 * libera} />
            </group>
            {Array.from({ length: 8 }).map((_, i) => {
              const a = 0.36 + i * 0.055;
              const k = lineal(b, a, a + 0.32);
              if (k <= 0 || k >= 1) return null;
              const p0: V3 = [ad[0] + 0.3, ad[1] - 0.7, 0.5];
              const p1: V3 = [ad[0] + 0.2 + (i % 3) * 0.4, vy, 0.4];
              const p2: V3 = [mito[0] - 0.5 + (i % 3) * 0.3, mito[1] + 0.2, 0.6];
              const p = k < 0.5 ? mix3(p0, p1, k * 2) : mix3(p1, p2, (k - 0.5) * 2);
              return <Cadena key={i} n={8} p={[p[0] - 0.4, p[1], p[2]]} color={GRASO} sep={0.11} brillo={0.6} op={k > 0.9 ? (1 - k) * 10 : 1} />;
            })}
            {Array.from({ length: 6 }).map((_, i) => {
              const a = 0.62 + i * 0.05;
              const k = lineal(b, a, a + 0.25);
              if (k <= 0) return null;
              const d: V3 = [mito[0] + (i % 2 ? 1.7 : -1.7) * (0.5 + 0.5 * k), mito[1] - 0.6 + (i % 3) * 0.5 * k, 0.9];
              return <MiniATP key={`a${i}`} p={mix3([mito[0], mito[1], 0.8], d, k)} escala={1.6} brillo={0.7} op={Math.min(1, k * 4)} />;
            })}
            <Polvo b={b} radio={7} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.24]} />
      {fuera ? <Chip b={b} a={0.06} z={0.24} t="GRASA CORPORAL" x={540} y={330} color={GRASO} /> : null}
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [ad[0] + 0.6, ad[1] + 0.6, 0], t: "Adipocito", a: 0.3, z: 1.2, o: [40, -110], color: GRASO },
            { p: [-1.2, vy + 0.1, 0.4], t: "Ácidos grasos", a: 0.5, z: 1.2, o: [-30, 120], color: GRASO },
            { p: [mito[0] + 0.6, mito[1] + 0.3, 0], t: "Mitocondria", a: 0.66, z: 1.2, o: [50, 110], color: K.naranja },
            { p: [mito[0] - 1.3, mito[1] - 0.2, 0.9], t: "ATP", a: 0.78, z: 1.2, o: [-50, 90], color: "#4f8dff" },
          ]}
        />
      ) : null}
      {!fuera ? <Dato b={b} a={0.28} z={1.2} t="Grasa → energía" sub="se oxida en la mitocondria" color={GRASO} y={240} tam={90} /> : null}
    </AbsoluteFill>
  );
};

// 3 · Error 1: calorias ocultas --------------------------------------------------------
const OCULTAS: { t: string; kcal: number; a: number; p: V3; o: [number, number]; c: string }[] = [
  { t: "Aceite 1 cda", kcal: 120, a: 0.4, p: [-0.75, 0, -0.35], o: [20, -170], c: "#f2b81f" },
  { t: "Refresco 600 ml", kcal: 250, a: 0.5, p: [0.75, 0, -0.4], o: [-20, -230], c: K.rojo },
  { t: "Mayonesa 1 cda", kcal: 90, a: 0.6, p: [-0.6, 0, 0.65], o: [20, 110], c: "#fff2c4" },
  { t: "Papas 45 g", kcal: 240, a: 0.7, p: [0.62, 0, 0.65], o: [-20, 170], c: "#f5c542" },
];

const Ocultas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 3.6, 8.6], l: [0, -0.35, 0], fov: 38 },
      { b: 1, p: [0.6, 3.2, 8.2], l: [0, -0.35, 0], fov: 38 },
    ],
    b,
  );
  const suma = OCULTAS.reduce((s, o) => s + (b >= o.a ? o.kcal : 0), 0);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, b * 0.25 - 0.1, 0]}>
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[1.45, 1.45, 0.08, 64]} />
            <meshStandardMaterial color="#123238" roughness={0.7} />
          </mesh>
          <Plato p={[0, 0.03, 0]} escala={0.9} />
          <Pechuga p={[0, 0.1, 0]} escala={0.6} />
          <Aceite p={OCULTAS[0].p} s={sale(b, OCULTAS[0].a)} />
          <Refresco p={OCULTAS[1].p} s={sale(b, OCULTAS[1].a)} />
          <Salsa p={OCULTAS[2].p} s={sale(b, OCULTAS[2].a) * 1.2} />
          <Botanas p={OCULTAS[3].p} s={sale(b, OCULTAS[3].a)} />
        </group>
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={OCULTAS.map((o) => {
          const g = b * 0.25 - 0.1;
          const q: V3 = [o.p[0] * Math.cos(g) + o.p[2] * Math.sin(g), 0.45, -o.p[0] * Math.sin(g) + o.p[2] * Math.cos(g)];
          return { p: q, t: `${o.t}  +${o.kcal}`, a: o.a + 0.03, z: 1.2, o: o.o, color: o.c };
        })}
      />
      <Dato b={b} a={0.03} z={1.2} t="Error 1" sub="subestimas lo que comes" color={K.naranja} y={240} tam={100} />
      <div style={{ position: "absolute", top: 1065, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: visible(b, 0.38, 1.2) }}>
        <div
          style={{
            fontFamily: ANTON,
            fontSize: 100,
            color: K.naranja,
            WebkitTextStroke: "8px #04090b",
            paintOrder: "stroke fill",
            transform: `scale(${1 + 0.12 * Math.max(0, ...OCULTAS.map((o) => 1 - Math.abs(b - o.a) / 0.04))})`,
          }}
        >
          +{suma} kcal
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 4 · Error 2: te mueves menos ---------------------------------------------------------
const Adaptacion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const frena = entre(b, 0.15, 0.55);
  const marcha = mix(1.1, 0, frena);
  const cam = camAtleta(b);
  const gasto = Math.round(mix(2500, 2350, entre(b, 0.2, 0.75)) / 10) * 10;
  const nCalor = Math.round(mix(18, 5, frena));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Humano fase={b * 28} marcha={marcha} musculo={0.8} brilla={mix(0.7, 0.15, frena)} colorBrillo={K.naranja} />
        <Piso color={K.naranja} />
        {Array.from({ length: nCalor }).map((_, i) => {
          const t = (b * 2.5 + rnd(`cl${i}`)) % 1;
          const a = rnd(`ca${i}`) * Math.PI * 2;
          return <Mol key={i} p={[Math.cos(a) * 0.45, 0.4 + t * 1.6, Math.sin(a) * 0.35]} color={K.naranja} r={0.04} op={1 - t} brillo={1.2} />;
        })}
      </Escena3D>
      <Dato b={b} a={0.03} z={0.62} t="Error 2" sub="te mueves menos sin notarlo" color={K.naranja} y={240} tam={100} />
      <Dato b={b} a={0.62} z={1.2} t="Adaptación metabólica" sub="gastas un poco menos" color={K.cian} y={250} tam={78} />
      <div style={{ position: "absolute", top: 990, left: 140, right: 140, opacity: visible(b, 0.1, 1.2) }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: INTER, fontWeight: 900, fontSize: 36, color: K.tinta }}>
          <span>GASTO DIARIO</span>
          <span style={{ color: K.naranja }}>≈ {gasto} kcal</span>
        </div>
        <div style={{ marginTop: 12, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.12)", border: "3px solid rgba(255,255,255,0.25)", overflow: "hidden" }}>
          <div style={{ width: `${(gasto / 2600) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${K.amarillo}, ${K.naranja})` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 5 · Error 3: la bascula engaña, mira la tendencia ------------------------------------
const DIAS = 28;
const pesoDia = (d: number) => 72.3 - 0.05 * d + (rnd(`pd${d}`) - 0.5) * 0.9 + Math.sin(d * 0.9) * 0.3;
const PX = (d: number) => -1.7 + (d / (DIAS - 1)) * 3.4;
const PY = (kg: number) => (kg - 70) * 1.0;

const Tendencia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const dibuja = lineal(b, 0.05, 0.55);
  const tend = entre(b, 0.6, 0.85);
  const n = Math.max(1, Math.round(dibuja * DIAS));
  const cam = camara(
    [
      { b: 0, p: [1.0, 2.0, 12.4], l: [0, 1.15, 0], fov: 38 },
      { b: 1, p: [-0.7, 1.8, 12.0], l: [0, 1.15, 0], fov: 38 },
    ],
    b,
  );
  const pts: V3[] = Array.from({ length: n }).map((_, d) => [PX(d), PY(pesoDia(d)), 0]);
  const pico = 9;
  const finT: V3 = [mix(PX(0), PX(DIAS - 1), tend), PY(mix(72.3, 72.3 - 0.05 * (DIAS - 1), tend)), 0.05];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, -0.12, 0]}>
          {/* ejes y rejilla */}
          <mesh position={[0, 0, -0.1]}>
            <planeGeometry args={[3.8, 3.4]} />
            <meshStandardMaterial color="#0d2a2f" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
          {[0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((y) => (
            <mesh key={y} position={[0, y - 1.7 + 1.7, -0.08]}>
              <boxGeometry args={[3.6, 0.008, 0.008]} />
              <meshBasicMaterial color="#2c5a60" />
            </mesh>
          ))}
          {pts.length > 1 ? <Tubo puntos={pts} radio={0.018} color={K.cian} emisivo={0.6} segmentos={pts.length * 6} /> : null}
          {pts.map((p, d) => (
            <Esfera key={d} p={p} r={0.045} color={K.cian} brillo={0.5} />
          ))}
          {tend > 0.02 ? <Tubo puntos={[[PX(0), PY(72.3), 0.05], finT]} radio={0.045} color={K.lima} emisivo={0.8} /> : null}
          {/* agua que sube y baja con los picos */}
          {n > pico
            ? Array.from({ length: 6 }).map((_, i) => {
                const p = pts[pico];
                return (
                  <AguaMol
                    key={i}
                    p={[p[0] - 0.3 + (i % 3) * 0.3, p[1] + 0.35 + Math.floor(i / 3) * 0.28 + Math.sin(b * 8 + i) * 0.06, 0.2]}
                    escala={1.5}
                    op={visible(b, 0.33, 0.95)}
                  />
                );
              })
            : null}
        </group>
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [PX(pico) - 0.1, PY(pesoDia(pico)) + 0.7, 0.2], t: "Agua y glucógeno", a: 0.36, z: 1.2, o: [20, -130], color: K.cian },
          { p: [PX(DIAS - 1), PY(72.3 - 0.05 * (DIAS - 1)), 0.05], t: "Tendencia ↓", a: 0.8, z: 1.2, o: [-40, 130], color: K.lima },
        ]}
      />
      <Dato b={b} a={0.03} z={0.6} t="Error 3" sub="la báscula engaña" color={K.naranja} y={240} tam={100} />
      <Dato b={b} a={0.6} z={1.2} t="Mira la tendencia" sub="de varias semanas" color={K.lima} y={250} tam={90} />
      <Chip b={b} a={0.08} z={1.2} t="4 SEMANAS" x={540} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 6 · Recomposicion: musculo arriba, grasa abajo ---------------------------------------
const Recomposicion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.26;
  const reps = b * 7;
  const k = Math.sin((reps % 1) * Math.PI);
  const crece = entre(b, 0.35, 0.95);
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [2.0, 1.3, 5.4], l: [0, 0.7, 0], fov: 36 },
          { b: 0.26, p: [0.9, 1.25, 3.4], l: [0.1, 0.95, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.26, p: [0, 0.3, 15], l: [0, -0.4, 0], fov: 40 },
          { b: 1, p: [0.8, 0.5, 14], l: [0, -0.4, 0], fov: 40 },
        ],
        b,
      );
  const rFibra = mix(0.38, 0.52, crece);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [10, 30]}>
        {fuera ? (
          <>
            <Atleta ej="curl" k={k} brilla={0.6} colorBrillo={K.lima} />
            <Piso />
          </>
        ) : (
          <>
            {/* fibras musculares (izquierda) que se engrosan */}
            <group rotation={[0, 0, Math.PI / 2]}>
              {[
                [-1.3, 0],
                [-0.55, -0.4],
                [-1.0, -1.1],
              ].map(([x, z], i) => (
                <CilindroX key={i} radio={rFibra} largo={5} x={2.5} y={-x * (1 + crece * 0.15)} z={z} color="#c03a46" estriado={8} emisivo={0.1 + crece * 0.5} />
              ))}
            </group>
            {/* adipocitos (derecha) que se encogen */}
            {[
              [1.25, 0.9, 0],
              [1.35, -0.6, -0.3],
              [0.8, 0.1, -1.2],
              [1.0, -1.9, -0.6],
            ].map((p, i) => (
              <Adipocito key={i} p={p as V3} r={mix(0.7, 0.55, crece)} gota={mix(0.85, 0.45, crece)} />
            ))}
            <Polvo b={b} radio={5} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.26]} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-1.0, 2.2, 0.4], t: "Fibra muscular", a: 0.3, z: 1.2, o: [20, -150], color: K.rojo },
            { p: [1.3, 1.5, 0], t: "Adipocito", a: 0.36, z: 1.2, o: [-20, -150], color: GRASO },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.03} z={1.2} t="Recomposición" sub="el peso engaña aún más" color={K.lima} y={240} tam={96} />
      <Chip b={b} a={0.5} z={1.2} t="MÚSCULO ↑" x={300} y={1100} color={K.lima} />
      <Chip b={b} a={0.7} z={1.2} t="GRASA ↓" x={780} y={1100} color={GRASO} />
    </AbsoluteFill>
  );
};

// 7 · La clave: checklist ----------------------------------------------------------------
const CLAVE: { t: string; a: number }[] = [
  { t: "✓ DÉFICIT MODERADO", a: 0.15 },
  { t: "✓ PROTEÍNA", a: 0.33 },
  { t: "✓ FUERZA", a: 0.52 },
  { t: "✓ DORMIR", a: 0.68 },
  { t: "✓ CONSTANCIA", a: 0.84 },
];

const Clave: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const reps = b * 5.5;
  const k = Math.sin((reps % 1) * Math.PI);
  const cam = camAtleta(b);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Atleta ej="sentadilla" k={k} brilla={0.3 + 0.4 * k} colorBrillo={K.lima} pesa={false} />
        <Piso />
      </Escena3D>
      <Titular b={b} a={0.02} z={1.2} y={265} tam={110} t="La clave" color={K.lima} />
      {CLAVE.map((c, i) => {
        const pos: [number, number][] = [
          [540, 430],
          [300, 1010],
          [780, 1010],
          [300, 1100],
          [780, 1100],
        ];
        return <Chip key={i} b={b} a={c.a} z={1.2} t={c.t} x={pos[i][0]} y={pos[i][1]} color={i === 0 ? K.lima : K.cian} />;
      })}
    </AbsoluteFill>
  );
};

const T = [
  "Haces dieta, entrenas... y la báscula **no se mueve**. ¿Por qué?",
  "Para perder grasa necesitas un **déficit calórico**: gastar más energía de la que comes.",
  "Entonces tu cuerpo saca la diferencia de la **grasa guardada**: los adipocitos liberan ácidos grasos que se queman en la mitocondria.",
  "Primer error: **subestimar** lo que comes. Aceite, bebidas, salsas y botanas suman más de lo que crees.",
  "Segundo: al comer menos, te **mueves menos** sin darte cuenta y tu cuerpo gasta un poco menos. Es la adaptación metabólica.",
  "Tercero: la báscula engaña. El **agua** y el glucógeno suben y bajan; fíjate en la **tendencia** de varias semanas.",
  "Y si entrenas fuerza, puedes estar ganando **músculo** mientras pierdes grasa.",
  "La clave: un déficit **moderado**, suficiente proteína, entrenar fuerza, dormir bien y ser **constante**.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Balance, Grasa, Ocultas, Adaptacion, Tendencia, Recomposicion, Clave, EscenaCierre];

export const DEFICIT: ShortDef = {
  id: "Short-Deficit",
  titulo: "Déficit calórico: por qué no bajas de peso",
  planos: ESCENAS.map((Escena, i) => ({ id: `deficit-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
