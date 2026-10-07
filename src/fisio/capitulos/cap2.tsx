import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, mix, PlanoDef, useBeat, V3, visible } from "../motor";
import { hexPack, Polvo, rnd, texCorte, Tubo } from "../modelos/comun";
import { CilindroX, MoleculaMiosina, Mitocondria } from "../modelos/musculo";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Rico, Tabla, Tarjeta } from "../ui";

const SEC = "1.2 Fibras musculares";

const colorTipo = (t: number) => (t === 0 ? C.tipoI : t === 1 ? C.tipoIIA : C.tipoIIX);

/** Corte transversal de un musculo: mosaico de fibras de distintos tipos. */
const Mosaico: React.FC<{
  pI: number;
  pIIA: number;
  pos?: V3;
  radio?: number;
  semilla?: string;
  encoge?: number; // envejecimiento: fibras tipo II mas pequenas y algunas desaparecen
  pulso?: number;
}> = ({ pI, pIIA, pos = [0, 0, 0], radio = 1.6, semilla = "m", encoge = 0, pulso = 0 }) => {
  const celdas = useMemo(() => hexPack(radio, 0.2), [radio]);
  return (
    <group position={pos}>
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[radio + 0.14, radio + 0.14, 0.3, 64]} />
        <meshStandardMaterial color="#f3d6c8" roughness={0.7} />
      </mesh>
      {celdas.map(([x, z], i) => {
        const r = rnd(`${semilla}${i}`);
        const tipo = r < pI ? 0 : r < pI + pIIA ? 1 : 2;
        const pierde = tipo > 0 && rnd(`${semilla}p${i}`) < 0.35 * encoge;
        const esc = (tipo > 0 ? 1 - 0.35 * encoge : 1) * (pierde ? 0.3 : 1);
        const col = pierde ? "#f3d6c8" : colorTipo(tipo);
        const jx = (rnd(`${semilla}x${i}`) - 0.5) * 0.03;
        const jz = (rnd(`${semilla}z${i}`) - 0.5) * 0.03;
        return (
          <mesh key={i} position={[x + jx, 0, z + jz]} scale={[esc, 1, esc]}>
            <cylinderGeometry args={[0.093, 0.093, 0.24 + (tipo === 0 ? 0.04 : 0), 7]} />
            <meshPhysicalMaterial
              color={col}
              emissive={col}
              emissiveIntensity={0.08 + pulso * 0.5}
              roughness={0.45}
              clearcoat={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const Leyenda: React.FC<{ op?: number }> = ({ op = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      top: 130,
      opacity: op,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      fontFamily: FUENTE,
      fontSize: 28,
      color: C.texto,
      background: "rgba(4,9,20,0.8)",
      padding: "16px 22px",
      borderRadius: 14,
    }}
  >
    {[
      ["Tipo I (lenta, oxidativa)", C.tipoI],
      ["Tipo IIA (rápida, oxidativa-glucolítica)", C.tipoIIA],
      ["Tipo IIX (rápida, glucolítica)", C.tipoIIX],
    ].map(([t, c]) => (
      <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 26, height: 26, borderRadius: 13, background: c, display: "inline-block" }} />
        {t}
      </div>
    ))}
  </div>
);

// ===================================================================

const IntroFibras: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 4.2, 3.2], l: [0, 0, 0], fov: 40 },
      { b: 2, p: [1.2, 3.6, 2.6], l: [0, 0, 0], fov: 40 },
      { b: 3, p: [0, 4.4, 3.0], l: [0, 0, -0.3], fov: 40 },
      { b: 5, p: [-0.8, 4.0, 3.2], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  const color = entre(b, 0.8, 1.3);
  const miosina = visible(b, 3, 4.1);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, b * 0.15, 0]}>
          <Mosaico pI={mix(1, 0.5, color)} pIIA={mix(0, 0.25, color)} />
        </group>
        {miosina > 0 ? (
          <group position={[0.3, 1.4, 0.6]} rotation={[0.9, 0.3, 0]} scale={0.8 * miosina}>
            <MoleculaMiosina colorCola={C.acento2} colorS2={C.acento2} colorCabeza={C.acento2} ligeras={0.3} />
          </group>
        ) : null}
      </Escena3D>
      <Leyenda op={visible(b, 1, 3)} />
      <Etiquetas
        cam={cam}
        b={b}
        items={[{ p: [0.3, 1.4, 0.6], t: "Cadena pesada de miosina (MHC)", a: 3.1, z: 4, o: [80, -60], color: C.acento2 }]}
      />
      <Tarjeta b={b} a={4} z={5} x={60} y={130} w={620} titulo="Tipos de fibra" tam={27}>
        <Lista
          items={[
            "Mamíferos: **Tipo I** (lenta) y **Tipo II** (rápida: IIA, IID o IIX, IIB)",
            "Humano, fibras **puras**: **I, IIA y IIX** (la IIB **no** se expresa)",
            "Fibras **híbridas**: I + IIA, IIAX…",
            "Cada músculo: **mosaico** adaptado a su función",
          ]}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================

