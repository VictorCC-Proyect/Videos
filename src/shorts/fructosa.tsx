// Short: ¿La fruta engorda porque tiene fructosa? Hígado y fructosa, dosis, matriz de la fruta, evidencia.
// Fuentes: Sievenpiper et al. 2012 (Ann Intern Med), Bertoia et al. 2015 (PLoS Med).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo } from "../fisio/modelos/comun";
import { GotaLipido, Higado, Vaso } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Piso, Plato } from "./modelos";
import { GLU, Glucosa, Manzana, Mesa, PanDulce, Refresco } from "./modelos-glucosa";
import { Galleta } from "./modelos-microbiota";
import { Naranja } from "./modelos-colageno";
import { Platano } from "./modelos-ventana";
import { Barra3D, Rotulos } from "./modelos-sueno";
import { BalanzaPlatos, Bloque, platilloBalanza } from "./modelos-ayunas";
import { Check } from "./modelos-mtor";
import { VasoLiquido } from "./modelos-agujetas";
import { Gota } from "./modelos-calambres";
import {
  AGUA_C,
  Caramelo,
  Dientes,
  Estomago,
  Exprimidor,
  FIBRA_C,
  Fresa,
  FRU,
  Fructosa,
  Frutero,
  Hepatocito,
  MallaFibra,
  ManzanaCorte,
  Multitud,
  panal,
  Tache,
} from "./modelos-fructosa";

const HIG = "#ff8f7a";
const GRASA = "#ffd34d";
const JUGO = "#ffa62b";

const Nota: React.FC<{ b: number; t: string; a?: number; y?: number }> = ({ b, t, a = 0.1, y = 1150 }) => (
  <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: INTER, fontWeight: 700, fontSize: 28, color: K.suave, opacity: visible(b, a, 1.2) }}>{t}</div>
);

// 0 · Gancho: persona frente al frutero; la fruta se aleja con "¿?" ----------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const aleja = entre(b, 0.36, 0.62);
  const entra = entre(b, 0.66, 1);
  const cam = camara(
    [
      { b: 0, p: [1.5, 1.35, 5.4], l: [0.35, 0.8, 0], fov: 36 },
      { b: 0.62, p: [0.9, 1.3, 5.0], l: [0.3, 0.8, 0], fov: 36 },
      { b: 1, p: [0.2, 1.2, 3.3], l: [0.0, 0.95, 0], fov: 36 },
    ],
    b,
  );
  const fp: V3 = [mix(0.72, 1.25, aleja), 0.74 + 0.25 * Math.sin(aleja * Math.PI), mix(0.3, -1.6, aleja)];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <Atleta ej="parado" musculo={mix(0.8, 0.35, entra)} brilla={0.1 + 0.4 * entra} colorBrillo={HIG} />
        <group position={[-0.07, 1.12, 0.04]} scale={0.085}>
          <Higado brillo={0.6 * entra} />
        </group>
        <Piso color={K.lima} r={1.3} />
        <Mesa p={[0.72, 0, 0.3]} alto={0.72} />
        <Frutero p={fp} escala={mix(1.25, 0.9, aleja)} giro={b * 1.2} />
      </Escena3D>
      <Rotulos cam={cam} b={b} items={[{ p: [fp[0], fp[1] + 0.6, fp[2]], t: "¿?", a: 0.38, z: 0.68, color: K.amarillo, tam: 110, anton: true }]} />
      <Etiquetas cam={cam} b={b} items={[{ p: [0.72, 0.95, 0.3], t: "Fruta", a: 0.06, z: 0.36, o: [40, -130], color: K.lima }]} />
      <Titular b={b} a={0.02} z={1.2} y={260} tam={118} t={<>¿La fruta <span style={{ color: K.amarillo }}>engorda</span>?</>} />
      <Chip b={b} a={0.3} z={1.2} t="MIEDO A LA FRUCTOSA" x={540} y={415} color={FRU} />
    </AbsoluteFill>
  );
};

// 1 · Vena porta: la fructosa la captura el higado; la glucosa sigue al cuerpo -------------
const P0: V3 = [-1.5, -2.4, 0];
const P1: V3 = [-0.55, 0.55, 0];
const LC: V3 = [0.05, 1.25, 0];
const E0: V3 = [0.6, 0.6, 0];
const E1: V3 = [1.25, -1.9, 0];

