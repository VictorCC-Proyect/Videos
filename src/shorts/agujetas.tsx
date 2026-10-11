// Short: ¿Por qué duelen los músculos al día siguiente? (agujetas / DOMS)
// Continuación del short del ardor: del atleta con el muslo dolorido al interior de la
// fibra (sarcómeros sobreestirados, microdesgarros, inflamación, células satélite).
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Cadena, Mol, Vaso } from "../fisio/modelos/energia";
import { CilindroX, Sarcomero } from "../fisio/modelos/musculo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { ANTON, Chip, Dato, Destello, INTER, K, Sello, ShortDef, Titular } from "./marco";
import { Huevo, InteriorFibra, Nervio, Pechuga, Piso, Plato, Proteina, Rinones } from "./modelos";
import { Cama, Estrellas, Luna, Sol } from "./modelos-cortisol";
import { Reloj } from "./modelos-colageno";
import { AtletaDolor, CelulaSatelite, Chispa, Dedo, DEFENSA, Desgarros, DOLOR, Flecha3D, Macrofago, SATELITE, SENSIB, VasoLiquido } from "./modelos-agujetas";
import { camViaje, cortesViaje, Viaje } from "./viaje";

const LACTATO = "#ff8fd0";
const pulso = (b: number, v: number) => Math.sin(b * v) ** 2;

// ---- Curva del dolor en el tiempo (0-90 h) -------------------------------------------
const suave = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
/** Dolor de agujetas: casi nada antes de 12 h, sube 12-24 h, maximo 24-72 h y baja. */
const dolorH = (h: number) => 4 + 88 * suave((h - 10) / 24) * (h > 58 ? Math.exp(-(((h - 58) / 30) ** 2)) : 1);
/** Lactato tras el ejercicio: vuelve a la normalidad en menos de una hora. */
const lactatoH = (h: number) => 70 * Math.exp(-h / 0.35);

