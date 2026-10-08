import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../motor";
import { Humano } from "../modelos/cuerpo";
import { Polvo, rnd } from "../modelos/comun";
import { CabezaMiosina, CilindroX, FilamentoFino } from "../modelos/musculo";
import { Cadena, Esfera, Glucogeno, GotaLipido, MitocondriaGrande, Mol, MoleculaATP } from "../modelos/energia";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Rico, Tarjeta, TituloGrande } from "../ui";

export const SEC_E = "Unidad 2 · Sistemas energéticos";

// ---- Fichas pequenas de moleculas (para verlas en grupo) -----------------

/** ATP/ADP compacto: adenosina azul + n fosfatos naranjas. */
export const MiniATP: React.FC<{ p: V3; n?: number; escala?: number; op?: number; brillo?: number }> = ({
  p,
  n = 3,
  escala = 1,
  op = 1,
  brillo = 0.3,
}) => (
  <group position={p} scale={escala}>
    <Esfera p={[-0.16, 0, 0]} r={0.1} color="#4f8dff" brillo={brillo} op={op} />
    {Array.from({ length: n }).map((_, i) => (
      <Esfera key={i} p={[0.02 + i * 0.13, 0, 0]} r={0.06} color="#ff9a2e" brillo={brillo + 0.2} op={op} />
    ))}
  </group>
);

export const Creatina: React.FC<{ p: V3; fosfato?: number; op?: number; escala?: number }> = ({
  p,
  fosfato = 0,
  op = 1,
  escala = 1,
}) => (
  <group position={p} scale={escala}>
    <Esfera p={[0, 0, 0]} r={0.09} color="#47d18c" brillo={0.3} op={op} />
    <Esfera p={[0.1, 0.08, 0]} r={0.07} color="#47d18c" brillo={0.3} op={op} />
    <Esfera p={[-0.1, 0.07, 0.02]} r={0.07} color="#47d18c" brillo={0.3} op={op} />
    {fosfato > 0 ? <Esfera p={[0.2, -0.06, 0]} r={0.065} color="#ff9a2e" brillo={0.5} op={op * fosfato} /> : null}
  </group>
);

const Leyenda: React.FC<{ items: [string, string][]; op?: number; top?: number }> = ({ items, op = 1, top = 130 }) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      top,
      opacity: op,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      fontFamily: FUENTE,
      fontSize: 26,
      color: C.texto,
      background: "rgba(4,9,20,0.8)",
      padding: "14px 20px",
      borderRadius: 14,
    }}
  >
    {items.map(([t, c]) => (
      <div key={t} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 22, height: 22, borderRadius: 11, background: c, display: "inline-block" }} />
        {t}
      </div>
    ))}
  </div>
);

// ===================================================================

const Portada: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.2, 4.4], l: [0, 1.0, 0], fov: 35 },
      { b: 2, p: [1.4, 1.3, 3.4], l: [0, 1.0, 0], fov: 35 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, 0.6 + b * 0.3, 0]}>
          <Humano fase={b * 9} marcha={1.6} musculo={0.55} brillaMuslo={0.4 + 0.3 * Math.sin(b * 6)} />
        </group>
      </Escena3D>
      <TituloGrande b={b} a={0} z={2} sup="Unidad 2 · Fisiología del ejercicio" t="Sistemas energéticos" sub="ATP · Fosfágenos · Glucólisis · Oxidación · Continuum · Umbral anaeróbico" />
    </AbsoluteFill>
  );
};