const viajeFru = (f: number, i: number): { q: V3; op: number } => {
  const dentro: V3 = [LC[0] + Math.cos(i * 2.1) * 0.6, LC[1] + Math.sin(i * 1.7) * 0.25, 0.35];
  if (f < 0.55) return { q: mix3(P0, P1, f / 0.55), op: 1 };
  const k = (f - 0.55) / 0.45;
  return { q: mix3(P1, dentro, Math.min(1, k * 1.6)), op: 1 - entre(k, 0.6, 1) };
};
const viajeGlu = (f: number): { q: V3; op: number } => {
  if (f < 0.4) return { q: mix3(P0, P1, f / 0.4), op: 1 };
  if (f < 0.55) return { q: mix3(P1, E0, (f - 0.4) / 0.15), op: 1 };
  return { q: mix3(E0, E1, (f - 0.55) / 0.45), op: 1 - entre(f, 0.93, 1) };
};

const Porta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const corte = 0.2;
  const fuera = b < corte;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [0.6, 1.2, 5.6], l: [0, 0.8, 0], fov: 36 },
          { b: corte, p: [-0.05, 1.12, 1.25], l: [-0.07, 1.1, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: corte, p: [0.4, 0.2, 12], l: [0, -0.3, 0], fov: 40 },
          { b: 1, p: [-0.4, 0.1, 10.8], l: [0, -0.3, 0], fov: 40 },
        ],
        b,
      );
  const capta = entre(b, 0.62, 0.9);
  const nF = 9;
  const nG = 7;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [9, 26]}>
        {fuera ? (
          <>
            <Atleta ej="parado" musculo={0.3} />
            <group position={[-0.07, 1.12, 0.04]} scale={0.085}>
              <Higado brillo={0.3 + 0.4 * entre(b, 0.05, 0.18)} />
            </group>
            <Piso />
          </>
        ) : (
          <>
            <group position={LC} scale={0.9}>
              <Higado brillo={0.1 + 0.45 * capta} />
            </group>
            <Vaso desde={P0} hasta={P1} t={b * 1.4} radio={0.36} />
            <Vaso desde={E0} hasta={E1} t={b * 1.4} radio={0.32} />
            <group position={[1.3, -2.5, -0.4]} rotation={[0, 0.3, 0]}>
              <CilindroX radio={0.5} largo={2.6} x={1.3} color="#c03a46" estriado={5} opacidad={0.8} />
            </group>
            {Array.from({ length: nF }).map((_, i) => {
              const f = (b * 1.1 + i / nF) % 1;
              if (b < 0.22 + (i / nF) * 0.1) return null;
              const { q, op } = viajeFru(f, i);
              return <Fructosa key={`f${i}`} p={q} escala={1.5} op={op} rot={[0, b * 3 + i, 0]} />;
            })}
            {Array.from({ length: nG }).map((_, i) => {
              const f = (b * 1.1 + i / nG + 0.05) % 1;
              if (b < 0.44) return null;
              const { q, op } = viajeGlu(f);
              return <Glucosa key={`g${i}`} p={[q[0] + 0.12, q[1], q[2] + 0.15]} escala={1.5} op={op} />;
            })}
            <Polvo b={b} radio={6} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[corte]} />
      {fuera ? (
        <Etiquetas cam={cam} b={b} items={[{ p: [-0.09, 1.12, 0.06], t: "Hígado", a: 0.06, z: corte, o: [-60, -120], color: HIG }]} />
      ) : (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: mix3(P0, P1, 0.3), t: "Fructosa", a: 0.24, z: 0.6, o: [-30, 140], color: FRU },
            { p: mix3(P0, P1, 0.62), t: "Glucosa", a: 0.46, z: 0.6, o: [70, 40], color: GLU },
            { p: [-0.6, 1.5, 0.3], t: "Fructosa → hígado", a: 0.64, z: 1.2, o: [-20, -140], color: FRU },
            { p: [1.3, -2.1, 0.2], t: "Glucosa → todo el cuerpo", a: 0.76, z: 1.2, o: [-40, 130], color: GLU },
          ]}
        />
      )}
      {!fuera ? <Chip b={b} a={0.22} z={1.2} t="VENA PORTA" x={540} y={330} color={K.rojo} /> : null}
    </AbsoluteFill>
  );
};

// 2 · Exceso: en el hepatocito una parte de la fructosa se vuelve grasa --------------------
const R_HEP = 1.0;
const CELULAS = panal(R_HEP);
const SITIOS: V3[] = [
  [-0.35, 0.3, 0.12],
  [0.05, 0.5, 0.12],
  [-0.45, -0.2, 0.12],
];

