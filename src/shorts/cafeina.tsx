// Short: Cafeína antes de entrenar: cómo funciona
// Del atleta que toma café al cerebro: la adenosina ocupa sus receptores (cansancio) y la
// cafeína, de forma parecida, los bloquea. Luego dosis, ejemplo, límites y precauciones.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaCierre } from "./cierre";
import { Chip, Dato, Destello, INTER, K, pop, ShortDef, Titular } from "./marco";
import { Atleta, Bascula, Piso } from "./modelos";
import { Cerebro } from "./modelos-ayuno";
import { Capsula } from "./modelos-magnesio";
import { Reloj, Tache } from "./modelos-colageno";
import {
  ADENOSINA,
  Adenosina,
  AtletaTaza,
  Cafeina,
  CAFEINA_C,
  Cama,
  Corazon,
  enReceptor,
  Luna,
  RECEPTOR,
  RECEPTORES_C,
  Sinapsis,
  Taza,
} from "./modelos-cafeina";

const CAFE_TXT = "#e0b48a";

// 0 · Gancho: toma cafe y entrena ------------------------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const bebe = b < 0.5;
  const cam = bebe
    ? camara(
        [
          { b: 0, p: [1.3, 1.55, 2.7], l: [0, 1.25, 0], fov: 36 },
          { b: 0.5, p: [0.6, 1.5, 2.3], l: [0, 1.28, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.5, p: [3.2, 1.5, 6.0], l: [0, 0.65, 0], fov: 36 },
          { b: 1, p: [-2.4, 1.4, 6.0], l: [0, 0.65, 0], fov: 36 },
        ],
        b,
      );
  const k = Math.sin(((b - 0.5) * 4.4 % 1) * Math.PI);
  const brillo = entre(b, 0.5, 0.75);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        {bebe ? (
          <AtletaTaza bebe={entre(b, 0.05, 0.3) * (1 - entre(b, 0.44, 0.5) * 0.4)} b={b} />
        ) : (
          <Atleta ej="sentadilla" k={k} brilla={0.2 + 0.7 * brillo} colorBrillo={K.amarillo} pesa={false} />
        )}
        <Piso color={bebe ? CAFE_TXT : K.amarillo} />
      </Escena3D>
      <Destello b={b} en={[0.5]} />
      <Titular b={b} a={0.03} z={1} y={290} tam={150} t="Cafeína" color={CAFE_TXT} />
      <Chip b={b} a={0.62} z={1} t="¿POR QUÉ RINDES MÁS?" x={540} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// ---- Adenosina que se acumula y se une a los receptores ----------------------------------

const inicioAd = (i: number): V3 => [(rnd(`ax${i}`) - 0.5) * 3.2, 2.3 + rnd(`ay${i}`) * 1.4, (rnd(`az${i}`) - 0.5) * 1.4];
const deriva = (p: V3, b: number, i: number): V3 => [p[0] + Math.sin(b * 6 + i) * 0.08, p[1] + Math.cos(b * 5 + i * 2) * 0.08, p[2]];
const EXTRA = 4;

// 1 · Atleta -> cerebro -> sinapsis: la adenosina ocupa los receptores -------------------
const Adenosina1: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const tramo = b < 0.18 ? 0 : b < 0.38 ? 1 : 2;
  const cam =
    tramo === 0
      ? camara(
          [
            { b: 0, p: [0, 1.2, 6.0], l: [0, 0.7, 0], fov: 36 },
            { b: 0.18, p: [0, 1.66, 1.1], l: [0, 1.62, 0], fov: 36 },
          ],
          b,
        )
      : tramo === 1
        ? camara(
            [
              { b: 0.18, p: [0, 0.4, 4.6], l: [0, -0.3, 0], fov: 38 },
              { b: 0.38, p: [0.3, 0.3, 3.4], l: [0, -0.25, 0], fov: 38 },
            ],
            b,
          )
        : camara(
            [
              { b: 0.38, p: [0, 3.0, 8.4], l: [0, 0.2, 0], fov: 40 },
              { b: 1, p: [0.8, 2.4, 7.4], l: [0, 0.1, 0], fov: 40 },
            ],
            b,
          );
  const acumula = entre(b, 0.38, 0.6);
  const actividad = 0.95 - 0.8 * entre(b, 0.72, 0.95);
  const unido = RECEPTORES_C.map((_, i) => entre(b, 0.55 + i * 0.04, 0.68 + i * 0.04));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={tramo === 2 ? "#1d1430" : K.fondo2} niebla={tramo === 2 ? [6, 20] : undefined}>
        {tramo === 0 ? (
          <>
            <Atleta ej="parado" brilla={0.1} />
            <Piso />
            <Cerebro p={[0, 1.7, 0]} escala={0.16 * entre(b, 0.08, 0.16)} brillo={0.3} />
          </>
        ) : tramo === 1 ? (
          <>
            <Cerebro p={[0, 0, 0]} escala={1.1} brillo={0.15 + 0.3 * entre(b, 0.25, 0.36)} giro={-0.4 + b * 1.2} />
            <Polvo b={b} radio={4} />
          </>
        ) : (
          <>
            <Sinapsis b={b} actividad={actividad} ocupado={unido} />
            {RECEPTORES_C.map((_, i) => {
              const ini = inicioAd(i);
              const p = unido[i] > 0 ? mix3(deriva(ini, b, i), enReceptor(i, 0.12), unido[i]) : deriva(ini, b, i);
              return <Adenosina key={i} p={p} escala={0.75 * Math.min(1, acumula * 1.6 + 0.2 - i * 0.05)} rot={[0, 0, (1 - unido[i]) * Math.sin(b * 4 + i)]} />;
            })}
            {Array.from({ length: EXTRA }).map((_, j) => {
              const i = j + 10;
              return <Adenosina key={i} p={deriva(inicioAd(i), b, i)} escala={0.75 * entre(b, 0.45 + j * 0.05, 0.6 + j * 0.05)} rot={[0, 0, Math.sin(b * 3 + i)]} />;
            })}
            <Polvo b={b} radio={5} color="#c8b8ff" />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[0.18, 0.38]} />
      {tramo === 1 ? <Chip b={b} a={0.2} z={0.38} t="CEREBRO" x={540} y={330} color="#ff8fb0" /> : null}
      {tramo === 2 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: inicioAd(10), t: "Adenosina", a: 0.42, z: 1, o: [-60, -80], color: ADENOSINA },
            { p: [0.95, 0.3, -0.45], t: "Receptor", a: 0.6, z: 1, o: [60, 120], color: RECEPTOR },
            { p: [-1.6, -0.5, 1.2], t: "Neurona", a: 0.5, z: 1, o: [-30, 130], color: "#ff8fb0" },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.42} z={0.85} t="Adenosina" sub="se acumula durante el día" color={ADENOSINA} y={260} tam={96} />
      <Dato b={b} a={0.86} z={1.2} t="CANSANCIO" sub="la neurona se apaga" color={K.morado} y={260} tam={110} />
    </AbsoluteFill>
  );
};