const CurvaDolor: React.FC<{ b: number; a: number; z: number; prog: number; y?: number; alto?: number }> = ({ b, a, z, prog, y = 300, alto: hh = 520 }) => {
  const op = visible(b, a, z, 0.08);
  if (op <= 0) return null;
  const w = 960;
  const H0 = 90;
  const m = { l: 50, r: 40, t: 80, b: 60 };
  const X = (h: number) => m.l + (h / H0) * (w - m.l - m.r);
  const Y = (v: number) => hh - m.b - (v / 100) * (hh - m.t - m.b);
  const camino = (fn: (h: number) => number, fin: number, n = 120) =>
    Array.from({ length: n + 1 })
      .map((_, i) => {
        const h = (fin * i) / n;
        return `${i ? "L" : "M"}${X(h).toFixed(1)},${Y(fn(h)).toFixed(1)}`;
      })
      .join(" ");
  const fin = Math.max(0.5, prog * H0);
  const banda = entre(b, a + 0.25, a + 0.33);
  return (
    <div style={{ position: "absolute", left: 60, top: y, width: w, height: hh, opacity: op, transform: `scale(${0.94 + 0.06 * entre(b, a, a + 0.08)})` }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,14,17,0.86)", border: `4px solid ${DOLOR}`, borderRadius: 34, boxShadow: `0 0 50px ${DOLOR}44` }} />
      <div style={{ position: "absolute", left: 44, top: 20, fontFamily: INTER, fontWeight: 900, fontSize: 34, color: K.tinta, letterSpacing: 1 }}>DOLOR DESPUÉS DE ENTRENAR</div>
      <svg width={w} height={hh} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={X(24)} y={m.t - 6} width={X(72) - X(24)} height={hh - m.t - m.b + 6} fill={DOLOR} opacity={0.14 * banda} />
        <text x={(X(24) + X(72)) / 2} y={m.t + 34} fill={DOLOR} opacity={banda} fontFamily="Anton, Impact, sans-serif" fontSize={40} textAnchor="middle">
          MÁXIMO
        </text>
        <line x1={X(0)} y1={Y(0)} x2={X(H0)} y2={Y(0)} stroke="#4c6b6f" strokeWidth={3} />
        {[0, 12, 24, 48, 72].map((h) => (
          <g key={h}>
            <line x1={X(h)} y1={Y(0)} x2={X(h)} y2={Y(0) + 10} stroke="#9fb8b4" strokeWidth={3} />
            <text x={X(h)} y={hh - 18} fill="#9fb8b4" fontFamily="InterV, Inter, sans-serif" fontWeight={800} fontSize={28} textAnchor="middle">
              {h} h
            </text>
          </g>
        ))}
        {/* lactato: pico al terminar y se va en < 1 h */}
        <path d={camino(lactatoH, Math.min(fin, 6), 60)} fill="none" stroke={LACTATO} strokeWidth={8} strokeLinecap="round" />
        <text x={X(2)} y={Y(72)} fill={LACTATO} fontFamily="Anton, Impact, sans-serif" fontSize={36}>
          LACTATO &lt; 1 h
        </text>
        <path d={camino(dolorH, fin)} fill="none" stroke={DOLOR} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${DOLOR})` }} />
        <circle cx={X(fin)} cy={Y(dolorH(fin))} r={13} fill="#fff" stroke={DOLOR} strokeWidth={6} />
        {prog > 0.3 ? (
          <text x={X(fin) + 18} y={Y(dolorH(fin)) - 22} fill={K.tinta} fontFamily="Anton, Impact, sans-serif" fontSize={36} opacity={entre(prog, 0.3, 0.4)}>
            AGUJETAS
          </text>
        ) : null}
      </svg>
    </div>
  );
};

// 0 · Gancho: despierta con el muslo dolorido ---------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const dePie = b >= 0.34;
  const dolor = 0.45 + 0.55 * pulso(b, 22);
  const cam = dePie
    ? camara(
        [
          { b: 0.34, p: [1.9, 1.3, 6.0], l: [0, 0.68, 0], fov: 36 },
          { b: 1, p: [-1.4, 1.2, 6.0], l: [0, 0.7, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0, p: [1.6, 3.0, 7.2], l: [0, 0.35, 0], fov: 36 },
          { b: 0.34, p: [0.9, 2.6, 6.4], l: [0, 0.4, 0], fov: 36 },
        ],
        b,
      );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={dePie ? "#2a1a24" : "#0a1630"} luz={dePie ? 1 : 0.8}>
        {!dePie ? (
          <>
            <Sol p={[-1.6, mix(-0.4, 1.6, entre(b, 0, 0.34)), -3.5]} r={0.35} />
            <Reloj p={[0.5, 1.5, -1.2]} escala={0.55} t={b * 10} />
            <Cama />
            <group position={[0.8, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
              <group rotation={[-Math.PI / 2 + 0.25 * entre(b, 0.18, 0.32), 0, 0]}>
                <AtletaDolor ej="parado" dolor={dolor * entre(b, 0.1, 0.2)} />
              </group>
            </group>
          </>
        ) : (
          <>
            <group position={[-0.2, 0, -1.6]} rotation={[0, Math.PI / 2, 0]}>
              <Cama />
            </group>
            <group position={[0.15, 0, 0.2]}>
              <AtletaDolor ej="sentadilla" k={0.1 + 0.06 * Math.sin(b * 9)} dolor={dolor} />
              <Piso color={DOLOR} />
            </group>
          </>
        )}
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 60%, rgba(255,40,40,${dePie ? 0.18 * dolor : 0}) 0%, transparent 55%)` }} />
      <Destello b={b} en={[0.34]} />
      <Chip b={b} a={0.02} z={0.4} t="PARTE 2 · ARDOR →" x={540} y={300} color={K.naranja} />
      <Titular b={b} a={0.4} z={1.2} y={260} tam={140} t="¿Agujetas?" color={K.tinta} />
      <Dato b={b} a={0.6} z={1.2} t={<>DÍA 1 <span style={{ color: K.tinta }}>→</span> DÍA 2</>} color={DOLOR} y={1020} tam={80} />
    </AbsoluteFill>
  );
};

// 1 · No es el lactato: se va en < 1 h; las agujetas, 12-72 h -----------------------
const NoLactato: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 8.6], l: [0, -0.5, 0], fov: 40 },
      { b: 1, p: [-0.8, 0.2, 7.8], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  const sale = entre(b, 0.1, 0.42);
  const centros: V3[] = [
    [-1.2, 1.2, 0.5],
    [0.1, -0.2, 0.7],
    [-0.9, -1.5, 0.5],
    [0.4, 1.9, 0.4],
  ];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 24]}>
        <group position={[0, 0, -3.5]}>
          <InteriorFibra b={b} pcr={0} brillo={0.25} dano={0.8 * entre(b, 0.62, 0.9)} />
        </group>
        <Vaso desde={[1.5, -4.5, 0.4]} hasta={[1.5, 4.5, 0.4]} t={b * 1.6} radio={0.45} />
        {centros.map((c, i) => {
          const s = Math.min(1, Math.max(0, sale * 1.4 - i * 0.12));
          const enVaso: V3 = [1.5, c[1], 0.5];
          const p = s < 0.5 ? mix3(c, enVaso, s * 2) : mix3(enVaso, [1.5, c[1] + 6, 0.5], (s - 0.5) * 2);
          return s < 1 ? <Cadena key={i} n={3} p={p} color={LACTATO} sep={0.34} brillo={0.6} /> : null;
        })}
        <Reloj p={[-0.7, -0.2, 1.6]} escala={0.5 * visible(b, 0.05, 0.48, 0.05)} t={entre(b, 0.1, 0.42)} />
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: centros[1], t: "Lactato", a: 0.04, z: 0.2, o: [-90, 100], color: LACTATO },
          { p: [1.5, 0.6, 0.4], t: "a la sangre", a: 0.16, z: 0.44, o: [-60, 120], color: K.rojo },
        ]}
      />
      <Titular b={b} a={0.0} z={0.46} y={270} tam={140} t="Lactato" color={LACTATO} />
      <Sello b={b} a={0.06} z={0.46} t="NO" y={400} />
      <Chip b={b} a={0.2} z={0.46} t="SE VA EN < 1 HORA" x={540} y={1100} color={LACTATO} />
      <CurvaDolor b={b} a={0.46} z={1.2} prog={lineal(b, 0.5, 0.92)} y={260} alto={540} />
      <Chip b={b} a={0.55} z={1.2} t="APARECEN A LAS 12–24 H" x={540} y={1100} color={DOLOR} />
    </AbsoluteFill>
  );
};