const Lipogenesis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.3, 0.6, 15], l: [0, 0.2, 0], fov: 40 },
      { b: 0.3, p: [0.1, 0.5, 11.5], l: [0, 0.2, 0], fov: 40 },
      { b: 1, p: [-0.3, 0.4, 10.5], l: [0, 0.2, 0], fov: 40 },
    ],
    b,
  );
  const llega = lineal(b, 0.02, 0.4);
  const convierte = entre(b, 0.38, 0.78);
  const n = 18;
  const vy = 1.95;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[10, 30]}>
        {CELULAS.map((c, i) => (
          <Hepatocito key={i} p={c} r={R_HEP * 0.97} brillo={i === 0 ? 0.15 * convierte : 0} op={i === 0 ? 1 : 0.65} />
        ))}
        <Vaso desde={[-3.5, vy, 0.2]} hasta={[3.5, vy, 0.2]} t={b * 1.6} radio={0.3} />
        {Array.from({ length: n }).map((_, i) => {
          const t0 = (i / n) * 0.7;
          const k = Math.min(1, Math.max(0, (llega - t0) / 0.3));
          if (k <= 0) {
            const f = (b * 1.4 + i / n) % 1;
            return <Fructosa key={i} p={[mix(-3.3, 3.3, f), vy + Math.sin(i) * 0.08, 0.3]} escala={1.2} />;
          }
          const x0 = mix(-1.4, 1.4, (i * 7) % n / n);
          const dest: V3 = [mix(-0.7, 0.5, rndMod(i, 0)), mix(-0.6, 0.75, rndMod(i, 1)), 0.2];
          let q = mix3([x0, vy, 0.3], dest, k);
          let op = 1;
          if (i % 3 === 0) {
            // una parte se convierte en grasa
            const s = SITIOS[(i / 3) % SITIOS.length];
            q = mix3(q, s, convierte);
            op = 1 - entre(convierte, 0.6, 1);
          }
          return <Fructosa key={i} p={q} escala={1.1} op={op} rot={[0, 0, b * 2 + i]} />;
        })}
        {SITIOS.map((s, i) => (
          <GotaLipido key={i} p={s} r={0.02 + 0.2 * entre(convierte, 0.2 + i * 0.12, 0.8 + i * 0.07)} />
        ))}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.8, -0.8, 0], t: "Célula del hígado", a: 0.04, z: 0.45, o: [-40, 150], color: HIG },
          { p: [1.6, vy, 0.3], t: "Fructosa en exceso", a: 0.08, z: 0.5, o: [-40, -110], color: FRU },
          { p: SITIOS[1], t: "Lipogénesis → grasa", a: 0.55, z: 1.2, o: [40, -150], color: GRASA },
        ]}
      />
      <Dato b={b} a={0.42} z={1.2} t="En exceso → grasa" color={GRASA} y={250} tam={92} />
      <Chip b={b} a={0.76} z={1.2} t="DE AHÍ EL MIEDO" x={540} y={1100} color={FRU} />
    </AbsoluteFill>
  );
};
const rndMod = (i: number, k: number) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;

// 3 · Dosis: manzana ≈ 10 g vs refresco 600 ml > 30 g --------------------------------------
const Pila: React.FC<{ p: V3; n: number; mostrar: number }> = ({ p, n, mostrar }) => (
  <group position={p}>
    {Array.from({ length: n }).map((_, i) => {
      const k = Math.min(1, Math.max(0, mostrar * n - i));
      if (k <= 0) return null;
      return <Fructosa key={i} p={[0, 0.1 + i * 0.14 + (1 - k) * 0.4, 0]} escala={1.6 * k} rot={[-Math.PI / 2 + 0.25, 0, i * 0.6]} />;
    })}
  </group>
);

const Dosis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.0, 1.6, 9.6], l: [0, 0.5, 0], fov: 38 },
      { b: 1, p: [0.3, 1.5, 9.0], l: [0, 0.5, 0], fov: 38 },
    ],
    b,
  );
  const mA = entre(b, 0.2, 0.45);
  const mS = entre(b, 0.6, 0.92);
  const gA = Math.round(10 * mA);
  const gS = Math.round(33 * mS);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[2.4, 64]} />
          <meshStandardMaterial color="#12343a" roughness={0.9} />
        </mesh>
        <Manzana p={[-1.15, 0.3, 0.3]} escala={2.0} />
        <Pila p={[-0.42, 0, 0]} n={3} mostrar={mA} />
        <Refresco p={[1.2, 0, 0.3]} escala={1.75} />
        <Pila p={[0.45, 0, 0]} n={10} mostrar={mS} />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-0.42, 0.75, 0], t: `≈ ${gA} g`, a: 0.2, z: 1.2, color: FRU, tam: 62, anton: true },
          { p: [0.45, 1.68, 0], t: `${mS > 0.97 ? "> 30" : gS} g`, a: 0.6, z: 1.2, color: FRU, tam: 62, anton: true },
          { p: [-1.15, -0.2, 0.3], t: "Manzana mediana", a: 0.12, z: 1.2, color: K.tinta, tam: 32 },
          { p: [1.2, -0.2, 0.3], t: "Refresco 600 ml", a: 0.55, z: 1.2, color: K.tinta, tam: 32 },
        ]}
      />
      <Dato b={b} a={0.03} z={0.56} t="La dosis importa" sub="fructosa por porción" color={FRU} y={250} tam={92} />
      <Dato b={b} a={0.58} z={1.2} t={<>≈ 3 veces más</>} sub="en un solo refresco" color={K.rojo} y={250} tam={92} />
    </AbsoluteFill>
  );
};

