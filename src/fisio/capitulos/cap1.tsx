import React from "react";
import { AbsoluteFill } from "remotion";
import {
  Cam,
  camara,
  entre,
  lineal,
  mix,
  mix3,
  PlanoDef,
  useBeat,
  V3,
  visible,
} from "../motor";
import { Humano } from "../modelos/cuerpo";
import { difusion, Particulas, Polvo, rnd, Tubo } from "../modelos/comun";
import {
  CabezaMiosina,
  CilindroX,
  FilamentoFino,
  Mitocondria,
  MoleculaMiosina,
  NivelFasciculo,
  NivelFibra,
  NivelMiofibrilla,
  NivelMusculo,
  posActina,
  posTroponina,
  SARC,
  Sarcomero,
} from "../modelos/musculo";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Rico, Tarjeta } from "../ui";

const SEC = "1.1 Músculo esquelético";

/** Fundido a negro breve en los cambios de nivel del zoom. */
const Destello: React.FC<{ b: number; en: number[] }> = ({ b, en }) => {
  const op = Math.max(0, ...en.map((k) => 1 - Math.abs(b - k) / 0.07));
  return <AbsoluteFill style={{ background: "#000", opacity: op }} />;
};

/** Lista de pasos con el paso actual resaltado. */
export const Pasos: React.FC<{
  titulo: string;
  pasos: string[];
  actual: number;
  x?: number;
  y?: number;
  w?: number;
  tam?: number;
}> = ({ titulo, pasos, actual, x = 1330, y = 120, w = 540, tam = 24 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      background: "rgba(4,9,20,0.8)",
      borderRadius: 16,
      padding: "18px 22px",
      fontFamily: FUENTE,
      color: C.texto,
      fontSize: tam,
      border: "1px solid rgba(94,224,255,0.3)",
    }}
  >
    <div style={{ fontWeight: 800, color: C.acento, marginBottom: 10, fontSize: tam * 1.1 }}>
      {titulo}
    </div>
    {pasos.map((p, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          gap: 10,
          padding: "6px 10px",
          borderRadius: 8,
          marginBottom: 4,
          background: i === actual ? "rgba(255,207,90,0.18)" : undefined,
          color: i === actual ? C.acento2 : i < actual ? C.texto : C.suave,
          fontWeight: i === actual ? 800 : 500,
          opacity: i <= actual ? 1 : 0.55,
        }}
      >
        <span style={{ minWidth: 28 }}>{i + 1}.</span>
        <span>{p}</span>
      </div>
    ))}
  </div>
);

// ===================================================================
// 1. Zoom: del cuerpo al sarcomero
// ===================================================================

const camNivel = (t: number): Cam => {
  const ida = entre(t, 0, 0.85);
  const zum = entre(t, 0.85, 1);
  const p = mix3(mix3([3.3, 1.5, 2.9], [1.25, 0.45, 0.55], ida), [0.18, 0, 0.0], zum);
  const l = mix3(mix3([-1.2, 0, 0], [0, 0, 0], ida), [-1, 0, 0], zum);
  return { p, l, fov: 40 };
};

const ZoomCuerpo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const nivel = Math.floor(b);
  let cam: Cam;
  if (b < 1) {
    cam = camara(
      [
        { b: 0, p: [0, 1.1, 3.6], l: [0, 0.95, 0], fov: 35 },
        { b: 0.55, p: [0.7, 0.85, 1.6], l: [0.1, 0.75, 0], fov: 35 },
        { b: 1, p: [0.16, 0.73, 0.2], l: [0.1, 0.73, 0], fov: 35 },
      ],
      b,
    );
  } else if (b < 5) {
    cam = camNivel(b - nivel);
  } else {
    cam = camara(
      [
        { b: 5, p: [-1.2, 2.2, 3.4], l: [-3, 0, 0], fov: 40 },
        { b: 6, p: [-2.4, 1.1, 2.4], l: [-3, 0, 0], fov: 40 },
      ],
      b,
    );
  }
  const brilla = entre(b - nivel, 0.55, 0.8);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {nivel === 0 ? (
          <Humano fase={b * 3} marcha={0.6 * (1 - b)} musculo={0.75} brillaMuslo={entre(b, 0.3, 0.7)} />
        ) : null}
        {nivel === 1 ? <NivelMusculo brilla={brilla} /> : null}
        {nivel === 2 ? <NivelFasciculo brilla={brilla} /> : null}
        {nivel === 3 ? <NivelFibra brilla={brilla} /> : null}
        {nivel === 4 ? <NivelMiofibrilla brilla={brilla} /> : null}
        {nivel >= 5 ? <NivelMiofibrilla /> : null}
        {nivel >= 1 ? <Polvo b={b} radio={4} /> : null}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.1, 0.75, 0.08], t: "Cuádriceps (músculo esquelético)", a: 0.3, z: 0.9, o: [90, -70], color: C.musculoClaro },
          { p: [-1.5, 0.6, 0.85], t: "Epimisio", a: 1.1, z: 1.75, o: [-80, -70], color: C.tejido },
          { p: [0.05, 0.36, 0], t: "Fascículo", a: 1.2, z: 1.75, o: [90, -80] },
          { p: [-1.5, 0.6, 0.8], t: "Perimisio", a: 2.1, z: 2.75, o: [-80, -70], color: C.tejido },
          { p: [0.08, 0.18, 0.05], t: "Fibra muscular", a: 2.2, z: 2.75, o: [90, -80] },
          { p: [-1.6, 0.7, 0.75], t: "Endomisio", a: 3.1, z: 3.75, o: [-80, -90], color: C.tejido },
          { p: [-0.4, 0.98, 0.0], t: "Sarcolema", a: 3.15, z: 3.75, o: [60, -90], color: "#f39aa0" },
          { p: [-1.4, 0.0, 0.97], t: "Núcleos (multinucleada)", a: 3.2, z: 3.75, o: [-60, 80], color: "#9b86ff" },
          { p: [0.15, 0.17, 0.0], t: "Miofibrilla", a: 3.3, z: 3.75, o: [90, -40] },
          { p: [0.0, 0.5, 0.0], t: "Miofibrilla", a: 4.1, z: 4.75, o: [90, -70] },
          { p: [-3.714, 0.5, 0], t: "Disco Z", a: 5.15, z: 6, o: [-60, -90], color: "#c8d6ff" },
          { p: [-2.286, 0.5, 0], t: "Disco Z", a: 5.15, z: 6, o: [60, -90], color: "#c8d6ff" },
          { p: [-3.0, -0.5, 0.0], t: "1 sarcómero", a: 5.3, z: 6, o: [0, 90], color: C.acento2 },
        ]}
      />
      <Tarjeta b={b} a={1} z={5} x={1380} y={120} w={480} titulo="Del músculo al sarcómero" tam={26}>
        <Lista
          items={[
            nivel >= 1 ? "Músculo → **epimisio**" : "",
            nivel >= 2 ? "Fascículo → **perimisio**" : "",
            nivel >= 3 ? "Fibra → **sarcolema + endomisio**" : "",
            nivel >= 4 ? "Miofibrilla → **sarcómeros en serie**" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
      <Destello b={b} en={[1, 2, 3, 4, 5]} />
    </AbsoluteFill>
  );
};

// ===================================================================
// 2. El sarcomero: bandas, arreglo espacial, titina y nebulina
// ===================================================================

const Caja: React.FC<{ x0: number; x1: number; color: string; op: number; r?: number }> = ({
  x0,
  x1,
  color,
  op,
  r = 1.0,
}) =>
  op > 0 ? (
    <mesh position={[(x0 + x1) / 2, 0, 0]}>
      <boxGeometry args={[Math.abs(x1 - x0), r * 2, r * 2]} />
      <meshBasicMaterial color={color} transparent opacity={0.16 * op} depthWrite={false} />
    </mesh>
  ) : null;

const SarcomeroEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const L = SARC.reposo;
  const A = SARC.grueso / 2;
  const H = L / 2 - SARC.fino;
  const cam = camara(
    [
      { b: 0, p: [0.5, 2.4, 5.2], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [-1.0, 1.6, 4.0], l: [-1.2, 0, 0], fov: 40 },
      { b: 2, p: [0, 2.0, 4.6], l: [0, 0, 0], fov: 40 },
      { b: 3, p: [0.3, 1.5, 4.0], l: [0, 0, 0], fov: 40 },
      { b: 3.85, p: [0.3, 1.5, 4.0], l: [0, 0, 0], fov: 40 },
      { b: 4.15, p: [16, 0.05, 0.05], l: [0, 0, 0], fov: 8.5 },
      { b: 4.85, p: [16, 0.05, 0.05], l: [0, 0, 0], fov: 8.5 },
      { b: 5.15, p: [-1.0, 0.5, 3.0], l: [-1.0, 0.1, 0], fov: 40 },
      { b: 6, p: [-1.1, 0.4, 2.6], l: [-1.1, 0.0, 0], fov: 40 },
      { b: 7, p: [-0.6, 0.9, 3.4], l: [-0.9, 0.0, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0.0, 0, 0]}>
          <Sarcomero L={L} cabezas={b < 4 || b > 5} titina={visible(b, 5, 7.2)} nebulina={visible(b, 6, 7.2)} resaltaFinos={visible(b, 6, 7) * 0.5} />
          <Caja x0={-L / 2} x1={-A} color="#5ec8ff" op={visible(b, 1, 2)} />
          <Caja x0={A} x1={L / 2} color="#5ec8ff" op={visible(b, 1, 2)} />
          <Caja x0={-A} x1={A} color="#ff8a3d" op={visible(b, 2, 3)} />
          <Caja x0={-H} x1={H} color="#7cff8a" op={visible(b, 3, 4)} />
        </group>
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-L / 2, 1.0, 0], t: "Disco Z", a: 0.2, z: 1, o: [-60, -60], color: "#c8d6ff" },
          { p: [L / 2, 1.0, 0], t: "Disco Z", a: 0.2, z: 1, o: [60, -60], color: "#c8d6ff" },
          { p: [-1.2, 0.3, 0.7], t: "Actina (fino)", a: 0.4, z: 1, o: [-80, 90], color: C.actina },
          { p: [0.6, 0.0, 0.7], t: "Miosina (grueso)", a: 0.5, z: 1, o: [80, 90], color: C.cabeza },
          { p: [-(L / 2 + A) / 2, 1.0, 0], t: "Banda I (clara)", a: 1.1, z: 2, o: [-40, -80], color: "#5ec8ff" },
          { p: [(L / 2 + A) / 2, 1.0, 0], t: "Banda I", a: 1.1, z: 2, o: [40, -80], color: "#5ec8ff" },
          { p: [0, 0.9, 0], t: "Banda A (oscura) – longitud constante", a: 2.1, z: 3, o: [-120, -40], color: "#ff8a3d" },
          { p: [0.25, 0.9, 0], t: "Zona H", a: 3.1, z: 4, o: [80, -50], color: "#7cff8a" },
          { p: [0, -0.85, 0], t: "Línea M", a: 3.2, z: 4, o: [60, 70], color: "#ff6bff" },
          { p: [-1.65, 0.07, 0.68], t: "Titina (resorte)", a: 5.2, z: 6, o: [-60, -110], color: C.titina },
          { p: [-1.2, 0.03, 0.75], t: "Nebulina", a: 6.2, z: 7, o: [-60, 110], color: C.nebulina },
        ]}
      />
      <Tarjeta b={b} a={4} z={5} x={60} y={160} w={520} titulo="Corte transversal" tam={27}>
        <Lista
          items={[
            "Cada **grueso** (miosina) está rodeado por **6 finos**",
            "Cada **fino** (actina) está rodeado por **3 gruesos**",
          ]}
        />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={4} x={1380} y={140} w={480} titulo="Bandas del sarcómero" tam={26}>
        <Lista
          items={[
            "**I**: solo finos · se acorta",
            b > 2 ? "**A**: todo el grueso · NO cambia" : "",
            b > 3 ? "**H**: solo gruesos · se acorta" : "",
            b > 3 ? "**M**: divide la A en dos" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
      <Tarjeta b={b} a={5} z={7} x={1380} y={140} w={480} titulo="Proteínas gigantes" color={C.titina} tam={26}>
        <Lista
          items={[
            "**Titina**: Z → M · >25 000 aminoácidos · centra la miosina · tensión pasiva · solo es elástica en la banda I",
            b > 6 ? "**Nebulina**: NO elástica · junto a la actina · alinea y regula su longitud" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================
// 3. Miosina
// ===================================================================

const MiosinaEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 4.2], l: [-0.6, 0, 0], fov: 40 },
      { b: 1, p: [-0.6, 0.8, 3.6], l: [-0.6, 0, 0], fov: 40 },
      { b: 2, p: [-0.4, 0.6, 4.0], l: [-0.8, 0, 0], fov: 40 },
      { b: 3, p: [0.9, 0.5, 2.0], l: [0.5, 0, 0], fov: 40 },
      { b: 4, p: [0.2, 0.5, 2.0], l: [-0.1, 0, 0], fov: 40 },
      { b: 5, p: [0, 0.9, 3.8], l: [0, 0, 0], fov: 40 },
      { b: 6, p: [0.4, 1.1, 3.4], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  const fraccion = visible(b, 2, 3);
  const ensamblaje = entre(b, 5, 5.6);
  const sola = 1 - entre(b, 4.85, 5.05);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {sola > 0.01 ? (
          <group scale={sola} rotation={[0.25, 0, 0]}>
            <MoleculaMiosina
              colorCola={fraccion > 0.5 ? "#4f7dff" : C.miosina}
              colorS2={fraccion > 0.5 ? "#ff7aa8" : C.miosina}
              colorCabeza={fraccion > 0.5 ? "#ff7aa8" : C.cabeza}
              ligeras={visible(b, 1, 5) > 0 ? 1 : 0.15}
              dominios={visible(b, 3, 4)}
              angulo={b > 4 ? Math.sin((b - 4) * 14) * 0.35 * visible(b, 4, 5) : 0}
            />
          </group>
        ) : null}
        {ensamblaje > 0 ? <FilamentoGrueso t={ensamblaje} /> : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.6, 0.0, 0.1], t: "2 cadenas pesadas (cola)", a: 1.0, z: 2, o: [-60, -90], color: C.miosina },
          { p: [0.58, 0.32, 0], t: "Cabezas globulares", a: 1.05, z: 2, o: [60, -100], color: C.cabeza },
          { p: [0.27, 0.22, 0.04], t: "4 cadenas ligeras", a: 1.15, z: 2, o: [-120, -140], color: "#5ef0c8" },
          { p: [-1.6, 0.0, 0.1], t: "Meromiosina ligera (cola)", a: 2.05, z: 3, o: [-60, -90], color: "#4f7dff" },
          { p: [-0.3, 0.0, 0.1], t: "Meromiosina pesada: S2 + S1", a: 2.1, z: 3, o: [40, 110], color: "#ff7aa8" },
          { p: [0.75, 0.42, 0], t: "Catalítico: actina + ATPasa", a: 3.05, z: 4, o: [60, -80], color: "#ff8a5c" },
          { p: [0.18, 0.12, 0], t: "Cuello", a: 3.1, z: 4, o: [-80, -110], color: "#8ec5ff" },
          { p: [0.38, 0.23, 0], t: "Conversor", a: 3.15, z: 4, o: [-40, -170], color: "#7cff8a" },
          { p: [-0.3, 0.0, 0.1], t: "Bisagra (S2): permite girar", a: 4.05, z: 5, o: [-60, 100], color: "#ff7aa8" },
          { p: [0, 0.3, 0], t: "Zona desnuda (colas al centro)", a: 5.6, z: 6, o: [-60, -110], color: C.miosina },
          { p: [1.6, 0.35, 0], t: "Cabezas hacia los extremos", a: 5.6, z: 6, o: [60, -100], color: C.cabeza },
        ]}
      />
      <Tarjeta b={b} a={0} z={2} x={60} y={130} w={480} titulo="Miosina = hexámero" color={C.cabeza} tam={27}>
        <Lista items={["**2** cadenas pesadas", "**4** cadenas ligeras (2 por cabeza): **esencial** y **reguladora**"]} />
      </Tarjeta>
      <Tarjeta b={b} a={3} z={4} x={60} y={130} w={480} titulo="Cabeza S1: 3 dominios" color="#ff8a5c" tam={27}>
        <Lista items={["**Catalítico**: une actina e hidroliza ATP (ATPasa)", "**Cuello**: estabilizado por cadenas ligeras", "**Conversor**: transmite el cambio de forma"]} />
      </Tarjeta>
      <Tarjeta b={b} a={5} z={6} x={60} y={130} w={480} titulo="Filamento grueso" color={C.miosina} tam={27}>
        <Lista items={["≈ **250** moléculas de miosina", "Isoformas **IIA y IIX**: ATPasa rápida → acortamiento más veloz"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

/** Unas 36 miosinas que se ensamblan: colas al centro, cabezas a los extremos. */
const FilamentoGrueso: React.FC<{ t: number }> = ({ t }) => (
  <group>
    {Array.from({ length: 36 }).map((_, i) => {
      const lado = i % 2 ? 1 : -1;
      const k = Math.floor(i / 2);
      const ang = k * 1.1;
      const finalPos: V3 = [lado * (0.35 + (k % 9) * 0.16), Math.cos(ang) * 0.12, Math.sin(ang) * 0.12];
      const ini: V3 = [(rnd(`gx${i}`) - 0.5) * 6, (rnd(`gy${i}`) - 0.5) * 3, (rnd(`gz${i}`) - 0.5) * 3];
      const p = mix3(ini, finalPos, t);
      return (
        <group key={i} position={p} rotation={[ang, lado > 0 ? 0 : Math.PI, 0.25 * (1 - t) + 0.3]}>
          <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.7, 6]} />
            <meshStandardMaterial color={C.miosina} />
          </mesh>
          <mesh position={[0.05, 0.03, 0]}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <meshStandardMaterial color={C.cabeza} emissive={C.cabeza} emissiveIntensity={0.2} />
          </mesh>
          <mesh position={[0.05, -0.03, 0.02]}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <meshStandardMaterial color={C.cabeza} emissive={C.cabeza} emissiveIntensity={0.2} />
          </mesh>
        </group>
      );
    })}
  </group>
);

