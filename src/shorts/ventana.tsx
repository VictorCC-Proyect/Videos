// Short: ¿Existe la "ventana anabólica"? Qué comer antes y después de entrenar.
// Fuentes: Aragon y Schoenfeld 2013 (JISSN), Schoenfeld et al. 2017 (PeerJ), Kerksick et al. 2017 (ISSN nutrient timing).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3 } from "../fisio/motor";
import { Polvo, rnd, Tubo } from "../fisio/modelos/comun";
import { Mol, Vaso } from "../fisio/modelos/energia";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, K, pop, ShortDef, Titular } from "./marco";
import { Atleta, Huevo, Pechuga, Piso, Plato, Proteina } from "./modelos";
import { Reloj, TanqueGlucogeno } from "./modelos-fatiga";
import { Reloj3D, Sol } from "./modelos-ayunas";
import { Glucosa } from "./modelos-glucosa";
import { H_RIBO, Ribosoma } from "./modelos-hipertrofia";
import { Barra3D, Rotulos } from "./modelos-sueno";
import { Arroz, AtletaShaker, Igual, Mancuerna, MarcoVentana, PanRebanada, Platano, Puerta, Semanas, Tarjeta3D } from "./modelos-ventana";
import { camViaje, cortesViaje, tramoViaje, Viaje } from "./viaje";

const COL_AA = [K.lima, K.cian, K.naranja, K.rosa, K.morado, K.amarillo];
const AA = "#7ef0b8";

// 0 · Gancho: sale del gym con su shaker; reloj de 30 min y la "ventana" que se cierra -----
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cierre = entre(b, 0.12, 0.8);
  const seg = Math.max(0, Math.round(1800 - lineal(b, 0.03, 0.62) * 1500));
  const reloj = `${String(Math.floor(seg / 60)).padStart(2, "0")}:${String(seg % 60).padStart(2, "0")}`;
  const z = mix(-0.7, 0.5, lineal(b, 0, 1));
  const cam = camara(
    [
      { b: 0, p: [1.5, 1.35, 6.9], l: [0, 0.95, 0], fov: 38 },
      { b: 1, p: [-0.9, 1.25, 5.9], l: [0, 0.95, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[0, 1.2, -1.6]}>
          <MarcoVentana ancho={1.9} alto={2.1} cierre={cierre} luz={1 - cierre * 0.85} />
        </group>
        <group position={[-0.62, 1.3, 0.3]} scale={0.3}>
          <Reloj t={-b * 5} color={K.rojo} />
        </group>
        <group position={[0, 0, z]}>
          <AtletaShaker marcha={0.45} fase={b * 16} brilla={0.35} colorBrillo={K.naranja} />
          <Piso />
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -0.2]}>
          <planeGeometry args={[8, 4]} />
          <meshStandardMaterial color="#0d2428" roughness={0.9} />
        </mesh>
      </Escena3D>
      <Dato b={b} a={0.03} z={0.64} t={reloj} sub="después de entrenar" color={K.rojo} y={250} tam={130} />
      <Titular b={b} a={0.66} z={1.1} y={270} tam={118} t={<>¿Ventana<br />anabólica?</>} />
      <Chip b={b} a={0.14} z={0.66} t="30 MINUTOS… ¿O PIERDES MÚSCULO?" x={540} y={1100} color={K.rojo} />
    </AbsoluteFill>
  );
};

// 1 · Zoom a la fibra: tras entrenar está más sensible; aminoácidos -> ribosomas -----------
const RIBOS: V3[] = [
  [-0.95, 0.35, 1.6],
  [0.85, -0.25, 1.7],
  [-0.3, -1.25, 1.8],
];

