// Short: Ayuno intermitente: qué pasa en tu cuerpo por horas
// Del atleta a la sangre, el hígado, el tejido graso, el cerebro y la célula.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, Cam, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Cadena, Glucogeno, Higado, Mol, Vaso } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaCierre } from "./cierre";
import { ANTON, Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Bascula, Pechuga, Piso, Plato } from "./modelos";
import { Adipocito, Autofagia, CelulaCorte, CelulaSimple, Cerebro, MitoMini } from "./modelos-ayuno";

const GLUCOSA = "#ffd166";
const INSULINA = "#4f8dff";
const GRASO = "#ffb000";
const CETONA = "#b48cff";
const HIGADO = "#e88a7a";

// ---- Reloj de ayuno: barra 0-24 h con contador -----------------------------------
const MARCAS = [0, 4, 12, 18, 24];
const Reloj: React.FC<{ b: number; de: number; a: number; y?: number; mas?: boolean }> = ({ b, de, a, y = 470, mas }) => {
  const h = mix(de, a, lineal(b, 0.05, 0.9));
  const f = Math.min(1, h / 24);
  const ancho = 760;
  const op = visible(b, 0, 1.2, 0.06);
  return (
    <div style={{ position: "absolute", top: y, left: (1080 - ancho) / 2, width: ancho, height: 90, opacity: op }}>
      <div style={{ position: "absolute", top: 28, left: 0, right: 0, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", top: 28, left: 0, width: ancho * f, height: 14, borderRadius: 7, background: `linear-gradient(90deg, ${GLUCOSA}, ${GRASO} 55%, ${CETONA})`, boxShadow: `0 0 20px ${GRASO}88` }} />
      {MARCAS.map((m) => (
        <div key={m} style={{ position: "absolute", top: 50, left: (m / 24) * ancho - 30, width: 60, textAlign: "center", fontFamily: INTER, fontWeight: 800, fontSize: 24, color: h >= m ? K.tinta : K.suave }}>
          {m} h
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          top: 2,
          left: ancho * f - 33,
          width: 66,
          height: 66,
          borderRadius: 33,
          background: "#061317",
          border: `4px solid ${K.lima}`,
          boxShadow: `0 0 24px ${K.lima}aa`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: ANTON,
          fontSize: 30,
          color: K.lima,
        }}
      >
        {Math.floor(h)}
        {mas && h >= 23.5 ? "+" : ""}
      </div>
    </div>
  );
};

const camAtleta = (b: number, a = 0, z = 1): Cam =>
  camara(
    [
      { b: a, p: [2.6, 1.4, 6.2], l: [0, 0.62, 0], fov: 36 },
      { b: z, p: [-2.2, 1.3, 5.9], l: [0, 0.65, 0], fov: 36 },
    ],
    b,
  );

// 0 · Gancho: el plato desaparece -----------------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const se = entre(b, 0.3, 0.55);
  const cam = camAtleta(b);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Atleta ej="parado" brilla={0.15} />
        <Piso />
        {se < 1 ? (
          <group position={[0, 0.98, 0.42]} scale={1 - se} rotation={[0, se * 3, 0]}>
            <Plato p={[0, 0, 0]} escala={0.55} />
            <Pechuga p={[0, 0.08, 0]} escala={0.5} />
          </group>
        ) : null}
      </Escena3D>
      <Titular b={b} a={0.03} z={1.2} y={270} tam={92} t="¿Qué pasa al ayunar?" />
      <Reloj b={b} de={0} a={0} y={410} />
      <Chip b={b} a={0.55} z={1.2} t="HORA POR HORA" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 1 · 0-4 h: digestion, insulina, glucosa -> glucogeno y grasa -------------------
const Digestion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fuera = b < 0.2;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [0.5, 1.2, 5.8], l: [0, 0.75, 0], fov: 36 },
          { b: 0.2, p: [0.08, 1.12, 1.5], l: [0, 1.08, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.2, p: [0, 1.0, 15], l: [0, 0.4, 0], fov: 40 },
          { b: 1, p: [0.6, 0.9, 14], l: [0, 0.4, 0], fov: 40 },
        ],
        b,
      );
  const insul = Math.round(mix(2, 9, entre(b, 0.3, 0.55)));
  const guarda = entre(b, 0.58, 0.92);
  const celG: V3 = [-1.15, 1.9, 0];
  const celA: V3 = [1.15, 1.9, 0];
  const vy = -0.1;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [9, 26]}>
        {fuera ? (
          <>
            <Atleta ej="parado" brilla={0.3} colorBrillo={GLUCOSA} />
            <Piso />
          </>
        ) : (
          <>
            <Vaso desde={[-3.2, vy, 0]} hasta={[3.2, vy, 0]} t={b * 1.2} radio={0.55} />
            {Array.from({ length: 8 }).map((_, i) => {
              const f = (b * 0.7 + i / 8) % 1;
              const enVaso: V3 = [mix(-3, 3, f), vy + Math.sin(i * 1.7) * 0.18, 0.15];
              const destino = i % 2 ? celG : celA;
              const sube = i < 6 ? entre(b, 0.6 + (i % 3) * 0.08, 0.75 + (i % 3) * 0.08) : 0;
              const p = mix3(enVaso, [destino[0] + (rnd(`d${i}`) - 0.5) * 0.4, destino[1] - 0.2, 0.3], sube);
              return sube < 0.98 ? <Cadena key={i} n={6} anillo p={p} color={GLUCOSA} sep={0.13} brillo={0.5} /> : null;
            })}
            {Array.from({ length: insul }).map((_, i) => {
              const f = (b * 0.55 + i / insul + 0.05) % 1;
              return <Mol key={`i${i}`} p={[mix(-3, 3, f), vy - 0.25 + Math.cos(i * 2.3) * 0.12, 0.25]} color={INSULINA} r={0.09} />;
            })}
            <CelulaSimple p={celG} r={0.75} color={HIGADO} />
            <Glucogeno p={[celG[0] - 0.1, celG[1] - 0.05, 0.1]} escala={1.8 + 1.0 * guarda} />
            <Adipocito p={celA} r={0.8} gota={0.45 + 0.25 * guarda} brillo={0.1 * guarda} />
            <Polvo b={b} radio={6} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.2]} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [-1.6, vy + 0.1, 0.3], t: "Glucosa", a: 0.22, z: 1, o: [-10, 130], color: GLUCOSA },
            { p: [1.0, vy - 0.25, 0.3], t: "Insulina ↑", a: 0.38, z: 1, o: [20, 140], color: INSULINA },
            { p: [celG[0], celG[1] + 0.6, 0], t: "Glucógeno", a: 0.62, z: 1, o: [-20, -90], color: "#8f74ff" },
            { p: [celA[0], celA[1] + 0.7, 0], t: "Grasa", a: 0.8, z: 1, o: [20, -80], color: GRASO },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.03} z={1.2} t="0–4 h" sub="digestión" color={GLUCOSA} y={250} tam={110} />
      <Reloj b={b} de={0} a={4} />
    </AbsoluteFill>
  );
};