// 2 · Excentrico: bajar lento en la sentadilla --------------------------------------
const Excentrico: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const u = (b * 2.3) % 1;
  const baja = u < 0.72;
  const k = baja ? suave(u / 0.72) : 1 - suave((u - 0.72) / 0.28);
  const cam = camara(
    [
      { b: 0, p: [4.4, 1.4, 4.4], l: [0, 0.6, 0], fov: 36 },
      { b: 1, p: [5.4, 1.2, 2.4], l: [0, 0.58, 0], fov: 36 },
    ],
    b,
  );
  const fuerza = visible(b, 0.3, 1.2, 0.1);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <AtletaDolor ej="sentadilla" k={k} dolor={baja ? (0.35 + 0.65 * k) * fuerza : 0.1} colorBrillo={K.naranja} />
        <Piso color={K.naranja} />
        <Flecha3D p={[0, 1.85 - 0.4 * k, 0.55]} largo={0.7} color={K.amarillo} op={baja ? 1 : 0.15} />
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={[{ p: [0.1, 1.5 - 0.4 * k, 0.55], t: baja ? "Bajada lenta" : "Subida", a: 0.3, z: 1.2, o: [110, -90], color: K.amarillo }]} />
      <Chip b={b} a={0.06} z={1.2} t="EJERCICIO NUEVO" x={300} y={1040} color={K.lima} />
      <Chip b={b} a={0.16} z={1.2} t="MÁS INTENSO" x={790} y={1040} color={K.lima} />
      <Dato b={b} a={0.3} z={1.2} t="EXCÉNTRICO" sub="el músculo se alarga con fuerza" color={K.naranja} y={250} tam={110} />
    </AbsoluteFill>
  );
};