// 4 · El paquete de la fruta: fibra, agua y masticar -----------------------------------------
const Paquete: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const abre = entre(b, 0.2, 0.4);
  const malla = entre(b, 0.45, 0.58);
  const agua = entre(b, 0.58, 0.7);
  const mast = entre(b, 0.74, 0.82);
  const ciclo = Math.max(0, b - 0.78) * 9;
  const abreBoca = mast * (0.5 + 0.5 * Math.cos(ciclo * Math.PI * 2));
  const mordidas = b > 0.78 ? Math.min(20, 1 + Math.floor(ciclo)) : 0;
  const cam = camara(
    [
      { b: 0, p: [0.0, 0.5, 9.4], l: [0, -0.1, 0], fov: 38 },
      { b: 0.7, p: [0.2, 0.4, 8.6], l: [0, -0.1, 0], fov: 38 },
      { b: 1, p: [0.5, 0.3, 9.2], l: [0.2, -0.3, 0], fov: 38 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <group position={[0, 0.45, 0]} scale={0.8} rotation={[0, mix(-2.4, 0, abre) + 0.15 * Math.sin(b * 4), 0]}>
          {abre < 0.5 ? (
            <Manzana p={[0, 0, 0]} escala={6.6} />
          ) : (
            <ManzanaCorte malla={malla} agua={agua} azucar={entre(b, 0.4, 0.5)} brilloMalla={0.2 + 0.5 * malla * (1 - agua * 0.5)} />
          )}
        </group>
        {mast > 0 ? <Dientes p={[0.6, -0.62, 0.6]} escala={mast * 0.7} abre={abreBoca} /> : null}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.28, 0.95, 0.1], t: "Fibra", a: 0.48, z: 1.2, o: [80, -120], color: FIBRA_C },
          { p: [-0.34, 0.49, 0.1], t: "Agua", a: 0.6, z: 1.2, o: [-80, -110], color: AGUA_C },
          { p: [-0.2, 0.01, 0.1], t: "Poco azúcar, atrapado", a: 0.66, z: 1.2, o: [-60, 160], color: FRU },
        ]}
      />
      <Rotulos cam={cam} b={b} items={[{ p: [-0.45, -0.62, 0.6], t: `${mordidas} ${mordidas === 1 ? "mordida" : "mordidas"}`, a: 0.8, z: 1.2, color: K.tinta, tam: 40, anton: true }]} />
      <Titular b={b} a={0.02} z={1.2} y={250} tam={104} t={<>Un <span style={{ color: K.lima }}>paquete</span> especial</>} />
      <Chip b={b} a={0.5} z={1.2} t="FIBRA" x={250} y={420} color={FIBRA_C} />
      <Chip b={b} a={0.62} z={1.2} t="AGUA" x={540} y={420} color={AGUA_C} />
      <Chip b={b} a={0.78} z={1.2} t="MASTICAR" x={830} y={420} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 5 · Absorcion lenta con fibra vs de golpe; el estomago se llena --------------------------