// 2 · 4-12 h: el higado libera glucosa de su glucogeno ---------------------------
const Liberacion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.7, 14.5], l: [0, 0.15, 0], fov: 40 },
      { b: 1, p: [-0.8, 0.6, 13.5], l: [0, 0.15, 0], fov: 40 },
    ],
    b,
  );
  const baja = entre(b, 0.1, 0.4);
  const insul = Math.round(mix(8, 2, baja));
  const suelta = entre(b, 0.45, 0.95);
  const vy = -0.3;
  const gl: V3 = [0, 1.55, 0.9];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 26]}>
        <group position={[0, 1.5, -0.6]} scale={1.15}>
          <Higado brillo={0.1 + 0.25 * suelta} />
        </group>
        <Glucogeno p={gl} escala={mix(3.2, 1.4, suelta)} />
        <Vaso desde={[-3.2, vy, 0]} hasta={[3.2, vy, 0]} t={b * 1.2} radio={0.55} />
        {Array.from({ length: 6 }).map((_, i) => {
          const a = 0.45 + i * 0.08;
          const k = entre(b, a, a + 0.18);
          if (k <= 0) return null;
          const fin: V3 = [-2 + i * 0.8, vy + 0.05, 0.2];
          const deriva = lineal(b, a + 0.18, 1.3) * 1.5;
          const p = mix3([gl[0] + (rnd(`l${i}`) - 0.5) * 0.6, gl[1] - 0.2, gl[2]], fin, k);
          return <Cadena key={i} n={6} anillo p={[p[0] + deriva, p[1], p[2]]} color={GLUCOSA} sep={0.13} brillo={0.5} />;
        })}
        {Array.from({ length: insul }).map((_, i) => {
          const f = (b * 0.55 + i / insul) % 1;
          return <Mol key={`i${i}`} p={[mix(-3, 3, f), vy - 0.25 + Math.cos(i * 2.3) * 0.12, 0.25]} color={INSULINA} r={0.09} />;
        })}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, vy - 0.3, 0.3], t: "Insulina ↓", a: 0.12, z: 1, o: [60, 120], color: INSULINA },
          { p: [-1.2, 1.8, 0], t: "Hígado", a: 0.3, z: 1, o: [-30, -90], color: HIGADO },
          { p: gl, t: "Glucógeno", a: 0.45, z: 1, o: [80, -80], color: "#8f74ff" },
          { p: [-1.2, vy + 0.1, 0.3], t: "Glucosa a la sangre", a: 0.65, z: 1, o: [-10, 130], color: GLUCOSA },
        ]}
      />
      <Dato b={b} a={0.03} z={1.2} t="4–12 h" sub="el hígado suelta glucosa" color={HIGADO} y={250} tam={110} />
      <Reloj b={b} de={4} a={12} />
    </AbsoluteFill>
  );
};

