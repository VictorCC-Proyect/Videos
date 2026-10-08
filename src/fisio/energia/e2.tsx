import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3, visible } from "../motor";
import { Humano } from "../modelos/cuerpo";
import { difusion, Polvo, rnd, Tubo } from "../modelos/comun";
import { FilamentoFino, posTroponina } from "../modelos/musculo";
import { Cadena, Esfera, Higado, Mol, Pulmones, Vaso } from "../modelos/energia";
import { C, FUENTE } from "../tema";
import { Escena3D, Etiquetas, Lista, Rico, Tarjeta } from "../ui";

const SEC = "Glucólisis anaeróbica";
const H = "#ff4d4d";
const LACTATO = "#ff8fd0";
const GLUCOSA = "#ffd166";

const Contador: React.FC<{ items: [string, string, string][]; top?: number }> = ({ items, top = 150 }) => (
  <div style={{ position: "absolute", right: 60, top, display: "flex", flexDirection: "column", gap: 10, fontFamily: FUENTE }}>
    {items.map(([t, v, c]) => (
      <div key={t} style={{ background: "rgba(4,9,20,0.85)", borderRadius: 12, padding: "10px 18px", borderLeft: `6px solid ${c}`, minWidth: 300 }}>
        <div style={{ fontSize: 22, color: C.suave }}>{t}</div>
        <div style={{ fontSize: 40, fontWeight: 900, color: c, fontVariantNumeric: "tabular-nums" }}>{v}</div>
      </div>
    ))}
  </div>
);

// ===================================================================

const GlucolisisIntro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [3.0, 1.3, 2.4], l: [0, 1.0, 0], fov: 38 },
      { b: 2, p: [2.2, 1.2, 3.2], l: [0, 1.0, 0], fov: 38 },
    ],
    b,
  );
  const seg = Math.round(mix(30, 180, lineal(b, 0.1, 1.9)));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, 0.3, 0]}>
          <Humano fase={b * 11} marcha={1.4} musculo={0.55} brillaMuslo={0.6 + 0.3 * Math.sin(b * 8)} />
        </group>
      </Escena3D>
      <div style={{ position: "absolute", right: 140, top: 200, fontFamily: FUENTE, textAlign: "center", color: C.texto }}>
        <div style={{ fontSize: 28, color: C.suave }}>Esfuerzo intenso</div>
        <div style={{ fontSize: 80, fontWeight: 900, color: LACTATO, fontVariantNumeric: "tabular-nums" }}>
          {Math.floor(seg / 60)}:{String(seg % 60).padStart(2, "0")}
        </div>
        <div style={{ fontSize: 24, color: C.suave }}>de 0:30 a 3:00 min</div>
      </div>
      <Tarjeta b={b} a={0} z={2} x={60} y={130} w={620} titulo="Anaeróbico láctico" color={LACTATO} tam={26}>
        <Lista
          items={[
            "**Dónde**: citoplasma muscular",
            "**Duración**: alta intensidad, 30 s – 3 min",
            "**Sustrato**: solo glucosa sanguínea o glucógeno",
            b > 1 ? "Glucosa → **ácido pirúvico** → **ácido láctico** (sin O₂ suficiente)" : "",
            b > 1 ? "**2 ATP** por glucosa · **3 ATP** desde glucógeno" : "",
            b > 1 ? "✔ Energía rápida **sin oxígeno**" : "",
          ].filter(Boolean)}
        />
      </Tarjeta>
    </AbsoluteFill>
  );
};