const Sensible: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.42);
  const dentro = tramoViaje(t) === 3;
  const sens = entre(b, 0.5, 0.68);
  const sube = entre(b, 0.72, 0.95);
  const cam =
    b < 0.42
      ? camViaje(t)
      : camara(
          [
            { b: 0.42, p: [0, 0.3, 10.5], l: [0, -0.9, 0], fov: 40 },
            { b: 1, p: [-0.5, 0.1, 10.2], l: [0, -0.7, 0], fov: 40 },
          ],
          b,
        );
  const pulso = 0.5 + 0.5 * Math.sin(b * 30);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={dentro ? [9, 30] : undefined}>
        <Viaje t={t} b={b} ej="sentadilla" k={0.5 + 0.5 * Math.sin(b * 25)} colorBrillo={K.lima} interior={{ pcr: 0, brillo: 0.15 + sens * (0.35 + 0.25 * pulso) }} />
        {dentro ? (
          <>
            {RIBOS.map((p, i) => (
              <Ribosoma key={i} p={p} color={COL_AA[i]} n={2 + sens * 4 + sube * 8} avance={b * (6 + sens * 14)} escala={1.05} giro={0.2 - i * 0.2} />
            ))}
            {sens > 0
              ? Array.from({ length: 21 }).map((_, i) => {
                  const r = RIBOS[i % 3];
                  const f = (b * (1.2 + sube) + rnd(`aa${i}`)) % 1;
                  const lado = i % 2 ? 1 : -1;
                  const ini: V3 = [lado * 3.2, r[1] + (rnd(`ay${i}`) - 0.5) * 2.4, 1.6];
                  const p = mix3(ini, [r[0], r[1] - 0.15, r[2] + 0.2], f);
                  return <Mol key={i} p={p} color={COL_AA[i % COL_AA.length]} r={0.14} op={Math.min(1, sens * 2) * (1 - f * 0.4)} />;
                })
              : null}
            <group position={[1.25, -2.05, 1.8]} scale={0.7}>
              <Barra3D valor={0.55 + 0.25 * sens + 0.6 * sube} color={K.lima} alto={1.2} r={0.22} />
            </group>
          </>
        ) : null}
      </Escena3D>
      <Destello b={b} en={cortesViaje(0, 0.42)} />
      <Chip b={b} a={0.03} z={0.13} t="MÚSCULO" x={540} y={330} color={K.rojo} />
      <Chip b={b} a={0.14} z={0.3} t="FIBRA MUSCULAR" x={540} y={330} color={K.rosa} />
      {dentro && b > 0.42 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [RIBOS[0][0] - 0.3, RIBOS[0][1] - 0.2, RIBOS[0][2]], t: "Ribosoma", a: 0.45, z: 0.72, o: [-30, 150], color: H_RIBO },
            { p: [-2.0, 1.4, 1.6], t: "Aminoácidos", a: 0.55, z: 0.75, o: [40, -110], color: AA },
            { p: [1.25, -1.15, 1.8], t: "Síntesis de proteína", a: 0.74, z: 1, o: [-60, -120], color: K.lima },
          ]}
        />
      ) : null}
      <Chip b={b} a={0.52} z={1} t="MÁS SENSIBLE A LA PROTEÍNA" x={540} y={1100} color={K.lima} />
      <Dato b={b} a={0.76} z={1} t="SÍNTESIS ↑" sub="se fabrica más proteína muscular" color={K.lima} y={260} tam={110} />
    </AbsoluteFill>
  );
};

// 2 · Línea de 24 h: la sensibilidad no dura 30 min, dura muchas horas ----------------------
const HX = (h: number) => -1.05 + (h / 24) * 2.1;
const sensH = (h: number) => 0.25 + 0.95 * Math.exp(-h / 13);

const Horas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const media = entre(b, 0.08, 0.2);
  const crece = entre(b, 0.45, 0.92);
  const hasta = 0.5 + crece * 23.5;
  const cam = camara(
    [
      { b: 0, p: [-0.6, 0.85, 4.4], l: [-0.6, 0.4, 0], fov: 38 },
      { b: 0.42, p: [-0.4, 0.85, 4.6], l: [-0.5, 0.4, 0], fov: 38 },
      { b: 0.85, p: [0.3, 1.0, 6.2], l: [0, 0.6, 0], fov: 38 },
      { b: 1, p: [0.5, 1.05, 6.0], l: [0, 0.6, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {/* riel de 24 h */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[2.3, 0.06, 0.32]} />
          <meshStandardMaterial color="#2b3f45" />
        </mesh>
        {[0, 6, 12, 18, 24].map((h) => (
          <mesh key={h} position={[HX(h), -0.02, 0.17]}>
            <boxGeometry args={[0.02, 0.1, 0.02]} />
            <meshBasicMaterial color="#e8f4f2" />
          </mesh>
        ))}
        {/* columnas: sensibilidad hora a hora */}
        {Array.from({ length: 48 }).map((_, i) => {
          const h = i * 0.5 + 0.25;
          if (h > hasta) return null;
          const alto = sensH(h) * Math.min(1, (hasta - h) / 1.5 + 0.2);
          return (
            <mesh key={i} position={[HX(h), alto / 2, 0]}>
              <boxGeometry args={[0.038, alto, 0.2]} />
              <meshStandardMaterial color={K.lima} emissive={K.lima} emissiveIntensity={0.45} transparent opacity={0.9} />
            </mesh>
          );
        })}
        {/* marca de 30 min */}
        {media > 0 ? (
          <mesh position={[HX(0.5), (1.35 * media) / 2, 0.14]}>
            <boxGeometry args={[0.025, 1.35 * media, 0.04]} />
            <meshStandardMaterial color={K.rojo} emissive={K.rojo} emissiveIntensity={0.9} />
          </mesh>
        ) : null}
        <group position={[HX(18.5), 1.2, -0.2]}>
          <Reloj3D p={[0, 0, 0]} r={0.3} hora={hasta} color={K.lima} />
        </group>
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [HX(0.5), 1.45, 0.14], t: "30 min", a: 0.12, z: 1.1, color: K.rojo, tam: 40, anton: true },
          ...[0, 6, 12, 18, 24].map((h) => ({ p: [HX(h), -0.22, 0.2] as V3, t: `${h} h`, a: h === 0 ? 0.05 : 0.45 + h * 0.018, z: 1.1, color: K.suave, tam: 30 })),
          { p: [HX(12), 1.15, 0], t: "MÚSCULO SENSIBLE", a: 0.62, z: 1.1, color: K.lima, tam: 34 },
        ]}
      />
      <Chip b={b} a={0.12} z={0.45} t="¿SOLO MEDIA HORA?" x={540} y={1100} color={K.rojo} />
      <Dato b={b} a={0.55} z={1} t="MUCHAS HORAS" sub="hasta ~24 h después" color={K.lima} y={260} tam={110} />
    </AbsoluteFill>
  );
};