// ===================================================================
// 4. Actina y proteinas moduladoras
// ===================================================================

const N_ACT = 26;

const ActinaEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const largo = N_ACT * 0.11;
  const cx = largo / 2;
  const cam = camara(
    [
      { b: 0, p: [cx, 0.6, 2.6], l: [cx, 0, 0], fov: 40 },
      { b: 1, p: [cx - 0.5, 0.45, 1.4], l: [cx - 0.5, 0, 0], fov: 40 },
      { b: 2, p: [cx, 0.7, 1.9], l: [cx, 0, 0], fov: 40 },
      { b: 3, p: [0.5, 0.35, 0.9], l: [0.4, 0, 0], fov: 40 },
      { b: 4, p: [0.8, 0.6, 1.5], l: [0.6, 0, 0], fov: 40 },
      { b: 5, p: [cx, 0.8, 2.5], l: [cx, 0, 0], fov: 40 },
    ],
    b,
  );
  const ca = entre(b, 4.15, 4.55) * (1 - entre(b, 5.3, 5.7));
  const bloqueo = 1 - entre(b, 4.45, 4.8) * (1 - entre(b, 5.45, 5.8));
  const tm = entre(b, 2.0, 2.4);
  const sitios = Math.max(visible(b, 1, 2.3) * (1 - tm), 1 - bloqueo);
  const armado = b < 0.5 ? entre(b, 0, 0.45) : 1;
  const hebras = b < 0.5 ? 1 : 2;
  // iones de calcio que llegan a la troponina C
  const tn = [0, 1, 2].flatMap((k) => [0, 1].map((s) => posTroponina(k, s, bloqueo)));
  const iones = tn.map((p, i) => {
    const t = lineal(b, 4.0 + i * 0.03, 4.45 + i * 0.03);
    const ini: V3 = [p[0] + 0.6, p[1] + 1.4, p[2] + 0.6];
    return t >= 1 ? null : difusion(ini, p, t, `ca${i}`, 0.15);
  });
  const ionesSalen = tn.map((p, i) => {
    const t = lineal(b, 5.3, 5.75);
    return difusion(p, [p[0] - 0.5, p[1] + 1.5, p[2] + 0.5], t, `cs${i}`, 0.15);
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <FilamentoFino
          n={N_ACT}
          armado={armado}
          hebras={hebras}
          bloqueo={bloqueo}
          sitios={sitios}
          tropomiosina={tm}
          troponina={entre(b, 3.0, 3.3)}
          caUnido={ca}
          resaltaG={b > 1 && b < 2 ? 8 : -1}
        />
        {b > 4 && b < 4.6 ? <Particulas pos={iones.filter((x): x is V3 => !!x)} radio={0.022} color={C.calcio} /> : null}
        {b > 5.3 && b < 5.8 ? <Particulas pos={ionesSalen} radio={0.022} color={C.calcio} /> : null}
        <Polvo b={b} radio={3} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: posActina(3, 0), t: "Actina G (globular)", a: 0.05, z: 0.5, o: [-60, -90], color: C.actina },
          { p: posActina(15, 1), t: "Actina F: 2 hebras en espiral", a: 0.55, z: 1, o: [60, -90], color: C.actina },
          { p: posActina(8, 0), t: "Sitio de unión a miosina", a: 1.1, z: 2, o: [60, -90], color: "#ff3d6e" },
          { p: [cx, 0.09, 0], t: "Tropomiosina: tapa los sitios", a: 2.3, z: 3, o: [60, -90], color: C.tropomiosina },
          { p: posTroponina(0, 0, 1), t: "Troponina C (Ca²⁺)", a: 3.15, z: 4, o: [-40, -110], color: C.troponina },
          { p: [posTroponina(0, 0, 1)[0] + 0.05, posTroponina(0, 0, 1)[1] + 0.02, posTroponina(0, 0, 1)[2]], t: "Troponina I (actina)", a: 3.25, z: 4, o: [60, -60], color: "#ff6b6b" },
          { p: [posTroponina(0, 0, 1)[0] - 0.05, posTroponina(0, 0, 1)[1] - 0.01, posTroponina(0, 0, 1)[2]], t: "Troponina T (tropomiosina)", a: 3.35, z: 4, o: [-60, 90], color: "#ffd23b" },
          { p: posTroponina(1, 0, bloqueo), t: "Ca²⁺ unido a troponina C", a: 4.5, z: 5, o: [60, -90], color: C.calcio },
          { p: posActina(12, 0), t: "Sitios expuestos", a: 4.75, z: 5.3, o: [-60, 100], color: "#ff3d6e" },
        ]}
      />
      <Tarjeta b={b} a={3} z={6} x={1380} y={140} w={480} titulo="Troponina: 3 subunidades" color={C.troponina} tam={27}>
        <Lista items={["**I** → afinidad por la **actina**", "**T** → afinidad por la **tropomiosina**", "**C** → afinidad por el **Ca²⁺**"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================
// 5. Sistema de activacion: triada y sarcoplasma
// ===================================================================

const SARC_LEN = 10 / 7;
const zLineas = (n: number) => Array.from({ length: n }).map((_, k) => 2 - k * SARC_LEN);
// uniones A-I de cada sarcomero (donde se ubican las triadas)
const triadas = () =>
  zLineas(6).flatMap((z) => [z - SARC_LEN * 0.18, z - SARC_LEN * 0.82]).filter((x) => x > -6.5 && x < 2);

export const Triada: React.FC<{
  b: number;
  pulso?: number; // 0..1 viaje del potencial de accion por el tubulo T
  caDentro?: number;
  caFuera?: number; // 0..1 liberacion
  reticuloOp?: number;
  mito?: number;
  depositos?: number;
}> = ({ pulso = 0, caDentro = 0, caFuera = 0, reticuloOp = 0.6, mito = 1, depositos = 0 }) => {
  const xs = triadas();
  const R = 0.56;
  return (
    <group>
      {/* miofibrillas */}
      <CilindroX radio={0.5} largo={10} x={2} color="#c03a46" estriado={7} tapa="#d75b65" rugosidad={0.35} />
      <CilindroX radio={0.5} largo={10} x={2} y={0} z={-1.35} color="#c03a46" estriado={7} tapa="#d75b65" rugosidad={0.35} />
      <CilindroX radio={0.5} largo={10} x={2} y={-1.25} z={-0.4} color="#c03a46" estriado={7} tapa="#d75b65" rugosidad={0.35} />
      {/* sarcolema (arriba) */}
      <mesh position={[-3, 1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 5]} />
        <meshPhysicalMaterial color="#f39aa0" transparent opacity={0.22} side={2} depthWrite={false} />
      </mesh>
      {xs.map((x, i) => {
        const brillo = pulso > 0 ? Math.max(0, 1 - Math.abs(pulso * 1.6 - 0.3 - i * 0.02) * 2) : 0;
        return (
          <group key={i} position={[x, 0, 0]}>
            {/* tubulo T: anillo + conexion con el sarcolema */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[R, 0.03, 10, 48]} />
              <meshStandardMaterial color={C.tuboT} emissive={C.tuboT} emissiveIntensity={0.3 + brillo * 2.5} />
            </mesh>
            <mesh position={[0, (R + 1.25) / 2, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.25 - R, 10]} />
              <meshStandardMaterial color={C.tuboT} emissive={C.tuboT} emissiveIntensity={0.3 + brillo * 2.5} />
            </mesh>
            {/* 2 cisternas terminales */}
            {[-0.085, 0.085].map((dx) => (
              <mesh key={dx} position={[dx, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[R, 0.055, 12, 48]} />
                <meshPhysicalMaterial
                  color={C.reticulo}
                  emissive={C.reticulo}
                  emissiveIntensity={0.15 + caFuera * 0.6}
                  transparent
                  opacity={reticuloOp + 0.2}
                  roughness={0.25}
                  clearcoat={0.6}
                />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* reticulo longitudinal entre cisternas */}
      {xs.slice(0, -1).map((x, i) =>
        Array.from({ length: 8 }).map((_, k) => {
          const a = (k / 8) * Math.PI * 2 + i * 0.2;
          const x0 = x - 0.085;
          const x1 = xs[i + 1] + 0.085;
          const pts: V3[] = Array.from({ length: 7 }).map((__, j) => {
            const t = j / 6;
            const aa = a + Math.sin(t * Math.PI * 2) * 0.12;
            return [mix(x0, x1, t), Math.cos(aa) * R, Math.sin(aa) * R];
          });
          return <Tubo key={`${i}-${k}`} puntos={pts} radio={0.018} color={C.reticulo} opacidad={reticuloOp} segmentos={24} />;
        }),
      )}
      {/* calcio almacenado dentro de las cisternas */}
      {caDentro > 0
        ? xs.slice(0, 6).flatMap((x, i) =>
            Array.from({ length: 10 }).map((_, k) => {
              const a = (k / 10) * Math.PI * 2;
              const dentro: V3 = [x + (k % 2 ? 0.085 : -0.085), Math.cos(a) * R, Math.sin(a) * R];
              const fuera: V3 = [x + (rnd(`cx${i}${k}`) - 0.5) * 0.9, Math.cos(a) * 0.25, Math.sin(a) * 0.25];
              const p = difusion(dentro, fuera, caFuera, `t${i}${k}`, 0.08);
              return (
                <mesh key={`${i}-${k}`} position={p}>
                  <sphereGeometry args={[0.022, 8, 6]} />
                  <meshStandardMaterial color={C.calcio} emissive={C.calcio} emissiveIntensity={2} transparent opacity={caDentro} />
                </mesh>
              );
            }),
          )
        : null}
      {/* mitocondrias y depositos del sarcoplasma */}
      {mito > 0 ? (
        <>
          <Mitocondria pos={[-1.2, 0.68, -0.68]} rot={[0.4, 0, 0]} escala={1.1} />
          <Mitocondria pos={[-3.3, 0.7, -0.62]} rot={[0.3, 0, 0]} escala={1.1} />
          <Mitocondria pos={[-0.3, -0.65, 0.4]} rot={[-0.5, 0, 0]} escala={1.1} />
        </>
      ) : null}
      {depositos > 0
        ? Array.from({ length: 26 }).map((_, i) => {
            const tipo = i % 3;
            const x = -0.2 - rnd(`dx${i}`) * 4.5;
            const a = rnd(`da${i}`) * Math.PI * 2;
            const r = 0.66 + rnd(`dr${i}`) * 0.12;
            const col = tipo === 0 ? "#3a2a55" : tipo === 1 ? "#ffd34d" : "#ff2d3a";
            return (
              <mesh key={i} position={[x, Math.cos(a) * r, Math.sin(a) * r]}>
                <sphereGeometry args={[tipo === 1 ? 0.06 : 0.035, 10, 8]} />
                <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} transparent opacity={depositos} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

const TriadaEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const x0 = triadas()[2];
  const cam = camara(
    [
      { b: 0, p: [x0 + 1.4, 2.6, 2.4], l: [x0, 0.6, 0], fov: 40 },
      { b: 1, p: [x0 - 0.6, 1.4, 2.4], l: [x0 - 0.5, 0, 0], fov: 40 },
      { b: 2, p: [x0 + 0.5, 0.9, 1.4], l: [x0, 0.2, 0], fov: 38 },
      { b: 3, p: [-1.6, 1.4, 1.2], l: [-1.4, 0.5, -0.6], fov: 40 },
      { b: 4, p: [-2.2, 1.9, 2.4], l: [-2.2, 0.4, 0], fov: 40 },
    ],
    b,
  );
  const pulso = b < 1 ? lineal(b, 0.2, 0.9) : 0;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Triada b={b} pulso={pulso} caDentro={visible(b, 1, 3)} reticuloOp={0.45 + 0.4 * visible(b, 1, 3)} depositos={entre(b, 4, 4.2)} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [x0, 1.0, 0], t: "Túbulo T (invaginación del sarcolema)", a: 0.1, z: 1, o: [60, -80], color: C.tuboT },
          { p: [-3, 1.25, 1.5], t: "Sarcolema", a: 0.2, z: 1, o: [-60, -60], color: "#f39aa0" },
          { p: [x0 - 0.6, 0.56, 0], t: "Retículo sarcoplásmico", a: 1.1, z: 2, o: [-60, -90], color: C.reticulo },
          { p: [x0, 0, 0.62], t: "Ca²⁺ almacenado", a: 1.4, z: 2, o: [60, 90], color: C.calcio },
          { p: [x0 - 0.085, -0.56, 0], t: "Cisterna terminal", a: 2.1, z: 3, o: [-90, 70], color: C.reticulo },
          { p: [x0, -0.56, 0], t: "Túbulo T", a: 2.15, z: 3, o: [20, 110], color: C.tuboT },
          { p: [x0 + 0.085, -0.56, 0], t: "Cisterna terminal", a: 2.2, z: 3, o: [100, 60], color: C.reticulo },
          { p: [-1.2, 0.68, -0.68], t: "Mitocondria → ATP", a: 3.1, z: 4, o: [60, -80], color: C.mitocondria },
          { p: [-2.2, 0.72, 0.1], t: "Glucógeno · triglicéridos · mioglobina", a: 4.2, z: 5, o: [-80, -90], color: C.acento2 },
        ]}
      />
      <Tarjeta b={b} a={2} z={3} x={1380} y={160} w={460} titulo="Tríada" color={C.tuboT} tam={30}>
        <Rico t="**1** túbulo T + **2** cisternas terminales" />
      </Tarjeta>
      <Tarjeta b={b} a={4} z={5} x={1380} y={160} w={460} titulo="Sarcoplasma" color={C.acento2} tam={26}>
        <Lista items={["**Glucógeno** (gránulos oscuros)", "**Triglicéridos** (gotas amarillas)", "**Mioglobina**: fija O₂ y da el color rojo"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================
// 6. Teoria del deslizamiento de los filamentos
// ===================================================================

const Barra: React.FC<{ x0: number; x1: number; y: number; color: string }> = ({ x0, x1, y, color }) =>
  Math.abs(x1 - x0) > 0.01 ? (
    <mesh position={[(x0 + x1) / 2, y, 0]}>
      <boxGeometry args={[Math.abs(x1 - x0), 0.05, 0.05]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  ) : null;

const DeslizamientoEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const ciclo = b < 1 ? 0.5 - 0.5 * Math.cos(Math.max(0, b - 0.25) * Math.PI * 2.6) : b < 2 ? 0 : 0.5 - 0.5 * Math.cos((b - 2) * Math.PI * 2.4);
  const L = mix(SARC.reposo, SARC.contraido, ciclo);
  const A = SARC.grueso / 2;
  const H = Math.max(0, L / 2 - SARC.fino);
  const cam = camara(
    [
      { b: 0, p: [0, 1.4, 6.6], l: [0, 0.55, 0], fov: 40 },
      { b: 3, p: [0.5, 1.5, 6.2], l: [0, 0.55, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Sarcomero L={L} />
        <Barra x0={-A} x1={A} y={1.25} color="#ff8a3d" />
        <Barra x0={-L / 2} x1={-A} y={1.45} color="#5ec8ff" />
        <Barra x0={A} x1={L / 2} y={1.45} color="#5ec8ff" />
        <Barra x0={-H} x1={H} y={1.05} color="#7cff8a" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, 1.25, 0], t: `Banda A = ${(SARC.grueso * 0.6).toFixed(2)} µm (constante)`, a: 0, z: 3, o: [-60, -60], color: "#ff8a3d" },
          { p: [-(L / 2 + A) / 2, 1.45, 0], t: `Banda I = ${((L / 2 - A) * 0.6).toFixed(2)} µm`, a: 0, z: 3, o: [-200, -30], color: "#5ec8ff" },
          { p: [0, 1.05, 0], t: `Zona H = ${(H * 2 * 0.6).toFixed(2)} µm`, a: 0, z: 3, o: [260, 20], color: "#7cff8a" },
          { p: [L / 2, -0.95, 0], t: "Las líneas Z se acercan", a: 2, z: 3, o: [60, 70], color: "#c8d6ff" },
        ]}
      />
      <Tarjeta b={b} a={0} z={3} x={1360} y={130} w={500} titulo="Teoría del deslizamiento (1954)" color={C.acento2} tam={25}>
        <Lista
          items={[
            "**A. F. Huxley y Niedergerke**: la banda A no cambia; I y H se acortan",
            "La miosina **no se encoge**",
            b > 2 ? "**H. E. Huxley**: los finos se deslizan sobre los gruesos hacia el centro" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================
// 7. Acoplamiento excitacion-contraccion
// ===================================================================

export const PASOS_EC = [
  "Potencial de acción por la motoneurona",
  "Se libera acetilcolina",
  "ACh se une a receptores: entra Na⁺",
  "Potencial de acción por sarcolema y túbulos T",
  "El retículo libera Ca²⁺",
  "Ca²⁺ + troponina C: se aparta la tropomiosina",
  "Miosina + actina: deslizamiento (ATP)",
  "Relajación: bomba de Ca²⁺ (ATP) + calsecuestrina",
];

const AXON: V3[] = [
  [-5, 3.4, -0.5],
  [-3.2, 3.0, -0.3],
  [-1.6, 2.2, 0],
  [-0.6, 1.4, 0],
  [0, 0.9, 0],
];

const puntoCurva = (pts: V3[], t: number): V3 => {
  const f = Math.min(pts.length - 1.0001, Math.max(0, t * (pts.length - 1)));
  const i = Math.floor(f);
  return mix3(pts[i], pts[i + 1], f - i);
};

export const PlacaMotoraEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-1.5, 2.8, 6.0], l: [-1.6, 1.4, 0], fov: 40 },
      { b: 0.65, p: [-0.9, 2.2, 5.0], l: [-0.8, 1.0, 0], fov: 40 },
      { b: 0.9, p: [0.4, 0.9, 3.0], l: [0, 0.3, 0], fov: 40 },
      { b: 1, p: [0.7, 0.5, 2.0], l: [0, 0.25, 0], fov: 40 },
      { b: 2, p: [-0.6, 0.35, 1.7], l: [0, 0.1, 0], fov: 40 },
      { b: 3, p: [2.5, 2.6, 5.8], l: [0.5, -0.6, 0], fov: 42 },
      { b: 4, p: [4.0, 3.2, 6.5], l: [1.0, -0.8, 0], fov: 42 },
    ],
    b,
  );
  const ap = lineal(b, 0.05, 0.85);
  const pulsoAxon = b < 0.95 ? puntoCurva(AXON, ap) : null;
  const vesFusion = entre(b, 1.05, 1.5);
  const achT = lineal(b, 1.3, 2.3);
  const naT = lineal(b, 2.25, 2.9);
  const ondaT = lineal(b, 3.0, 3.9);
  const vesiculas = Array.from({ length: 14 }).map((_, i): V3 => {
    const a = rnd(`va${i}`) * Math.PI * 2;
    const r = 0.1 + rnd(`vr${i}`) * 0.25;
    const ini: V3 = [Math.cos(a) * r, 0.75 + rnd(`vy${i}`) * 0.25, Math.sin(a) * r * 0.6];
    const fin: V3 = [ini[0] * 0.8, 0.42, ini[2] * 0.8];
    return mix3(ini, fin, i < 8 ? vesFusion : 0);
  });
  const ach = Array.from({ length: 36 }).map((_, i) => {
    const a = rnd(`aa${i}`) * Math.PI * 2;
    const r = rnd(`ar${i}`) * 0.4;
    const t = Math.min(1, Math.max(0, achT * 1.4 - rnd(`at${i}`) * 0.4));
    return difusion([Math.cos(a) * r * 0.6, 0.4, Math.sin(a) * r * 0.4], [Math.cos(a) * r, 0.05, Math.sin(a) * r * 0.7], t, `ach${i}`, 0.06);
  });
  const na = Array.from({ length: 30 }).map((_, i) => {
    const a = rnd(`na${i}`) * Math.PI * 2;
    const r = 0.15 + rnd(`nr${i}`) * 0.5;
    const t = Math.min(1, Math.max(0, naT * 1.4 - rnd(`nt${i}`) * 0.4));
    return difusion([Math.cos(a) * r * 1.4, 0.25, Math.sin(a) * r], [Math.cos(a) * r, -0.5, Math.sin(a) * r * 0.6], t, `nas${i}`, 0.05);
  });
  const paso = Math.min(3, Math.floor(b));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {/* fibra muscular */}
        <group position={[0, -2, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[2, 2, 14, 64, 1, true]} />
            <meshPhysicalMaterial color="#c4404c" roughness={0.45} clearcoat={0.3} side={2} />
          </mesh>
          {/* onda del potencial de accion por el sarcolema */}
          {ondaT > 0 && ondaT < 1
            ? [-1, 1].map((s) => (
                <mesh key={s} position={[s * ondaT * 6.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <torusGeometry args={[2.02, 0.06, 10, 64]} />
                  <meshStandardMaterial color={C.sodio} emissive={C.sodio} emissiveIntensity={2.5} />
                </mesh>
              ))
            : null}
          {/* entradas de los tubulos T */}
          {Array.from({ length: 6 }).map((_, i) => {
            const x = -4.5 + i * 1.8;
            const brillo = ondaT > 0 && ondaT < 1 ? Math.max(0, 1 - Math.abs(Math.abs(x) / 6.5 - ondaT) * 6) : 0;
            return (
              <mesh key={i} position={[x, 1.6, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 0.85, 12]} />
                <meshStandardMaterial color={C.tuboT} emissive={C.tuboT} emissiveIntensity={0.3 + brillo * 3} />
              </mesh>
            );
          })}
        </group>
        {/* receptores de ACh en el sarcolema */}
        {Array.from({ length: 22 }).map((_, i) => {
          const a = (i / 22) * Math.PI * 2;
          const r = 0.18 + (i % 3) * 0.17;
          return (
            <mesh key={i} position={[Math.cos(a) * r, 0.02, Math.sin(a) * r * 0.7]}>
              <cylinderGeometry args={[0.035, 0.035, 0.07, 8]} />
              <meshStandardMaterial color="#ff9de2" emissive="#ff4fc8" emissiveIntensity={0.3 + entre(b, 2, 2.3) * 1.5} />
            </mesh>
          );
        })}
        {/* axon y boton terminal */}
        <Tubo puntos={AXON} radio={0.12} color={C.nervio} emisivo={0.2} segmentos={80} />
        {[0.12, 0.3, 0.5].map((t, i) => (
          <mesh key={i} position={puntoCurva(AXON, t)}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshPhysicalMaterial color="#fff4d6" transparent opacity={0.55} depthWrite={false} />
          </mesh>
        ))}
        <mesh position={[0, 0.72, 0]} scale={[1, 0.62, 0.75]}>
          <sphereGeometry args={[0.55, 32, 24]} />
          <meshPhysicalMaterial color={C.nervio} transparent opacity={0.45} roughness={0.3} clearcoat={0.6} depthWrite={false} />
        </mesh>
        {pulsoAxon ? <Particulas pos={[pulsoAxon]} radio={0.16} color="#ffffff" brillo={3} /> : null}
        <Particulas pos={vesiculas} radio={0.07} color={C.ach} opacidad={1 - entre(b, 1.4, 1.6) * 0.6} brillo={0.4} />
        {achT > 0 && b < 3.2 ? <Particulas pos={ach} radio={0.022} color={C.ach} /> : null}
        {naT > 0 && b < 3.4 ? <Particulas pos={na} radio={0.026} color={C.sodio} /> : null}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: puntoCurva(AXON, 0.35), t: "Axón de la motoneurona", a: 0, z: 0.9, o: [60, -80], color: C.nervio },
          { p: [0, 0.72, 0.4], t: "Placa motora", a: 0.6, z: 1.1, o: [80, -70], color: C.nervio },
          { p: [0.2, 0.8, 0.1], t: "Vesículas con ACh", a: 1.05, z: 2, o: [80, -80], color: C.ach },
          { p: [0.0, 0.22, 0.2], t: "Espacio sináptico", a: 1.4, z: 2, o: [-80, 90], color: C.acento },
          { p: [0.35, 0.02, 0.2], t: "Receptores de ACh", a: 2.05, z: 3, o: [80, 80], color: "#ff9de2" },
          { p: [-0.3, -0.2, 0.1], t: "Entra Na⁺", a: 2.3, z: 3, o: [-90, 70], color: C.sodio },
          { p: [-2.7, -0.4, 0], t: "Túbulo T", a: 3.3, z: 4, o: [-70, -80], color: C.tuboT },
        ]}
      />
      <Pasos titulo="Acoplamiento excitación-contracción" pasos={PASOS_EC} actual={paso} />
    </AbsoluteFill>
  );
};

const LiberacionCaEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const x0 = triadas()[2];
  const cam = camara(
    [
      { b: 0, p: [x0 + 1.6, 2.2, 2.6], l: [x0, 0.3, 0], fov: 40 },
      { b: 0.6, p: [x0 + 0.6, 0.9, 1.6], l: [x0, 0, 0], fov: 40 },
      { b: 1, p: [x0 + 0.3, 0.4, 0.9], l: [x0, 0, 0], fov: 40 },
    ],
    b,
  );
  const pulso = lineal(b, 0.0, 0.35);
  const caFuera = entre(b, 0.3, 0.75);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Triada b={b} pulso={pulso} caDentro={1} caFuera={caFuera} reticuloOp={0.75} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [x0, 1.0, 0], t: "El impulso baja por el túbulo T", a: 0.0, z: 0.4, o: [60, -80], color: C.tuboT },
          { p: [x0 + 0.085, 0.56, 0], t: "Cisternas: liberan Ca²⁺", a: 0.35, z: 1, o: [80, -80], color: C.reticulo },
          { p: [x0, 0.1, 0.3], t: "Ca²⁺ en el citosol", a: 0.6, z: 1, o: [-80, 90], color: C.calcio },
        ]}
      />
      <Pasos titulo="Acoplamiento excitación-contracción" pasos={PASOS_EC} actual={4} />
    </AbsoluteFill>
  );
};

/** Filamento fino sobre filamento grueso con varias cabezas trabajando. */
const N_CAB = 7;
const ContraccionEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const largo = 30 * 0.11;
  const cam = camara(
    [
      { b: 0, p: [largo / 2 + 0.6, 0.7, 3.6], l: [largo / 2 + 0.5, -0.1, 0], fov: 42 },
      { b: 1, p: [largo / 2 + 0.5, 0.2, 3.8], l: [largo / 2 + 0.5, -0.3, 0], fov: 42 },
      { b: 2, p: [largo / 2 + 0.3, 1.0, 4.2], l: [largo / 2 + 0.6, 0.1, 0], fov: 42 },
      { b: 3, p: [largo / 2 + 0.3, 1.0, 4.2], l: [largo / 2 + 0.6, 0.1, 0], fov: 42 },
    ],
    b,
  );
  const caEntra = entre(b, 0.05, 0.4);
  const caSale = entre(b, 2.05, 2.5);
  const ca = caEntra * (1 - caSale);
  const bloqueo = 1 - entre(b, 0.35, 0.7) * (1 - entre(b, 2.4, 2.75));
  const activo = entre(b, 1.0, 1.1) * (1 - entre(b, 2.3, 2.5));
  // ciclos de puentes cruzados durante el paso 7
  const ciclos = lineal(b, 1.0, 2.3) * 4;
  const desliza = Math.min(ciclos, 4) * 0.11 * (1 - entre(b, 2.5, 2.95));
  const tn = [0, 1, 2, 3].flatMap((k) => [0, 1].map((s) => posTroponina(k, s, bloqueo)));
  const ionesIn = tn.map((p, i) => difusion([p[0] + 0.3, p[1] + 1.2, p[2] + 0.4], p, Math.min(1, caEntra * 1.05), `ce${i}`, 0.12));
  const ionesOut = tn.map((p, i) => difusion(p, [p[0], 1.35, -0.3], caSale, `co${i}`, 0.12));
  const yGrueso = -0.95;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {/* reticulo arriba (adonde vuelve el calcio) */}
        <mesh position={[largo / 2, 1.45, -0.3]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.12, largo, 8, 24]} />
          <meshPhysicalMaterial color={C.reticulo} transparent opacity={0.6} emissive={C.reticulo} emissiveIntensity={0.2 + caSale * visible(b, 2, 3) * 0.8} />
        </mesh>
        <group position={[0, 0.05, 0]}>
          <FilamentoFino n={30} desliza={desliza} bloqueo={bloqueo} sitios={1 - bloqueo} caUnido={ca} />
        </group>
        {/* filamento grueso */}
        <mesh position={[largo / 2, yGrueso, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, largo + 0.6, 16]} />
          <meshStandardMaterial color={C.miosina} emissive={C.miosina} emissiveIntensity={0.15} />
        </mesh>
        {Array.from({ length: N_CAB }).map((_, i) => {
          const fase = (ciclos + i * 0.37) % 1;
          // armado (+0.5) -> golpe de fuerza (-0.5)
          const ang = activo > 0 ? (fase < 0.55 ? mix(0.5, -0.5, entre(fase, 0.1, 0.55)) : mix(-0.5, 0.5, entre(fase, 0.65, 0.95))) : 0.5;
          const pegada = activo > 0 && fase < 0.6 ? 1 : 0;
          const estira = 0.82 + 0.08 * pegada * activo;
          return (
            <group key={i} position={[0.35 + i * 0.42, yGrueso + 0.06, 0.04]} scale={0.95}>
              <CabezaMiosina angulo={ang * Math.max(activo, 0.001) + (1 - activo) * 0.5} estira={estira} />
            </group>
          );
        })}
        {ca > 0.02 && b < 0.5 ? <Particulas pos={ionesIn} radio={0.024} color={C.calcio} /> : null}
        {b > 2.05 && b < 2.6 ? <Particulas pos={ionesOut} radio={0.024} color={C.calcio} /> : null}
        {activo > 0 && b < 2.3
          ? <Particulas
              pos={Array.from({ length: N_CAB }).map((_, i): V3 => {
                const fase = (ciclos + i * 0.37) % 1;
                return [0.35 + i * 0.42 + (fase > 0.6 ? 0 : 0.25), yGrueso + 0.4 + (1 - fase) * 0.3, 0.25];
              })}
              radio={0.03}
              color={C.atp}
            />
          : null}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: posTroponina(1, 0, bloqueo), t: "Ca²⁺ + troponina C", a: 0.3, z: 1, o: [60, -100], color: C.calcio },
          { p: [1.6, 0.13, 0.08], t: "La tropomiosina se aparta", a: 0.55, z: 1, o: [-60, -120], color: C.tropomiosina },
          { p: [1.0, -0.2, 0.05], t: "Puente cruzado", a: 1.1, z: 2, o: [-60, 110], color: C.cabeza },
          { p: [2.6, 0.05, 0.1], t: "La actina se desliza hacia la línea M →", a: 1.3, z: 2, o: [40, -110], color: C.actina },
          { p: [1.4, -0.4, 0.25], t: "ATP", a: 1.2, z: 2, o: [-60, 60], color: C.atp },
          { p: [largo / 2, 1.45, -0.3], t: "Bomba de Ca²⁺ (gasta ATP) → retículo", a: 2.1, z: 3, o: [80, -60], color: C.reticulo },
        ]}
      />
      <Pasos titulo="Acoplamiento excitación-contracción" pasos={PASOS_EC} actual={5 + Math.min(2, Math.floor(b))} />
    </AbsoluteFill>
  );
};