const PasosGlucolisis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.3, 4.2], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [0, 0.3, 4.8], l: [0, 0, 0], fov: 40 },
      { b: 3, p: [0.4, 0.4, 4.6], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  const fosf1 = entre(b, 0.2, 0.45);
  const fosf2 = entre(b, 0.5, 0.75);
  const divide = entre(b, 1.05, 1.35);
  const oxid = entre(b, 1.4, 1.9);
  const ldh = entre(b, 2.2, 2.7);
  const gastados = (fosf1 > 0.5 ? 1 : 0) + (fosf2 > 0.5 ? 1 : 0);
  const producidos = b < 1.4 ? 0 : Math.min(4, Math.floor(oxid * 4.999));
  const nadh = b < 1.4 ? 0 : oxid > 0.5 ? 2 : 0;
  const seis = divide < 0.5;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {seis ? (
          <group rotation={[0, 0, b * 0.4]}>
            <Cadena n={6} anillo color={GLUCOSA} sep={0.3} brillo={0.3} />
            {fosf1 > 0 ? <Esfera p={mix3([-1.6, 1.0, 0], [0.33, 0, 0.1], fosf1)} r={0.13} color={C.atp} brillo={0.6} /> : null}
            {fosf2 > 0 ? <Esfera p={mix3([1.6, -1.0, 0], [-0.33, 0, 0.1], fosf2)} r={0.13} color={C.atp} brillo={0.6} /> : null}
          </group>
        ) : (
          [-1, 1].map((s) => {
            const y = s * mix(0.2, 0.9, divide);
            const col = ldh > 0.5 ? LACTATO : oxid > 0.9 ? "#ff9a5c" : GLUCOSA;
            return (
              <group key={s} position={[mix(0, 0.2, oxid), y, 0]}>
                <Cadena n={3} p={[-0.35, 0, 0]} color={col} sep={0.35} brillo={0.3} />
                {oxid > 0 && oxid < 1
                  ? [0, 1].map((k) => <Mol key={k} p={[0.8 + oxid * 1.6 + k * 0.3, 0.25 * (k ? 1 : -1), 0.2]} color={C.atp} r={0.08} />)
                  : null}
              </group>
            );
          })
        )}
        {ldh > 0 && ldh < 1 ? (
          <mesh position={[0.6, 0, 0.4]} scale={[0.4, 0.3, 0.3]}>
            <sphereGeometry args={[1, 24, 16]} />
            <meshPhysicalMaterial color="#b48cff" emissive="#b48cff" emissiveIntensity={0.5} transparent opacity={0.7} />
          </mesh>
        ) : null}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0, 0.35, 0], t: "Glucosa (6 carbonos)", a: 0.05, z: 1, o: [-60, -110], color: GLUCOSA },
          { p: [0, 0.35, 0.1], t: "Fructosa-1,6-bisfosfato", a: 0.8, z: 1.05, o: [60, -110], color: C.atp },
          { p: [-0.35, 0.9, 0], t: "2 × gliceraldehído-3-fosfato (3 C)", a: 1.15, z: 1.5, o: [-80, -90], color: GLUCOSA },
          { p: [-0.15, 0.9, 0], t: "2 piruvatos", a: 1.85, z: 2.2, o: [-80, -90], color: "#ff9a5c" },
          { p: [-0.15, 0.9, 0], t: "2 lactatos", a: 2.55, z: 3, o: [-80, -90], color: LACTATO },
          { p: [0.6, 0, 0.4], t: "Lactato deshidrogenasa (LDH)", a: 2.2, z: 2.7, o: [60, 90], color: "#b48cff" },
        ]}
      />
      <Contador
        items={[
          ["ATP invertidos", `−${gastados}`, H],
          ["ATP producidos", `+${producidos}`, C.atp],
          ["NADH", `${nadh}`, "#5ec8ff"],
          ["Ganancia neta", `${producidos - gastados} ATP`, "#7cff8a"],
        ]}
      />
    </AbsoluteFill>
  );
};