// 3 · Estudio: 25 g antes vs 25 g después, 10 semanas, mismos resultados --------------------
const Estudio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const bebeA = Math.sin(entre(b, 0.26, 0.42) * Math.PI);
  const bebeD = Math.sin(entre(b, 0.4, 0.56) * Math.PI);
  const crece = entre(b, 0.58, 0.88);
  const semanas = lineal(b, 0.58, 0.95);
  const igual = entre(b, 0.66, 0.74);
  const cam = camara(
    [
      { b: 0, p: [0.4, 1.3, 6.6], l: [0, 0.85, 0], fov: 38 },
      { b: 0.5, p: [-0.3, 1.2, 6.2], l: [0, 0.8, 0], fov: 38 },
      { b: 0.68, p: [0, 1.2, 5.5], l: [0, 0.6, 0.4], fov: 38 },
      { b: 1, p: [0.3, 1.25, 5.3], l: [0, 0.6, 0.4], fov: 38 },
    ],
    b,
  );
  const grupo = (x: number, bebe: number, col: string) => (
    <group position={[x, 0, 0]}>
      <group scale={0.85} rotation={[0, -x * 0.25, 0]}>
        <AtletaShaker bebe={bebe} vacio={bebe > 0.5 ? 1 : 0} brilla={0.15 + crece * 0.45} colorBrillo={K.lima} colorShaker={col} />
        <Piso color={col} />
      </group>
      {[
        [-0.2, K.naranja],
        [0.2, K.lima],
      ].map(([dx, c]) => (
        <group key={c as string} position={[(dx as number), 0, 0.85]} scale={0.42}>
          <Barra3D valor={0.15 + 0.85 * crece} color={c as string} alto={1.4} r={0.24} />
        </group>
      ))}
    </group>
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {grupo(-0.66, bebeA, K.cian)}
        {grupo(0.66, bebeD, K.rosa)}
        {igual > 0 ? <Igual p={[0, 0.62, 0.9]} escala={igual * 0.9} /> : null}
        <group position={[0, 1.2, -0.6]} scale={0.6}>
          <Semanas marca={semanas} />
        </group>
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-0.66, 1.72, 0], t: "ANTES", a: 0.24, z: 1.1, color: K.cian, tam: 46, anton: true },
          { p: [0.66, 1.72, 0], t: "DESPUÉS", a: 0.38, z: 1.1, color: K.rosa, tam: 46, anton: true },
          { p: [0, 1.2 + 0.26, -0.6], t: `${Math.min(10, Math.ceil(semanas * 10))} / 10 semanas`, a: 0.58, z: 1.1, color: K.tinta, tam: 28 },
        ]}
      />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.46, 0.2 + 0.55 * crece, 0.85], t: "Fuerza", a: 0.62, z: 1.1, o: [90, -50], color: K.naranja },
          { p: [0.86, 0.2 + 0.55 * crece, 0.85], t: "Músculo", a: 0.66, z: 1.1, o: [40, 90], color: K.lima },
        ]}
      />
      <Dato b={b} a={0.1} z={1.1} t={<>25 g antes <span style={{ color: K.tinta }}>=</span> 25 g después</>} sub="Schoenfeld et al. 2017" color={K.lima} y={240} tam={78} />
      <Chip b={b} a={0.72} z={1.1} t="MISMOS RESULTADOS" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 4 · Comida previa -> aminoácidos en la sangre durante y después del entreno ----------------
const H0 = -3;
const H1 = 4;
const CX = (h: number) => -1.1 + ((h - H0) / (H1 - H0)) * 2.2;
const nivelAA = (h: number) => {
  if (h < -2.5) return 0.22;
  if (h < -1) {
    const u = (h + 2.5) / 1.5;
    return 0.22 + 0.78 * u * u * (3 - 2 * u);
  }
  return 1 - 0.055 * (h + 1);
};
const OX = 6; // el grafico vive a la derecha del plato