// 3 · Sarcomeros sobreestirados y microdesgarros -----------------------------------
const COL = 0.8;
const Microdesgarros: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const t = lineal(b, 0, 0.3);
  const fase = b < 0.3 ? 0 : b < 0.64 ? 1 : 2;
  const st = entre(b, 0.33, 0.45);
  const rompe = entre(b, 0.42, 0.56);
  const Ls = mix(4.0, 4.3, st);
  const Lm = mix(4.0, 6.4, rompe);
  const Lu = mix(4.0, 4.55, st);
  const dano = entre(b, 0.66, 0.9);
  const cam =
    fase === 0
      ? camViaje(t)
      : fase === 1
        ? camara(
            [
              { b: 0.3, p: [2.6, 1.4, 12.4], l: [0, -0.7, 0], fov: 40 },
              { b: 0.64, p: [-1.4, 0.8, 12.0], l: [0, -0.7, 0], fov: 40 },
            ],
            b,
          )
        : camara(
            [
              { b: 0.64, p: [0, 0.4, 11], l: [0, -0.9, 0], fov: 40 },
              { b: 1, p: [0.6, 0.2, 8.6], l: [0, -0.9, 0], fov: 40 },
            ],
            b,
          );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fase === 0 && t < 0.72 ? undefined : [8, 26]}>
        {fase === 0 ? <Viaje t={t} b={b} ej="sentadilla" k={0.55} colorBrillo={K.naranja} interior={{ pcr: 0, brillo: 0.2 }} /> : null}
        {fase === 1 ? (
          <>
            <group rotation={[0, 0, Math.PI / 2]}>
              {/* miofibrilla con un sarcomero que cede */}
              <group position={[0, COL, 0]}>
                {[-(Lm / 2 + Ls / 2), 0, Lm / 2 + Ls / 2].map((x, i) => (
                  <group key={i} position={[x, 0, 0]}>
                    <Sarcomero L={i === 1 ? Lm : Ls} radio={0.55} cabezas={i === 1} resaltaFinos={i === 1 ? rompe * 0.6 : 0} />
                  </group>
                ))}
              </group>
              {/* miofibrilla vecina: se estira parejo */}
              <group position={[0, -COL, 0]}>
                {[-Lu, 0, Lu].map((x, i) => (
                  <group key={i} position={[x, 0, 0]}>
                    <Sarcomero L={Lu} radio={0.55} cabezas={false} />
                  </group>
                ))}
              </group>
            </group>
            <Chispa p={[-COL, Lm / 2 - 1.1, 0.7]} escala={0.9} op={entre(b, 0.5, 0.56) * (0.6 + 0.4 * pulso(b, 60))} />
            <Chispa p={[-COL, -Lm / 2 + 1.1, 0.7]} escala={0.7} op={entre(b, 0.53, 0.59) * (0.6 + 0.4 * pulso(b, 50))} />
            <Polvo b={b} radio={6} />
          </>
        ) : null}
        {fase === 2 ? (
          <>
            <InteriorFibra b={b} pcr={0} dano={dano} brillo={0.15} />
            <Desgarros caja={[7.5, 6.5, 0.6]} centro={[0, -0.6, 1.3]} n={12} dano={entre(b, 0.74, 0.95)} b={b} seed="tej" />
            <Polvo b={b} radio={5} />
          </>
        ) : null}
      </Escena3D>
      <Destello b={b} en={[...cortesViaje(0, 0.3), 0.64]} />
      <Etiquetas
        cam={cam}
        b={b}
        items={
          fase === 1
            ? [
                { p: [-COL - 0.6, 0.6, 0.4], t: "sobreestirado", a: 0.44, z: 0.64, o: [140, -150], color: K.amarillo },
                { p: [-COL + 0.75, Lm / 2, 0], t: "líneas Z desalineadas", a: 0.5, z: 0.64, o: [60, -130], color: "#c8d6ff" },
              ]
            : fase === 2
              ? [{ p: [1.0, -0.5, 1.4], t: "tejido que las rodea", a: 0.78, z: 1.2, o: [-60, 150], color: K.amarillo }]
              : []
        }
      />
      <Dato b={b} a={0.32} z={0.64} t="SOBREESTIRADOS" sub="sarcómeros que ceden" color={K.amarillo} y={250} tam={104} />
      <Dato b={b} a={0.66} z={1.2} t="MICRODESGARROS" sub="en fibras y tejido" color={K.amarillo} y={250} tam={104} />
    </AbsoluteFill>
  );
};