const MonedaATP: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.4, 6.0], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [-0.3, 0.3, 3.6], l: [-0.3, 0, 0], fov: 40 },
      { b: 2, p: [1.0, -0.2, 6.2], l: [1.0, -0.5, 0], fov: 40 },
      { b: 3, p: [0, 1.0, 6.4], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  // b0: macronutrientes que se degradan hacia el ATP
  const llega = entre(b, 0.15, 0.85);
  const fuentes: { p: V3; tipo: number }[] = [
    { p: [-3.4, 1.4, -1], tipo: 0 },
    { p: [3.4, 1.6, -1], tipo: 1 },
    { p: [0.2, -2.4, -1], tipo: 2 },
  ];
  const sub = b - 1;
  const resalta = b >= 1 && b < 2 ? (sub < 0.33 ? "adenina" : sub < 0.66 ? "ribosa" : "fosfatos") : null;
  const suelta = b >= 2 && b < 3 ? entre(b, 2.25, 2.7) : 0;
  const energia = b >= 2 && b < 3 ? visible(b, 2.2, 2.95) : 0;
  const golpe = entre(b, 2.55, 2.85);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {b < 3 ? (
          <group scale={b < 1 ? 0.6 + 0.4 * llega : 1}>
            <MoleculaATP resalta={resalta} suelta={suelta} energia={energia} />
          </group>
        ) : null}
        {b < 1
          ? fuentes.map((f, i) => {
              const p = mix3(f.p, [0, 0, 0], llega);
              const op = 1 - entre(b, 0.7, 0.9);
              return f.tipo === 0 ? (
                <group key={i} position={p}>
                  <Cadena n={6} anillo color="#ffd166" op={op} />
                </group>
              ) : f.tipo === 1 ? (
                <group key={i} position={p}>
                  <Cadena n={10} color="#ffd34d" op={op} sep={0.16} />
                </group>
              ) : (
                <group key={i} position={p}>
                  <Cadena n={4} color="#7cff8a" op={op} />
                </group>
              );
            })
          : null}
        {/* la energia del ATP mueve la cabeza de miosina */}
        {b >= 2 && b < 3 ? (
          <group position={[2.4, -1.6, 0]} scale={0.9}>
            <CabezaMiosina angulo={mix(0.5, -0.5, golpe)} />
            <group position={[-1.2, 1.18, 0]}>
              <FilamentoFino n={22} bloqueo={0} sitios={0.5} troponina={0.3} tropomiosina={0.4} desliza={golpe * 0.2} />
            </group>
          </group>
        ) : null}
        {/* muchas moleculas de ATP renovandose rapido */}
        {b >= 3
          ? Array.from({ length: 30 }).map((_, i) => {
              const fase = (b * 2.5 + rnd(`a${i}`)) % 1;
              const p: V3 = [(rnd(`x${i}`) - 0.5) * 7, (rnd(`y${i}`) - 0.5) * 3.6, (rnd(`z${i}`) - 0.5) * 2];
              return <MiniATP key={i} p={p} n={fase < 0.5 ? 3 : 2} escala={1.6} brillo={fase < 0.5 ? 0.6 : 0.1} />;
            })
          : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-3.0, 1.2, -1], t: "Carbohidratos", a: 0.05, z: 0.6, o: [-40, -60], color: "#ffd166" },
          { p: [3.0, 1.4, -1], t: "Grasas", a: 0.1, z: 0.6, o: [40, -60], color: "#ffd34d" },
          { p: [0.2, -2.0, -1], t: "Proteínas", a: 0.15, z: 0.6, o: [60, 40], color: "#7cff8a" },
          { p: [-1.55, 0.6, 0], t: "Adenina", a: 1.0, z: 2, o: [-60, -90], color: "#4f8dff" },
          { p: [-0.35, -0.55, 0], t: "Ribosa", a: 1.3, z: 2, o: [-60, 90], color: "#47d18c" },
          { p: [0.75, 0.1, 0], t: "3 grupos fosfato", a: 1.6, z: 2, o: [60, -100], color: "#ff9a2e" },
          { p: [0.5, -0.1, 0], t: "ADP", a: 2.6, z: 3, o: [-60, 90], color: "#ff9a2e" },
          { p: [2.45, 0.4, 0], t: "Pi + energía", a: 2.6, z: 3, o: [60, -80], color: "#fff2a8" },
          { p: [2.4, -1.2, 0], t: "Puente cruzado", a: 2.7, z: 3, o: [80, 60], color: C.cabeza },
        ]}
      />
      <Tarjeta b={b} a={2} z={3} x={60} y={130} w={520} titulo="Hidrólisis del ATP" color={C.atp} tam={30}>
        <Rico t="ATP **→** ADP + Pi + **energía**" />
        <div style={{ fontSize: 24, color: C.suave, marginTop: 6 }}>Enzima: ATPasa</div>
      </Tarjeta>
      {b >= 3 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FUENTE, fontSize: 46, fontWeight: 900, color: C.acento2 }}>
          Ejercicio: reponer ATP cientos de veces más rápido
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Interior de la celula muscular: miofibrillas, PCr, glucogeno y mitocondria. */
const CelulaMuscular: React.FC<{ b: number; pcr?: number; gluc?: number; mito?: number; grasa?: number }> = ({
  b,
  pcr = 0,
  gluc = 0,
  mito = 0,
  grasa = 0,
}) => (
  <group>
    <CilindroX radio={0.55} largo={12} x={6} y={-1.7} z={-2.6} color="#c03a46" estriado={8} />
    <CilindroX radio={0.55} largo={12} x={6} y={1.8} z={-2.8} color="#c03a46" estriado={8} />
    {Array.from({ length: 10 }).map((_, i) => (
      <Creatina
        key={`c${i}`}
        p={[-3.4 + (i % 5) * 0.55, -0.3 + Math.floor(i / 5) * 0.6 + Math.sin(b * 2 + i) * 0.05, 0.4 + (i % 3) * 0.2]}
        fosfato={1}
        escala={1.3}
        op={0.35 + 0.65 * pcr}
      />
    ))}
    {[
      [-0.8, 0.6, 0.2],
      [0, -0.7, 0.5],
      [0.6, 0.4, -0.3],
    ].map((p, i) => (
      <Glucogeno key={`g${i}`} p={p as V3} escala={1.4 + gluc * 0.4} op={0.4 + 0.6 * gluc} />
    ))}
    <group position={[3.2, 0, 0]} scale={0.9}>
      <MitocondriaGrande op={0.5 + 0.5 * mito} brillo={mito * 0.4} />
    </group>
    <GotaLipido p={[1.6, 1.0, -0.6]} r={0.35} op={0.4 + 0.6 * grasa} />
    <GotaLipido p={[1.9, -1.0, 0.2]} r={0.28} op={0.4 + 0.6 * grasa} />
  </group>
);

