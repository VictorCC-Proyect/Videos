// Short: Cardio en ayunas. Insulina baja -> lipólisis -> más oxidación de grasa en la sesión, pero mismo resultado a largo plazo.
// Del atleta trotando al amanecer al hígado, el adipocito y la mitocondria; luego la comparación sesión / día / semanas.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../fisio/motor";
import { Polvo, rnd } from "../fisio/modelos/comun";
import { Cadena, Glucogeno, GotaLipido, Higado, MitocondriaGrande, Mol, Vaso } from "../fisio/modelos/energia";
import { CilindroX } from "../fisio/modelos/musculo";
import { Humano } from "../fisio/modelos/cuerpo";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { ANTON, Chip, Dato, Destello, INTER, K, ShortDef, Titular } from "./marco";
import { Atleta, Bascula, Pechuga, Piso, Plato } from "./modelos";
import { Adipocito } from "./modelos-ayuno";
import { Columna } from "./modelos-energia";
import { BalanzaPlatos, BarraApilada, Bloque, LlamaGasto, platilloBalanza, Reloj3D, Sol, Velocimetro } from "./modelos-ayunas";

const GRASO = K.amarillo;
const GRASO2 = "#c98a00";
const CARBO = K.cian;
const INSULINA = "#4f8dff";
const HIGADO = "#e88a7a";
const GLUCOGENO = "#8f74ff";

const Final: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Entrenas en <span style={{ color: K.lima }}>ayunas</span>?</>}
    escribe="Yo entreno…"
    ideas={["EN AYUNAS", "DESAYUNO ANTES", "DEPENDE DEL DÍA"]}
  />
);

/** Leyenda pequena GRASA / CARBOHIDRATO. */
const Leyenda: React.FC<{ b: number; a: number; y?: number; carbo?: boolean }> = ({ b, a, y = 460, carbo = true }) => (
  <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40, opacity: visible(b, a, 1.2, 0.08), fontFamily: INTER, fontWeight: 900, fontSize: 30 }}>
    <span style={{ color: GRASO }}>■ GRASA</span>
    {carbo ? <span style={{ color: CARBO }}>■ CARBOHIDRATO</span> : null}
  </div>
);

const Nota: React.FC<{ b: number; t: string; y?: number }> = ({ b, t, y = 1160 }) => (
  <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: INTER, fontWeight: 700, fontSize: 24, color: K.suave, opacity: visible(b, 0.1, 1.2) }}>{t}</div>
);

// 0 · Gancho: trotando al amanecer, en ayunas ---------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [2.6, 1.3, 7.4], l: [0, 0.55, 0], fov: 36 },
      { b: 1, p: [-2.1, 1.2, 7.0], l: [0, 0.57, 0], fov: 36 },
    ],
    b,
  );
  const sube = entre(b, 0, 0.8);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#6a3340">
        <Sol p={[-1.6, mix(-0.4, 1.4, sube), -9]} r={0.9} brillo={0.6 + 0.4 * sube} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <circleGeometry args={[30, 64]} />
          <meshStandardMaterial color="#1b1418" roughness={0.95} />
        </mesh>
        <Humano fase={b * 22} marcha={0.9} musculo={0.8} brilla={0.15 + 0.35 * entre(b, 0.55, 0.75)} colorBrillo={GRASO} />
        <Piso color={K.naranja} />
        <Reloj3D p={[0.82, 1.45, 0.2]} r={0.27} hora={6} color={K.naranja} />
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={[{ p: [0.82, 1.2, 0.2], t: "6:00 a. m.", a: 0.1, z: 1.2, o: [-20, 110], color: K.naranja }]} />
      <Titular b={b} a={0.03} z={1.2} y={260} tam={104} t="¿Quema más grasa?" />
      <Chip b={b} a={0.25} z={1.2} t="CARDIO EN AYUNAS" x={540} y={415} color={K.lima} />
    </AbsoluteFill>
  );
};