// 4 · Inflamacion: celulas de defensa, liquido y nervio sensibilizado -----------------
const MACROS: { x0: number; fin: V3 }[] = [
  { x0: -1.0, fin: [-1.0, 1.0, 1.0] },
  { x0: 0.4, fin: [-0.1, -0.5, 1.3] },
  { x0: -2.0, fin: [-1.2, -1.9, 1.0] },
];
const RECEPTOR: V3 = [1.2, 1.0, 1.3];
const Inflamacion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const liquido = entre(b, 0.36, 0.62);
  const sens = entre(b, 0.6, 0.86);
  const activa = entre(b, 0.76, 0.9);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 11], l: [0, -0.4, 0], fov: 40 },
      { b: 1, p: [0.9, 0.2, 9.8], l: [0, -0.5, 0], fov: 40 },
    ],
    b,
  );
  const macros = MACROS.map((m, i) => {
    const s = entre(b, 0.06 + i * 0.07, 0.34 + i * 0.07);
    const enVaso: V3 = [m.x0, 3.0, 0.9];
    const p = s < 0.35 ? mix3([m.x0 - 3, 3.0, 0.9], enVaso, s / 0.35) : mix3(enVaso, m.fin, (s - 0.35) / 0.65);
    return { p, s };
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[8, 26]}>
        <group position={[0, 0, -2.2]}>
          <InteriorFibra b={b} pcr={0} dano={0.9} agua={liquido} hinchazon={liquido * 0.9} brillo={0.15 + liquido * 0.25} />
        </group>
        <Vaso desde={[-5, 3.0, 0.9]} hasta={[5, 3.0, 0.9]} t={b * 1.2} radio={0.5} />
        {macros.map((m, i) => (
          <Macrofago key={i} p={[m.p[0], m.p[1] + Math.sin(b * 6 + i) * 0.04, m.p[2]]} escala={0.85} giro={b * 2 + i} brillo={0.15 + 0.3 * sens} seed={`mf${i}`} op={entre(b, 0.04 + i * 0.07, 0.1 + i * 0.07)} />
        ))}
        <group position={[1.2, 0.45, 1.3]} rotation={[0, 0, Math.PI]} scale={0.55}>
          <Nervio activa={activa} pulso={b * 3} />
        </group>
        {Array.from({ length: 12 }).map((_, i) => {
          const src = macros[i % 3].p;
          const f = Math.min(1, Math.max(0, sens * 1.4 - rnd(`sz${i}`) * 0.4));
          if (f <= 0) return null;
          const ini: V3 = [src[0] + (rnd(`sx${i}`) - 0.5) * 0.6, src[1] + (rnd(`sy${i}`) - 0.5) * 0.6, src[2] + 0.3];
          const fin: V3 = [RECEPTOR[0] + (rnd(`sf${i}`) - 0.5) * 0.4, RECEPTOR[1] + (rnd(`sg${i}`) - 0.5) * 0.3, RECEPTOR[2]];
          return <Mol key={i} p={mix3(ini, fin, f)} color={SENSIB} r={0.07} brillo={1.2} />;
        })}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 62% 48%, rgba(255,140,40,${0.3 * activa}) 0%, transparent 45%)` }} />
      <Etiquetas cam={cam} b={b} items={[{ p: RECEPTOR, t: "nervio del dolor", a: 0.6, z: 1.2, o: [-40, -170], color: K.naranja }]} />
      <Dato b={b} a={0.02} z={1.2} t="INFLAMACIÓN" color={K.naranja} y={250} tam={110} />
      <Chip b={b} a={0.1} z={1.2} t="CÉLULAS DE DEFENSA" x={320} y={1030} color={DEFENSA} />
      <Chip b={b} a={0.38} z={1.2} t="LÍQUIDO" x={830} y={1030} color={K.cian} />
      <Chip b={b} a={0.62} z={1.2} t="SENSIBILIZAN EL NERVIO" x={540} y={1110} color={SENSIB} />
    </AbsoluteFill>
  );
};

// 5 · Duele al moverte o presionar, no en reposo -----------------------------------
const AlMoverte: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const camina = b < 0.38;
  const fase = b * 34;
  const aprieta = entre(b, 0.42, 0.52) * (1 - entre(b, 0.64, 0.7));
  const dolor = camina ? 0.25 + 0.75 * Math.max(0, Math.sin(fase)) : b < 0.7 ? 0.15 + 0.85 * aprieta : 0.08;
  const cam = camara(
    [
      { b: 0, p: [2.2, 1.3, 5.6], l: [0, 0.75, 0], fov: 36 },
      { b: 0.45, p: [1.9, 1.0, 3.6], l: [0.05, 0.72, 0], fov: 36 },
      { b: 0.72, p: [1.6, 1.1, 4.4], l: [0, 0.78, 0], fov: 36 },
      { b: 1, p: [0.6, 1.2, 5.6], l: [0, 0.75, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <AtletaDolor ej={camina ? "marcha" : "parado"} fase={fase} marcha={0.5} dolor={dolor} />
        <Piso color={dolor > 0.5 ? DOLOR : K.lima} />
        {!camina && b < 0.72 ? <Dedo p={[0.12, 0.72, mix(0.4, 0.1, aprieta)]} escala={0.6} /> : null}
        {aprieta > 0.6 ? <Chispa p={[0.12, 0.72, 0.12]} escala={0.25} op={(aprieta - 0.6) * 2.5 * pulso(b, 70)} color={K.amarillo} /> : null}
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, rgba(255,40,40,${0.25 * dolor}) 0%, transparent 50%)` }} />
      <Dato b={b} a={0.03} z={1.2} t="DUELE AL MOVERTE" sub="o al presionar el músculo" color={DOLOR} y={250} tam={100} />
      <Chip b={b} a={0.06} z={1.2} t="MOVERTE ↑" x={200} y={1100} color={DOLOR} />
      <Chip b={b} a={0.42} z={1.2} t="PRESIONAR ↑" x={540} y={1100} color={DOLOR} />
      <Chip b={b} a={0.72} z={1.2} t="REPOSO ↓" x={880} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 6 · Reparacion: celulas satelite ----------------------------------------------------