// 2 · La cafeina bloquea los receptores ------------------------------------------------------
const Bloqueo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 2.7, 4.0], l: [0, 2.15, 0], fov: 40 },
      { b: 0.26, p: [0, 2.7, 4.6], l: [0, 2.05, 0], fov: 40 },
      { b: 0.42, p: [0, 3.0, 8.4], l: [0, 0.2, 0], fov: 40 },
      { b: 1, p: [-0.8, 2.6, 7.6], l: [0, 0.1, 0], fov: 40 },
    ],
    b,
  );
  const compara = 1 - entre(b, 0.28, 0.4);
  const actividad = 0.15 + 0.8 * entre(b, 0.6, 0.88);
  const sale = RECEPTORES_C.map((_, i) => entre(b, 0.3 + i * 0.04, 0.4 + i * 0.04));
  const entra = RECEPTORES_C.map((_, i) => entre(b, 0.36 + i * 0.04, 0.48 + i * 0.04));
  const rebota = (i: number) => lineal(b, 0.6 + i * 0.05, 0.78 + i * 0.05);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#1d1430" niebla={[6, 20]}>
        <Sinapsis b={b} actividad={actividad} ocupado={entra} />
        {/* adenosina: estaba unida, se suelta y ya no puede volver a entrar */}
        {RECEPTORES_C.map((_, i) => {
          const fuera: V3 = [RECEPTORES_C[i][0] * 1.3 + (i % 2 ? 0.5 : -0.5), 1.9 + rnd(`fy${i}`) * 0.6, RECEPTORES_C[i][1] + 0.3];
          let p = mix3(enReceptor(i, 0.12), fuera, sale[i]);
          const r = rebota(i);
          if (r > 0 && r < 1) {
            const baja = Math.sin(r * Math.PI);
            p = mix3(fuera, [RECEPTORES_C[i][0] + 0.15, 1.05, RECEPTORES_C[i][1] + 0.1], baja);
          } else if (sale[i] >= 1) {
            p = deriva(fuera, b, i);
          }
          return <Adenosina key={i} p={p} escala={0.75} rot={[0, 0, sale[i] * Math.sin(b * 4 + i) * 0.8]} op={compara > 0.5 && i !== 1 ? 0.25 : 1} />;
        })}
        {/* cafeina que llega y ocupa la copa */}
        {RECEPTORES_C.map((_, i) => {
          const ini: V3 = i === 1 ? [-0.75, 2.15, 0.6] : [(rnd(`cx${i}`) - 0.5) * 3.4, 3.1 + rnd(`cy${i}`) * 0.6, 0.4];
          const vis = i === 1 ? 1 : entre(b, 0.3, 0.38);
          return <Cafeina key={i} p={mix3(deriva(ini, b, i + 5), enReceptor(i, 0.08), entra[i])} escala={0.75 + 0.35 * (i === 1 ? compara : 0)} rot={[0, 0, (1 - entra[i]) * Math.sin(b * 3 + i) * 0.6]} op={vis} />;
        })}
        {compara > 0 ? <Adenosina p={[0.55, 2.15, 0.6]} escala={1.1 * compara} op={compara} /> : null}
        <Polvo b={b} radio={5} color="#c8b8ff" />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.75, 2.45, 0.6], t: "Cafeína", a: 0.03, z: 0.28, o: [-40, -110], color: CAFEINA_C },
          { p: [0.6, 2.45, 0.6], t: "Adenosina", a: 0.08, z: 0.28, o: [40, -110], color: ADENOSINA },
          { p: enReceptor(0, 0.1), t: "Cafeína en el receptor", a: 0.5, z: 0.95, o: [-30, 150], color: CAFEINA_C },
        ]}
      />
      <Chip b={b} a={0.12} z={0.3} t="FORMA PARECIDA" x={540} y={1060} color={CAFEINA_C} />
      <Dato b={b} a={0.42} z={1.2} t="Bloquea los receptores" sub="la adenosina ya no puede unirse" color={CAFE_TXT} y={260} tam={80} />
      <Chip b={b} a={0.8} z={1.2} t="↓ FATIGA" x={540} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// ---- Medidor de esfuerzo percibido (HTML) ------------------------------------------------------
