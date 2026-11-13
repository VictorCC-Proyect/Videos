// Short: ¿Por qué unos ganan músculo más rápido que otros? Genética, fibras y somatotipos.
// Fuentes: Hubal et al. 2005 (Med Sci Sports Exerc), Bamman et al. 2007 (J Appl Physiol), Holway, Nutrición sin dogmas, Tomo 1, 2.7.1.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Cam, camara, entre, lineal, mix, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { Enlace } from "../fisio/modelos/energia";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, K, ShortDef, Titular } from "./marco";
import { Atleta, Frijoles, Pechuga, Piso, Plato } from "./modelos";
import { F2_COL, F2Arroz, F2Flecha, F2Tacha } from "./modelos-fibras";
import { F3Nucleo } from "./modelos-fibras3";
import { Biceps, FibraSatelite, H_NUCLEO, H_SATELITE, posSatelite } from "./modelos-hipertrofia";
import { Check } from "./modelos-mtor";
import {
  BarraEsfuerzo,
  celdaTipo,
  CorteTipos,
  GenteConPesa,
  Histograma,
  HojaRutina,
  Luna,
  Pista,
  puntaBarra,
  radioCorte,
  RESPUESTAS,
} from "./modelos-respuesta";
import { CuerpoSoma, Soma } from "./modelos-somatotipos";
import { Barra3D, Rotulos } from "./modelos-sueno";
import { Mancuerna, Semanas, Tarjeta3D } from "./modelos-ventana";

const CE = { endo: K.amarillo, meso: K.rosa, ecto: K.cian };
const GEN = K.lima; // genes de crecimiento encendidos
const curl = (b: number, vel: number) => Math.sin(((Math.max(0, b) * vel) % 1) * Math.PI);
const add = (a: V3, z: V3): V3 => [a[0] + z[0], a[1] + z[1], a[2] + z[2]];
const esc3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];

/** Cámara que se acerca al bíceps derecho de un Atleta en x0 (vista exterior). */
const camBrazo = (b: number, z: number, x0 = 0): Cam =>
  camara(
    [
      { b: 0, p: [x0 + 0.5, 1.25, 5.6], l: [x0, 0.72, 0], fov: 36 },
      { b: z, p: [x0 + 0.62, 1.5, 1.35], l: [x0 + 0.2, 1.28, 0], fov: 36 },
    ],
    b,
  );

// 0 · Gancho: misma rutina, tres meses después uno creció y el otro no ------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const k = curl(b, 4.2);
  const crece = entre(b, 0.3, 0.5);
  const hoja = visible(b, 0.02, 0.3, 0.05);
  const mes = visible(b, 0.28, 0.58, 0.05);
  const cam = camara(
    [
      { b: 0, p: [0.3, 1.2, 7.0], l: [0, 0.56, 0], fov: 36 },
      { b: 0.55, p: [-0.2, 1.15, 6.6], l: [0, 0.58, 0], fov: 36 },
      { b: 1, p: [0.3, 1.15, 6.9], l: [0, 0.56, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[-0.52, 0, 0]}>
          <Atleta ej="curl" k={k} brilla={0.1} />
          <Piso color={K.suave} brillo={0.25} />
        </group>
        <group position={[0.52, 0, 0]}>
          <Atleta ej="curl" k={k} brilla={0.1 + 0.45 * crece} colorBrillo={K.lima} musculo={0.8 + 0.1 * crece} />
          <Biceps tam={1 + 0.55 * crece} brilla={0.45 * crece} colorBrillo={K.lima} />
          <Piso brillo={0.25 + 0.3 * crece} />
        </group>
        {hoja > 0 ? (
          <group position={[0, 1.15, 0.35]} scale={0.42 * hoja}>
            <HojaRutina marca={entre(b, 0.06, 0.24)} />
          </group>
        ) : null}
        {mes > 0 ? (
          <group position={[0, 1.2, 0.35]} scale={0.3 * mes}>
            <Semanas n={12} marca={entre(b, 0.3, 0.46)} />
          </group>
        ) : null}
        {crece > 0 ? <F2Flecha a={[0.95, 1.05, 0.1]} b={[0.95, 1.05 + 0.45 * crece, 0.1]} color={K.lima} r={0.035} op={crece} /> : null}
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-0.52, 2.02, 0], t: "TÚ", a: 0.04, z: 0.44, color: K.suave, tam: 44, anton: true },
          { p: [0.52, 2.02, 0], t: "TU AMIGO", a: 0.04, z: 0.44, color: K.lima, tam: 44, anton: true },
        ]}
      />
      <Chip b={b} a={0.03} z={0.28} t="MISMA RUTINA" x={540} y={1100} color={K.cian} />
      <Chip b={b} a={0.3} z={0.6} t="3 MESES DESPUÉS" x={540} y={1100} color={K.amarillo} />
      <Titular b={b} a={0.46} z={1.1} y={290} tam={140} color={K.lima} t="¿Por qué él sí?" />
      <Chip b={b} a={0.66} z={1.1} t="GENÉTICA" x={200} y={1100} color={K.morado} />
      <Chip b={b} a={0.72} z={1.1} t="FIBRAS" x={490} y={1100} color={K.rosa} />
      <Chip b={b} a={0.78} z={1.1} t="SOMATOTIPOS" x={820} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 1 · El estudio: 585 personas, curl de bíceps, 12 semanas ----------------------------------