const SATS: { a: number; y: number }[] = [
  { a: -0.6, y: 1.7 },
  { a: 0.5, y: 0.3 },
  { a: -0.25, y: -1.3 },
  { a: 0.85, y: -2.4 },
];
const RF = 1.1;
const Reparacion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const activa = entre(b, 0.06, 0.28);
  const divide = entre(b, 0.28, 0.46);
  const fusion = entre(b, 0.5, 0.74);
  const repara = entre(b, 0.6, 0.9);
  const adapta = entre(b, 0.72, 1);
  const cam = camara(
    [
      { b: 0, p: [0.4, 0.6, 8.4], l: [0, -0.4, 0], fov: 40 },
      { b: 1, p: [-1.2, 0.3, 7.8], l: [0, -0.5, 0], fov: 40 },
    ],
    b,
  );
  const sobre = (a: number, y: number, r = RF + 0.04): V3 => [Math.sin(a) * r, y, Math.cos(a) * r];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[7, 22]}>
        <group scale={[1 + 0.1 * adapta, 1, 1 + 0.1 * adapta]}>
          <group rotation={[0, 0, Math.PI / 2]}>
            <CilindroX radio={RF} largo={14} x={7} color="#c03a46" estriado={9} emisivo={0.1 + 0.6 * adapta} />
          </group>
          <Desgarros caja={[1.5, 4.6, 0.1]} centro={[0, -0.3, RF + 0.02]} n={9} dano={1 - repara} b={b} seed="rep" />
        </group>
        {SATS.map((s, i) => {
          const madre = sobre(s.a, s.y);
          const hija = sobre(s.a + 0.25 * divide, s.y - 0.5 * divide, mix(RF + 0.04, RF - 0.3, fusion));
          return (
            <group key={i}>
              <CelulaSatelite p={madre} rot={[0, s.a, 0]} activa={activa * (1 - adapta * 0.7)} escala={1.1} />
              {divide > 0.02 ? <CelulaSatelite p={hija} rot={[0, s.a + 0.25 * divide, 0]} activa={activa} escala={1.1} op={1 - fusion} /> : null}
              <Chispa p={sobre(s.a + 0.25, s.y - 0.5, RF + 0.1)} escala={0.35} op={visible(b, 0.66, 0.8, 0.04)} color={SATELITE} />
            </group>
          );
        })}
        <Polvo b={b} radio={5} color={SATELITE} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: sobre(SATS[1].a, SATS[1].y), t: "célula satélite", a: 0.06, z: 0.5, o: [80, -110], color: SATELITE },
          { p: [0, -0.3, RF], t: "microdesgarros", a: 0.04, z: 0.5, o: [-60, 170], color: K.amarillo },
        ]}
      />
      <Dato b={b} a={0.03} z={1.2} t="CÉLULAS SATÉLITE" sub="reparan la fibra" color={SATELITE} y={250} tam={104} />
      <Chip b={b} a={0.06} z={0.28} t="SE ACTIVAN" x={540} y={1100} color={SATELITE} />
      <Chip b={b} a={0.28} z={0.5} t="SE DIVIDEN" x={540} y={1100} color={SATELITE} />
      <Chip b={b} a={0.5} z={0.74} t="SE FUSIONAN CON LA FIBRA" x={540} y={1100} color={SATELITE} />
      <Chip b={b} a={0.74} z={1.2} t="REPARA Y SE ADAPTA" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 7 · Efecto de carga repetida ---------------------------------------------------------
const Barras: React.FC<{ b: number; uno: number; dos: number; op: number }> = ({ b, uno, dos, op }) => {
  if (op <= 0) return null;
  const alto = 330;
  const barra = (v: number, color: string, et: string, x: number) => (
    <div style={{ position: "absolute", left: x, bottom: 70, width: 130, height: alto, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
      <div style={{ fontFamily: ANTON, fontSize: 44, color, opacity: v > 0.05 ? 1 : 0, marginBottom: 6 }}>{Math.round(v * 100)}%</div>
      <div style={{ width: 110, height: v * (alto - 70), background: color, borderRadius: 16, boxShadow: `0 0 30px ${color}` }} />
      <div style={{ position: "absolute", bottom: -54, fontFamily: INTER, fontWeight: 900, fontSize: 32, color: K.tinta, whiteSpace: "nowrap" }}>{et}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 600, top: 540, width: 420, height: 500, opacity: op, transform: `scale(${0.94 + 0.06 * entre(b, 0.06, 0.14)})` }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,14,17,0.84)", border: `4px solid ${DOLOR}`, borderRadius: 30 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontFamily: INTER, fontWeight: 900, fontSize: 32, color: K.tinta }}>DOLOR</div>
      {barra(uno, DOLOR, "1.ª VEZ", 50)}
      {barra(dos, K.lima, "2.ª VEZ", 240)}
    </div>
  );
};