type Perfil = {
  nombre: string;
  color: string;
  radio: number;
  mito: number;
  capilares: number;
  nervio: number;
  glucogeno: number;
};

const PERFILES: Perfil[] = [
  { nombre: "Tipo I", color: C.tipoI, radio: 0.55, mito: 9, capilares: 7, nervio: 0.05, glucogeno: 3 },
  { nombre: "Tipo IIA", color: C.tipoIIA, radio: 0.68, mito: 5, capilares: 6, nervio: 0.11, glucogeno: 10 },
  { nombre: "Tipo IIX", color: C.tipoIIX, radio: 0.45, mito: 1, capilares: 2, nervio: 0.11, glucogeno: 18 },
];

const FibraTipo: React.FC<{ p: Perfil; z: number; brillo: number; b: number }> = ({ p, z, brillo, b }) => {
  const tapa = texCorte("#f6dccf", p.color, "#7a1d27", 20);
  return (
    <group position={[0, 0, z]}>
      <CilindroX radio={p.radio} largo={4} x={1.2} color={p.color} estriado={0} tapa={tapa} emisivo={0.05 + brillo * 0.25} />
      {/* mitocondrias */}
      {Array.from({ length: p.mito }).map((_, i) => {
        const a = (i / p.mito) * Math.PI * 2 + 0.3;
        return (
          <Mitocondria key={i} pos={[0.6 - (i % 3) * 0.9, Math.cos(a) * (p.radio + 0.04), Math.sin(a) * (p.radio + 0.04)]} rot={[a, 0, 0]} escala={0.55} />
        );
      })}
      {/* capilares */}
      {Array.from({ length: p.capilares }).map((_, i) => {
        const a = (i / p.capilares) * Math.PI * 2 + 1;
        const r = p.radio + 0.1;
        const pts: V3[] = Array.from({ length: 9 }).map((__, k) => {
          const x = 1.2 - k * 0.5;
          const aa = a + Math.sin(k * 0.9 + i) * 0.15;
          return [x, Math.cos(aa) * r, Math.sin(aa) * r];
        });
        return <Tubo key={i} puntos={pts} radio={0.025} color="#ff2440" emisivo={0.35} segmentos={40} />;
      })}
      {/* glucogeno */}
      {Array.from({ length: p.glucogeno }).map((_, i) => {
        const a = rnd(`gl${p.nombre}${i}`) * Math.PI * 2;
        const r = rnd(`glr${p.nombre}${i}`) * p.radio * 0.85;
        return (
          <mesh key={`g${i}`} position={[1.22, Math.cos(a) * r, Math.sin(a) * r]}>
            <sphereGeometry args={[0.028, 8, 6]} />
            <meshStandardMaterial color="#2c1e48" />
          </mesh>
        );
      })}
      {/* motoneurona */}
      <Tubo
        puntos={[
          [-0.6, p.radio, 0],
          [-0.7, p.radio + 0.5, 0.1],
          [-1.0, p.radio + 1.4, 0.2],
        ]}
        radio={p.nervio}
        color={C.nervio}
        emisivo={0.3 + (b > 0 ? Math.max(0, Math.sin(b * 20)) * brillo : 0)}
        segmentos={30}
      />
    </group>
  );
};