const VY = -0.9;
const Absorcion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const segunda = b >= 0.5;
  const cam = segunda
    ? camara(
        [
          { b: 0.5, p: [0.3, -4.4, 10.2], l: [0.3, -5.3, 0], fov: 40 },
          { b: 1, p: [-0.3, -4.5, 9.4], l: [0.3, -5.3, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: 0, p: [0, 0.4, 9.6], l: [0, -0.2, 0], fov: 40 },
          { b: 0.5, p: [0.3, 0.3, 9.0], l: [0, -0.2, 0], fov: 40 },
        ],
        b,
      );
  const izq: V3 = [-0.95, 1.0, 0];
  const der: V3 = [0.95, 1.0, 0];
  const n = 8;
  const llena = entre(b, 0.58, 0.95);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[11, 30]}>
        {/* comparacion */}
        <MallaFibra p={izq} r={0.55} giro={b * 1.5} brillo={0.35} />
        <Vaso desde={[-3.2, VY, 0]} hasta={[3.2, VY, 0]} t={b * 1.2} radio={0.36} />
        {Array.from({ length: n }).map((_, i) => {
          // fruta entera: sale uno por uno (lento)
          const t0 = 0.06 + i * 0.075;
          const k = lineal(b, t0, t0 + 0.12);
          const casa: V3 = [izq[0] + Math.cos(i * 2.4) * 0.22, izq[1] + Math.sin(i * 1.9) * 0.22, Math.sin(i) * 0.15];
          const q: V3 = k <= 0 ? casa : k < 1 ? mix3(casa, [izq[0] + 0.1 * Math.sin(i), VY, 0.3], k) : [izq[0] + (b - t0 - 0.12) * 3 + 0.1, VY, 0.3];
          return <Fructosa key={`l${i}`} p={q} escala={1.1} op={q[0] > 3 ? 0 : 1} />;
        })}
        {Array.from({ length: n }).map((_, i) => {
          // jugo: todo de golpe
          const k = entre(b, 0.08, 0.16);
          const casa: V3 = [der[0] + Math.cos(i * 2.4) * 0.35, der[1] + Math.sin(i * 1.9) * 0.3, Math.sin(i) * 0.2];
          const llegada: V3 = [der[0] - 0.6 + (i % 4) * 0.4, VY + (i < 4 ? 0.1 : -0.1), 0.3];
          return <Fructosa key={`r${i}`} p={mix3(casa, llegada, k)} escala={1.1} />;
        })}
        <group position={[der[0], 0.55, 0]}>
          <VasoLiquido p={[0, 0, 0]} color={JUGO} nivel={mix(0.8, 0.1, entre(b, 0.08, 0.16))} escala={0.32} />
        </group>
        {/* estomago y saciedad */}
        <Estomago p={[-0.45, -4.85, 0]} escala={1.0} brillo={0.15 * llena} />
        {Array.from({ length: 12 }).map((_, i) => {
          const k = entre(llena, i / 14, i / 14 + 0.15);
          if (k <= 0) return null;
          const q: V3 = [-0.45 + Math.cos(i * 2.3) * 0.6, -5.35 + Math.floor(i / 4) * 0.3 + (1 - k) * 1.5, Math.sin(i * 1.3) * 0.2];
          return i % 3 === 0 ? (
            <Gota key={i} p={q} r={0.12} color={AGUA_C} />
          ) : (
            <mesh key={i} position={q} rotation={[i, i * 2, 0]}>
              <boxGeometry args={[0.24, 0.2, 0.2]} />
              <meshStandardMaterial color={i % 2 ? "#f6e7b8" : "#c8202c"} roughness={0.6} />
            </mesh>
          );
        })}
        <group position={[1.45, -5.9, 0]}>
          <Barra3D valor={0.1 + 0.85 * llena} color={K.lima} alto={1.3} r={0.18} />
        </group>
        <Polvo b={b} radio={6} />
      </Escena3D>
      {!segunda ? (
        <Rotulos
          cam={cam}
          b={b}
          items={[
            { p: [izq[0], izq[1] - 0.75, 0], t: "Fruta entera", a: 0.02, z: 0.5, color: FIBRA_C, tam: 36 },
            { p: [der[0], der[1] - 0.75, 0], t: "Jugo / refresco", a: 0.02, z: 0.5, color: JUGO, tam: 36 },
            { p: [0, VY - 0.65, 0], t: "Sangre", a: 0.1, z: 0.5, color: K.rojo, tam: 30 },
          ]}
        />
      ) : (
        <Rotulos
          cam={cam}
          b={b}
          items={[
            { p: [-0.45, -3.7, 0], t: "Estómago", a: 0.52, z: 1.2, color: "#ff9fb2", tam: 34 },
            { p: [1.45, -3.95, 0], t: "Saciedad", a: 0.56, z: 1.2, color: K.lima, tam: 34 },
          ]}
        />
      )}
      <Destello b={b} en={[0.5]} />
      <Dato b={b} a={0.18} z={0.5} t="Más lento" sub="la fibra suelta el azúcar poco a poco" color={FIBRA_C} y={250} tam={96} />
      <Dato b={b} a={0.6} z={1.2} t="Te llena" sub="agua + volumen" color={K.lima} y={250} tam={96} />
    </AbsoluteFill>
  );
};