const CargaRepetida: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const segunda = b >= 0.42;
  const k = Math.sin(((b * 3.2) % 1) * Math.PI);
  const dolor = segunda ? 0.12 : 0.45 + 0.55 * k;
  const cam = camara(
    [
      { b: 0, p: [2.0, 1.3, 6.9], l: [0.36, 0.62, 0], fov: 36 },
      { b: 1, p: [1.0, 1.2, 7.1], l: [0.36, 0.62, 0], fov: 36 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <AtletaDolor ej="sentadilla" k={k} dolor={dolor} />
        <Piso color={segunda ? K.lima : DOLOR} />
      </Escena3D>
      <Destello b={b} en={[0.42]} />
      <Titular b={b} a={0.02} z={0.66} y={260} tam={110} t="¡Buena noticia!" color={K.lima} />
      <Dato b={b} a={0.68} z={1.2} t="CARGA REPETIDA" sub="efecto de" color={K.lima} y={250} tam={104} />
      <Chip b={b} a={0.04} z={0.42} t="SESIÓN 1" x={260} y={1100} color={DOLOR} />
      <Chip b={b} a={0.42} z={1.2} t="SESIÓN 2" x={260} y={1100} color={K.lima} />
      <Barras b={b} uno={entre(b, 0.1, 0.32)} dos={0.3 * entre(b, 0.48, 0.62)} op={visible(b, 0.06, 1.2, 0.08)} />
    </AbsoluteFill>
  );
};

// 8 · Alivio: movimiento suave, dormir, proteina ----------------------------------------
const Alivio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const fase = b < 0.3 ? 0 : b < 0.5 ? 1 : b < 0.72 ? 2 : 3;
  const cams = [
    camara([{ b: 0, p: [2.4, 1.3, 6.0], l: [0, 0.72, 0], fov: 36 }, { b: 0.3, p: [1.2, 1.2, 6.2], l: [0, 0.72, 0], fov: 36 }], b),
    camara([{ b: 0.3, p: [1.4, 3.0, 7.0], l: [0, 0.3, 0], fov: 36 }, { b: 0.5, p: [-0.8, 2.8, 6.8], l: [0, 0.3, 0], fov: 36 }], b),
    camara([{ b: 0.5, p: [0, 1.6, 3.4], l: [0, -0.05, 0], fov: 36 }, { b: 0.72, p: [0.8, 1.5, 3.1], l: [0, -0.05, 0], fov: 36 }], b),
    camara([{ b: 0.72, p: [2.0, 1.2, 6.2], l: [0, 0.62, 0], fov: 36 }, { b: 1, p: [-1.4, 1.1, 6.2], l: [0, 0.62, 0], fov: 36 }], b),
  ];
  const k = Math.sin(((b * 4) % 1) * Math.PI);
  return (
    <AbsoluteFill>
      <Escena3D cam={cams[fase]} fondo={fase === 1 ? "#0a1630" : fase === 3 ? "#2a1018" : undefined} luz={fase === 1 ? 0.75 : 1}>
        {fase === 0 ? (
          <>
            <AtletaDolor ej="marcha" fase={b * 26} marcha={0.35} dolor={0.15} brilla={0.25} colorBrillo={K.lima} />
            <Piso />
          </>
        ) : null}
        {fase === 1 ? (
          <>
            <Estrellas />
            <Luna p={[-0.9, 1.3, -2.5]} r={0.28} />
            <Cama />
            <group position={[0.8, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
              <group rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 1 + Math.sin(b * 18) * 0.02]}>
                <AtletaDolor ej="parado" brilla={0.15} colorBrillo={K.cian} />
              </group>
            </group>
            {Array.from({ length: 3 }).map((_, i) => {
              const f = (b * 3 + i / 3) % 1;
              return <Mol key={i} p={[-0.9 + f * 0.5, 0.75 + f * 1.0, 0.2]} color="#9fb8ff" r={0.05 + f * 0.04} op={1 - f} />;
            })}
          </>
        ) : null}
        {fase === 2 ? (
          <group rotation={[0, b * 1.5, 0]}>
            <Plato p={[0, 0, 0]} escala={0.9} />
            <Pechuga p={[-0.15, 0.08, 0]} escala={0.8} />
            <Huevo p={[0.27, 0.05, 0.18]} escala={0.8} />
            <Proteina p={[0, 0.75, 0]} n={10} escala={1.1} giro={b * 6} desarma={0} />
          </group>
        ) : null}
        {fase === 3 ? (
          <>
            <AtletaDolor ej="sentadilla" k={k} dolor={0.6 + 0.4 * pulso(b, 30)} />
            <Piso color={DOLOR} />
          </>
        ) : null}
      </Escena3D>
      <Destello b={b} en={[0.3, 0.5, 0.72]} />
      <Dato b={b} a={0.02} z={0.72} t="¿CÓMO ALIVIARLAS?" color={K.lima} y={250} tam={96} />
      <Chip b={b} a={0.04} z={0.3} t="MOVIMIENTO SUAVE" x={540} y={1100} color={K.lima} />
      <Chip b={b} a={0.3} z={0.5} t="DORMIR BIEN" x={540} y={1100} color={K.cian} />
      <Chip b={b} a={0.5} z={0.72} t="SUFICIENTE PROTEÍNA" x={540} y={1100} color={K.amarillo} />
      <Dato
        b={b}
        a={0.74}
        z={1.2}
        t={
          <>
            MÁS DOLOR <span style={{ color: K.tinta }}>≠</span>
            <br />
            MEJOR ENTRENAMIENTO
          </>
        }
        color={DOLOR}
        y={240}
        tam={80}
      />
      <Sello b={b} a={0.8} z={1.2} t="NO" y={1000} />
    </AbsoluteFill>
  );
};