const Estudio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const aparece = entre(b, 0, 0.36);
  const semanas = entre(b, 0.5, 0.92);
  const cam = camara(
    [
      { b: 0, p: [0, 3.4, 3.2], l: [0, 0.0, -3.4], fov: 40 },
      { b: 1, p: [0.6, 3.0, 2.6], l: [0, 0.0, -3.6], fov: 40 },
    ],
    b,
  );
  const n = Math.round(585 * entre(b, 0, 0.36));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[0, 0, -4.0]}>
          <GenteConPesa filas={39} cols={15} sep={0.2} aparece={aparece} fase={b * 26} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
            <planeGeometry args={[3.6, 8.4]} />
            <meshStandardMaterial color="#0d2a2f" roughness={0.9} />
          </mesh>
        </group>
        {semanas > 0 ? (
          <group position={[0, 1.15, -1.6]} rotation={[-0.45, 0, 0]} scale={0.95 * entre(b, 0.46, 0.54)}>
            <Semanas n={12} marca={semanas} color={K.lima} />
          </group>
        ) : null}
      </Escena3D>
      <Dato b={b} a={0.04} z={1} t={n} sub={b < 0.5 ? "personas · curl de bíceps" : "mismo programa · 12 semanas"} color={K.lima} y={250} tam={130} />
      <Chip b={b} a={0.2} z={1} t="HUBAL ET AL. 2005" x={540} y={1100} color={K.suave} />
    </AbsoluteFill>
  );
};

// 2 · Resultados: de casi 0 % a +59 % de tamaño; fuerza más que el doble -----------------------
const H_ANCHO = 2.2;
const H_ESC = 0.027;
const H_Y = 0.12;
const Resultados: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const prog = b < 0.36 ? mix(0, 0.35, entre(b, 0.04, 0.3)) : mix(0.35, 1, entre(b, 0.36, 0.62));
  const grande = entre(b, 0.42, 0.62);
  const fuerza = entre(b, 0.7, 0.92);
  const hist = 1 - entre(b, 0.66, 0.72);
  const k = curl(b, 3.2);
  const n = RESPUESTAS.length;
  const cam = camara(
    [
      { b: 0, p: [0.2, 0.55, 6.4], l: [0, -0.12, 0], fov: 40 },
      { b: 0.66, p: [-0.2, 0.55, 6.2], l: [0, -0.12, 0], fov: 40 },
      { b: 0.74, p: [0.1, 0.1, 5.4], l: [0, -0.6, 0], fov: 40 },
      { b: 1, p: [0.3, 0.1, 5.2], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  const XA = -0.72;
  const XB = 0.72;
  const YA = -1.12;
  const S = 0.56;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {hist > 0.01 ? (
          <group position={[0, H_Y, 0]} scale={[1, hist, 1]}>
            <Histograma ancho={H_ANCHO} esc={H_ESC} prog={prog} resalta={[...(b > 0.12 ? [0, 1] : []), ...(grande > 0.5 ? [n - 1] : [])]} />
          </group>
        ) : null}
        {hist > 0.01 && b > 0.12 ? <Enlace a={add(puntaBarra(0, H_ANCHO, H_ESC), [0, H_Y - 0.06, 0])} b={[XA + 0.15, YA + 1.12 * S, 0]} r={0.006} color={K.tinta} op={0.6 * hist} /> : null}
        {hist > 0.01 && grande > 0.3 ? (
          <Enlace a={add(puntaBarra(n - 1, H_ANCHO, H_ESC), [0, H_Y - 0.05, 0])} b={[XB + 0.15, YA + 1.12 * S, 0]} r={0.006} color={K.lima} op={0.6 * hist} />
        ) : null}
        <group position={[XA, YA, 0]} scale={S}>
          <Atleta ej="curl" k={k} brilla={0.1} />
          <Piso color={K.suave} brillo={0.25} />
        </group>
        <group position={[XB, YA, 0]} scale={S}>
          <Atleta ej="curl" k={k} brilla={0.1 + 0.5 * grande} colorBrillo={K.lima} musculo={0.8 + 0.1 * grande} />
          <Biceps tam={1 + 0.6 * grande} brilla={0.5 * grande} colorBrillo={K.lima} />
          <Piso brillo={0.3} />
        </group>
        {fuerza > 0 ? (
          <>
            <group position={[XA + 0.48, YA, 0.1]} scale={0.42}>
              <Barra3D valor={mix(1, 1.05, fuerza)} color={K.suave} alto={0.75} r={0.16} />
            </group>
            <group position={[XB - 0.48, YA, 0.1]} scale={0.42}>
              <Barra3D valor={mix(1, 3.5, fuerza)} color={K.naranja} alto={0.75} r={0.16} />
            </group>
          </>
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: add(puntaBarra(1, H_ANCHO, H_ESC), [0.05, H_Y + 0.08, 0]), t: "≈ 0 %", a: 0.14, z: 0.66, color: K.tinta, tam: 40, anton: true },
          { p: add(puntaBarra(n - 1, H_ANCHO, H_ESC), [-0.1, H_Y + 0.1, 0]), t: "+59 %", a: 0.55, z: 0.66, color: K.lima, tam: 54, anton: true },
          { p: [0, H_Y - 0.12, 0.1], t: "cambio de tamaño del bíceps en 12 semanas", a: 0.08, z: 0.66, color: K.suave, tam: 26 },
          { p: [XA + 0.48, YA + 0.42, 0.1], t: "1RM", a: 0.72, z: 1, color: K.suave, tam: 30 },
          { p: [XB - 0.48, YA + 1.2, 0.1], t: "+250 %", a: 0.82, z: 1, color: K.naranja, tam: 48, anton: true },
        ]}
      />
      <Dato b={b} a={0.06} z={0.7} t="0 % → +59 %" sub="mismo entrenamiento" color={K.lima} y={250} tam={110} />
      <Dato b={b} a={0.72} z={1} t="FUERZA ×2 O MÁS" sub="hasta +250 % en su máximo (1RM)" color={K.naranja} y={250} tam={96} />
    </AbsoluteFill>
  );
};