const Previa: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase2 = b >= 0.4;
  const suelta = entre(b, 0.1, 0.34);
  const dibuja = lineal(b, 0.4, 0.88);
  const hasta = H0 + dibuja * (H1 - H0);
  const cam = fase2
    ? camara(
        [
          { b: 0.4, p: [OX - 0.4, 0.85, 6.4], l: [OX, 0.35, 0], fov: 38 },
          { b: 1, p: [OX + 0.4, 0.9, 6.7], l: [OX, 0.35, 0], fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: 0, p: [0.5, 1.5, 5.6], l: [0, 0.35, 0], fov: 38 },
          { b: 0.4, p: [-0.4, 1.3, 5.2], l: [0, 0.4, 0], fov: 38 },
        ],
        b,
      );
  const pts: V3[] = [];
  for (let h = H0; h <= hasta + 0.001; h += 0.25) pts.push([OX + CX(h), nivelAA(h) * 1.2, 0.05]);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {!fase2 ? (
          <>
            <Plato p={[0, 0, 0]} escala={1.1} />
            <Pechuga p={[-0.12, 0.08, 0.05]} escala={0.9} />
            <Huevo p={[0.3, 0.05, -0.12]} escala={0.8} />
            <Proteina p={[0, mix(0.25, 0.75, suelta), 0.1]} n={12} desarma={suelta} escala={1.1} giro={b * 3} seed="pv" />
            <Vaso desde={[-1.6, 1.05, -0.4]} hasta={[1.6, 1.05, -0.4]} t={b * 1.4} radio={0.3} />
            {Array.from({ length: 12 }).map((_, i) => {
              const f = entre(b, 0.18 + i * 0.012, 0.36 + i * 0.012);
              if (f <= 0) return null;
              const ini: V3 = [(rnd(`pa${i}`) - 0.5) * 1.0, 0.75, 0.1];
              const fin: V3 = [(rnd(`pb${i}`) - 0.5) * 2.6 + f * 0.4, 1.05 + (rnd(`pc${i}`) - 0.5) * 0.25, -0.4];
              return <Mol key={i} p={mix3(ini, fin, f)} color={COL_AA[i % COL_AA.length]} r={0.06} />;
            })}
            <Polvo b={b} radio={3} />
          </>
        ) : (
          <group>
            {/* ejes */}
            <mesh position={[OX, -0.02, 0]}>
              <boxGeometry args={[2.4, 0.03, 0.03]} />
              <meshBasicMaterial color="#9fb8b4" />
            </mesh>
            <mesh position={[OX + CX(H0) - 0.05, 0.7, 0]}>
              <boxGeometry args={[0.03, 1.45, 0.03]} />
              <meshBasicMaterial color="#9fb8b4" />
            </mesh>
            {/* zona del entreno */}
            <mesh position={[OX + (CX(0) + CX(1.2)) / 2, 0.72, -0.05]}>
              <boxGeometry args={[CX(1.2) - CX(0), 1.45, 0.02]} />
              <meshBasicMaterial color={K.naranja} transparent opacity={0.22 * entre(b, 0.42, 0.55)} depthWrite={false} />
            </mesh>
            {/* comida */}
            <Plato p={[OX + CX(-2.5), 0.08, 0.15]} escala={0.28} />
            <Pechuga p={[OX + CX(-2.5), 0.12, 0.17]} escala={0.22} />
            {/* curva */}
            {pts.length > 1 ? <Tubo puntos={pts} radio={0.028} color={AA} emisivo={0.8} segmentos={Math.max(8, pts.length * 4)} /> : null}
            {pts.length > 1 ? <Mol p={pts[pts.length - 1]} color={AA} r={0.06} brillo={1.5} /> : null}
            {/* aminoacidos flotando bajo la curva */}
            {Array.from({ length: 22 }).map((_, i) => {
              const h = H0 + 0.5 + rnd(`ch${i}`) * (H1 - H0 - 0.5);
              if (h > hasta) return null;
              const y = rnd(`cy${i}`) * nivelAA(h) * 1.1 + Math.sin(b * 6 + i) * 0.03;
              return <Mol key={i} p={[OX + CX(h), y, 0.1]} color={COL_AA[i % COL_AA.length]} r={0.035} />;
            })}
          </group>
        )}
      </Escena3D>
      <Destello b={b} en={[0.4]} />
      {!fase2 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.12, 0.12, 0.05], t: "Comida con proteína", a: 0.04, z: 0.38, o: [-60, 140], color: K.rosa },
            { p: [1.1, 1.05, -0.4], t: "Sangre", a: 0.2, z: 0.38, o: [-20, -110], color: "#ff6b7a" },
          ]}
        />
      ) : (
        <Rotulos
          cam={cam}
          b={b}
          items={[
            { p: [OX + CX(-2.5), -0.2, 0.15], t: "comida", a: 0.42, z: 1.1, color: K.rosa, tam: 30 },
            { p: [OX + (CX(0) + CX(1.2)) / 2, 1.58, 0], t: "ENTRENO", a: 0.5, z: 1.1, color: K.naranja, tam: 36, anton: true },
            { p: [OX + CX(3), -0.2, 0], t: "después", a: 0.8, z: 1.1, color: K.suave, tam: 30 },
          ]}
        />
      )}
      <Dato b={b} a={0.5} z={1.1} t="AMINOÁCIDOS EN SANGRE" sub="siguen altos durante y después" color={AA} y={250} tam={76} />
    </AbsoluteFill>
  );
};

// 5 · Día completo: total diario en tomas de 20-40 g cada 3-4 h ------------------------------
const TOMAS = [8, 11.5, 15, 18.5];
const DIAL: V3 = [0, 1.0, 0];
const RD = 0.45;
const enDial = (h: number, r = RD): V3 => {
  const a = (h / 24) * Math.PI * 2;
  return [DIAL[0] + Math.sin(a) * r, DIAL[1] + Math.cos(a) * r, DIAL[2] + 0.05];
};