const TresVias: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.0, 7.4], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [-2.4, 0.6, 3.6], l: [-2.4, 0, 0], fov: 40 },
      { b: 2, p: [0, 0.5, 3.6], l: [0, 0, 0], fov: 40 },
      { b: 3, p: [3.0, 0.6, 4.0], l: [3.0, 0, 0], fov: 40 },
      { b: 4, p: [0, 1.0, 7.4], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <CelulaMuscular b={b} pcr={visible(b, 1, 2)} gluc={visible(b, 2, 3)} mito={visible(b, 3, 4)} />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-2.3, 0.3, 0.6], t: "Fosfocreatina (PCr) · citoplasma", a: 1.05, z: 2, o: [60, -110], color: "#47d18c" },
          { p: [0, -0.7, 0.5], t: "Glucógeno → lactato · citoplasma", a: 2.05, z: 3, o: [60, 90], color: "#8f74ff" },
          { p: [3.2, 0.6, 0], t: "Mitocondria · con oxígeno", a: 3.05, z: 4, o: [60, -100], color: C.mitocondria },
          { p: [5, -1.7, -2.0], t: "Miofibrillas (gastan ATP)", a: 0.1, z: 1, o: [-60, 80], color: C.musculoClaro },
        ]}
      />
      <Tarjeta b={b} a={0} z={4} x={60} y={130} w={560} titulo="3 vías para reponer ATP" tam={27}>
        <Lista b={b} a={0.9} paso={1} items={["**1. Fosfágenos** (PCr)", "**2. Glucólisis anaeróbica** (lactato)", "**3. Fosforilación oxidativa** (mitocondria)"]} />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ===================================================================
// Sistema de los fosfagenos
// ===================================================================