// 3 · Fibras: quien tiene más rápidas (tipo II) tiene más para crecer ------------------------
const LEN_A = 0.3; // corte con más rápidas
const LEN_B = 0.72; // corte con más lentas
const C_ESC = 0.5;
const CA: V3 = [-0.62, 0.95, 0];
const CB: V3 = [0.62, 0.95, 0];
const Fibras: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.2;
  const k = curl(b, 4);
  const entrena = entre(b, 0.5, 0.82);
  const gRap = mix(1, 1.32, entrena);
  const gLen = mix(1, 1.06, entrena);
  const cam = fuera
    ? camBrazo(b, 0.2, 0.42)
    : camara(
        [
          { b: 0.2, p: [0.3, 1.2, 5.8], l: [0, 0.72, 0], fov: 38 },
          { b: 1, p: [-0.3, 1.15, 5.6], l: [0, 0.72, 0], fov: 38 },
        ],
        b,
      );
  const rA = radioCorte(LEN_A, gRap, gLen) * C_ESC;
  const rB = radioCorte(LEN_B, gRap, gLen) * C_ESC;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {fuera ? (
          <group position={[0.42, 0, 0]}>
            <Atleta ej="curl" k={k} brilla={0.2 + 0.4 * entre(b, 0.06, 0.18)} colorBrillo={K.rosa} />
            <Piso />
          </group>
        ) : (
          <>
            {[
              { c: CA, l: LEN_A, s: "ra" },
              { c: CB, l: LEN_B, s: "rb" },
            ].map((x) => (
              <group key={x.s} position={x.c} rotation={[-0.18, x.c[0] > 0 ? -0.12 : 0.12, 0]} scale={C_ESC}>
                <CorteTipos lentas={x.l} gRap={gRap} gLen={gLen} brillo={0.6 * entrena * (0.6 + 0.4 * Math.sin(b * 30))} seed={x.s} />
              </group>
            ))}
            {[CA, CB].map((c, i) => {
              const r = i ? rB : rA;
              const g = i ? 0.06 : 0.32;
              return entrena > 0.05 ? (
                <F2Flecha key={i} a={[c[0] + (i ? 0.35 : -0.35), c[1] - r - 0.08, 0.2]} b={[c[0] + (i ? 0.35 : -0.35), c[1] - r - 0.08 + 0.15 + g * 1.4 * entrena, 0.2]} color={i ? K.suave : K.lima} r={0.025} op={entrena} />
              ) : null;
            })}
            <Polvo b={b} radio={4} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.2]} />
      {!fuera ? (
        <>
          <Etiquetas
            cam={cam}
            b={b}
            items={[
              { p: add(CA, esc3(celdaTipo(LEN_A, true, [0.1, -0.6], gRap, gLen, 0.8, 0.2, "ra"), C_ESC)), t: "Rápidas (tipo II)", a: 0.26, z: 0.58, o: [60, 170], color: F2_COL.IIx },
              { p: add(CB, esc3(celdaTipo(LEN_B, false, [-0.1, -0.6], gRap, gLen, 0.8, 0.2, "rb"), C_ESC)), t: "Lentas (tipo I)", a: 0.3, z: 0.58, o: [-60, 170], color: "#ff6b7a" },
            ]}
          />
          <Rotulos
            cam={cam}
            b={b}
            items={[
              { p: [CA[0], CA[1] + rA + 0.14, 0], t: "MÁS RÁPIDAS", a: 0.34, z: 1, color: K.lima, tam: 40, anton: true },
              { p: [CB[0], CB[1] + rB + 0.14, 0], t: "MÁS LENTAS", a: 0.38, z: 1, color: "#ff6b7a", tam: 40, anton: true },
              { p: [CA[0], CA[1] - rA - 0.16, 0.2], t: "crece más", a: 0.6, z: 1, color: K.lima, tam: 34 },
              { p: [CB[0], CB[1] - rB - 0.16, 0.2], t: "crece menos", a: 0.64, z: 1, color: K.suave, tam: 34 },
            ]}
          />
        </>
      ) : null}
      <Dato b={b} a={0.03} z={0.5} t="1 · FIBRAS" sub="lentas (I) · rápidas (II)" color={K.rosa} y={250} tam={104} />
      <Dato b={b} a={0.52} z={1} t="TIPO II CRECEN MÁS" sub="más rápidas = más material" color={K.lima} y={250} tam={92} />
      <Chip b={b} a={0.62} z={1} t="LAS RÁPIDAS CRECEN MÁS" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 4 · Genes de crecimiento y células satélite: respondedor extremo ------------------------------