const Dia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const hora = mix(7, 20, lineal(b, 0.22, 0.92));
  const tomas = TOMAS.map((h) => Math.min(1, Math.max(0, (hora - h) / 0.8)));
  const total = tomas.reduce((a, x) => a + x, 0) / 4;
  const cam = camara(
    [
      { b: 0, p: [0.5, 0.75, 6.8], l: [0, 0.4, 0], fov: 38 },
      { b: 1, p: [-0.5, 0.7, 6.5], l: [0, 0.4, 0], fov: 38 },
    ],
    b,
  );
  const aDial = (hora / 24) * Math.PI * 2;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {/* esfera de 24 h */}
        <mesh position={DIAL} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[RD + 0.08, RD + 0.08, 0.06, 64]} />
          <meshStandardMaterial color="#0b1d21" />
        </mesh>
        <mesh position={DIAL}>
          <torusGeometry args={[RD + 0.1, 0.035, 12, 64]} />
          <meshStandardMaterial color={K.cian} emissive={K.cian} emissiveIntensity={0.4} />
        </mesh>
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const q = enDial(i, RD - 0.04);
          return (
            <mesh key={i} position={q} rotation={[0, 0, -a]}>
              <boxGeometry args={[0.02, i % 6 ? 0.05 : 0.11, 0.02]} />
              <meshBasicMaterial color="#e8f4f2" />
            </mesh>
          );
        })}
        <group position={[DIAL[0], DIAL[1], DIAL[2] + 0.07]} rotation={[0, 0, -aDial]}>
          <mesh position={[0, RD * 0.42, 0]}>
            <boxGeometry args={[0.035, RD * 0.84, 0.02]} />
            <meshStandardMaterial color={K.amarillo} emissive={K.amarillo} emissiveIntensity={0.6} />
          </mesh>
        </group>
        {/* tomas */}
        {TOMAS.map((h, i) => {
          const s = tomas[i];
          if (s <= 0) return null;
          const q = enDial(h, RD + 0.36);
          return <Proteina key={i} p={q} n={7} escala={0.6 * pop(s, 0, 1)} giro={b * 4 + i} seed={`d${i}`} />;
        })}
        {/* total del dia */}
        <group position={[0, 0.12, 0]}>
          <mesh>
            <boxGeometry args={[1.7, 0.24, 0.24]} />
            <meshPhysicalMaterial color="#cfefff" transparent opacity={0.16} roughness={0.05} clearcoat={1} depthWrite={false} />
          </mesh>
          {tomas.map((s, i) =>
            s > 0 ? (
              <mesh key={i} position={[-0.85 + 0.2125 + i * 0.425 - (0.425 * (1 - s)) / 2, 0, 0]}>
                <boxGeometry args={[0.41 * s, 0.2, 0.2]} />
                <meshStandardMaterial color={COL_AA[i]} emissive={COL_AA[i]} emissiveIntensity={0.5} />
              </mesh>
            ) : null,
          )}
        </group>
        <Polvo b={b} radio={3} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [0, 0.34, 0] as V3, t: `${Math.round(total * 100)} %`, a: 0.2, z: 1.1, color: K.tinta, tam: 32, anton: true },
        ]}
      />
      <Dato b={b} a={0.08} z={1.1} t="TOTAL DEL DÍA" sub="lo que más pesa" color={K.lima} y={250} tam={100} />
      <Chip b={b} a={0.55} z={1.1} t="20–40 g CADA 3–4 h" x={540} y={1160} color={K.cian} />
    </AbsoluteFill>
  );
};

// 6 · ANTES: 1-3 h antes, carbohidratos + algo de proteína -> llegas con energía --------------
const OXA = 4; // el atleta vive a la derecha