// 3 · 12-18 h: higado casi vacio, el adipocito suelta acidos grasos ---------------
const QuemaGrasa: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.2, 17], l: [0, -0.45, 0], fov: 40 },
      { b: 1, p: [0.8, 0.1, 16], l: [0, -0.45, 0], fov: 40 },
    ],
    b,
  );
  const vacia = entre(b, 0.05, 0.4);
  const lipolisis = entre(b, 0.45, 0.95);
  const ad: V3 = [0.95, 1.5, 0];
  const vy = 0.0;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 28]}>
        <group position={[-1.2, 1.6, -0.8]} scale={0.7}>
          <Higado brillo={0.05} />
        </group>
        <Glucogeno p={[-1.2, 1.6, 0.2]} escala={mix(2.6, 0.9, vacia)} op={mix(1, 0.6, vacia)} />
        <Adipocito p={ad} r={0.9} gota={mix(0.72, 0.5, lipolisis)} brillo={0.15 * lipolisis} />
        <Vaso desde={[-3.2, vy, 0]} hasta={[3.2, vy, 0]} t={b * 1.1} radio={0.5} />
        <group position={[0, -1.5, -0.3]}>
          <CilindroX radio={0.6} largo={6} x={3} color="#c03a46" estriado={6} />
        </group>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = 0.45 + i * 0.06;
          const k = lineal(b, a, a + 0.4);
          if (k <= 0) return null;
          const p0: V3 = [ad[0] - 0.2, ad[1] - 0.6, 0.4];
          const p1: V3 = [ad[0] - 0.6 - i * 0.25, vy, 0.3];
          const p2: V3 = [-1.6 + i * 0.5, -1.0, 0.6];
          const p = k < 0.5 ? mix3(p0, p1, k * 2) : mix3(p1, p2, (k - 0.5) * 2);
          return <Cadena key={i} n={7} p={[p[0] - 0.4, p[1], p[2]]} color={GRASO} sep={0.12} brillo={0.6} op={k > 0.95 ? (1 - k) * 20 : 1} />;
        })}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.2, 1.3, 0.2], t: "Glucógeno casi vacío", a: 0.1, z: 1, o: [40, 130], color: "#8f74ff" },
          { p: [ad[0] + 0.5, ad[1] + 0.5, 0], t: "Adipocito", a: 0.4, z: 1, o: [-30, -150], color: GRASO },
          { p: [-0.6, vy + 0.1, 0.3], t: "Ácidos grasos", a: 0.6, z: 1, o: [-60, 90], color: GRASO },
          { p: [1.5, -1.5, 0.6], t: "Músculo", a: 0.75, z: 1, o: [20, 110], color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.03} z={0.62} t="12–18 h" sub="se agota el glucógeno" color="#8f74ff" y={250} tam={110} />
      <Dato b={b} a={0.6} z={1.2} t="+ quema de grasa" sub="12–18 h" color={GRASO} y={250} tam={96} />
      <Reloj b={b} de={12} a={18} />
    </AbsoluteFill>
  );
};