const Medidor: React.FC<{ b: number; nivel: number }> = ({ b, nivel }) => {
  const op = visible(b, 0.04, 1.2, 0.08);
  const ancho = 760;
  return (
    <div style={{ position: "absolute", top: 250, left: (1080 - ancho) / 2, width: ancho, opacity: op, transform: `scale(${pop(b, 0.04)})` }}>
      <div style={{ fontFamily: INTER, fontWeight: 900, fontSize: 46, color: K.tinta, textAlign: "center", textShadow: "0 4px 18px #000" }}>ESFUERZO PERCIBIDO ↓</div>
      <div style={{ marginTop: 16, height: 46, borderRadius: 23, background: "rgba(255,255,255,0.12)", border: "3px solid rgba(255,255,255,0.25)", overflow: "hidden" }}>
        <div
          style={{
            width: `${nivel * 100}%`,
            height: "100%",
            borderRadius: 23,
            background: `linear-gradient(90deg, ${K.lima}, ${K.amarillo} 60%, ${K.rojo})`,
            boxShadow: `0 0 24px ${K.amarillo}88`,
          }}
        />
      </div>
    </div>
  );
};

// 3 · Resultado: menos esfuerzo, mas concentracion, fuerza y resistencia ---------------------------
const Rinde: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const sprint = b < 0.62;
  const cam = sprint
    ? camara(
        [
          { b: 0, p: [4.4, 1.3, 4.6], l: [0, 0.68, 0], fov: 36 },
          { b: 0.62, p: [3.0, 1.2, 5.4], l: [0, 0.68, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: 0.62, p: [2.4, 1.4, 5.8], l: [0, 0.7, 0], fov: 36 },
          { b: 1, p: [-1.8, 1.4, 5.8], l: [0, 0.7, 0], fov: 36 },
        ],
        b,
      );
  const k = Math.sin(((b * 5) % 1) * Math.PI);
  const nivel = mix(0.85, 0.55, entre(b, 0.08, 0.35));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {sprint ? <Atleta ej="sprint" fase={b * 30} brilla={0.85} colorBrillo={K.amarillo} /> : <Atleta ej="sentadilla" k={k} brilla={0.9} colorBrillo={K.amarillo} pesa={false} />}
        <Piso color={K.amarillo} />
      </Escena3D>
      <Destello b={b} en={[0.62]} />
      <Medidor b={b} nivel={nivel} />
      <Chip b={b} a={0.42} z={1.2} t="↑ CONCENTRACIÓN" x={540} y={1010} color={K.cian} />
      <Chip b={b} a={0.7} z={1.2} t="↑ FUERZA" x={330} y={1100} color={K.lima} />
      <Chip b={b} a={0.8} z={1.2} t="↑ RESISTENCIA" x={740} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 4 · Dosis: 3-6 mg/kg, 30-60 min antes ------------------------------------------------------------
const Dosis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.7, 6.4], l: [0, 0.75, 0], fov: 38 },
      { b: 1, p: [0.9, 1.5, 6.0], l: [0, 0.75, 0], fov: 38 },
    ],
    b,
  );
  const reloj = entre(b, 0.42, 0.55);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Taza p={[-0.65, 0, 0]} escala={1.25} b={b} giro={-0.5 + b * 0.6} />
        <group rotation={[0, b * 1.4, 0]} position={[0.75, 0.55, 0.2]}>
          <Capsula p={[0, 0, 0]} rot={[0, 0, 0.5]} escala={4.2} />
        </group>
        {reloj > 0 ? <Reloj p={[0, 1.95, -0.2]} escala={0.9 * reloj} t={lineal(b, 0.45, 0.75) * 0.75} /> : null}
        <Piso color={CAFE_TXT} r={1.6} brillo={0.25} />
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Dato b={b} a={0.04} z={1.2} t="3–6 mg/kg" sub="de peso corporal" color={CAFE_TXT} y={250} tam={130} />
      <Chip b={b} a={0.45} z={1.2} t="⏱ 30–60 MIN ANTES" x={540} y={1010} color={K.cian} />
      <Chip b={b} a={0.78} z={1.2} t="EMPIEZA POR LA PARTE BAJA" x={540} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 5 · Ejemplo: 70 kg x 3 mg = 210 mg ≈ 2 tazas ------------------------------------------------------