const CicloCori: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 0.8, 10.0], l: [0, 0, 0], fov: 40 },
      { b: 1, p: [1.6, 0.7, 8.0], l: [1.8, 0, 0], fov: 40 },
      { b: 2, p: [-0.2, 0.6, 9.6], l: [0, 0, 0], fov: 40 },
    ],
    b,
  );
  const t = b * 0.6;
  const lact = Array.from({ length: 6 }).map((_, i): V3 => {
    const f = (t + i / 6) % 1;
    return [mix(-2.2, 2.0, f), 1.05 + Math.sin(i) * 0.06, 0.15];
  });
  const gluc = Array.from({ length: 6 }).map((_, i): V3 => {
    const f = (t + i / 6) % 1;
    return [mix(2.0, -2.2, f), -1.05 + Math.sin(i) * 0.06, 0.15];
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {/* musculo */}
        <mesh position={[-3.2, 0, 0]} scale={[1.0, 1.6, 0.8]}>
          <sphereGeometry args={[1, 40, 28]} />
          <meshPhysicalMaterial color={C.musculo} emissive={C.musculoClaro} emissiveIntensity={0.15} roughness={0.4} clearcoat={0.4} />
        </mesh>
        <group position={[3.4, 0, 0]}>
          <Higado brillo={visible(b, 1, 2) * 0.4} />
        </group>
        <Vaso desde={[-2.3, 1.05, 0]} hasta={[2.2, 1.05, 0]} t={b * 0.4} radio={0.3} />
        <Vaso desde={[2.2, -1.05, 0]} hasta={[-2.3, -1.05, 0]} t={b * 0.4} radio={0.3} />
        {lact.map((p, i) => (
          <Mol key={`l${i}`} p={p} color={LACTATO} r={0.11} />
        ))}
        {b > 1.3
          ? gluc.map((p, i) => <Mol key={`g${i}`} p={p} color={GLUCOSA} r={0.11} />)
          : null}
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-3.2, 1.4, 0.5], t: "Músculo: glucólisis → lactato", a: 0.05, z: 3, o: [-40, -90], color: C.musculoClaro },
          { p: [0, 1.15, 0.2], t: "Lactato por la sangre →", a: 0.3, z: 3, o: [-40, -100], color: LACTATO },
          { p: [3.4, 0.6, 0.6], t: "Hígado: gluconeogénesis (−6 ATP)", a: 1.05, z: 3, o: [40, -110], color: "#c2554a" },
          { p: [0, -1.15, 0.2], t: "← Glucosa de vuelta al músculo", a: 1.4, z: 3, o: [-40, 100], color: GLUCOSA },
        ]}
      />
      {b > 2 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FUENTE, fontSize: 56, fontWeight: 900, color: C.acento2 }}>
          Ciclo de Cori
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const Acidosis: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const enFilamento = b >= 2;
  const cam = enFilamento
    ? camara(
        [
          { b: 2, p: [1.3, 0.5, 2.0], l: [1.3, 0, 0], fov: 40 },
          { b: 3, p: [1.5, 0.6, 2.3], l: [1.4, 0, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: 0, p: [0, 0.8, 5.6], l: [0, 0, 0], fov: 40 },
          { b: 1, p: [1.6, 0.4, 4.0], l: [1.8, 0, 0], fov: 40 },
          { b: 2, p: [1.6, 0.4, 4.0], l: [1.8, 0, 0], fov: 40 },
        ],
        b,
      );
  const acumula = entre(b, 0.05, 0.9);
  const ph = mix(7.1, 6.4, acumula) + (b > 1 && b < 2 ? entre(b, 1.2, 1.9) * 0.2 : 0);
  const nH = Math.round(8 + acumula * 30);
  const flash = Math.max(0, 1 - Math.abs(b - 2) / 0.07);
  // pares lactato + H+ que salen por el MCT4
  const salen = Array.from({ length: 6 }).map((_, i) => {
    const f = ((b - 1) * 1.2 + i / 6) % 1;
    return f;
  });
  const tn = [0, 1, 2].flatMap((k) => [0, 1].map((s) => posTroponina(k, s, 1)));
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {!enFilamento ? (
          <>
            {/* interior de la fibra y su membrana a la derecha */}
            <mesh position={[2.2, 0, 0]}>
              <boxGeometry args={[0.18, 4, 2.4]} />
              <meshPhysicalMaterial color="#f39aa0" transparent opacity={0.45} />
            </mesh>
            {[0.7, -0.7].map((y) => (
              <group key={y} position={[2.2, y, 0.3]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.22, 0.22, 0.5, 20, 1, true]} />
                  <meshPhysicalMaterial color="#5ec8ff" emissive="#5ec8ff" emissiveIntensity={0.3 + visible(b, 1, 2) * 0.6} side={2} />
                </mesh>
              </group>
            ))}
            {Array.from({ length: nH }).map((_, i) => (
              <Mol
                key={i}
                p={[(rnd(`hx${i}`) - 0.6) * 4, (rnd(`hy${i}`) - 0.5) * 3, (rnd(`hz${i}`) - 0.5) * 1.6 + Math.sin(b * 3 + i) * 0.05]}
                color={H}
                r={0.06}
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <Mol key={`l${i}`} p={[(rnd(`lx${i}`) - 0.6) * 3.6, (rnd(`ly${i}`) - 0.5) * 2.6, (rnd(`lz${i}`) - 0.5) * 1.4]} color={LACTATO} r={0.08} />
            ))}
            {b > 1
              ? salen.map((f, i) => {
                  const y = i % 2 ? 0.7 : -0.7;
                  const p: V3 = [mix(1.4, 3.4, f), y, 0.3];
                  return (
                    <group key={`s${i}`}>
                      <Mol p={p} color={LACTATO} r={0.08} />
                      <Mol p={[p[0], p[1] + 0.18, p[2]]} color={H} r={0.06} />
                    </group>
                  );
                })
              : null}
          </>
        ) : (
          <>
            <FilamentoFino n={26} bloqueo={1} sitios={0} caUnido={0} />
            {tn.map((p, i) => (
              <Mol key={i} p={[p[0], p[1] + 0.07, p[2]]} color={H} r={0.035} />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <Mol key={`c${i}`} p={difusion([tn[i][0] + 0.6, 0.9, 0.5], [tn[i][0] + 0.2, 0.35, 0.3], ((b - 2) * 1.5 + i / 6) % 1, `ca${i}`, 0.2)} color={C.calcio} r={0.03} />
            ))}
            {/* terminacion nerviosa libre */}
            <Tubo puntos={[[0.2, 0.8, -0.4], [0.9, 0.6, -0.3], [1.6, 0.75, -0.4], [2.4, 0.7, -0.3]]} radio={0.02} color={C.nervio} emisivo={0.5 + Math.max(0, Math.sin(b * 25)) * 1.5} segmentos={30} />
          </>
        )}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [0.3, 0.9, 0.3], t: "H⁺ libres", a: 0.1, z: 2, o: [-60, -90], color: H },
          { p: [-0.6, -0.4, 0.4], t: "Lactato", a: 0.3, z: 2, o: [-60, 90], color: LACTATO },
          { p: [2.2, 0.7, 0.3], t: "MCT4: saca lactato + H⁺", a: 1.05, z: 2, o: [60, -90], color: "#5ec8ff" },
          { p: tn[2], t: "H⁺ ocupa la troponina", a: 2.1, z: 3, o: [60, -100], color: H },
          { p: [1.2, 0.75, 0.3], t: "El Ca²⁺ no puede unirse", a: 2.3, z: 3, o: [-60, -110], color: C.calcio },
          { p: [2.0, 0.72, -0.3], t: "Terminación nerviosa: ardor", a: 2.5, z: 3, o: [60, 70], color: C.nervio },
        ]}
      />
      {!enFilamento ? (
        <div style={{ position: "absolute", left: 60, top: 140, fontFamily: FUENTE, background: "rgba(4,9,20,0.85)", borderRadius: 14, padding: "14px 22px", color: C.texto }}>
          <div style={{ fontSize: 26, color: C.suave }}>pH intracelular</div>
          <div style={{ fontSize: 72, fontWeight: 900, color: ph < 6.8 ? H : "#7cff8a", fontVariantNumeric: "tabular-nums" }}>{ph.toFixed(2)}</div>
          <div style={{ fontSize: 24, color: ph < 6.8 ? H : C.suave }}>{ph < 6.8 ? "Acidosis metabólica" : "Normal"}</div>
        </div>
      ) : (
        <Tarjeta b={b} a={2} z={3} x={60} y={130} w={560} titulo="Consecuencias de la acidosis" color={H} tam={27}>
          <Lista items={["**Ardor muscular**: H⁺ estimula terminaciones nerviosas libres", "**Fallo de la contracción**: H⁺ compite con el Ca²⁺ en la troponina → menos fuerza"]} />
        </Tarjeta>
      )}
      <AbsoluteFill style={{ background: "#000", opacity: flash }} />
    </AbsoluteFill>
  );
};