// 1 · Tras la noche: insulina baja y glucogeno del higado reducido ------------------
const Noche: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const corte = 0.18;
  const fuera = b < corte;
  const cam = fuera
    ? camara(
        [
          { b: 0, p: [0.5, 1.2, 5.8], l: [0, 0.75, 0], fov: 36 },
          { b: corte, p: [-0.05, 1.12, 1.4], l: [-0.08, 1.1, 0], fov: 36 },
        ],
        b,
      )
    : camara(
        [
          { b: corte, p: [0, 0.9, 11.5], l: [0, 0.35, 0], fov: 40 },
          { b: 1, p: [0.7, 0.8, 10.8], l: [0, 0.35, 0], fov: 40 },
        ],
        b,
      );
  const baja = entre(b, 0.28, 0.55);
  const vacia = entre(b, 0.6, 0.92);
  const insul = Math.round(mix(8, 2, baja));
  const vy = -0.6;
  const gl: V3 = [-0.2, 1.35, 0.75];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={fuera ? undefined : [8, 24]}>
        {fuera ? (
          <>
            <Atleta ej="parado" brilla={0.15} />
            <Piso />
          </>
        ) : (
          <>
            <group position={[-0.35, 1.3, -0.5]} scale={1.1}>
              <Higado brillo={0.08 + 0.15 * vacia} />
            </group>
            <Glucogeno p={gl} escala={mix(3.0, 1.1, vacia)} op={mix(1, 0.7, vacia)} />
            <Vaso desde={[-3.2, vy, 0]} hasta={[3.2, vy, 0]} t={b * 1.1} radio={0.5} />
            {Array.from({ length: insul }).map((_, i) => {
              const f = (b * 0.5 + i / insul) % 1;
              return <Mol key={i} p={[mix(-3, 3, f), vy + Math.cos(i * 2.3) * 0.15, 0.3]} color={INSULINA} r={0.1} />;
            })}
            <Columna p={[1.85, -0.25, 0.6]} nivel={mix(0.8, 0.15, baja)} color={INSULINA} alto={1.0} r={0.14} />
            <Polvo b={b} radio={6} />
          </>
        )}
      </Escena3D>
      <Destello b={b} en={[corte]} />
      {!fuera ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [1.85, 0.35, 0.6], t: "Insulina ↓", a: 0.3, z: 1.2, o: [-40, 170], color: INSULINA },
            { p: [-1.5, 1.6, 0.3], t: "Hígado", a: 0.55, z: 1.2, o: [-20, -110], color: HIGADO },
            { p: gl, t: "Glucógeno ↓", a: 0.68, z: 1.2, o: [60, -150], color: GLUCOGENO },
          ]}
        />
      ) : null}
      <Dato b={b} a={0.03} z={1.2} t="Al despertar" sub="toda la noche sin comer" color={INSULINA} y={250} tam={100} />
    </AbsoluteFill>
  );
};