const Antes: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase2 = b >= 0.72;
  const carbs = entre(b, 0.48, 0.58);
  const prot = entre(b, 0.6, 0.68);
  const cam = fase2
    ? camara(
        [
          { b: 0.72, p: [OXA + 1.2, 1.3, 5.6], l: [OXA + 0.2, 0.75, 0], fov: 38 },
          { b: 1, p: [OXA - 0.6, 1.2, 5.4], l: [OXA + 0.2, 0.75, 0], fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: 0, p: [0.4, 1.7, 5.0], l: [0, -0.15, 0], fov: 38 },
          { b: 0.72, p: [-0.3, 1.6, 4.6], l: [0, -0.15, 0], fov: 38 },
        ],
        b,
      );
  const k = Math.sin(((b * 3) % 1) * Math.PI);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {!fase2 ? (
          <>
            <Reloj3D p={[-0.68, 0.5, -0.7]} r={0.28} hora={mix(9, 11, lineal(b, 0.05, 0.45))} color={K.cian} />
            <Plato p={[0, 0, 0]} escala={1.2} />
            {carbs > 0 ? (
              <group scale={pop(b, 0.48, 0.1)}>
                <Arroz p={[-0.3, 0.04, -0.05]} escala={1} />
                <PanRebanada p={[0.32, 0.03, -0.15]} escala={0.9} giro={-0.3} />
                <Platano p={[0.15, 0.08, 0.38]} escala={0.8} giro={0.2} />
              </group>
            ) : null}
            {prot > 0 ? (
              <group scale={pop(b, 0.6, 0.1)}>
                <Pechuga p={[0.1, 0.08, 0.05]} escala={0.6} />
              </group>
            ) : null}
            <Polvo b={b} radio={3} />
          </>
        ) : (
          <group position={[OXA, 0, 0]}>
            <Atleta ej="sentadilla" k={k} brilla={0.55} colorBrillo={K.lima} pesa={false} />
            <Piso color={K.lima} />
            <group position={[0.75, 0, 0.1]} scale={0.6}>
              <Barra3D valor={1} color={K.lima} alto={1.6} r={0.22} />
            </group>
          </group>
        )}
      </Escena3D>
      <Destello b={b} en={[0.72]} />
      {!fase2 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-0.3, 0.15, -0.05], t: "Arroz", a: 0.5, z: 0.72, o: [-60, -110], color: K.amarillo },
            { p: [0.35, 0.3, -0.15], t: "Pan", a: 0.52, z: 0.72, o: [50, -120], color: K.amarillo },
            { p: [0.2, 0.1, 0.38], t: "Plátano", a: 0.55, z: 0.72, o: [70, 90], color: K.amarillo },
            { p: [0.1, 0.12, 0.05], t: "Pollo (proteína)", a: 0.62, z: 0.72, o: [-80, 140], color: K.rosa },
          ]}
        />
      ) : (
        <Rotulos cam={cam} b={b} items={[{ p: [OXA + 0.75, 1.15, 0.1], t: "ENERGÍA", a: 0.76, z: 1.1, color: K.lima, tam: 34, anton: true }]} />
      )}
      <Dato b={b} a={0.04} z={0.72} t="ANTES" sub="¿qué comer?" color={K.cian} y={250} tam={110} />
      <Chip b={b} a={0.16} z={0.73} t="1–3 h ANTES" x={540} y={1010} color={K.cian} />
      <Chip b={b} a={0.5} z={0.73} t="CARBOHIDRATOS + PROTEÍNA" x={540} y={1100} color={K.amarillo} />
      <Dato b={b} a={0.76} z={1.1} t="CON ENERGÍA" sub="y sin sentirte pesado" color={K.lima} y={250} tam={100} />
    </AbsoluteFill>
  );
};

// 7 · DESPUÉS: comida con proteína y carbohidratos en las siguientes horas; sin prisa ---------
const Despues: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase2 = b >= 0.56;
  const anda = lineal(b, 0.56, 1);
  const cam = fase2
    ? camara(
        [
          { b: 0.56, p: [OXA + 2.2, 1.3, 4.6], l: [OXA, 0.8, 0.0], fov: 38 },
          { b: 1, p: [OXA + 1.6, 1.25, 5.6], l: [OXA, 0.8, 0.7], fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: 0, p: [-0.3, 1.7, 4.8], l: [0, -0.15, 0], fov: 38 },
          { b: 0.56, p: [0.3, 1.6, 4.5], l: [0, -0.15, 0], fov: 38 },
        ],
        b,
      );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {!fase2 ? (
          <>
            <Reloj3D p={[0.68, 0.5, -0.7]} r={0.28} hora={mix(12, 15, lineal(b, 0.25, 0.55))} color={K.rosa} />
            <Plato p={[0, 0, 0]} escala={1.2} />
            <group scale={pop(b, 0.06, 0.1)}>
              <Pechuga p={[0.2, 0.08, 0.05]} escala={0.75} />
              <Arroz p={[-0.3, 0.04, -0.05]} escala={1} />
              <Huevo p={[0.05, 0.05, 0.42]} escala={0.6} />
            </group>
            <Polvo b={b} radio={3} />
          </>
        ) : (
          <group position={[OXA, 0, mix(-0.6, 0.9, anda)]}>
            <AtletaShaker marcha={0.3} fase={b * 9} brilla={0.2} colorBrillo={K.cian} />
          </group>
        )}
        {fase2 ? (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[OXA, -0.005, 0]}>
            <planeGeometry args={[3, 6]} />
            <meshStandardMaterial color="#0d2a2f" roughness={0.9} />
          </mesh>
        ) : null}
      </Escena3D>
      <Destello b={b} en={[0.56]} />
      {!fase2 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [0.2, 0.12, 0.05], t: "Proteína", a: 0.12, z: 0.56, o: [60, -130], color: K.rosa },
            { p: [-0.3, 0.15, -0.05], t: "Carbohidratos", a: 0.18, z: 0.56, o: [-40, -150], color: K.amarillo },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.03} z={0.56} t="DESPUÉS" sub="en las siguientes horas" color={K.rosa} y={250} tam={110} />
      <Chip b={b} a={0.3} z={0.56} t="+1… 2… 3 h" x={540} y={1010} color={K.rosa} />
      <Dato b={b} a={0.6} z={1.1} t="SIN PRISA" sub="el licuado puede esperar" color={K.lima} y={250} tam={110} />
      <Chip b={b} a={0.72} z={1.1} t="NO CORRAS AL VESTIDOR" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 8 · Excepciones: en ayunas / doble sesión -----------------------------------------------------