const FIB: V3 = [-0.42, 0.55, 0];
const F_ESC = 0.68;
const NUC: V3 = [0.62, 1.15, 0.8];
const MIONUC: V3 = [FIB[0] + 0.2, FIB[1] + 0.35, 0.45];

/** Fibra + núcleo con genes (mismo montaje para respondedor y no respondedor). */
const Celula: React.FC<{ b: number; on: number; activa: number; fusion: number[]; R: number }> = ({ b, on, activa, fusion, R }) => (
  <>
    <group position={FIB} scale={F_ESC}>
      <FibraSatelite R={R} activa={activa} fusion={fusion} />
    </group>
    <Enlace a={MIONUC} b={add(NUC, [-0.3, -0.25, -0.1])} r={0.008} color="#9fb8ff" op={0.7} />
    <F3Nucleo
      p={NUC}
      r={0.42}
      giro={b * 3}
      genes={[
        { color: GEN, on },
        { color: K.cian, on: on * 0.9 },
      ]}
    />
    <Polvo b={b} radio={4} />
  </>
);

const Genes: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.18;
  const on = entre(b, 0.3, 0.42) * (0.85 + 0.15 * Math.sin(b * 40));
  const activa = entre(b, 0.44, 0.56);
  const fusion = [0, 1, 2].map((i) => entre(b, 0.58 + i * 0.07, 0.72 + i * 0.07));
  const R = 0.8 * (1 + 0.16 * entre(b, 0.66, 0.95));
  const cam = fuera
    ? camBrazo(b, 0.18)
    : camara(
        [
          { b: 0.18, p: [0.5, 1.0, 7.2], l: [0.1, 0.4, 0], fov: 40 },
          { b: 1, p: [-0.3, 0.9, 6.9], l: [0.1, 0.4, 0], fov: 40 },
        ],
        b,
      );
  const sat = (i: number): V3 => add(FIB, esc3(posSatelite(i, R, fusion[i]), F_ESC));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={fuera ? undefined : [7, 20]}>
        {fuera ? (
          <>
            <Atleta ej="curl" k={curl(b, 4)} brilla={0.3 + 0.3 * curl(b, 4)} colorBrillo={K.lima} musculo={0.9} />
            <Biceps tam={1.5} brilla={0.4} colorBrillo={K.lima} />
            <Piso />
          </>
        ) : (
          <Celula b={b} on={on} activa={activa} fusion={fusion} R={R} />
        )}
      </Escena3D>
      <Destello b={b} en={[0.18]} color={K.lima} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: add(NUC, [-0.05, 0.1, 0.3]), t: "Genes de crecimiento", a: 0.24, z: 1, o: [-40, -110], color: GEN },
            { p: sat(0), t: "Célula satélite", a: 0.44, z: 0.7, o: [50, -70], color: H_SATELITE },
            { p: sat(1), t: "Se fusiona: núcleo nuevo", a: 0.72, z: 1, o: [60, 140], color: H_NUCLEO },
          ]}
        />
      ) : null}
      {!fuera ? (
        <Rotulos cam={cam} b={b} items={[{ p: add(NUC, [0, -0.62, 0]), t: "MGF · miogenina", a: 0.34, z: 1, color: K.tinta, tam: 32 }]} />
      ) : null}
      <Chip b={b} a={0.03} z={0.24} t="RESPONDEDOR EXTREMO" x={540} y={1100} color={K.lima} />
      <Dato b={b} a={0.03} z={0.4} t="2 · GENES" sub="y células satélite" color={GEN} y={250} tam={110} />
      <Dato b={b} a={0.42} z={1} t="SEÑALES ENCENDIDAS" sub="más satélites → la fibra crece" color={GEN} y={250} tam={86} />
      <Chip b={b} a={0.3} z={1} t="BAMMAN ET AL. 2007" x={540} y={1100} color={K.suave} />
    </AbsoluteFill>
  );
};