// 2 · Lipolisis: el adipocito suelta acidos grasos que viajan al musculo ------------
const Lipolisis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.6, 17], l: [0, -0.35, 0], fov: 40 },
      { b: 0.72, p: [0.4, 0.4, 15.5], l: [0.2, -0.45, 0], fov: 40 },
      { b: 1, p: [0.9, -0.3, 11.5], l: [0.6, -1.0, 0], fov: 40 },
    ],
    b,
  );
  const suelta = entre(b, 0.3, 0.9);
  const ad: V3 = [-0.9, 1.2, 0];
  const vy = 0;
  const mito: V3 = [1.0, -1.4, 0.75];
  const llega = entre(b, 0.8, 0.95);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} niebla={[9, 28]}>
        <Adipocito p={ad} r={0.82} gota={mix(0.74, 0.55, suelta)} brillo={0.15 * suelta} />
        <Vaso desde={[-3.2, vy, 0]} hasta={[3.2, vy, 0]} t={b * 1.1} radio={0.5} />
        {Array.from({ length: 2 }).map((_, i) => {
          const f = (b * 0.5 + i / 2) % 1;
          return <Mol key={`i${i}`} p={[mix(-3, 3, f), vy - 0.2, 0.3]} color={INSULINA} r={0.09} />;
        })}
        <group position={[0, -1.4, -0.4]}>
          <CilindroX radio={0.6} largo={6} x={3} color="#c03a46" estriado={6} opacidad={0.75} />
        </group>
        <group position={mito} scale={0.34}>
          <MitocondriaGrande brillo={0.5 * llega} />
        </group>
        {Array.from({ length: 9 }).map((_, i) => {
          const a = 0.3 + i * 0.055;
          const k = lineal(b, a, a + 0.38);
          if (k <= 0) return null;
          const p0: V3 = [ad[0] + 0.3 + (rnd(`a${i}`) - 0.5) * 0.6, ad[1] - 0.7, 0.4];
          const p1: V3 = [ad[0] + 0.6 + i * 0.22, vy + 0.1, 0.35];
          const p2: V3 = [mito[0] - 0.4 + (rnd(`m${i}`) - 0.5) * 0.5, mito[1] + 0.05, mito[2] + 0.2];
          const p = k < 0.5 ? mix3(p0, p1, k * 2) : mix3(p1, p2, (k - 0.5) * 2);
          return <Cadena key={i} n={7} p={[p[0] - 0.36, p[1], p[2]]} color={GRASO} sep={0.11} brillo={0.6} op={k > 0.95 ? (1 - k) * 20 : 1} />;
        })}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.8, vy - 0.2, 0.3], t: "Insulina baja", a: 0.05, z: 0.6, o: [10, 120], color: INSULINA },
          { p: [ad[0] + 0.5, ad[1] + 0.7, 0], t: "Tejido adiposo", a: 0.22, z: 0.78, o: [110, -20], color: GRASO },
          { p: [0.3, vy + 0.15, 0.35], t: "Ácidos grasos", a: 0.48, z: 1.2, o: [60, -60], color: GRASO },
          { p: [-1.6, -1.4, 0.6], t: "Músculo", a: 0.75, z: 1.2, o: [-10, 120], color: K.rojo },
          { p: mito, t: "Mitocondria", a: 0.85, z: 1.2, o: [-40, 120], color: K.naranja },
        ]}
      />
      <Dato b={b} a={0.3} z={1.2} t="Lipólisis ↑" sub="se libera más grasa" color={GRASO} y={250} tam={104} />
    </AbsoluteFill>
  );
};

// Corredor pequeno con dos columnas (grasa / carbohidrato) ------------------------
const Grupo: React.FC<{ x: number; b: number; grasa: number; carbo: number; brilla: string }> = ({ x, b, grasa, carbo, brilla }) => (
  <group position={[x, 0, 0]}>
    <group position={[0, 0, -0.3]} scale={0.72}>
      <Humano fase={b * 20 + x} marcha={0.85} musculo={0.8} brilla={0.35} colorBrillo={brilla} />
    </group>
    <Columna p={[-0.42, 0, 0.35]} nivel={grasa} color={GRASO} alto={1.4} r={0.13} />
    <Columna p={[0.42, 0, 0.35]} nivel={carbo} color={CARBO} alto={1.4} r={0.13} />
  </group>
);

// 3 · Durante la sesion: en ayunas se oxida mas grasa --------------------------------
const Sesion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.6, 1.2, 9.2], l: [0, 0.3, 0], fov: 36 },
      { b: 1, p: [-0.5, 1.1, 8.8], l: [0, 0.3, 0], fov: 36 },
    ],
    b,
  );
  const g = entre(b, 0.15, 0.6);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Grupo x={-0.88} b={b} grasa={mix(0.05, 0.8, g)} carbo={mix(0.05, 0.4, g)} brilla={GRASO} />
        <Grupo x={0.88} b={b} grasa={mix(0.05, 0.45, g)} carbo={mix(0.05, 0.75, g)} brilla={CARBO} />
        <Piso r={2.1} color={K.lima} brillo={0.25} />
      </Escena3D>
      <Leyenda b={b} a={0.1} />
      <Titular b={b} a={0.02} z={0.45} y={270} tam={96} t="Durante el cardio" />
      <Dato b={b} a={0.45} z={1.2} t="Sí: + grasa" sub="durante la sesión" color={GRASO} y={250} tam={104} />
      <Chip b={b} a={0.08} z={1.2} t="AYUNAS" x={270} y={1100} color={GRASO} />
      <Chip b={b} a={0.16} z={1.2} t="DESAYUNASTE" x={810} y={1100} color={CARBO} />
    </AbsoluteFill>
  );
};