const Excepciones: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const c1 = pop(b, 0.36, 0.14) * (b >= 0.36 ? 1 : 0);
  const c2 = pop(b, 0.64, 0.14) * (b >= 0.64 ? 1 : 0);
  const reloj = 1 - entre(b, 0.3, 0.4);
  const cam = camara(
    [
      { b: 0, p: [0, 0.9, 6.9], l: [0, 0.6, 0], fov: 38 },
      { b: 1, p: [0.3, 0.95, 6.6], l: [0, 0.6, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {reloj > 0 ? (
          <group position={[0, 1.0, 0.2]} scale={0.75 * reloj}>
            <Reloj t={b * 3} color={K.naranja} />
          </group>
        ) : null}
        {c1 > 0 ? (
          <group position={[-0.56, 1.0, 0]} scale={c1} rotation={[0, 0.15, 0]}>
            <Tarjeta3D ancho={0.98} alto={1.4} color={K.amarillo} />
            <Sol p={[0, 0.3, 0.1]} r={0.12} />
            <group position={[0, -0.3, 0.2]} rotation={[1.0, 0, 0]}>
              <Plato p={[0, 0, 0]} escala={0.6} />
            </group>
          </group>
        ) : null}
        {c2 > 0 ? (
          <group position={[0.56, 1.0, 0]} scale={c2} rotation={[0, -0.15, 0]}>
            <Tarjeta3D ancho={0.98} alto={1.4} color={K.cian} />
            <Mancuerna p={[0, 0.38, 0.12]} escala={0.7} giro={0.15 * Math.sin(b * 12)} color="#3a4250" />
            <Mancuerna p={[0, -0.02, 0.12]} escala={0.7} giro={-0.15 * Math.sin(b * 12)} color="#3a4250" />
            <Reloj3D p={[-0.22, -0.43, 0.1]} r={0.13} hora={8} color={K.cian} />
            <Reloj3D p={[0.22, -0.43, 0.1]} r={0.13} hora={18} color={K.cian} />
          </group>
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-0.56, 0.12, 0], t: "EN AYUNAS", a: 0.46, z: 1.1, color: K.amarillo, tam: 44, anton: true },
          { p: [0.56, 0.12, 0], t: "DOBLE SESIÓN", a: 0.72, z: 1.1, color: K.cian, tam: 44, anton: true },
        ]}
      />
      <Dato b={b} a={0.04} z={1.1} t="AQUÍ SÍ: COME PRONTO" sub="dos excepciones" color={K.naranja} y={250} tam={84} />
    </AbsoluteFill>
  );
};

// 9 · Recargar glucógeno rápido: carbohidratos ya + algo de proteína ---------------------------
const Recarga: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.3);
  const dentro = tramoViaje(t) === 3;
  const carga = entre(b, 0.48, 0.95);
  const cam =
    b < 0.3
      ? camViaje(t)
      : camara(
          [
            { b: 0.3, p: [0, 0.3, 10.5], l: [0, -0.9, 0], fov: 40 },
            { b: 1, p: [0.6, 0.0, 8.6], l: [0, -0.8, 0], fov: 40 },
          ],
          b,
        );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={dentro ? [8, 28] : undefined}>
        <Viaje t={t} b={b} ej="sentadilla" k={0.6} colorBrillo={K.morado} interior={{ pcr: 0, brillo: 0.05 }} />
        {dentro ? (
          <>
            <group position={[0, -0.75, 1.6]}>
              <TanqueGlucogeno nivel={0.1 + 0.9 * carga} b={b} escala={1.75} />
            </group>
            {b > 0.45
              ? Array.from({ length: 14 }).map((_, i) => {
                  const f = (b * 1.8 + rnd(`gl${i}`)) % 1;
                  const lado = i % 2 ? 1 : -1;
                  const ini: V3 = [lado * 3.0, 1.6 + rnd(`gy${i}`) * 1.2, 1.8];
                  const p = mix3(ini, [lado * 0.2, -0.4, 1.8], f);
                  return <Glucosa key={i} p={p} escala={1.5} op={1 - f * 0.5} />;
                })
              : null}
            {b > 0.8
              ? Array.from({ length: 6 }).map((_, i) => {
                  const f = (b * 1.4 + rnd(`pp${i}`)) % 1;
                  const p = mix3([2.6, -2.4 + i * 0.25, 2.0], [0.5, -0.9, 1.8], f);
                  return <Mol key={i} p={p} color={COL_AA[i]} r={0.09} />;
                })
              : null}
          </>
        ) : null}
      </Escena3D>
      <Destello b={b} en={cortesViaje(0, 0.3)} />
      <Chip b={b} a={0.03} z={0.18} t="MÚSCULO" x={540} y={330} color={K.rojo} />
      {dentro && b > 0.3 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [0.35, -0.2, 1.6], t: "Glucógeno", a: 0.32, z: 1.1, o: [110, -60], color: "#9b7bff" },
            { p: [-1.6, 1.0, 1.8], t: "Glucosa", a: 0.55, z: 0.85, o: [40, -90], color: "#ffd166" },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.32} z={1.1} t="GLUCÓGENO" sub={carga > 0.6 ? "recarga rápida" : "reserva vacía"} color="#9b7bff" y={250} tam={110} />
      <Chip b={b} a={0.52} z={1.1} t="CARBOHIDRATOS YA" x={540} y={1010} color={K.amarillo} />
      <Chip b={b} a={0.84} z={1.1} t="+ PROTEÍNA" x={540} y={1100} color={K.rosa} />
    </AbsoluteFill>
  );
};