const Ejemplo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.6, 1.1, 5.8], l: [0, 0.75, 0], fov: 36 },
      { b: 1, p: [-1.0, 1.2, 6.2], l: [0, 0.75, 0], fov: 36 },
    ],
    b,
  );
  const tazas = [0.62, 0.72].map((a) => entre(b, a, a + 0.1));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group position={[0, 0.06, 0]}>
          <Atleta ej="parado" brilla={0.15} />
        </group>
        <Bascula />
        <Piso color={K.cian} />
        {tazas.map((t, i) =>
          t > 0 ? <Taza key={i} p={[i ? 0.72 : -0.72, 0.85, 0.35]} escala={0.42 * pop(b, i ? 0.72 : 0.62)} b={b + i * 0.3} giro={-0.6 + i * 1.2} brillo={0.15} /> : null,
        )}
      </Escena3D>
      <Dato b={b} a={0.03} z={0.36} t="70 kg" sub="de peso" color={K.cian} y={260} tam={130} />
      <Dato b={b} a={0.36} z={1.2} t="× 3 mg = 210 mg" sub="70 kg × 3 mg/kg" color={CAFE_TXT} y={260} tam={100} />
      <Chip b={b} a={0.66} z={1.2} t="≈ 2 TAZAS DE CAFÉ" x={540} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// ---- Barra 0-400 mg (HTML) ------------------------------------------------------------------------