const TresFibras: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const zs = [-2.2, 0, 2.2];
  const cam = camara(
    [
      { b: 0, p: [3.4, 1.5, -0.9], l: [0.3, 0.2, -2.2], fov: 40 },
      { b: 0.8, p: [3.4, 1.5, -0.9], l: [0.3, 0.2, -2.2], fov: 40 },
      { b: 1, p: [3.4, 1.5, 1.3], l: [0.3, 0.2, 0], fov: 40 },
      { b: 1.8, p: [3.4, 1.5, 1.3], l: [0.3, 0.2, 0], fov: 40 },
      { b: 2, p: [3.4, 1.5, 3.5], l: [0.3, 0.2, 2.2], fov: 40 },
      { b: 3, p: [7.5, 3.0, 0.4], l: [0, 0, 0], fov: 40 },
      { b: 4, p: [7.5, 3.0, 0.4], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  const tablaOp = visible(b, 3, 4, 0.12);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {PERFILES.map((p, i) => (
          <FibraTipo key={p.nombre} p={p} z={zs[i]} b={b} brillo={visible(b, i, i + 1)} />
        ))}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={PERFILES.flatMap((p, i) => [
          { p: [1.2, p.radio, zs[i]] as V3, t: p.nombre, a: i, z: i + 1, o: [-60, -100] as [number, number], color: p.color },
          { p: [-0.9, p.radio + 1.2, zs[i] + 0.2] as V3, t: i === 0 ? "Motoneurona pequeña" : "Motoneurona grande", a: i + 0.2, z: i + 1, o: [-60, -50] as [number, number], color: C.nervio },
          { p: [0.6, p.radio + 0.05, zs[i]] as V3, t: i === 2 ? "Pocas mitocondrias" : "Mitocondrias", a: i + 0.3, z: i + 1, o: [60, -70] as [number, number], color: C.mitocondria },
          { p: [-0.4, -(p.radio + 0.1), zs[i]] as V3, t: i === 2 ? "Pocos capilares" : "Muchos capilares", a: i + 0.4, z: i + 1, o: [60, 70] as [number, number], color: "#ff2440" },
        ])}
      />
      <Tarjeta b={b} a={0} z={1} x={1340} y={130} w={520} titulo="Tipo I · lenta · oxidativa (ST)" color={C.tipoI} tam={25}>
        <Lista items={["Miosina **lenta**: hidroliza ATP despacio, gasta muy poca energía", "Calcio: túbulos T y retículo **sencillos**, liberación pausada", "**Aeróbica**: mitocondrias, sangre y mioglobina", "Nervios pequeños: **resistencia, no se cansan**"]} />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={2} x={1340} y={130} w={520} titulo="Tipo IIA · rápida · oxidativa-glucolítica (FOG)" color={C.tipoIIA} tam={25}>
        <Lista items={["Miosina **rápida**: contracciones potentes y rápidas", "Sistema de calcio **muy desarrollado**", "Energía **combinada** (O₂ + glucosa), buen glucógeno", "Nervios grandes: resistencia **media**; las **primeras rápidas** en activarse"]} />
      </Tarjeta>
      <Tarjeta b={b} a={2} z={3} x={1340} y={130} w={520} titulo="Tipo IIX / IID · rápida · glucolítica (FG)" color={C.tipoIIX} tam={25}>
        <Lista items={["La miosina **más rápida** del humano: máxima fuerza en milisegundos", "Sistema de calcio **más grande y eficiente**", "**Anaeróbica** (glucosa), pocas mitocondrias", "Se **fatiga rápido**: solo en esfuerzos **máximos o explosivos**"]} />
      </Tarjeta>
      {tablaOp > 0 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 110, opacity: tablaOp }}>
          <div style={{ width: 1500, background: "rgba(4,9,20,0.96)", borderRadius: 18, padding: "18px 26px", fontFamily: FUENTE, color: C.texto }}>
            <Tabla
              tam={25}
              anchos="1.4fr 1fr 1fr 1fr"
              cab={["Característica", "Lentas (tipo I)", "Intermedias (IIA)", "Rápidas (IIX)"]}
              b={b}
              a={3.05}
              paso={0.015}
              filas={[
                ["Diámetro", "Intermedio", "Grande", "Pequeño"],
                ["Grosor de línea Z", "Ancho", "Intermedio", "Estrecho"],
                ["Glucógeno", "Bajo", "Intermedio", "Alto"],
                ["Resistencia a la fatiga", "Alta", "Intermedia", "Baja"],
                ["Capilares", "Muchos", "Muchos", "Pocos"],
                ["Mioglobina", "Alto", "Alto", "Baja"],
                ["Velocidad de contracción", "Lenta", "Rápida", "Rápida"],
                ["Actividad ATPasa", "Baja", "Alta", "Alta"],
                ["Sistema energético", "Aeróbico", "Combinado", "Anaeróbico"],
                ["Motoneurona", "Pequeña", "Grande", "Grande"],
                ["Descarga", "Baja", "Alta", "Alta"],
              ]}
            />
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ===================================================================

const SECUENCIA = ["IIX", "IIXA", "IIA", "IIC / IC", "I"];
const COLS = [C.tipoIIX, "#f5b98a", C.tipoIIA, "#e45a45", C.tipoI];

const Chips: React.FC<{ pos: number; b: number }> = ({ pos, b }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 150,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 14,
      fontFamily: FUENTE,
      opacity: entre(b, 2.9, 3.1),
    }}
  >
    {SECUENCIA.map((s, i) => {
      const act = Math.max(0, 1 - Math.abs(pos - i));
      return (
        <React.Fragment key={s}>
          <div
            style={{
              padding: "14px 26px",
              borderRadius: 40,
              fontSize: 36,
              fontWeight: 800,
              background: COLS[i],
              color: i >= 3 ? "#fff" : "#1a0b0b",
              transform: `scale(${1 + act * 0.25})`,
              boxShadow: act > 0.5 ? `0 0 30px ${COLS[i]}` : undefined,
            }}
          >
            {s}
          </div>
          {i < SECUENCIA.length - 1 ? <div style={{ color: C.texto, fontSize: 40 }}>⇄</div> : null}
        </React.Fragment>
      );
    })}
  </div>
);