// 6 · Estudios controlados: misma energia -> peso igual; exceso -> sube ------------------------
const Isocalorico: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cambia = entre(b, 0.12, 0.3);
  const exceso = entre(b, 0.62, 0.8);
  const ang = 0.3 * exceso;
  const cam = camara(
    [
      { b: 0, p: [0, 1.6, 11.2], l: [0, 0.75, 0], fov: 38 },
      { b: 1, p: [0.5, 1.5, 10.6], l: [0, 0.75, 0], fov: 38 },
    ],
    b,
  );
  const pI = platilloBalanza(-1, ang);
  const pD = platilloBalanza(1, ang);
  const anillo = (i: number, fru: boolean) => {
    const q: V3 = [(i % 3) * 0.28 - 0.28, 0.12 + Math.floor(i / 3) * 0.22, 0];
    return fru ? <Fructosa key={i} p={q} escala={1.3} /> : <Glucosa key={i} p={q} escala={1.3} />;
  };
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <BalanzaPlatos
          ang={ang}
          izq={<group>{Array.from({ length: 6 }).map((_, i) => anillo(i, false))}</group>}
          der={
            <group>
              {Array.from({ length: 6 }).map((_, i) => anillo(i, i < Math.round(cambia * 6)))}
              {Array.from({ length: 3 }).map((_, i) => {
                const k = entre(exceso, i * 0.25, i * 0.25 + 0.35);
                if (k <= 0) return null;
                return <Bloque key={`x${i}`} p={[(i - 1) * 0.32, 0.55 + (1 - k) * 1.2, 0]} tam={[0.28, 0.22, 0.28]} color={K.rojo} op={k} />;
              })}
            </group>
          }
        />
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [pI[0], pI[1] - 0.25, 0], t: "Otros carbohidratos", a: 0.04, z: 1.2, color: GLU, tam: 30 },
          { p: [pD[0], pD[1] - 0.25, 0], t: "Fructosa", a: 0.12, z: 1.2, color: FRU, tam: 30 },
          { p: [0, 2.45, 0], t: "misma energía", a: 0.3, z: 0.6, color: K.lima, tam: 34 },
          { p: [pD[0], pD[1] + 1.1, 0], t: "+ calorías", a: 0.66, z: 1.2, color: K.rojo, tam: 40, anton: true },
        ]}
      />
      <Dato b={b} a={0.3} z={0.6} t="Peso =" sub="fructosa ≈ otros carbohidratos" color={K.lima} y={250} tam={100} />
      <Dato b={b} a={0.64} z={1.2} t="Peso ↑" sub="con exceso de calorías" color={K.rojo} y={250} tam={100} />
      <Nota b={b} t="Sievenpiper et al. 2012 · estudios controlados" />
    </AbsoluteFill>
  );
};

// 7 · 133 000 personas: mas fruta, menos aumento de peso -----------------------------------
const GraficaPeso: React.FC<{ b: number; a: number; prog: number }> = ({ b, a, prog }) => {
  const op = visible(b, a, 1.2, 0.08);
  if (op <= 0) return null;
  const w = 900;
  const h = 380;
  const barras = [1, 0.72, 0.45, 0.22];
  return (
    <div style={{ position: "absolute", left: 90, top: 250, width: w, height: h, opacity: op }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,14,17,0.86)", border: `4px solid ${K.lima}`, borderRadius: 30 }} />
      <div style={{ position: "absolute", left: 34, top: 18, fontFamily: INTER, fontWeight: 900, fontSize: 30, color: K.tinta }}>AUMENTO DE PESO EN 4 AÑOS</div>
      <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
        {barras.map((v, i) => {
          const k = Math.min(1, Math.max(0, prog * 4 - i));
          const bh = 200 * v * k;
          const x = 90 + i * 190;
          return <rect key={i} x={x} y={300 - bh} width={120} height={bh} rx={14} fill={i === 3 ? K.lima : "#5a8a84"} />;
        })}
        <line x1={60} x2={w - 40} y1={302} y2={302} stroke="#9fb8b4" strokeWidth={3} />
        <text x={w - 46} y={344} fill={K.lima} fontFamily="Anton, Impact, sans-serif" fontSize={34} textAnchor="end">
          MÁS FRUTA →
        </text>
      </svg>
    </div>
  );
};