// 5 · No respondedor: las mismas señales casi no se mueven ---------------------------------------
const NoResponde: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.2;
  const on = 0.06 + 0.06 * Math.max(0, Math.sin(b * 23));
  const cam = fuera
    ? camBrazo(b, 0.2)
    : camara(
        [
          { b: 0.2, p: [0.5, 1.0, 7.2], l: [0.1, 0.4, 0], fov: 40 },
          { b: 1, p: [-0.3, 0.9, 6.9], l: [0.1, 0.4, 0], fov: 40 },
        ],
        b,
      );
  const pesa = Math.sin(b * 18) * 0.12;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2} niebla={fuera ? undefined : [7, 20]}>
        {fuera ? (
          <>
            <Atleta ej="curl" k={curl(b, 4)} brilla={0.1} colorBrillo={K.suave} />
            <Piso color={K.suave} brillo={0.25} />
          </>
        ) : (
          <>
            <Celula b={b} on={on} activa={0.04} fusion={[0, 0, 0]} R={0.8} />
            <Mancuerna p={[0.62, -0.55 + pesa, 0.6]} escala={0.45} giro={0.1} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.2]} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: add(NUC, [-0.05, 0.1, 0.3]), t: "Genes casi apagados", a: 0.26, z: 1, o: [-40, -110], color: K.suave },
            { p: add(FIB, esc3(posSatelite(0, 0.8, 0), F_ESC)), t: "Satélites quietas", a: 0.4, z: 1, o: [50, -70], color: "#7fa89a" },
          ]}
        />
      ) : null}
      <Chip b={b} a={0.03} z={0.26} t="NO RESPONDEDOR" x={540} y={1100} color={K.suave} />
      <Dato b={b} a={0.24} z={1} t="CASI NO SE MUEVEN" sub="la fibra no crece" color={K.suave} y={250} tam={96} />
      <Chip b={b} a={0.55} z={1} t="MISMO ENTRENAMIENTO" x={540} y={1100} color={K.cian} />
    </AbsoluteFill>
  );
};