// ===================================================================
// 8. Ciclo de los puentes cruzados
// ===================================================================

const PASOS_CICLO = [
  "Rigor: unión fuerte sin ATP",
  "Disociación: entra ATP y se suelta",
  "Hidrólisis: ATP → ADP + Pi, la cabeza se arma",
  "Unión débil a una actina más adelante",
  "Golpe de fuerza: sale Pi, empuja la actina",
  "Sale ADP: unión fuerte, reinicia",
];

const CicloEscena: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  // b0: introduccion; b1..b6: estados
  const e = Math.max(0, b - 1);
  const cam = camara(
    [
      { b: 0, p: [2.0, 0.9, 4.4], l: [2.0, 0.45, 0], fov: 40 },
      { b: 1, p: [1.9, 0.6, 3.7], l: [1.9, 0.45, 0], fov: 40 },
      { b: 7, p: [1.8, 0.7, 3.8], l: [1.8, 0.45, 0], fov: 40 },
    ],
    b,
  );
  // angulo de la cabeza: + armado (izquierda), - despues del golpe
  const ang =
    e < 2 ? -0.45 : e < 3 ? mix(-0.45, 0.45, entre(e, 2.2, 2.8)) : e < 4 ? 0.45 : mix(0.45, -0.45, entre(e, 4.2, 4.7));
  const separa = e < 1 ? 0 : e < 1.5 ? entre(e, 1.15, 1.45) : e < 3 ? 1 : 1 - entre(e, 3.1, 3.6);
  const debil = e >= 3 && e < 4.2 ? 1 : 0;
  const desliza = entre(e, 4.2, 4.7) * 0.33;
  const cabezaX = 1.3;
  const tipBase = [cabezaX, 0.15 - separa * 0.18] as const;
  const punta = (a: number): V3 => [tipBase[0] - Math.sin(a) * 0.82, tipBase[1] + Math.cos(a) * 0.82, 0.12];
  const p = punta(ang);
  // nucleotidos
  const atpLlega = entre(e, 0.85, 1.2);
  const atp: V3 = mix3([p[0] + 0.9, p[1] - 0.3, 0.6], [p[0], p[1] - 0.05, 0.2], atpLlega);
  const piSale = entre(e, 4.0, 4.4);
  const adpSale = entre(e, 5.1, 5.5);
  const pi: V3 = mix3([p[0] + 0.08, p[1] - 0.05, 0.22], [p[0] + 0.9, p[1] - 0.6, 0.8], piSale);
  const adp: V3 = mix3([p[0] - 0.06, p[1] - 0.06, 0.22], [p[0] - 0.8, p[1] - 0.7, 0.8], adpSale);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[-0.9, 1.05, 0]} scale={1.25}>
          <FilamentoFino n={30} desliza={desliza} bloqueo={0} sitios={0.8} troponina={0.4} tropomiosina={0.5} />
        </group>
        <mesh position={[cabezaX, -0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 3.5, 16]} />
          <meshStandardMaterial color={C.miosina} emissive={C.miosina} emissiveIntensity={0.15} />
        </mesh>
        <group position={[tipBase[0], tipBase[1], 0.12]}>
          <CabezaMiosina angulo={ang} estira={0.95 - debil * 0.03} />
        </group>
        {e > 0.8 && e < 2.05 ? <Particulas pos={[atp]} radio={0.07} color={C.atp} /> : null}
        {e >= 2.05 && e < 4.5 ? <Particulas pos={[pi]} radio={0.05} color={C.fosfato} /> : null}
        {e >= 2.05 && e < 5.6 ? <Particulas pos={[adp]} radio={0.06} color={C.atp} /> : null}
        <Polvo b={b} radio={3} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.3, 1.05, 0.1], t: "Actina", a: 0, z: 1.2, o: [-60, -70], color: C.actina },
          { p: [cabezaX - 0.5, -0.15, 0.1], t: "Filamento grueso (miosina)", a: 0, z: 1.2, o: [-60, 80], color: C.miosina },
          { p: p, t: "Cabeza de miosina", a: 0.2, z: 1.5, o: [80, 40], color: C.cabeza },
          { p: atp, t: "ATP", a: 1.85, z: 2.9, o: [70, 40], color: C.atp },
          { p: pi, t: "Pi", a: 3.05, z: 5.4, o: [60, 50], color: C.fosfato },
          { p: adp, t: "ADP", a: 3.05, z: 6.5, o: [-60, 60], color: C.atp },
          { p: [cabezaX + 0.5, 1.05, 0.1], t: "La actina avanza hacia la línea M →", a: 5.3, z: 6, o: [40, -90], color: C.actina },
        ]}
      />
      <Pasos titulo="Ciclo de los puentes cruzados" pasos={PASOS_CICLO} actual={b < 1 ? -1 : Math.min(5, Math.floor(e))} x={1330} y={130} w={540} tam={25} />
    </AbsoluteFill>
  );
};