// 4 · El dia completo: despues se compensa y la grasa total se iguala ---------------
const Dia: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.5, 1.4, 10], l: [0, 0.3, 0], fov: 36 },
      { b: 1, p: [-0.5, 1.3, 9.6], l: [0, 0.3, 0], fov: 36 },
    ],
    b,
  );
  const hora = 6 + 24 * entre(b, 0.08, 0.5);
  const resto = entre(b, 0.5, 0.88);
  const iguala = entre(b, 0.86, 0.95);
  const sA = 0.7;
  const sD = 0.35;
  const rA = 0.9 * resto;
  const rD = 1.25 * resto;
  const xA = -0.65;
  const xD = 0.65;
  const tope = 0.08 + 1.6;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Reloj3D p={[0, 1.15, 0.1]} r={0.3} hora={hora} color={K.lima} />
        <BarraApilada p={[xA, 0, 0]} segs={[{ v: sA, color: GRASO }, { v: rA, color: GRASO2 }]} r={0.26} alto={1.75} />
        <BarraApilada p={[xD, 0, 0]} segs={[{ v: sD, color: GRASO }, { v: rD, color: GRASO2 }]} r={0.26} alto={1.75} />
        {iguala > 0 ? (
          <mesh position={[0, tope, 0]} scale={[iguala, 1, 1]}>
            <boxGeometry args={[2.1, 0.03, 0.03]} />
            <meshBasicMaterial color={K.lima} />
          </mesh>
        ) : null}
        <Piso r={1.8} color={K.lima} brillo={0.25} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [xA - 0.26, 0.08 + sA / 2, 0], t: "Sesión", a: 0.12, z: 1.2, o: [-20, 0], color: GRASO },
          { p: [xA - 0.26, 0.08 + sA + rA / 2, 0], t: "Resto del día", a: 0.62, z: 1.2, o: [-20, -40], color: GRASO2 },
          { p: [xD + 0.26, 0.08 + sD + rD / 2, 0], t: "+ carbohidrato", a: 0.7, z: 0.88, o: [20, 0], color: CARBO },
          { p: [xD + 0.3, tope, 0], t: "≈ igual", a: 0.9, z: 1.2, o: [20, -30], color: K.lima },
        ]}
      />
      <Dato b={b} a={0.03} z={0.6} t="Día completo" sub="grasa usada en 24 h" color={K.lima} y={250} tam={104} />
      <Dato b={b} a={0.6} z={1.2} t="El cuerpo compensa" sub="menos grasa el resto del día" color={K.lima} y={250} tam={88} />
      <Chip b={b} a={0.06} z={1.2} t="AYUNAS" x={330} y={1100} color={GRASO} />
      <Chip b={b} a={0.06} z={1.2} t="DESAYUNASTE" x={750} y={1100} color={CARBO} />
    </AbsoluteFill>
  );
};