// 6 · Somatotipos (Holway): meso responde rápido, ecto le cuesta, endo gana músculo y grasa -----------
const MESO: Soma = { endo: 1.5, meso: 6.2, ecto: 1.2 };
const ECTO: Soma = { endo: 1.5, meso: 2.5, ecto: 6 };
const ENDO: Soma = { endo: 6.5, meso: 4, ecto: 0.6 };
const Somatos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cod = -0.15 - 2.0 * curl(b, 7);
  const gM = entre(b, 0.2, 0.4);
  const gE = entre(b, 0.44, 0.62);
  const gN = entre(b, 0.66, 0.88);
  const cuerpos = [
    { x: -0.82, s: { ...MESO, meso: MESO.meso + 1.0 * gM }, c: CE.meso, n: "MESOMORFO", g: gM, br: 0.5 * gM, col: K.lima },
    { x: 0, s: { ...ECTO, meso: ECTO.meso + 0.25 * gE }, c: CE.ecto, n: "ECTOMORFO", g: gE, br: 0.15 * gE, col: K.suave },
    { x: 0.82, s: { ...ENDO, meso: ENDO.meso + 0.8 * gN, endo: ENDO.endo + 1.2 * gN }, c: CE.endo, n: "ENDOMORFO", g: gN, br: 0.4 * gN, col: K.amarillo },
  ];
  const cam = camara(
    [
      { b: 0, p: [0.6, 1.3, 7.8], l: [0, 0.6, 0], fov: 40 },
      { b: 1, p: [-0.6, 1.2, 7.6], l: [0, 0.6, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {cuerpos.map((c, i) => (
          <group key={i} position={[c.x, 0, 0]} rotation={[0, (i - 1) * -0.12, 0]}>
            <CuerpoSoma {...c.s} pesa codo={cod} abd={0.12} brilla={c.br} colorBrillo={c.col} />
            <Piso r={0.38} color={c.c} brillo={0.3 + 0.3 * c.g} />
          </group>
        ))}
        {gM > 0 ? <F2Flecha a={[-0.82 - 0.42, 0.9, 0.2]} b={[-0.82 - 0.42, 0.9 + 0.75 * gM, 0.2]} color={K.lima} r={0.04} op={gM} /> : null}
        {gE > 0 ? <F2Flecha a={[0.36, 0.9, 0.2]} b={[0.36, 0.9 + 0.22 * gE, 0.2]} color={K.suave} r={0.03} op={gE} /> : null}
        {gN > 0 ? (
          <>
            <F2Flecha a={[0.82 + 0.46, 0.9, 0.2]} b={[0.82 + 0.46, 0.9 + 0.55 * gN, 0.2]} color={K.lima} r={0.035} op={gN} />
            <F2Flecha a={[0.82 + 0.36, 0.6, 0.3]} b={[0.82 + 0.36, 0.6 + 0.5 * gN, 0.3]} color={K.amarillo} r={0.035} op={gN} />
          </>
        ) : null}
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          ...cuerpos.map((c, i) => ({ p: [c.x, 1.98, 0] as V3, t: c.n, a: 0.08 + i * 0.03, z: 1, color: c.c, tam: 34, anton: true })),
        ]}
      />
      <Dato b={b} a={0.02} z={1} t="3 · SOMATOTIPO" sub="mismo curl, distinta respuesta" color={K.rosa} y={250} tam={100} />
      <Chip b={b} a={0.04} z={0.22} t="HOLWAY · SOMATOTIPOS" x={540} y={1100} color={K.cian} />
      <Chip b={b} a={0.24} z={0.46} t="RESPONDE RÁPIDO" x={260} y={1100} color={K.lima} />
      <Chip b={b} a={0.48} z={0.68} t="LE CUESTA GANAR" x={540} y={1100} color={K.suave} />
      <Chip b={b} a={0.7} z={1.1} t="+ MÚSCULO + GRASA" x={790} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 7 · Lo que sí controlas: proteína, calorías, sueño, cerca del fallo -----------------------------
const TARJ: { p: V3; t: string; a: number; c: string }[] = [
  { p: [-0.56, 1.3, 0], t: "PROTEÍNA", a: 0.3, c: K.lima },
  { p: [0.56, 1.3, 0], t: "CALORÍAS", a: 0.42, c: K.naranja },
  { p: [-0.56, 0.16, 0], t: "SUEÑO", a: 0.52, c: K.morado },
  { p: [0.56, 0.16, 0], t: "CERCA DEL FALLO", a: 0.62, c: K.rojo },
];
const Controlas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const on = TARJ.map((t) => entre(b, t.a, t.a + 0.06));
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.9, 6.7], l: [0, 0.6, 0], fov: 38 },
      { b: 1, p: [-0.3, 0.85, 6.4], l: [0, 0.6, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {TARJ.map((t, i) => (
          <group key={i} position={t.p} rotation={[0, Math.sin(b * 3 + i) * 0.1, 0]} scale={0.85 + 0.15 * on[i]}>
            <Tarjeta3D ancho={0.95} alto={0.95} color={on[i] > 0.5 ? t.c : "#3b5257"} brillo={0.2 + 0.8 * on[i]} />
            <group position={[0, 0.08, 0.1]}>
              {i === 0 ? (
                <group rotation={[0.9, 0, 0]}>
                  <Plato p={[0, 0, 0]} escala={0.6} />
                  <Pechuga p={[0, 0.06, 0]} escala={0.5} />
                </group>
              ) : null}
              {i === 1 ? (
                <group rotation={[0.9, 0, 0]}>
                  <Plato p={[0, 0, 0]} escala={0.6} />
                  <F2Arroz p={[-0.12, 0.03, 0]} escala={0.3} />
                  <Frijoles p={[0.14, 0.03, 0.02]} escala={0.22} />
                </group>
              ) : null}
              {i === 2 ? <Luna p={[0.02, 0, 0]} r={0.24} brillo={0.3 + 0.6 * on[i]} /> : null}
              {i === 3 ? (
                <>
                  <Mancuerna p={[0, 0.15, 0]} escala={0.45} giro={0.15 * curl(b, 5) * on[i]} />
                  <group position={[0, -0.14, 0]}>
                    <BarraEsfuerzo nivel={mix(0.25, 0.9, on[i])} ancho={0.66} />
                  </group>
                </>
              ) : null}
            </group>
          </group>
        ))}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Rotulos cam={cam} b={b} items={TARJ.map((t, i) => ({ p: add(t.p, [0, -0.36, 0.1]), t: t.t, a: t.a, z: 1, color: on[i] > 0.5 ? t.c : K.suave, tam: 34, anton: true }))} />
      <Dato b={b} a={0.04} z={1} t="4 · LO QUE SÍ CONTROLAS" sub="cambia mucho el resultado" color={K.lima} y={250} tam={84} />
    </AbsoluteFill>
  );
};