const Barra: React.FC<{ b: number; f: number; op: number }> = ({ b, f, op }) => {
  const ancho = 800;
  const mg = Math.round((f * 400) / 10) * 10;
  return (
    <div style={{ position: "absolute", top: 1000, left: (1080 - ancho) / 2, width: ancho, opacity: op * visible(b, 0.04, 1.2, 0.06) }}>
      <div style={{ height: 40, borderRadius: 20, background: "rgba(255,255,255,0.12)", border: "3px solid rgba(255,255,255,0.25)", overflow: "hidden" }}>
        <div style={{ width: `${f * 100}%`, height: "100%", background: `linear-gradient(90deg, ${CAFE_TXT}, ${K.naranja})`, boxShadow: `0 0 20px ${K.naranja}88` }} />
      </div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontFamily: INTER, fontWeight: 800, fontSize: 28, color: K.suave }}>
        {[0, 100, 200, 300, 400].map((m) => (
          <span key={m} style={{ color: mg >= m && m > 0 ? K.tinta : K.suave }}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
};

// 6 · Limite diario y sueno ------------------------------------------------------------------------
const Limite: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const noche = b >= 0.55;
  const cam = noche
    ? camara(
        [
          { b: 0.55, p: [1.6, 1.9, 6.0], l: [0, 0.75, 0], fov: 38 },
          { b: 1, p: [-0.6, 1.7, 5.4], l: [0, 0.75, 0], fov: 38 },
        ],
        b,
      )
    : camara(
        [
          { b: 0, p: [0, 1.2, 6.6], l: [0, 0.45, 0], fov: 38 },
          { b: 0.55, p: [0.5, 1.3, 6.2], l: [0, 0.45, 0], fov: 38 },
        ],
        b,
      );
  const llena = entre(b, 0.06, 0.4);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={noche ? "#141a3a" : K.fondo2}>
        {noche ? (
          <>
            <Cama p={[-0.2, 0, 0]} escala={1.0} />
            <Luna p={[0.75, 2.05, -0.6]} escala={0.8} />
            {Array.from({ length: 18 }).map((_, i) => (
              <mesh key={i} position={[(rnd(`es${i}`) - 0.5) * 6, 1.6 + rnd(`ey${i}`) * 2.4, -2.5]}>
                <sphereGeometry args={[0.025, 6, 6]} />
                <meshBasicMaterial color="#fff6d0" />
              </mesh>
            ))}
            <Taza p={[1.05, 0, 0.75]} escala={0.45} b={b} vapor={0.6} />
            <Tache p={[1.05, 0.28, 1.05]} escala={0.5 * entre(b, 0.7, 0.8)} />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => {
            const a = 0.06 + i * 0.085;
            const t = entre(b, a, a + 0.06);
            return t > 0 ? <Taza key={i} p={[-1.05 + i * 0.7, 0, 0]} escala={0.5 * pop(b, a)} b={b + i * 0.2} giro={-0.4} brillo={i === 3 ? 0.15 * entre(b, 0.38, 0.45) : 0} /> : null;
          })
        )}
        {noche ? null : <Piso color={K.naranja} r={1.6} brillo={0.2} />}
      </Escena3D>
      <Destello b={b} en={[0.55]} />
      {noche ? null : <Barra b={b} f={llena} op={1} />}
      <Dato b={b} a={0.36} z={0.55} t="Máx. 400 mg/día" sub="adulto sano ≈ 4 tazas" color={K.naranja} y={260} tam={100} />
      <Dato b={b} a={0.58} z={1.2} t="6–8 h" sub="sin cafeína antes de dormir" color={K.morado} y={260} tam={130} />
      <Chip b={b} a={0.7} z={1.2} t="6–8 H ANTES DE DORMIR" x={540} y={1100} color={K.morado} />
    </AbsoluteFill>
  );
};