// 5 · Semanas con las mismas calorias: misma perdida de grasa ------------------------
const Semanas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0.7, 1.3, 8.6], l: [0, 0.45, 0], fov: 36 },
      { b: 1, p: [-0.6, 1.2, 8.2], l: [0, 0.45, 0], fov: 36 },
    ],
    b,
  );
  const sem = 1 + Math.floor(lineal(b, 0.08, 0.6) * 7.99);
  const baja = entre(b, 0.1, 0.75);
  const plato = entre(b, 0.58, 0.68);
  const lado = (x: number, color: string) => (
    <group position={[x, 0, 0]}>
      <group scale={0.7}>
        <group position={[0, 0.06, 0]}>
          <Atleta ej="parado" brilla={0.2} colorBrillo={color} />
        </group>
        <Bascula />
      </group>
      <GotaLipido p={[0, 1.5, 0]} r={mix(0.26, 0.15, baja)} />
      {plato > 0 ? (
        <group position={[0, 0.02, 0.6]} scale={plato}>
          <Plato p={[0, 0, 0]} escala={0.45} />
          <Pechuga p={[0, 0.06, 0]} escala={0.35} />
        </group>
      ) : null}
    </group>
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {lado(-0.72, GRASO)}
        {lado(0.72, CARBO)}
        <Piso r={1.7} color={K.lima} brillo={0.25} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.72, 1.5, 0], t: "Grasa corporal", a: 0.12, z: 0.6, o: [60, 50], color: GRASO },
        ]}
      />
      <div style={{ position: "absolute", top: 460, left: 0, right: 0, textAlign: "center", opacity: visible(b, 0.05, 0.8, 0.06), fontFamily: ANTON, fontSize: 56, color: K.tinta, WebkitTextStroke: "6px #04090b", paintOrder: "stroke fill" }}>
        SEMANA {sem}
      </div>
      <Dato b={b} a={0.03} z={0.62} t="Varias semanas" sub="estudios comparando ambos" color={K.cian} y={250} tam={100} />
      <Dato b={b} a={0.62} z={1.2} t="Mismas calorías" sub="= misma pérdida de grasa" color={K.lima} y={250} tam={100} />
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 24, opacity: entre(b, 0.8, 0.88) }}>
        {["AYUNAS", "=", "DESAYUNO"].map((t, i) => (
          <div
            key={i}
            style={{
              fontFamily: i === 1 ? ANTON : INTER,
              fontWeight: 900,
              fontSize: i === 1 ? 70 : 38,
              color: i === 1 ? K.lima : "#061317",
              background: i === 1 ? "transparent" : i === 0 ? GRASO : CARBO,
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
      <Nota b={b} t="Schoenfeld 2014 · Hackett y Hagstrom 2017" y={1165} />
    </AbsoluteFill>
  );
};

// 6 · Sesiones intensas o largas: puedes rendir menos y gastar menos ----------------
const Rendimiento: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.6, 1.3, 7.2], l: [0.1, 0.72, 0], fov: 36 },
      { b: 1, p: [-1.2, 1.2, 7.0], l: [0.1, 0.72, 0], fov: 36 },
    ],
    b,
  );
  const cae = entre(b, 0.3, 0.6);
  const gasto = entre(b, 0.68, 0.9);
  const nivel = mix(0.85, 0.42, cae) + Math.sin(b * 50) * 0.015;
  const vel: V3 = [0.72, 1.3, 0.3];
  const ll: V3 = [-0.72, 0, 0.35];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <Atleta ej="sprint" fase={b * mix(30, 20, cae)} brilla={mix(0.7, 0.25, cae)} colorBrillo={K.naranja} />
        <Piso color={K.naranja} />
        <Velocimetro p={vel} nivel={nivel} r={0.36} />
        <LlamaGasto p={ll} escala={mix(1.0, 0.5, gasto)} b={b} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [vel[0], vel[1] + 0.45, vel[2]], t: "Rendimiento", a: 0.2, z: 1.2, o: [-30, -45], color: K.lima },
          { p: [ll[0], ll[1] + 0.5, ll[2]], t: "Gasto total", a: 0.68, z: 1.2, o: [20, -90], color: K.naranja },
        ]}
      />
      <Dato b={b} a={0.03} z={0.66} t="Intensa o larga" sub="en ayunas puedes rendir menos" color={K.naranja} y={250} tam={100} />
      <Dato b={b} a={0.66} z={1.2} t="− gasto total" sub="menos calorías quemadas" color={K.naranja} y={250} tam={104} />
      <Chip b={b} a={0.45} z={1.2} t="PUEDE BAJAR" x={780} y={1100} color={K.amarillo} />
    </AbsoluteFill>
  );
};