// 8 · La genética es el punto de partida, no el final ----------------------------------------------
const SALIDA: [number, number] = [0, -1.1];
const META = -6.2;
const Partida: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const corre = lineal(b, 0.4, 1);
  const zA = SALIDA[0] - 4.7 * corre;
  const zB = SALIDA[1] - 4.2 * corre;
  const cam = camara(
    [
      { b: 0, p: [0.7, 2.3, 3.6], l: [0, 0.1, -1.0], fov: 40 },
      { b: 0.4, p: [0.6, 2.3, 3.3], l: [0, 0.1, -1.2], fov: 40 },
      { b: 1, p: [0.6, 2.6, 0.4], l: [0, 0.2, -4.6], fov: 40 },
    ],
    b,
  );
  const S = 0.55;
  const ent = visible(b, 0.46, 1, 0.05);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <Pista salidas={SALIDA} meta={META} brilloMeta={0.5 * entre(b, 0.8, 0.95)} />
        {[
          { x: -0.35, z: zA, c: K.naranja },
          { x: 0.35, z: zB, c: K.cian },
        ].map((r, i) => (
          <group key={i} position={[r.x, 0, r.z]} rotation={[0, Math.PI, 0]} scale={S}>
            {corre > 0 ? (
              <Atleta ej="sprint" fase={b * 40 + i} brilla={0.2 + 0.4 * corre} colorBrillo={K.lima} />
            ) : (
              <Atleta ej="parado" brilla={0.15} colorBrillo={r.c} />
            )}
          </group>
        ))}
        {b < 0.42 ? <F2Flecha a={[0, 0.06, SALIDA[0] - 0.05]} b={[0, 0.06, SALIDA[1] + 0.05]} color={K.morado} r={0.025} doble op={visible(b, 0.12, 0.42, 0.05)} /> : null}
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-0.35, 0.02, SALIDA[0] + 0.2], t: "SALIDA", a: 0.06, z: 0.45, color: K.naranja, tam: 30, anton: true },
          { p: [0.35, 0.02, SALIDA[1] + 0.2], t: "SALIDA", a: 0.06, z: 0.45, color: K.cian, tam: 30, anton: true },
          { p: [0.15, 0.3, (SALIDA[0] + SALIDA[1]) / 2], t: "genética", a: 0.14, z: 0.42, color: K.morado, tam: 34, ancla: "izq" },
          { p: [0, 1.4, META], t: "META", a: 0.5, z: 1, color: K.lima, tam: 44, anton: true },
        ]}
      />
      <Dato b={b} a={0.03} z={1} t="PUNTO DE PARTIDA" sub="no el final" color={K.morado} y={250} tam={104} />
      {ent > 0 ? (
        <>
          <Chip b={b} a={0.46} z={1} t="+ ENTRENAMIENTO" x={300} y={1100} color={K.lima} />
          <Chip b={b} a={0.52} z={1} t="+ COMIDA" x={790} y={1100} color={K.naranja} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// 9 · No copies a tu amigo: compárate contigo mismo ----------------------------------------------
const YO: Soma = { endo: 2.5, meso: 3.2, ecto: 4 };
const AMIGO: Soma = { endo: 1.5, meso: 6.5, ecto: 1 };
const Contigo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const tacha1 = entre(b, 0.14, 0.22);
  const comida = entre(b, 0.3, 0.38);
  const tiempo = entre(b, 0.46, 0.58);
  const yo6 = entre(b, 0.6, 0.72);
  const tacha2 = entre(b, 0.82, 0.88);
  const cod = -0.15 - 2.0 * curl(b, 6);
  const cam = camara(
    [
      { b: 0, p: [0.4, 1.2, 7.0], l: [0, 0.68, 0], fov: 40 },
      { b: 1, p: [-0.3, 1.15, 6.8], l: [0, 0.68, 0], fov: 40 },
    ],
    b,
  );
  const XY = mix(-0.4, -0.85, yo6);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {/* amigo (silueta de comparación) */}
        <group position={[0.85, 0, -0.2]}>
          <CuerpoSoma {...AMIGO} tono="#5d6b70" musculo={0.45} colorBrillo={K.suave} brilla={0.05} />
          <Piso r={0.38} color={K.suave} brillo={0.2} />
        </group>
        {b < 0.36 ? (
          <group position={[0.85, 1.1, 0.5]} scale={0.32}>
            <HojaRutina color={K.suave} marca={1} />
            {tacha1 > 0 ? <F2Tacha p={[0, 0, 0.1]} tam={0.9 * tacha1} /> : null}
          </group>
        ) : null}
        {tacha2 > 0 ? <F2Tacha p={[0.85, 1.0, 0.4]} tam={0.75 * tacha2} op={0.9} /> : null}
        {/* tú: mes 0 */}
        <group position={[XY, 0, 0]}>
          <CuerpoSoma {...YO} pesa codo={cod} abd={0.12} brilla={0.1} />
          <Piso r={0.38} color={K.cian} brillo={0.3} />
        </group>
        {comida > 0 ? (
          <group position={[XY, 0.62, 0.62]} rotation={[0.4, 0, 0]} scale={comida * 0.9}>
            <Plato p={[0, 0, 0]} escala={0.6} />
            <F2Arroz p={[-0.12, 0.03, -0.05]} escala={0.3} />
            <Pechuga p={[0.13, 0.05, 0.05]} escala={0.28} />
          </group>
        ) : null}
        {tiempo > 0 && b < 0.66 ? (
          <group position={[0.15, 1.3, 0.4]} scale={0.32 * Math.min(1, tiempo * 4)}>
            <Semanas n={12} marca={tiempo} />
          </group>
        ) : null}
        {/* tú: mes 6 */}
        {yo6 > 0 ? (
          <group position={[0.02, 0, 0.1]} scale={[1, 1, 1]}>
            <CuerpoSoma {...YO} meso={YO.meso + 1.0 * yo6} endo={YO.endo - 0.5 * yo6} pesa codo={cod} abd={0.12} brilla={0.35 * yo6} colorBrillo={K.lima} musculo={0.8 * yo6} verGrasa={yo6} />
            <Piso r={0.38} brillo={0.4 * yo6} />
          </group>
        ) : null}
        {yo6 > 0.5 ? <Check p={[0.4, 1.75, 0.2]} escala={0.9 * entre(b, 0.7, 0.76)} /> : null}
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [0.85, 1.88, -0.2], t: "TU AMIGO", a: 0.04, z: 1, color: K.suave, tam: 34, anton: true },
          { p: [XY, 1.88, 0], t: b < 0.62 ? "TÚ" : "MES 0", a: 0.04, z: 1, color: K.cian, tam: 34, anton: true },
          { p: [0.02, 1.88, 0.1], t: "MES 6", a: 0.66, z: 1, color: K.lima, tam: 34, anton: true },
          { p: [0.85, 1.44, 0.5], t: "SU RUTINA", a: 0.06, z: 0.36, color: K.suave, tam: 28 },
        ]}
      />
      <Dato b={b} a={0.03} z={0.28} t="NO COPIES SU RUTINA" color={K.rojo} y={250} tam={90} />
      <Dato b={b} a={0.3} z={0.6} t="AJUSTA TU COMIDA" sub="a tu tipo de cuerpo · dale tiempo" color={K.naranja} y={250} tam={90} />
      <Dato b={b} a={0.62} z={1.1} t="MES 0 → MES 6" sub="compárate contigo, no con él" color={K.lima} y={250} tam={96} />
      <Chip b={b} a={0.7} z={1.1} t="COMPÁRATE CONTIGO" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Ganas músculo <span style={{ color: K.lima }}>rápido o lento</span>?</>}
    escribe="Yo gano…"
    ideas={["RÁPIDO", "LENTO", "ME CUESTA MUCHO"]}
  />
);