const FosfagenosIntro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [3.2, 1.2, 2.2], l: [0, 1.0, 0], fov: 38 },
      { b: 2, p: [2.6, 1.3, 3.0], l: [0, 1.0, 0], fov: 38 },
    ],
    b,
  );
  // barra de "combustible": se agota en ~10 s del sprint
  const nivel = 1 - lineal(b, 0.1, 1.6);
  const seg = Math.round((1 - nivel) * 10);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, 0.3, 0]}>
          <Humano fase={b * 14} marcha={1.7} musculo={0.55} brillaMuslo={0.5 + 0.5 * nivel} />
        </group>
      </Escena3D>
      <div style={{ position: "absolute", right: 120, top: 180, width: 300, fontFamily: FUENTE, color: C.texto, textAlign: "center" }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#47d18c", marginBottom: 10 }}>ATP + PCr</div>
        <div style={{ height: 400, width: 90, margin: "0 auto", border: "3px solid #47d18c", borderRadius: 14, position: "relative", overflow: "hidden", background: "rgba(0,0,0,0.4)" }}>
          <div style={{ position: "absolute", bottom: 0, width: "100%", height: `${nivel * 100}%`, background: "#47d18c" }} />
        </div>
        <div style={{ fontSize: 44, fontWeight: 900, marginTop: 12, fontVariantNumeric: "tabular-nums" }}>{seg} s</div>
      </div>
      <Tarjeta b={b} a={0} z={2} x={60} y={130} w={600} titulo="Anaeróbico aláctico" color="#47d18c" tam={26}>
        <Lista
          items={[
            "**Dónde**: citoplasma muscular",
            "**Duración**: 0–10 s (sprints, pesas)",
            b > 1 ? "**Sustratos**: ATP presente + fosfocreatina (PCr)" : "",
            b > 1 ? "**ATP**: 1:1, muy rápido" : "",
            b > 1 ? "✔ Inmediato y **sin lactato**" : "",
            b > 1 ? "✖ **Capacidad limitada**, se agota rápido" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

const ReaccionCK: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.6, 5.4], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [0, 0.4, 3.4], l: [0, 0, 0], fov: 40 },
      { b: 3, p: [0.3, 0.5, 3.6], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  // b0: las reservas de ATP se gastan (se vuelven ADP)
  const gasto = lineal(b, 0.1, 0.9);
  // b1-b2: ciclo de transferencia del fosfato PCr -> ADP (se repite)
  const ciclo = b >= 1 ? (b - 1) % 1 : 0;
  const salto = entre(ciclo, 0.35, 0.7);
  const pcrP: V3 = [-1.3, 0, 0];
  const adpP: V3 = [1.0, 0, 0];
  const fosf = mix3([pcrP[0] + 0.3, pcrP[1] - 0.08, 0], [adpP[0] + 0.28, adpP[1], 0], salto);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {b < 1
          ? Array.from({ length: 8 }).map((_, i) => {
              const se = gasto * 8 > i ? 1 : 0;
              return <MiniATP key={i} p={[-2.1 + i * 0.6, 0.8 * Math.sin(i), -0.5]} n={3 - se} escala={2} brillo={se ? 0.05 : 0.6} />;
            })
          : (
            <>
              {/* creatin cinasa */}
              <mesh position={[-0.1, 0.5, -0.4]} scale={[0.45, 0.3, 0.3]}>
                <sphereGeometry args={[1, 32, 24]} />
                <meshPhysicalMaterial color="#b48cff" emissive="#b48cff" emissiveIntensity={0.25 + salto * 0.5} transparent opacity={0.5} clearcoat={0.6} depthWrite={false} />
              </mesh>
              <Creatina p={pcrP} fosfato={0} escala={2.6} />
              <MiniATP p={adpP} n={2} escala={2.6} brillo={0.2} />
              <Esfera p={fosf} r={0.17} color="#ff9a2e" brillo={0.6 + salto * 0.6} />
            </>
          )}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, 0.8, -0.5], t: "Reservas de ATP: muy escasas", a: 0.1, z: 1, o: [60, -100], color: C.atp },
          { p: [-0.1, 0.4, -0.4], t: "Creatin cinasa (CK)", a: 1.05, z: 3, o: [80, 140], color: "#b48cff" },
          { p: [-1.3, 0.2, 0], t: ciclo < 0.6 ? "Fosfocreatina (PCr)" : "Creatina (Cr)", a: 1.1, z: 3, o: [-60, -90], color: "#47d18c" },
          { p: [1.2, 0.15, 0], t: ciclo < 0.6 ? "ADP" : "¡ATP!", a: 1.15, z: 3, o: [60, 80], color: C.atp },
        ]}
      />
      {b >= 2 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: FUENTE, fontSize: 56, fontWeight: 900, color: C.texto, opacity: entre(b, 2, 2.2) }}>
          <span style={{ color: "#47d18c" }}>PCr</span> + <span style={{ color: C.atp }}>ADP</span> <span style={{ color: "#b48cff" }}>⇄</span> <span style={{ color: C.atp }}>ATP</span> + <span style={{ color: "#47d18c" }}>Cr</span>
          <div style={{ fontSize: 28, color: C.suave, fontWeight: 600 }}>creatin cinasa (CK) · reacción reversible</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Lanzadera: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [1.0, 1.2, 8.6], l: [1.0, 0, 0], fov: 40 },
      { b: 1, p: [1.8, 0.9, 7.2], l: [1.6, 0, 0], fov: 40 },
      { b: 2, p: [0.2, 0.9, 7.4], l: [0.4, 0, 0], fov: 40 },
      { b: 3, p: [1.0, 1.2, 8.6], l: [1.0, 0, 0], fov: 40 },
    ],
    b,
  );
  // circuito: citosol (x<0) -> mitocondria (x~3.2) -> citosol
  const fichas = Array.from({ length: 8 }).map((_, i) => {
    const t = (b * 0.35 + i / 8) % 1;
    const ida = t < 0.5;
    const u = ida ? t * 2 : (t - 0.5) * 2;
    const arriba: V3 = [mix(-2.8, 2.6, u), 0.75 + Math.sin(u * Math.PI) * 0.4, 0.3];
    const abajo: V3 = [mix(2.6, -2.8, u), -0.75 - Math.sin(u * Math.PI) * 0.4, 0.3];
    return { p: ida ? arriba : abajo, fosfato: ida ? 0 : 1 };
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <CilindroX radio={0.5} largo={6} x={-1.2} y={0} z={-1.2} color="#c03a46" estriado={4} />
        <group position={[3.4, 0, -0.4]} scale={0.95}>
          <MitocondriaGrande brillo={visible(b, 1, 2) * 0.5} />
        </group>
        {fichas.map((f, i) => (
          <Creatina key={i} p={f.p} fosfato={f.fosfato} escala={2.2} />
        ))}
        {b >= 1
          ? Array.from({ length: 4 }).map((_, i) => (
              <MiniATP key={`m${i}`} p={[3.0 + (i % 2) * 0.6, -0.2 + Math.floor(i / 2) * 0.45, 0.4]} n={(b * 2 + i) % 1 < 0.5 ? 3 : 2} escala={1.6} brillo={0.5} />
            ))
          : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-2.2, -0.4, -1.0], t: "Citosol: se gasta energía", a: 0.05, z: 3, o: [-60, 90], color: C.musculoClaro },
          { p: [3.4, 0.7, -0.4], t: "Mitocondria: se produce", a: 0.1, z: 3, o: [60, -100], color: C.mitocondria },
          { p: [0, 1.1, 0.3], t: "Creatina (Cr) →", a: 1.0, z: 3, o: [-40, -90], color: "#47d18c" },
          { p: [3.3, 0.2, 0.4], t: "CK mitocondrial + ATP", a: 1.3, z: 2.1, o: [60, 90], color: "#b48cff" },
          { p: [0, -1.1, 0.3], t: "← Fosfocreatina (PCr)", a: 2.0, z: 3, o: [40, 90], color: C.atp },
        ]}
      />
    </AbsoluteFill>
  );
};