const Transicion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  // b3: avanza hacia tipo I (resistencia); b4: regresa hacia IIX
  const pos = b < 3 ? 0 : b < 4 ? 4 * entre(b, 3.15, 3.9) : 4 - 4 * entre(b, 4.15, 4.9);
  const cam = camara(
    [
      { b: 0, p: [2.4, 1.2, 2.4], l: [-0.6, 0, 0], fov: 40 },
      { b: 3, p: [2.8, 1.6, 2.6], l: [-0.6, -0.2, 0], fov: 40 },
    ],
    b,
  );
  // proporcion de miosina "nueva" (tipo I) dentro de la fibra hibrida
  const nueva = b < 3 ? entre(b, 0.3, 0.9) * 0.4 + entre(b, 1.2, 1.6) * 0.2 + entre(b, 2.2, 2.8) * 0.15 : pos / 4;
  const colorFibra = COLS[Math.round(pos)];
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <CilindroX radio={0.9} largo={4} x={1} color={colorFibra} opacidad={0.35} />
        {hexPack(0.8, 0.16).map(([y, z], i) => {
          const esNueva = rnd(`mn${i}`) < nueva;
          const c = esNueva ? C.tipoI : C.tipoIIX;
          return (
            <mesh key={i} position={[1.02, y, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.08, 10]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.3} />
            </mesh>
          );
        })}
        <Polvo b={b} radio={3} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [1.02, 0.5, 0.3], t: "Miosina IIX (vieja)", a: 0.4, z: 3, o: [80, -80], color: C.tipoIIX },
          { p: [1.02, -0.4, -0.3], t: "Miosina nueva", a: 0.6, z: 3, o: [80, 80], color: C.tipoI },
        ]}
      />
      <Chips pos={pos} b={b} />
      <Tarjeta b={b} a={0} z={3} x={1300} y={130} w={560} titulo="Fibras híbridas" color={C.acento2} tam={26}>
        <Lista
          items={[
            "Contienen **2 tipos de miosina** a la vez: el músculo **se adapta**",
            b > 1 ? "**Nombre**: la 1.ª letra = miosina que **más hay** (IIXA: más IIX que IIA)" : "",
            b > 2 ? "Se fabrica la miosina **nueva antes** de eliminar la vieja" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
      {b > 3 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: FUENTE, fontSize: 34, fontWeight: 700, color: b < 4 ? C.tipoI : C.tipoIIX }}>
          {b < 4 ? "Entrenamiento aeróbico → hacia el Tipo I" : "Desentrenamiento, reposo o potencia → hacia el Tipo IIX"}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ===================================================================

const Influencias: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 4.6, 3.4], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [0, 6.0, 4.6], l: [0, 0, 0.2], fov: 40 },
      { b: 2.9, p: [0, 6.0, 4.6], l: [0, 0, 0.2], fov: 40 },
      { b: 3.1, p: [0, 4.6, 3.4], l: [0, 0, 0], fov: 40 },
      { b: 5, p: [0.6, 4.4, 3.2], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  const doble = visible(b, 1, 3, 0.1);
  const sep = 2.0 * doble;
  // izquierda / derecha segun el tema
  const izq = b < 2 ? { pI: 0.8, pIIA: 0.12 } : { pI: 0.65, pIIA: 0.22 };
  const der = b < 2 ? { pI: 0.3, pIIA: 0.3 } : { pI: 0.3, pIIA: 0.35 };
  const pulso = b > 4 ? Math.max(0, Math.sin((b - 4) * 40)) * visible(b, 4, 5) : 0;
  const elect = entre(b, 4.2, 4.9);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {doble > 0.02 ? (
          <>
            <Mosaico pos={[-sep, 0, 0]} radio={1.5} pI={izq.pI} pIIA={izq.pIIA} semilla="a" />
            <Mosaico pos={[sep, 0, 0]} radio={1.5} pI={der.pI} pIIA={der.pIIA} semilla="c" />
          </>
        ) : (
          <Mosaico
            pI={b < 4 ? 0.5 : mix(0.5, 0.25, elect)}
            pIIA={0.25}
            encoge={visible(b, 3, 4)}
            pulso={pulso}
          />
        )}
        {pulso > 0 ? (
          <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.8 + pulso * 0.1, 0.02, 8, 64]} />
            <meshStandardMaterial color={C.sodio} emissive={C.sodio} emissiveIntensity={2 * pulso} />
          </mesh>
        ) : null}
      </Escena3D>
      <Leyenda op={visible(b, 0, 1)} />
      {doble > 0.5 ? (
        <>
          <div style={{ position: "absolute", left: 300, top: 140, width: 520, textAlign: "center", fontFamily: FUENTE, fontSize: 34, fontWeight: 800, color: C.tipoI }}>
            {b < 2 ? "Sóleo (postural): predominio Tipo I" : "Atleta de fondo: > 60-65 % Tipo I"}
          </div>
          <div style={{ position: "absolute", right: 300, top: 140, width: 520, textAlign: "center", fontFamily: FUENTE, fontSize: 34, fontWeight: 800, color: C.tipoIIX }}>
            {b < 2 ? "Braquial anterior (rápido): más Tipo II" : "Velocidad / levantamiento: > 65 % Tipo II"}
          </div>
        </>
      ) : null}
      <Tarjeta b={b} a={0} z={1} x={1340} y={140} w={520} titulo="Genética y sexo" tam={27}>
        <Rico t="La genética da la base. En **sedentarios**, el Tipo I es **45–55 %**, un poco más en **mujeres**." />
      </Tarjeta>
      <Tarjeta b={b} a={3} z={4} x={1340} y={140} w={520} titulo="Envejecimiento (sarcopenia)" color="#9fb0c8" tam={27}>
        <Rico t="Disminuye el **número y tamaño** de las fibras, sobre todo **Tipo II**, por pérdida de **motoneuronas**: menos fuerza y contracción más lenta." />
      </Tarjeta>
      <Tarjeta b={b} a={4} z={5} x={1340} y={140} w={520} titulo="Electroestimulación / inervación" color={C.sodio} tam={27}>
        <Rico t="Cambiar el **estímulo eléctrico** puede forzar la **transición** de un tipo de fibra a otro." />
      </Tarjeta>
    </AbsoluteFill>
  );
};