// 4 · Cuerpos cetonicos: higado -> cerebro y musculo -----------------------------
const Cetonas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.1, 18], l: [0, -0.45, 0], fov: 40 },
      { b: 1, p: [-1.0, 0.1, 17], l: [0, -0.45, 0], fov: 40 },
    ],
    b,
  );
  const hig: V3 = [0, 0.0, -0.4];
  const cer: V3 = [0, 2.0, 0];
  const mus: V3 = [0, -1.8, 0];
  const fab = entre(b, 0.15, 0.4);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 28]}>
        <group position={hig} scale={1.05}>
          <Higado brillo={0.1 + 0.3 * fab} />
        </group>
        <Cerebro p={cer} escala={0.85} brillo={0.3 * entre(b, 0.6, 0.8)} giro={-0.3 + b * 0.6} />
        <group position={[0, mus[1], -0.3]}>
          <CilindroX radio={0.5} largo={5} x={2.5} color="#c03a46" estriado={6} emisivo={0.3 * entre(b, 0.75, 0.95)} />
        </group>
        {/* acidos grasos que llegan al higado */}
        {Array.from({ length: 4 }).map((_, i) => {
          const k = lineal(b, 0.02 + i * 0.06, 0.25 + i * 0.06);
          if (k <= 0 || k >= 1) return null;
          return <Cadena key={i} n={7} p={mix3([2.2, -0.9 + i * 0.35, 0.5], [0.2, 0.2, 0.6], k)} color={GRASO} sep={0.11} brillo={0.6} op={1 - k * 0.6} />;
        })}
        {/* cetonas que salen hacia cerebro y musculo */}
        {Array.from({ length: 12 }).map((_, i) => {
          const arriba = i % 2 === 0;
          const a = 0.32 + (i >> 1) * 0.07;
          const k = lineal(b, a, a + 0.3);
          if (k <= 0) return null;
          const dest: V3 = arriba ? [cer[0] + (rnd(`c${i}`) - 0.5) * 0.8, cer[1] - 0.5, 0.4] : [(rnd(`c${i}`) - 0.5) * 1.6, mus[1] + 0.4, 0.6];
          const ini: V3 = [(rnd(`e${i}`) - 0.5) * 0.8, hig[1] + (arriba ? 0.5 : -0.5), 0.8];
          return <Mol key={i} p={mix3(ini, dest, k)} color={i % 3 === 0 ? K.cian : CETONA} r={0.11} op={k > 0.97 ? 0.4 : 1} />;
        })}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [1.4, -0.5, 0.5], t: "Grasa", a: 0.05, z: 0.4, o: [20, 110], color: GRASO },
          { p: [-1.0, 0.4, 0.2], t: "Hígado", a: 0.1, z: 1, o: [-40, 0], color: HIGADO },
          { p: [0.3, 1.4, 0.8], t: "Cetonas", a: 0.4, z: 1, o: [80, 0], color: CETONA },
          { p: [-0.6, cer[1], 0.4], t: "Cerebro", a: 0.6, z: 1, o: [-60, -60], color: "#ff8fb0" },
          { p: [-1.0, mus[1], 0.6], t: "Músculo", a: 0.78, z: 1, o: [-40, 90], color: K.rojo },
        ]}
      />
      <Dato b={b} a={0.03} z={1.2} t="Cuerpos cetónicos" sub="combustible extra" color={CETONA} y={250} tam={90} />
      <Reloj b={b} de={18} a={24} mas />
    </AbsoluteFill>
  );
};

// 5 · Autofagia ---------------------------------------------------------------------
const AutofagiaEsc: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, -0.2, 15], l: [0, -1.1, 0], fov: 40 },
      { b: 0.3, p: [0.2, -0.4, 7.5], l: [0.3, -1.05, 0], fov: 40 },
      { b: 1, p: [-0.4, -0.4, 6.4], l: [0.3, -1.05, 0], fov: 40 },
    ],
    b,
  );
  const cierra = entre(b, 0.2, 0.5);
  const fusion = entre(b, 0.5, 0.65);
  const recicla = entre(b, 0.66, 0.9);
  const centro: V3 = [0.3, -0.5, 0.4];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[6, 24]}>
        <CelulaCorte r={2.4} />
        <MitoMini p={[-1.2, -1.2, 0.2]} escala={1.1} rot={0.6} />
        <MitoMini p={[1.3, 1.0, -0.3]} escala={1.0} rot={-0.4} />
        <Autofagia p={centro} cierra={cierra} fusion={fusion} recicla={recicla} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [centro[0], centro[1] + 0.2, centro[2]], t: "Mitocondria vieja", a: 0.12, z: 0.5, o: [60, -130], color: "#b0b6bd" },
          { p: [centro[0] - 0.55, centro[1] - 0.2, centro[2]], t: "Membrana que envuelve", a: 0.3, z: 0.62, o: [30, 150], color: K.cian },
          { p: [centro[0] + 0.5, centro[1] - 0.4, centro[2]], t: "Lisosoma", a: 0.5, z: 0.7, o: [30, 150], color: "#47d18c" },
          { p: [centro[0], centro[1] + 0.6, centro[2]], t: "Se recicla", a: 0.7, z: 1, o: [60, -120], color: K.lima },
        ]}
      />
      <Dato b={b} a={0.03} z={1.2} t="Autofagia" sub="reciclaje dentro de la célula" color={K.cian} y={250} tam={110} />
      <Reloj b={b} de={24} a={24} mas />
      <Chip b={b} a={0.68} z={1.2} t="EN HUMANOS AÚN SE ESTUDIA" x={540} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 6 · Peso: lo que manda son las calorias totales ---------------------------------