const Buffers: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const enPulmon = b >= 1;
  const cam = enPulmon
    ? camara(
        [
          { b: 1, p: [0, 0.4, 4.6], l: [0, 0.3, 0], fov: 40 },
          { b: 2, p: [0.6, 0.6, 4.2], l: [0, 0.4, 0], fov: 40 },
        ],
        b,
      )
    : camara(
        [
          { b: 0, p: [0, 0.2, 5.2], l: [0, -0.3, 0], fov: 40 },
          { b: 1, p: [0.4, 0.2, 4.8], l: [0, -0.3, 0], fov: 40 },
        ],
        b,
      );
  // reaccion: H+ + HCO3- -> H2CO3 -> CO2 + H2O (se repite en varias parejas)
  const parejas = [0, 1, 2, 3].map((k) => {
    const f = (b * 1.2 + k / 4) % 1;
    const y = -0.9 + k * 0.6;
    const une = entre(f, 0.15, 0.4);
    const separa = entre(f, 0.55, 0.85);
    return { y, une, separa, f };
  });
  const respira = Math.max(0, Math.sin(b * 22));
  const flash = Math.max(0, 1 - Math.abs(b - 1) / 0.07);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        {!enPulmon ? (
          <>
            <Vaso desde={[-3, -1.6, -0.8]} hasta={[3, -1.6, -0.8]} t={b} radio={0.25} />
            {parejas.map(({ y, une, separa }, k) => (
              <group key={k}>
                {separa < 0.05 ? (
                  <>
                    <Mol p={[mix(-1.4, -0.12, une), y, 0]} color={H} r={0.08} />
                    <Mol p={[mix(1.4, 0.12, une), y, 0]} color="#5ec8ff" r={0.12} />
                  </>
                ) : (
                  <>
                    <Mol p={[-separa * 1.2, y + separa * 0.3, 0]} color="#8a8f99" r={0.12} />
                    <Mol p={[separa * 1.2, y - separa * 0.2, 0]} color="#a8e6ff" r={0.1} />
                  </>
                )}
              </group>
            ))}
          </>
        ) : (
          <>
            <Pulmones respira={respira} />
            {Array.from({ length: 10 }).map((_, i) => {
              const f = (b * 2 + i / 10) % 1;
              return <Mol key={i} p={[Math.sin(i) * 0.2 * f, 1.3 + f * 1.4, 0.2 + f * 0.6]} color="#8a8f99" r={0.07} op={1 - f} />;
            })}
          </>
        )}
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-1.1, 0.9, 0], t: "H⁺", a: 0.05, z: 0.9, o: [-60, -60], color: H },
          { p: [1.1, 0.9, 0], t: "Bicarbonato (HCO₃⁻)", a: 0.05, z: 0.9, o: [60, -60], color: "#5ec8ff" },
          { p: [-1.0, -1.0, 0], t: "CO₂", a: 0.4, z: 0.95, o: [-60, 80], color: "#8a8f99" },
          { p: [1.0, -1.0, 0], t: "H₂O", a: 0.4, z: 0.95, o: [60, 80], color: "#a8e6ff" },
          { p: [0, 2.0, 0.4], t: "CO₂ espirado", a: 1.1, z: 2, o: [60, -60], color: "#8a8f99" },
        ]}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FUENTE, fontSize: 44, fontWeight: 800, color: C.texto }}>
        <Rico t="H⁺ + HCO₃⁻ → **H₂CO₃** → CO₂ + H₂O" />
      </div>
      {enPulmon ? (
        <div style={{ position: "absolute", right: 80, top: 260, fontFamily: FUENTE, fontSize: 40, fontWeight: 900, color: C.acento2 }}>Hiperventilación</div>
      ) : null}
      <AbsoluteFill style={{ background: "#000", opacity: flash }} />
    </AbsoluteFill>
  );
};