// 7 · Conclusion: lo que mas pesa es el deficit y la constancia ---------------------
const Conclusion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.0, 2.3, 9.4], l: [0, 0.85, 0], fov: 38 },
      { b: 1, p: [-0.9, 2.1, 8.9], l: [0, 0.85, 0], fov: 38 },
    ],
    b,
  );
  const d1 = entre(b, 0.74, 0.8);
  const d2 = entre(b, 0.88, 0.94);
  const ang = mix(-0.08, 0.14, d1) + 0.08 * d2 + Math.sin(b * 6) * 0.01;
  const izq = platilloBalanza(-1, ang);
  const der = platilloBalanza(1, ang);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <BalanzaPlatos
          ang={ang}
          izq={<Bloque p={[0, 0, 0]} tam={[0.32, 0.2, 0.32]} color={K.morado} />}
          der={
            <group>
              {d1 > 0 ? <Bloque p={[0, mix(1.6, 0, d1), 0]} tam={[0.8, 0.34, 0.55]} color={K.naranja} /> : null}
              {d2 > 0 ? <Bloque p={[0, 0.34 + mix(1.6, 0, d2), 0]} tam={[0.62, 0.3, 0.45]} color={K.cian} /> : null}
            </group>
          }
        />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [izq[0], izq[1] + 0.2, 0], t: "Ayunas vs desayuno", a: 0.08, z: 1.2, o: [20, 200], color: K.morado },
          { p: [der[0] + 0.4, der[1] + 0.17, 0], t: "Déficit calórico", a: 0.78, z: 1.2, o: [-80, 200], color: K.naranja },
          { p: [der[0] + 0.31, der[1] + 0.49, 0], t: "Constancia", a: 0.92, z: 1.2, o: [-40, -130], color: K.cian },
        ]}
      />
      <Titular b={b} a={0.02} z={0.62} y={270} tam={110} t="Conclusión" />
      <Dato b={b} a={0.62} z={1.2} t="Lo que más pesa" sub="déficit calórico + constancia" color={K.lima} y={250} tam={100} />
      <Chip b={b} a={0.2} z={0.66} t="¿TE VA BIEN? ADELANTE" x={540} y={460} color={K.lima} />
      <Chip b={b} a={0.46} z={0.66} t="SI NO, DESAYUNA" x={540} y={545} color={K.cian} />
    </AbsoluteFill>
  );
};

const T = [
  "¿Hacer cardio en ayunas quema más grasa? Muchos lo juran. Vamos a ver qué pasa en tu cuerpo.",
  "Después de una noche sin comer, tu **insulina** está baja y el glucógeno de tu hígado también.",
  "Con la insulina baja, el tejido adiposo libera más **ácidos grasos**, que viajan por la sangre hasta el músculo.",
  "Así que sí: durante el cardio en ayunas **quemas más grasa** que si hubieras desayunado.",
  "Pero lo que cuenta es el **día completo**: después tu cuerpo compensa, usando más carbohidratos y menos grasa.",
  "Cuando los estudios comparan la pérdida de grasa durante semanas, con las **mismas calorías**, no encuentran una diferencia importante.",
  "Además, en ayunas puedes rendir menos en sesiones **intensas o largas**, y eso significa gastar menos en total.",
  "Conclusión: si te sientes bien en ayunas y te ayuda a ser constante, adelante. Si no, desayuna. Lo que más pesa es tu **déficit calórico** y tu constancia.",
  "¿Tú entrenas en ayunas o desayunas antes? **Escríbelo en los comentarios**.",
];

const ESCENAS = [Gancho, Noche, Lipolisis, Sesion, Dia, Semanas, Rendimiento, Conclusion, Final];

export const AYUNAS: ShortDef = {
  id: "Short-Ayunas",
  titulo: "Cardio en ayunas: ¿quema más grasa?",
  planos: ESCENAS.map((Escena, i) => ({ id: `ayunas-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