// 9 · Alerta: cuando ir al medico -----------------------------------------------------------
const mezclaHex = (a: string, z: string, t: number) => {
  const c = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  return `rgb(${[0, 1, 2].map((i) => Math.round(mix(c(a, i), c(z, i), t))).join(",")})`;
};
const Alerta: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const oscura = entre(b, 0.3, 0.46);
  const cam = camara(
    [
      { b: 0, p: [0.8, 0.5, 7.6], l: [0, -0.2, 0], fov: 40 },
      { b: 1, p: [-0.6, 0.3, 7.2], l: [0, -0.2, 0], fov: 40 },
    ],
    b,
  );
  const color = oscura < 0.01 ? "#f2d14a" : mezclaHex("#f2d14a", "#4a1c0c", oscura);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#2a1018">
        <group position={[0, 1.05, 0]} scale={0.5}>
          <Rinones brillo={0.3 * pulso(b, 10) * oscura} />
        </group>
        <group position={[-0.55, 0, 0]} rotation={[0, b * 0.8, 0]}>
          <VasoLiquido p={[0, -0.75, 0]} color={color} nivel={0.72} escala={0.55} />
        </group>
      </Escena3D>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(255,40,40,${0.25 + 0.15 * pulso(b, 8)}) 100%)` }} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.42, 1.05, 0], t: "riñones", a: 0.36, z: 1.2, o: [90, -90], color: "#e88a7a" },
          { p: [-0.55, -0.4, 0.3], t: "orina oscura", a: 0.32, z: 1.2, o: [-40, -90], color: "#d9a066" },
        ]}
      />
      <Titular b={b} a={0.0} z={0.7} y={260} tam={140} t="¡Ojo!" color={K.amarillo} />
      <Dato b={b} a={0.7} z={1.2} t="ACUDE AL MÉDICO" color={DOLOR} y={250} tam={100} />
      <Chip b={b} a={0.06} z={1.2} t="DOLOR MUY INTENSO" x={770} y={860} color={DOLOR} />
      <Chip b={b} a={0.3} z={1.2} t="ORINA OSCURA" x={770} y={950} color="#d9a066" />
      <Chip b={b} a={0.5} z={1.2} t="MUCHA HINCHAZÓN" x={770} y={1040} color={K.naranja} />
    </AbsoluteFill>
  );
};

// 10 · Comentarios ---------------------------------------------------------------------------
const Comentarios: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Qué <span style={{ color: K.lima }}>suplemento</span> explico?</>}
    escribe="Quiero el de…"
    ideas={["OMEGA 3", "PROTEÍNA WHEY", "BETA-ALANINA", "VITAMINA D", "ASHWAGANDHA"]}
  />
);

const T = [
  "En el video del ardor te dije que las agujetas eran otra cosa. ¿Por qué te duelen los músculos **al día siguiente**?",
  "Primero: **no** es el lactato. El lactato se va de tu músculo en **menos de una hora**, y las agujetas aparecen de **12 a 24 horas** después, con su máximo entre las **24 y 72**.",
  "Aparecen sobre todo con ejercicios **nuevos**, más intensos o con fase **excéntrica**: cuando el músculo se alarga mientras hace fuerza, como al bajar en una sentadilla.",
  "En esa fase, algunos sarcómeros se estiran de más y se producen **microdesgarros** en las fibras y en el tejido que las rodea.",
  "Tu cuerpo responde con **inflamación**: llegan células de defensa, se acumula líquido y se liberan sustancias que **sensibilizan** a los nervios del dolor.",
  "Por eso duele al **moverte** o al presionar el músculo, y no tanto en reposo.",
  "Mientras tanto, se activan las **células satélite**, y el músculo se repara y se **adapta**.",
  "La buena noticia: si repites el ejercicio, la próxima vez dolerá **mucho menos**. Se llama efecto de **carga repetida**.",
  "¿Cómo aliviarlas? Movimiento suave, **dormir bien** y suficiente **proteína**. Y ojo: más dolor **no** significa mejor entrenamiento.",
  "Si el dolor es muy intenso, la orina se pone **oscura** o hay mucha hinchazón, acude al **médico**.",
  "¿Qué suplemento quieres que explique en el próximo video? **Escríbelo en los comentarios**, y sígueme para más nutrición explicada con ciencia.",
];

const ESCENAS = [Gancho, NoLactato, Excentrico, Microdesgarros, Inflamacion, AlMoverte, Reparacion, CargaRepetida, Alivio, Alerta, Comentarios];

export const AGUJETAS: ShortDef = {
  id: "Short-Agujetas",
  titulo: "¿Por qué duelen los músculos al día siguiente?",
  planos: ESCENAS.map((Escena, i) => ({ id: `agujetas-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