export const CAP2: PlanoDef[] = [
  {
    id: "fibras-intro",
    seccion: SEC,
    textos: [
      "**Versatilidad funcional**: el músculo esquelético responde a demandas muy distintas, desde **movimientos precisos de poca fuerza** hasta la **postura** y las **contracciones máximas**.",
      "**Diversidad celular**: esto se debe a que existen **distintos tipos de fibras**, con características **funcionales, metabólicas y moleculares** propias.",
      "**Estructura en mosaico**: cada músculo combina **proporciones variables** de estas fibras para adaptarse a su función.",
      "**Bases moleculares**: la miosina tiene 6 proteínas (2 pesadas y 4 ligeras). La **isoforma de la cadena pesada (MHC)** es el **principal determinante de la velocidad** de contracción.",
      "Las fibras se clasifican según su **MHC** y su **velocidad de acortamiento**: **Tipo I** lenta y **Tipo II** rápida (IIA, IID o IIX, y IIB). En el humano hay fibras puras **I, IIA y IIX** (la **IIB no se expresa**) y fibras **híbridas** como I + IIA o IIAX.",
    ],
    Escena: IntroFibras,
  },
  {
    id: "tipos-fibra",
    seccion: SEC + " · Tipos",
    textos: [
      "**Tipo I (lentas, oxidativas o ST)**: su miosina hidroliza el ATP **despacio**: se contraen a menor velocidad pero con **muy bajo gasto de energía**. Calcio de manejo pausado. Trabajan **con oxígeno**, llenas de **mitocondrias, sangre y mioglobina**. Nervios pequeños: ideales para la **resistencia**.",
      "**Tipo IIA (rápidas, oxidativas-glucolíticas o FOG)**: miosina **rápida**, contracciones **potentes y rápidas**. Sistema de calcio **muy desarrollado**. Energía **combinada** (oxígeno y glucosa) con buen glucógeno. Nervios grandes: **resistencia media**; son las **primeras fibras rápidas** que el cuerpo activa.",
      "**Tipo IIX / IID (rápidas, glucolíticas o FG)**: la **miosina más rápida** del humano, **máxima fuerza y velocidad** en milisegundos. El sistema de calcio **más grande y eficiente**. Trabajan **sin oxígeno** (glucosa), con **pocas mitocondrias**: se **fatigan rápido** y solo se reclutan en esfuerzos **máximos o explosivos**.",
      "**Resumen**: el **Tipo I** es lento, **aeróbico** y muy **resistente a la fatiga** (muchos capilares y mioglobina, línea Z ancha, motoneurona pequeña). El **IIA** es rápido, de energía **combinada** y el de **mayor diámetro**. El **IIX** es rápido, **anaeróbico**, de diámetro **pequeño**, con **mucho glucógeno** y **poca resistencia** a la fatiga.",
    ],
    Escena: TresFibras,
  },
  {
    id: "fibras-hibridas",
    seccion: SEC + " · Formas de transición",
    textos: [
      "**Fibras híbridas**: son fibras **en transición** que contienen **dos tipos de miosina al mismo tiempo**. Muestran que el músculo **se adapta y cambia según el uso**.",
      "**Nomenclatura**: dos letras juntas indican que la fibra es híbrida. La **primera letra** es la miosina que **más hay** y la segunda la que menos (**IIXA** tiene más IIX que IIA).",
      "**Mecanismo de cambio**: al adaptarse, la célula **fabrica la miosina nueva antes de eliminar la vieja**; por eso conviven ambas un tiempo.",
      "Cada paso de la secuencia es **bidireccional**. Si el estímulo aumenta (por ejemplo, **entrenamiento de resistencia aeróbica**), avanza hacia la derecha: **IIX → IIXA → IIA → IIC/IC → Tipo I**.",
      "Si el estímulo **cesa o cambia** (desentrenamiento, **reposo por lesión** o ejercicios de **potencia**), la fibra deshace el camino: **I → IIC/IC → IIA → IIXA → IIX**.",
    ],
    Escena: Transicion,
  },
  {
    id: "fibras-influencias",
    seccion: SEC + " · Influencias en su distribución",
    textos: [
      "**Genética y sexo**: la genética determina la base inicial. En **personas sedentarias**, las fibras **Tipo I** representan entre el **45 % y 55 %**, con un porcentaje ligeramente mayor en **mujeres**.",
      "**Función del músculo**: los músculos **posturales o antigravitatorios** (como el **sóleo**) tienen predominio de **Tipo I**; los de **movimiento rápido** (como el **braquial anterior**) tienen más **Tipo II**.",
      "**Entrenamiento**: la **resistencia aeróbica** lleva las fibras hacia fenotipos oxidativos (**más del 60–65 % Tipo I** en atletas de fondo). La **fuerza y potencia** mantienen o aumentan el **Tipo II** (**más del 65 %** en velocistas y levantadores).",
      "**Envejecimiento (sarcopenia)**: con la edad disminuye el **número y tamaño** de las fibras, sobre todo las **Tipo II**, por **pérdida de motoneuronas**: menos fuerza y contracción más lenta.",
      "**Electroestimulación / inervación**: modificar el **estímulo eléctrico** que recibe el músculo puede **forzar la transición** de un tipo de fibra a otro: la célula muscular es muy **adaptable**.",
    ],
    Escena: Influencias,
  },
];