const T = [
  "¿Por qué tu amigo gana músculo en tres meses y tú no, con la misma rutina? Hoy juntamos todo lo de la serie: **genética**, **fibras** y **somatotipos**.",
  "En un estudio, **quinientas ochenta y cinco** personas entrenaron el bíceps durante doce semanas con el mismo programa.",
  "Algunas casi no cambiaron, y otras aumentaron el tamaño de su músculo hasta un **cincuenta y nueve por ciento**. Su fuerza llegó a más que duplicarse.",
  "Primera razón: las **fibras**. Las rápidas, tipo dos, son las que más crecen. Quien nace con más fibras rápidas tiene más material para crecer.",
  "Segunda: los **genes de crecimiento** y las células satélite. En quienes más crecieron, esas señales se encendieron con mucha más fuerza.",
  "En quienes no crecieron, esas señales casi no se movieron, aunque hicieron exactamente el mismo entrenamiento.",
  "Tercera: el **somatotipo**. Como explica Holway, el mesomorfo responde rápido, al ectomorfo le cuesta mucho ganar músculo, y el endomorfo gana músculo pero también grasa con facilidad.",
  "Y cuarta, lo que sí controlas: la **proteína**, las **calorías**, el **sueño** y qué tan cerca del fallo entrenas cambian mucho el resultado.",
  "La genética te da el **punto de partida**, no el final: casi todos responden cuando ajustan su entrenamiento y su alimentación.",
  "Por eso no copies la rutina de tu amigo. Ajusta tu comida a tu tipo de cuerpo, dale tiempo, y compárate **contigo mismo**, no con él.",
  "¿Tú ganas músculo rápido o lento? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Estudio, Resultados, Fibras, Genes, NoResponde, Somatos, Controlas, Partida, Contigo, Final];

export const RESPUESTA: ShortDef = {
  id: "Short-Respuesta",
  titulo: "¿Por qué unos ganan músculo más rápido que otros?",
  planos: ESCENAS.map((Escena, i) => ({ id: `respuesta-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