export const E1: PlanoDef[] = [
  {
    id: "e-portada",
    seccion: "",
    textos: [
      "**Unidad 2: Sistemas energéticos.** ¿De dónde saca el músculo la energía para moverse? Viajemos al interior de la fibra muscular.",
      "Veremos el **ATP**, el **sistema de los fosfágenos**, la **glucólisis anaeróbica**, el **metabolismo aeróbico**, la **beta-oxidación**, los **aminoácidos**, el **continuum energético** y el **umbral anaeróbico**.",
    ],
    Escena: Portada,
  },
  {
    id: "e-moneda-atp",
    seccion: SEC_E + " · Moneda energética",
    textos: [
      "El cuerpo obtiene energía del **catabolismo de los macronutrientes**: **carbohidratos, grasas y proteínas**. Con ella fabrica **adenosín trifosfato (ATP)**, la principal **moneda energética** de la célula.",
      "El ATP está formado por una **base nitrogenada (adenina)**, un **azúcar (ribosa)** y **tres grupos fosfato** unidos.",
      "Al contraerse el músculo, la enzima **ATPasa** hidroliza el ATP en **ADP**, un **fosfato inorgánico (Pi)** y **energía libre** para el ciclo de los **puentes cruzados (actina-miosina)**.",
      "Durante el ejercicio, el músculo necesita **reponer el ATP** a una velocidad **cientos de veces mayor que en reposo**, manteniendo estables sus reservas.",
    ],
    Escena: MonedaATP,
  },
  {
    id: "e-tres-vias",
    seccion: SEC_E + " · Vías energéticas",
    textos: [
      "Para lograrlo, la célula muscular utiliza **tres vías energéticas principales**, basadas en procesos que **liberan energía**.",
      "**1. El sistema de los fosfágenos**: resíntesis **inmediata** de ATP usando **fosfocreatina (PCr)**.",
      "**2. La glucólisis anaeróbica**: transformación del **glucógeno muscular en lactato**.",
      "**3. La fosforilación oxidativa**: producción de energía en la **mitocondria**, usando **oxígeno**.",
    ],
    Escena: TresVias,
  },
  {
    id: "e-fosfagenos",
    seccion: "Sistema de los fosfágenos",
    textos: [
      "**Sistema de los fosfágenos o anaeróbico aláctico.** Localización: **citoplasma muscular**. Duración del esfuerzo: **0 a 10 segundos**, como los **sprints** o el **levantamiento de pesas**.",
      "Sustratos: el **ATP ya presente** y la **fosfocreatina (PCr)**. Produce ATP en proporción **1:1** y **muy rápido**. Ventaja: **energía inmediata, sin producir lactato**. Desventaja: **capacidad limitada** y **agotamiento rápido**.",
    ],
    Escena: FosfagenosIntro,
  },
  {
    id: "e-creatin-cinasa",
    seccion: "Sistema de los fosfágenos",
    textos: [
      "**Principio de transferencia energética**: al iniciar una contracción de máxima intensidad, el miocito necesita **de forma instantánea** grandes cantidades de ATP, pero sus **reservas basales son muy escasas** y se agotan en pocos segundos.",
      "**El sistema de rescate**: el aumento de **ADP** estimula a la enzima **creatin cinasa (CK)**, que **transfiere un grupo fosfato** desde la **fosfocreatina** hacia el **ADP**.",
      "Así se **resintetiza ATP de forma inmediata** mediante una reacción **reversible**: **fosfocreatina más ADP** se convierten en **ATP más creatina**.",
    ],
    Escena: ReaccionCK,
  },
  {
    id: "e-lanzadera",
    seccion: "Sistema de los fosfágenos · Lanzadera",
    textos: [
      "**El mecanismo de lanzadera**: para mantener el ciclo, la célula transporta energía entre el **citosol**, donde **se gasta**, y la **mitocondria**, donde **se produce**.",
      "La **creatina libre (Cr)** generada en el citosol viaja hacia la mitocondria. Allí, la **creatin cinasa mitocondrial** la fosforila usando el **ATP de la respiración celular** y la convierte de nuevo en **fosfocreatina (PCr)**.",
      "Esta nueva **PCr regresa al citosol**, disponible para un **nuevo ciclo contráctil**.",
    ],
    Escena: Lanzadera,
  },
];

// Reutilizado en otros capitulos
export { CelulaMuscular, Leyenda, Mol };