const Cohorte: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const aparece = entre(b, 0.0, 0.4);
  const cam = camara(
    [
      { b: 0, p: [0, 2.6, 4.4], l: [0, -0.2, 0], fov: 40 },
      { b: 1, p: [0.6, 3.6, 5.6], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  const cuenta = Math.round(mix(0, 133000, entre(b, 0.02, 0.32)) / 1000) * 1000;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[6, 64]} />
          <meshStandardMaterial color="#12343a" roughness={0.9} />
        </mesh>
        <Multitud filas={18} cols={16} sep={0.3} aparece={aparece} seed="bert" />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Dato b={b} a={0.02} z={0.42} t={`${cuenta.toLocaleString("es-MX").replace(/,/g, " ")} personas`} sub="seguidas durante años" color={K.cian} y={250} tam={92} />
      <GraficaPeso b={b} a={0.45} prog={entre(b, 0.5, 0.85)} />
      <Chip b={b} a={0.78} z={1.2} t="MÁS FRUTA = MENOS KILOS" x={540} y={690} color={K.lima} />
      <Nota b={b} t="Bertoia et al. 2015 · 133 000 personas" a={0.4} />
    </AbsoluteFill>
  );
};

// 8 · Los verdaderos culpables: azucar anadido, refresco, jugo -------------------------------
const Culpables: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [-0.6, 2.6, 7.6], l: [-0.2, 0.1, 0], fov: 38 },
      { b: 0.5, p: [0.1, 2.9, 8.0], l: [0, 0.05, 0], fov: 38 },
      { b: 1, p: [0.6, 2.4, 7.0], l: [0.3, 0.1, 0.2], fov: 38 },
    ],
    b,
  );
  const tA = pop01(b, 0.3);
  const tR = pop01(b, 0.42);
  const tJ = pop01(b, 0.52);
  const sinFibra = entre(b, 0.6, 0.72);
  const sube = lineal(b, 0.74, 0.95);
  const vasoP: V3 = [0.95, 0, 0.6];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[3, 64]} />
          <meshStandardMaterial color="#12343a" roughness={0.9} />
        </mesh>
        {/* fruta entera, aparte */}
        <Plato p={[-0.95, 0.03, 0.7]} escala={0.62} />
        <Manzana p={[-1.1, 0.2, 0.7]} escala={1.1} />
        <Naranja p={[-0.8, 0.18, 0.78]} escala={0.3} />
        <Fresa p={[-0.95, 0.12, 0.98]} escala={0.9} />
        <Check p={[-0.95, 0.85, 0.7]} escala={1.3 * pop01(b, 0.04)} />
        {/* azucares anadidos */}
        <PanDulce p={[-0.75, 0.0, -0.45]} escala={0.45} />
        <Galleta p={[-0.2, 0.06, -0.35]} escala={0.6} />
        <Caramelo p={[-0.4, 0.07, 0.0]} />
        <Caramelo p={[-0.15, 0.07, 0.15]} color={K.morado} giro={0.6} />
        <Tache p={[-0.45, 0.75, -0.3]} escala={1.3 * tA} />
        {/* refresco */}
        <Refresco p={[0.55, 0, -0.5]} escala={1.3} />
        <Tache p={[0.55, 1.2, -0.5]} escala={1.3 * tR} />
        {/* jugo: la fibra se queda en el exprimidor */}
        <Exprimidor p={[0.15, 0, 0.75]} escala={0.9} brillo={0.6 * sinFibra} />
        <VasoLiquido p={vasoP} color={JUGO} nivel={0.85} escala={0.34} />
        <Tache p={[0.95, 0.85, 0.6]} escala={1.3 * tJ} />
        {Array.from({ length: 8 }).map((_, i) => {
          const f = (sube * 2.2 + i / 8) % 1;
          if (sube <= 0) return null;
          return <Fructosa key={i} p={[vasoP[0] + Math.sin(i * 2) * 0.12, 0.45 + f * 1.2, vasoP[2] + Math.cos(i * 2) * 0.1]} escala={0.8} op={1 - f} />;
        })}
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.95, 0.3, 0.7], t: "Fruta entera", a: 0.04, z: 1.2, o: [10, 150], color: K.lima },
          { p: [-0.5, 0.2, -0.3], t: "Azúcar añadido", a: 0.3, z: 1.2, o: [-30, -170], color: K.rosa },
          { p: [0.55, 0.85, -0.5], t: "Refresco", a: 0.42, z: 1.2, o: [40, -130], color: K.rojo },
          { p: [0.2, 0.14, 0.75], t: "La fibra se queda", a: 0.62, z: 1.2, o: [-40, 140], color: FIBRA_C },
        ]}
      />
      <Titular b={b} a={0.02} z={0.28} y={260} tam={104} t={<>No es la <span style={{ color: K.lima }}>fruta</span></>} />
      <Dato b={b} a={0.3} z={1.2} t="Los verdaderos culpables" color={K.rojo} y={250} tam={80} />
      <Chip b={b} a={0.74} z={1.2} t="SIN FIBRA, MUCHO AZÚCAR EN SEGUNDOS" x={540} y={1100} color={JUGO} />
    </AbsoluteFill>
  );
};
const pop01 = (b: number, a: number) => entre(b, a, a + 0.06);