// 7 · Precauciones -----------------------------------------------------------------------------------
const Precaucion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.2, 5.6], l: [0, -0.3, 0], fov: 38 },
      { b: 1, p: [0.6, 0.3, 5.0], l: [0, -0.3, 0], fov: 38 },
    ],
    b,
  );
  // latido: doble golpe (lub-dub) unas 9 veces durante la escena
  const ciclo = (b * 9) % 1;
  const pulso = Math.max(Math.exp(-Math.pow((ciclo - 0.1) / 0.05, 2)), 0.6 * Math.exp(-Math.pow((ciclo - 0.3) / 0.05, 2)));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, Math.sin(b * 3) * 0.35, 0]}>
          <Corazon p={[0, 0, 0]} escala={0.75} pulso={pulso} />
        </group>
        <Polvo b={b} radio={4} color="#ffb0b0" />
      </Escena3D>
      <Titular b={b} a={0.02} z={0.8} y={290} tam={120} t="Precaución" color={K.naranja} />
      <Chip b={b} a={0.1} z={1.2} t="PRESIÓN ALTA" x={310} y={1010} color={K.rojo} />
      <Chip b={b} a={0.22} z={1.2} t="ANSIEDAD" x={770} y={1010} color={K.naranja} />
      <Chip b={b} a={0.36} z={1.2} t="CORAZÓN" x={310} y={1100} color={K.rosa} />
      <Chip b={b} a={0.56} z={1.2} t="EMBARAZO" x={770} y={1100} color={K.morado} />
      <Dato b={b} a={0.8} z={1.2} t="Consulta antes" sub="con tu médico" color={K.lima} y={260} tam={110} />
    </AbsoluteFill>
  );
};

const T = [
  "¿Por qué la **cafeína** antes de entrenar te hace rendir más?",
  "Durante el día se acumula en tu cerebro la **adenosina**, que se une a sus receptores y te da **cansancio**.",
  "La cafeína tiene una forma parecida: **bloquea esos receptores**, y la sensación de fatiga baja.",
  "Resultado: sientes menos esfuerzo, te concentras mejor y rindes un poco más en **fuerza y resistencia**.",
  "La dosis estudiada es de **3 a 6 mg por kilo** de peso, unos **30 a 60 minutos** antes. Empieza por la parte baja.",
  "Para alguien de 70 kilos, 3 mg por kilo son unos **210 mg**: más o menos dos tazas de café.",
  "No pases de **400 mg al día** si eres adulto sano, y evítala de 6 a 8 horas antes de dormir.",
  "Si tienes presión alta, ansiedad, problemas del corazón o estás embarazada, **consulta antes**.",
  "Sígueme para más **nutrición explicada con ciencia**.",
];

const ESCENAS = [Gancho, Adenosina1, Bloqueo, Rinde, Dosis, Ejemplo, Limite, Precaucion, EscenaCierre];

export const CAFEINA: ShortDef = {
  id: "Short-Cafeina",
  titulo: "Cafeína antes de entrenar: cómo funciona",
  planos: ESCENAS.map((Escena, i) => ({ id: `cafeina-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