const Peso: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camAtleta(b);
  const ig = entre(b, 0.3, 0.45);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0, 0.06, 0]}>
          <Atleta ej="parado" brilla={0.15} />
        </group>
        <Bascula />
        <Piso color={K.cian} />
      </Escena3D>
      <Titular b={b} a={0.02} z={0.42} y={280} tam={120} t="¿Bajar de peso?" />
      <Dato b={b} a={0.42} z={1.2} t="Calorías totales" sub="lo que de verdad decide" color={K.lima} y={250} tam={96} />
      <div style={{ position: "absolute", top: 1000, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, opacity: ig }}>
        {["AYUNO", "=", "OTRA DIETA"].map((t, i) => (
          <div
            key={i}
            style={{
              fontFamily: i === 1 ? ANTON : INTER,
              fontWeight: 900,
              fontSize: i === 1 ? 70 : 38,
              color: i === 1 ? K.lima : "#061317",
              background: i === 1 ? "transparent" : K.cian,
              padding: i === 1 ? 0 : "10px 26px",
              borderRadius: 999,
              WebkitTextStroke: i === 1 ? "6px #04090b" : undefined,
              paintOrder: "stroke fill",
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <Chip b={b} a={0.82} z={1.2} t="NO ES MAGIA" x={540} y={1100} color={K.naranja} />
    </AbsoluteFill>
  );
};

// 7 · Advertencia ------------------------------------------------------------------
const Advertencia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camAtleta(b);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Atleta ej="parado" brilla={0.25 + 0.2 * Math.sin(b * 20) ** 2} colorBrillo={K.naranja} />
        <Piso color={K.naranja} />
      </Escena3D>
      <Titular b={b} a={0.02} z={0.68} y={280} tam={120} t="No es para todos" color={K.naranja} />
      <Dato b={b} a={0.68} z={1.2} t="Consulta antes" sub="a un profesional de la salud" color={K.naranja} y={250} tam={104} />
      <Chip b={b} a={0.22} z={1.2} t="EMBARAZO" x={280} y={1010} color={K.amarillo} />
      <Chip b={b} a={0.33} z={1.2} t="DIABETES" x={800} y={1010} color={K.amarillo} />
      <Chip b={b} a={0.45} z={1.2} t="TCA" x={540} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

const T = [
  "¿Qué pasa en tu cuerpo cuando **dejas de comer**? Vamos hora por hora.",
  "De **0 a 4 horas** estás digiriendo: la **insulina** sube y guardas la glucosa como glucógeno y grasa.",
  "De **4 a 12 horas** la insulina baja y el hígado libera glucosa de su **glucógeno** para mantenerte estable.",
  "De **12 a 18 horas** el glucógeno del hígado se va agotando y aumenta la **quema de grasa**.",
  "Con la grasa, el hígado empieza a fabricar **cuerpos cetónicos**: un combustible extra para el cerebro y los músculos.",
  "Con ayunos más largos aumenta la **autofagia**, el reciclaje de partes viejas de la célula, aunque en humanos todavía se está estudiando.",
  "¿Y para bajar de peso? Funciona igual que otras dietas **si al final comes menos calorías**. No es magia.",
  "Ojo: no es para todos. Si estás embarazada, tienes diabetes o has tenido trastornos de la conducta alimentaria, consulta antes a un profesional.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Digestion, Liberacion, QuemaGrasa, Cetonas, AutofagiaEsc, Peso, Advertencia, EscenaCierre];

export const AYUNO: ShortDef = {
  id: "Short-Ayuno",
  titulo: "Ayuno intermitente: qué pasa en tu cuerpo por horas",
  planos: ESCENAS.map((Escena, i) => ({ id: `ayuno-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