// 9 · Consejo: fruta entera 2-3 porciones; jugo y refresco ocasional --------------------------
const Consejo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.0, 2.8, 6.4], l: [0.2, 0.0, 0], fov: 38 },
      { b: 1, p: [0.5, 2.6, 5.9], l: [0.3, 0.0, 0], fov: 38 },
    ],
    b,
  );
  const f1 = pop01(b, 0.25);
  const f2 = pop01(b, 0.35);
  const f3 = pop01(b, 0.45);
  const porc = f3 > 0.5 ? 3 : f2 > 0.5 ? 2 : f1 > 0.5 ? 1 : 0;
  const oca = entre(b, 0.7, 0.8);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[3, 64]} />
          <meshStandardMaterial color="#12343a" roughness={0.9} />
        </mesh>
        <Plato p={[-0.2, 0.03, 0.2]} escala={1.25} />
        <Manzana p={[-0.55, 0.22 + (1 - f1) * 0.8, 0.25]} escala={1.25 * f1} />
        <Platano p={[-0.1, 0.13 + (1 - f2) * 0.8, 0.5]} escala={0.9 * f2} giro={0.3} />
        <Naranja p={[0.2, 0.2 + (1 - f3) * 0.8, 0.05]} escala={0.32 * f3} />
        {[f1, f2, f3].map((k, i) => (
          <Check key={i} p={[-0.55 + i * 0.38, 0.75, 0.3]} escala={0.8 * k} />
        ))}
        <group position={[1.0, 0, -0.7]} scale={mix(1, 0.7, oca)}>
          <Refresco p={[0, 0, 0]} escala={0.9} />
          <VasoLiquido p={[0.35, 0, 0.2]} color={JUGO} nivel={0.8} escala={0.22} />
        </group>
      </Escena3D>
      <Rotulos
        cam={cam}
        b={b}
        items={[
          { p: [-0.2, -0.25, 0.4], t: `${porc} ${porc === 1 ? "porción" : "porciones"}`, a: 0.25, z: 1.2, color: K.lima, tam: 54, anton: true },
          { p: [1.05, 0.9, -0.7], t: "ocasional", a: 0.7, z: 1.2, color: JUGO, tam: 40, anton: true },
        ]}
      />
      <Dato b={b} a={0.04} z={1.2} t="Fruta entera" sub="2–3 porciones al día" color={K.lima} y={250} tam={100} />
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Cuántas <span style={{ color: K.lima }}>frutas</span> comes al día?</>}
    escribe="Como…"
    ideas={["NINGUNA", "1 A 2", "3 O MÁS"]}
  />
);

const T = [
  "¿La fruta engorda porque tiene **fructosa**? Muchos la dejan por miedo al azúcar. Vamos a ver qué pasa de verdad en tu cuerpo.",
  "La fructosa es el azúcar natural de la fruta. A diferencia de la glucosa, casi toda la procesa tu **hígado**.",
  "Cuando llega en **exceso**, el hígado puede convertir una parte en **grasa**. De ahí nace el miedo.",
  "Pero la dosis importa: una manzana mediana tiene unos **diez gramos** de fructosa. Un refresco de seiscientos mililitros, más de **treinta**.",
  "Además, la fruta viene en un paquete especial: **fibra**, **agua**, y además hay que **masticarla**.",
  "La fibra hace que el azúcar se absorba **más lento**, y el agua y el volumen te **llenan**: es difícil comer fruta de más.",
  "En estudios controlados, cambiar otros carbohidratos por fructosa **sin subir las calorías** no cambió el peso. Lo que hizo subir de peso fue el **exceso de calorías**.",
  "Y en más de **ciento treinta mil** personas seguidas durante años, quienes comían más fruta subían **menos** de peso.",
  "El problema no es la fruta entera: son los azúcares **añadidos**, los refrescos y hasta los **jugos**, donde pierdes la fibra y tomas mucho azúcar en segundos.",
  "Así que come fruta **entera**, de dos a tres porciones al día, y deja los jugos y refrescos para algo ocasional.",
  "¿Cuántas frutas comes al día? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Porta, Lipogenesis, Dosis, Paquete, Absorcion, Isocalorico, Cohorte, Culpables, Consejo, Final];

export const FRUCTOSA: ShortDef = {
  id: "Short-Fructosa",
  titulo: "¿La fruta engorda porque tiene fructosa?",
  planos: ESCENAS.map((Escena, i) => ({ id: `fructosa-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