export const E2: PlanoDef[] = [
  {
    id: "e-glucolisis-anaerobica",
    seccion: SEC + " (anaeróbico láctico)",
    textos: [
      "**Glucólisis anaeróbica o anaeróbico láctico.** Localización: **citoplasma muscular**. Esfuerzos de **alta intensidad de 30 segundos a 3 minutos**. Usa **exclusivamente glucosa** sanguínea o **glucógeno** almacenado en el músculo.",
      "Proceso: **glucosa → ácido pirúvico → ácido láctico**, cuando no hay oxígeno suficiente. Rinde **2 ATP por glucosa**, o **3 ATP si parte del glucógeno**. Ventaja: proporciona **energía rápida sin requerir oxígeno**.",
    ],
    Escena: GlucolisisIntro,
  },
  {
    id: "e-pasos-glucolisis",
    seccion: SEC + " · La glucólisis paso a paso",
    textos: [
      "**Fase de inversión**: la glucosa, de **6 carbonos**, recibe dos fosfatos: se **gastan 2 ATP** para formar **fructosa-1,6-bisfosfato**.",
      "**Fase de generación**: la molécula se parte en **dos de 3 carbonos**, que se oxidan produciendo **4 ATP y 2 NADH** hasta formar **2 piruvatos**. **Ganancia neta: 2 ATP**.",
      "Ante la alta demanda y la **escasez momentánea de oxígeno**, la enzima **lactato deshidrogenasa** reduce el **piruvato** y lo transforma en **lactato**.",
    ],
    Escena: PasosGlucolisis,
  },
  {
    id: "e-ciclo-cori",
    seccion: SEC + " · Ciclo de Cori",
    textos: [
      "El **lactato** producido en el músculo **sale a la sangre** y viaja hasta el **hígado**.",
      "En el hígado, la **gluconeogénesis** convierte el lactato de nuevo en **glucosa**, un proceso que **cuesta energía** (unos **6 ATP**).",
      "Esa glucosa **regresa por la sangre al músculo** para volver a usarse. Este circuito músculo-hígado se llama **ciclo de Cori**.",
    ],
    Escena: CicloCori,
  },
  {
    id: "e-acidosis",
    seccion: SEC + " · Fatiga y acidosis",
    textos: [
      "**El verdadero villano de la fatiga: los protones (H⁺).** Durante la glucólisis anaeróbica se acumulan **H⁺ libres** en el sarcoplasma y el **pH cae** drásticamente: **acidosis metabólica**.",
      "**La expulsión conjunta**: el transportador **MCT4** saca **lactato e iones H⁺ al mismo tiempo** hacia el espacio extracelular, para evitar el colapso inmediato de la fibra muscular.",
      "Consecuencias: el exceso de H⁺ estimula las **terminaciones nerviosas libres** y genera **ardor**. Además, los H⁺ **compiten con el calcio en la troponina**, inhiben el acoplamiento actina-miosina y el músculo **pierde fuerza**.",
    ],
    Escena: Acidosis,
  },
  {
    id: "e-buffers",
    seccion: SEC + " · Amortiguadores",
    textos: [
      "**El sistema de rescate: los amortiguadores (buffers).** El principal es el **bicarbonato (HCO₃⁻)**: los H⁺ se combinan con él y forman **ácido carbónico**, que se disocia rápidamente en **dióxido de carbono (CO₂) y agua**.",
      "El CO₂ se expulsa mediante la **hiperventilación pulmonar**: por eso **aumenta la frecuencia respiratoria** al final de un esfuerzo intenso.",
    ],
    Escena: Buffers,
  },
];