// ===================================================================

export const CAP1: PlanoDef[] = [
  {
    id: "zoom-musculo",
    seccion: SEC,
    textos: [
      "El **músculo esquelético** es responsable de la **postura** y de los **movimientos del esqueleto**: transforma la **energía química** en **energía mecánica**. Entremos en él.",
      "**Músculo completo**: está recubierto por una capa de tejido conectivo llamada **epimisio**.",
      "**Fascículo muscular**: es una agrupación de fibras rodeada por el **perimisio**.",
      "**Fibra muscular (miocito)**: célula **cilíndrica y multinucleada**, delimitada por el **sarcolema** y envuelta por el **endomisio**.",
      "**Miofibrilla**: estructura cilíndrica dentro de la fibra, formada por la **repetición en serie de sarcómeros**.",
      "El **sarcómero** es la **unidad funcional y contráctil** del músculo, delimitada por dos **líneas (discos) Z**.",
    ],
    Escena: ZoomCuerpo,
  },
  {
    id: "sarcomero",
    seccion: SEC + " · Ultraestructura",
    textos: [
      "Dentro del sarcómero hay **filamentos gruesos (miosina)** y **filamentos finos (actina, con troponina y tropomiosina)**. Aquí ocurre todo el ciclo de **contracción-relajación**.",
      "**Bandas I (isotrópicas)**: zonas **claras**, formadas **solo por filamentos finos**. **Se acortan** durante la contracción.",
      "**Banda A (anisotrópica)**: zona **oscura** que abarca **toda la longitud del filamento grueso**. Su longitud **permanece constante** al contraerse.",
      "**Zona H**: parte central de la banda A ocupada **solo por filamentos gruesos**. **Línea M**: zona central que divide la banda A en **dos partes iguales**.",
      "**Arreglo espacial**: en un corte transversal, cada filamento **grueso** está rodeado por **6 finos**, y cada filamento **fino** por **3 gruesos**.",
      "**Titina**: la proteína **más grande conocida** (más de 25 000 aminoácidos). Va del **disco Z a la línea M**, **centra la miosina**, genera **tensión pasiva** y devuelve la **longitud de reposo**. Solo su segmento en la **banda I** es elástico.",
      "**Nebulina**: proteína gigante **no elástica** que corre junto al filamento fino, se inserta en el **disco Z** y **regula la longitud y alineación** de la actina.",
    ],
    Escena: SarcomeroEscena,
  },
  {
    id: "miosina",
    seccion: SEC + " · Proteínas contráctiles",
    textos: [
      "**Miosina**: el **motor molecular** del filamento grueso. Es un **hexámero**: está formada por **6 cadenas proteicas**.",
      "**2 cadenas pesadas** se entrelazan formando una larga **cola (bastón)** y terminan en **cabezas globulares**. **4 cadenas ligeras**, dos en cada cabeza, tienen función **moduladora** (esencial y reguladora).",
      "Si se corta con enzimas (**proteólisis**) se obtiene la **meromiosina ligera**, que forma la cola rígida, y la **meromiosina pesada**, que da el subfragmento **S1 (cabeza)** y el **S2 (bisagra)**.",
      "La cabeza **S1** genera **fuerza y movimiento**. Tiene 3 dominios: **catalítico** (se une a la actina e hidroliza ATP: es una **ATPasa**), **cuello** (estabilizado por las cadenas ligeras) y **conversor** (transmite el cambio de forma).",
      "La **zona de bisagra** es una región **elástica** entre la cola y la cabeza que permite a las cabezas **girar** respecto a su punto de inserción.",
      "Unas **250 moléculas de miosina** forman un filamento grueso: las **colas quedan al centro** y las **cabezas se proyectan hacia los extremos**. Las isoformas **IIA y IIX** son las más rápidas del músculo humano.",
    ],
    Escena: MiosinaEscena,
  },
  {
    id: "actina",
    seccion: SEC + " · Proteínas contráctiles y moduladoras",
    textos: [
      "**Actina**: la **actina G (globular)** se polimeriza en cadenas largas (**actina F**). **Dos cadenas de actina F** se enrollan en espiral y forman el **filamento fino**.",
      "Cada molécula de **actina G** tiene un **sitio de unión para la miosina**.",
      "**Tropomiosina**: proteína alargada que rodea en espiral a la actina. **En reposo cubre los sitios de unión** y evita que se formen puentes cruzados.",
      "**Troponina**: tiene **3 subunidades**. **Troponina I**: afinidad por la actina. **Troponina T**: afinidad por la tropomiosina. **Troponina C**: afinidad por el **calcio**.",
      "Cuando **aumenta el calcio** en el citosol, la **troponina C se une al Ca²⁺**, cambia de forma y **desplaza a la tropomiosina**: los **sitios de unión quedan al descubierto**.",
      "Cuando el calcio se retira, la tropomiosina vuelve a tapar los sitios. Así las **proteínas moduladoras** impiden que, aunque haya ATP, el músculo quede **contraído de forma continua**.",
    ],
    Escena: ActinaEscena,
  },
  {
    id: "triada",
    seccion: SEC + " · Sistema de activación",
    textos: [
      "**Túbulos T**: invaginaciones del **sarcolema** llenas de **líquido extracelular**. Llevan el **impulso eléctrico al interior** de la célula.",
      "**Retículo sarcoplásmico**: red que rodea a las miofibrillas y se encarga de **concentrar y secuestrar el calcio (Ca²⁺)**.",
      "Sus extremos ensanchados son las **cisternas terminales**. La **tríada** es la unión de **1 túbulo T + 2 cisternas terminales**.",
      "**Mitocondrias**: oxidan precursores de alta energía (**NADH**) para **resintetizar ATP**, el combustible del movimiento.",
      "El **sarcoplasma** contiene depósitos de **glucógeno**, **triglicéridos** y **mioglobina**, que **fija oxígeno** y da el **color rojo** al músculo.",
    ],
    Escena: TriadaEscena,
  },
  {
    id: "deslizamiento",
    seccion: SEC + " · Función del músculo",
    textos: [
      "**1954**: **Andrew F. Huxley y Niedergerke** observaron al microscopio que la **banda A permanece constante** durante la contracción, mientras que las **bandas I y la zona H se acortan**.",
      "Esto demostró que la **miosina no se encoge** por sí misma, desmintiendo las teorías antiguas.",
      "Al mismo tiempo, **Hugh E. Huxley** propuso la **Teoría del Deslizamiento de los Filamentos** (vigente hoy): los **filamentos finos se deslizan sobre los gruesos** hacia el centro, **acercando las líneas Z**.",
    ],
    Escena: DeslizamientoEscena,
  },
  {
    id: "placa-motora",
    seccion: SEC + " · Acoplamiento excitación-contracción",
    textos: [
      "**Paso 1**: un **potencial de acción** viaja por el **axón de la motoneurona** hasta la **placa motora**.",
      "**Paso 2**: se libera **acetilcolina (ACh)** al **espacio sináptico**.",
      "**Paso 3**: la acetilcolina se une a sus **receptores en el sarcolema**: se abren **canales iónicos** y **entra Na⁺**.",
      "**Paso 4**: se desencadena un **potencial de acción** que viaja por el **sarcolema** y se profundiza a través de los **túbulos T**.",
    ],
    Escena: PlacaMotoraEscena,
  },
  {
    id: "liberacion-calcio",
    seccion: SEC + " · Acoplamiento excitación-contracción",
    textos: [
      "**Paso 5**: el impulso llega al **retículo sarcoplásmico**, que **libera masivamente Ca²⁺ al citosol**. ¡Así es como el calcio llega a los filamentos!",
    ],
    Escena: LiberacionCaEscena,
  },
  {
    id: "contraccion",
    seccion: SEC + " · Acoplamiento excitación-contracción",
    textos: [
      "**Paso 6**: el **Ca²⁺ se une a la troponina C**, que **desplaza a la tropomiosina** y **expone los sitios activos de la actina**.",
      "**Paso 7**: la **miosina se une a la actina** y produce el **deslizamiento** mediante el **consumo de ATP**.",
      "**Paso 8 (relajación)**: cuando cesa el estímulo, una **bomba dependiente de ATP** regresa el **Ca²⁺ al retículo sarcoplásmico** (con ayuda de la **calsecuestrina**) y la contracción se detiene.",
    ],
    Escena: ContraccionEscena,
  },
  {
    id: "puentes-cruzados",
    seccion: SEC + " · Acoplamiento quimiomecánico",
    textos: [
      "**Ciclo de los puentes de unión**: así convierte la miosina la energía química del ATP en movimiento.",
      "**1. Estado de rigor**: en **ausencia de ATP**, la actina está **unida fuertemente** a la miosina.",
      "**2. Disociación**: un **nuevo ATP** se une a la cabeza de miosina, **reduce su afinidad** por la actina y la **libera**.",
      "**3. Hidrólisis del ATP**: la miosina, gracias a su actividad **ATPasa**, rompe el ATP en **ADP + Pi** y **cambia el ángulo** de su cabeza.",
      "**4. Unión débil**: la cabeza ya rotada se une **débilmente** a una **nueva actina G más adelante**.",
      "**5. Golpe de fuerza**: al **liberarse el fosfato (Pi)**, la miosina genera el impulso mecánico **empujando la actina hacia la línea M**.",
      "**6. Liberación de ADP**: se libera el ADP, se restablece la **unión fuerte** y el ciclo **vuelve a empezar**.",
    ],
    Escena: CicloEscena,
  },
];