// 10 · Conclusión: la ventana pequeña se vuelve una puerta abierta de varias horas -------------
const PuertaAbierta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const sale = entre(b, 0.46, 0.58);
  const entra = entre(b, 0.5, 0.66);
  const abre = entre(b, 0.6, 0.85);
  const anda = lineal(b, 0.72, 1);
  const cam = camara(
    [
      { b: 0, p: [0.3, 1.5, 4.4], l: [0, 1.25, 0], fov: 38 },
      { b: 0.5, p: [0.5, 1.45, 5.4], l: [0, 1.1, 0], fov: 38 },
      { b: 1, p: [-0.6, 1.35, 6.4], l: [0, 1.0, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {sale < 1 ? (
          <group position={[0, 1.3, 0.1]} scale={(1 - sale) * 0.9}>
            <MarcoVentana ancho={0.6} alto={0.7} cierre={0.75} luz={0.4} />
          </group>
        ) : null}
        {entra > 0 ? (
          <group scale={entra}>
            <Puerta abre={abre} luz={0.2 + 0.8 * abre} ancho={1.15} alto={2.15} />
          </group>
        ) : null}
        {b > 0.66 ? (
          <group position={[0.15, 0, mix(1.9, 0.9, anda)]} rotation={[0, Math.PI, 0]} scale={0.8}>
            <AtletaShaker marcha={0.4} fase={b * 12} brilla={0.25} colorBrillo={K.lima} />
          </group>
        ) : null}
      </Escena3D>
      <Rotulos cam={cam} b={b} items={[{ p: [0, 2.48, 0], t: "VARIAS HORAS", a: 0.82, z: 1.1, color: K.lima, tam: 64, anton: true }]} />
      <Titular b={b} a={0.06} z={0.8} y={270} tam={120} t="No son 30 min" />
      <Chip b={b} a={0.22} z={0.55} t="VENTANA DE 30 MIN" x={540} y={1100} color={K.rojo} />
      <Chip b={b} a={0.64} z={1.1} t="PUERTA ABIERTA" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Cuándo tomas tu <span style={{ color: K.lima }}>proteína</span>?</>}
    escribe="Yo la tomo…"
    ideas={["AL SALIR DEL GYM", "ANTES DE ENTRENAR", "EN MIS COMIDAS"]}
  />
);

const T = [
  "Seguro te han dicho que tienes **treinta minutos** después de entrenar para tomar tu proteína, o pierdes el músculo. ¿De verdad existe esa **ventana anabólica**?",
  "La idea viene de algo real: después de entrenar, tu músculo está más **sensible** a la proteína y la síntesis sube.",
  "Pero esa sensibilidad no dura media hora: dura **muchas horas**, hasta un día después de la sesión.",
  "En un estudio, tomar **veinticinco gramos** de proteína justo antes o justo después de entrenar dio **los mismos resultados** en fuerza y músculo durante diez semanas.",
  "Además, si comiste proteína unas horas antes, esos aminoácidos siguen en tu sangre **durante y después** del entrenamiento.",
  "Lo que más pesa es tu proteína **total del día**, repartida en tomas de **veinte a cuarenta gramos** cada tres o cuatro horas.",
  "Entonces, ¿qué comer **antes**? Entre una y tres horas antes, una comida con **carbohidratos** y algo de **proteína**: llegas con energía y sin sentirte pesado.",
  "¿Y **después**? Una comida con proteína y carbohidratos en las siguientes horas. No tienes que correr al vestidor por el licuado.",
  "¿Cuándo sí conviene comer pronto? Si entrenaste **en ayunas**, o si vuelves a entrenar **el mismo día**.",
  "En ese caso, para recargar el **glucógeno** rápido, come carbohidratos desde el primer momento, junto con algo de proteína.",
  "En resumen, no es una ventana de treinta minutos, es más bien una **puerta abierta** durante varias horas.",
  "¿Tú cuándo tomas tu proteína? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Sensible, Horas, Estudio, Previa, Dia, Antes, Despues, Excepciones, Recarga, PuertaAbierta, Final];

export const VENTANA: ShortDef = {
  id: "Short-Ventana",
  titulo: "¿Existe la ventana anabólica? Qué comer antes y después de entrenar",
  planos: ESCENAS.map((Escena, i) => ({ id: `ventana-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
