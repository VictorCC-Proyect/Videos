import React from "react";
import { AbsoluteFill } from "remotion";
import { entre, mix, PlanoDef, useBeat } from "../motor";
import { C, FUENTE } from "../tema";
import { Lista, Rico, Tabla, Tarjeta, TituloGrande } from "../ui";
import { Fondo, FiguraIzq } from "../actividad/a1";
import { COL_K, Indicador, Pasos } from "./comun";
import { CorazonIzq } from "./k1";

const SEC = "3.5 Control de la intensidad por la FC";

// ---- Tomar el pulso -------------------------------------------------------------

const Pulso: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cuenta = b < 1 ? Math.min(18, Math.floor(entre(b, 0.3, 0.95) * 18)) : 18;
  return (
    <AbsoluteFill>
      <CorazonIzq b={b} lpm={72} />
      <Indicador x={420} y={640} valor={String(cuenta)} unidad="latidos en 15 s" color={COL_K.fc} op={b < 1 ? 1 : 0.4} />
      <Pasos
        b={b}
        x={760}
        y={130}
        w={1100}
        titulo="¿Cómo medir la FC?"
        color={COL_K.fc}
        lineas={[
          { a: 0, t: "**Pulso radial**: muñeca, del lado del pulgar" },
          { a: 0.15, t: "**Pulso carotídeo**: cuello, sin presionar fuerte" },
          { a: 0.3, t: "Con **índice y medio**, nunca con el pulgar" },
          { a: 0.6, t: "Cuenta **15 s × 4**: 18 × 4 = **72 lpm**", color: COL_K.fc },
          { a: 1, t: "**Banda de pecho**: la más precisa" },
          { a: 1.2, t: "**Reloj de muñeca**: cómodo, pero falla más en esfuerzos intensos" },
          { a: 1.4, t: "La FC de reposo se mide **al despertar**, acostado" },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---- FC maxima ----------------------------------------------------------------

const FCmax: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -300, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo="corre" brilla={0.3 + 0.2 * Math.sin(b * 7)} colorBrillo={COL_K.fc} />
      </div>
      <Pasos
        b={b}
        x={640}
        y={130}
        w={1220}
        titulo="1. Conocer la FC máxima"
        color={COL_K.fc}
        lineas={[
          { a: 0, t: "Lo ideal: **prueba de esfuerzo** máxima" },
          { a: 0.3, t: "Si no, estimarla con fórmulas:" },
          { a: 0.45, t: "**Clásica: 220 − edad** → 30 años: **190 lpm**", color: COL_K.fc },
          { a: 0.65, t: "**Tanaka: 208 − 0.7 × edad** → 30 años: **187 lpm**", color: COL_K.fc },
          { a: 1, t: "Margen de error de **± 10 a 12 lpm**: son estimaciones" },
          { a: 1.25, t: "No depende del entrenamiento: baja con la **edad**" },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---- Metodos y zonas ACSM -------------------------------------------------------

const Metodos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, top: 130, width: 1740, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, fontFamily: FUENTE, color: C.texto }}>
        {[
          { n: "% de la FC máxima", f: "FC objetivo = % × FCmáx", d: "Sencillo, pero ignora la FC de reposo", c: COL_K.fc, a: 0 },
          { n: "% de la FC de reserva (Karvonen)", f: "FC objetivo = FCrep + % × (FCmáx − FCrep)", d: "Más individual: se parece al % del VO₂ de reserva", c: COL_K.o2, a: 0.4 },
        ].map((m) => (
          <div key={m.n} style={{ opacity: entre(b, m.a, m.a + 0.2), background: "rgba(4,9,20,0.86)", borderTop: `6px solid ${m.c}`, borderRadius: 16, padding: "18px 24px" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: m.c }}>{m.n}</div>
            <div style={{ fontSize: 28, fontWeight: 800, margin: "10px 0" }}>{m.f}</div>
            <div style={{ fontSize: 24, color: C.suave }}>{m.d}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, top: 420, width: 1740, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "14px 22px", opacity: entre(b, 1, 1.15) }}>
        <div style={{ fontSize: 30, fontWeight: 900, color: C.acento, marginBottom: 6 }}>Intensidad según el ACSM</div>
        <Tabla
          tam={27}
          anchos="1fr 1fr 1fr 1fr"
          cab={["Intensidad", "% FC máx", "% FC reserva", "RPE (0–10)"]}
          filas={[
            ["Ligera", "57–63 %", "30–39 %", "2–4"],
            ["Moderada", "64–76 %", "40–59 %", "5–6"],
            ["Vigorosa", "77–95 %", "60–89 %", "7–8"],
          ]}
          b={b}
          a={1.1}
          paso={0.2}
        />
      </div>
    </Fondo>
  );
};

// ---- Ejemplo completo ------------------------------------------------------------

const Ejemplo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const W = 1700;
  const MIN = 60;
  const MAX = 200;
  const px = (v: number) => ((v - MIN) / (MAX - MIN)) * W;
  const bandas = [
    { a: 118, z: 141, t: "Moderada 118–141", c: COL_K.o2, op: entre(b, 1, 1.15) },
    { a: 142, z: 177, t: "Vigorosa 142–177", c: COL_K.rojo, op: entre(b, 1.4, 1.55) },
  ];
  return (
    <Fondo>
      <Pasos
        b={b}
        x={90}
        y={120}
        w={1740}
        titulo="Ejemplo: 30 años · FC de reposo 70 lpm"
        color={COL_K.o2}
        tam={29}
        lineas={[
          { a: 0, t: "FCmáx = 220 − 30 = **190** · Reserva = 190 − 70 = **120**" },
          { a: 0.4, t: "Moderada 40 %: 70 + 0.40 × 120 = **118** · 59 %: 70 + 0.59 × 120 = **141**", color: COL_K.o2 },
          { a: 1.2, t: "Vigorosa 60 %: 70 + 0.60 × 120 = **142** · 89 %: 70 + 0.89 × 120 = **177**", color: COL_K.rojo },
        ]}
      />
      <div style={{ position: "absolute", left: 110, top: 560, width: W, height: 200, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ position: "absolute", top: 60, left: 0, width: W, height: 70, background: "rgba(255,255,255,0.08)", borderRadius: 12 }} />
        {bandas.map((k) => (
          <div key={k.t} style={{ position: "absolute", top: 60, left: px(k.a), width: px(k.z) - px(k.a), height: 70, background: k.c, opacity: k.op * 0.85, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#08121f", fontWeight: 900, fontSize: 26 }}>
            {k.t}
          </div>
        ))}
        {[60, 70, 100, 130, 160, 190].map((v) => (
          <div key={v} style={{ position: "absolute", left: px(v) - 30, width: 60, top: 140, textAlign: "center", fontSize: 24, color: v === 70 || v === 190 ? C.acento2 : C.suave, fontWeight: v === 70 || v === 190 ? 900 : 400 }}>
            {v}
          </div>
        ))}
        <div style={{ position: "absolute", left: px(70) - 60, top: 10, fontSize: 22, color: C.acento2 }}>FC reposo</div>
        <div style={{ position: "absolute", left: px(190) - 50, top: 10, fontSize: 22, color: C.acento2 }}>FC máx</div>
      </div>
    </Fondo>
  );
};

// ---- Limitaciones -------------------------------------------------------------------

const Limitaciones: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <CorazonIzq b={b} lpm={mix(80, 140, (Math.sin(b * 2) + 1) / 2)} />
      <Tarjeta b={b} a={0} z={2} x={760} y={130} w={1100} titulo="¿Qué altera la FC sin cambiar la intensidad?" color={COL_K.rojo} tam={28}>
        <Lista
          items={["**Calor** y **deshidratación** (deriva cardiovascular)", "**Medicamentos**: los **betabloqueadores** la bajan", "**Cafeína**, **estrés**, falta de **sueño**", "**Altitud**, **posición** del cuerpo y **tipo de ejercicio** (brazos vs piernas)"]}
          b={b}
          a={0}
          paso={0.2}
          color={COL_K.rojo}
        />
      </Tarjeta>
      <Tarjeta b={b} a={1} z={2} x={760} y={560} w={1100} titulo="Consejo práctico" color={COL_K.o2} tam={28}>
        <Rico t="Usa la FC **junto con la percepción del esfuerzo (RPE)** y el **test del habla**." />
      </Tarjeta>
    </AbsoluteFill>
  );
};

// ---- Repaso y cierre ---------------------------------------------------------------

const Repaso: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cards = [
    { n: "3.1 FC", c: COL_K.fc, a: 0, l: ["Reposo **60–100** lpm", "Sube **lineal** con la intensidad", "**Q = FC × VS**"] },
    { n: "3.2 VO₂ y VO₂máx", c: COL_K.o2, a: 0.35, l: ["**Fick**: Q × dif a-vO₂", "Meseta = **VO₂máx**", "Cooper: (m − 504.9) ÷ 44.73"] },
    { n: "3.3 Deuda de O₂", c: COL_K.deuda, a: 0.7, l: ["**Déficit** al inicio", "**EPOC** al terminar", "Rápido y lento"] },
    { n: "3.4 MET", c: COL_K.met, a: 1, l: ["1 MET = **3.5 ml/kg/min**", "METs = VO₂ ÷ 3.5", "kcal/min = METs × 3.5 × kg ÷ 200"] },
    { n: "3.5 Control por FC", c: C.acento, a: 1.3, l: ["%FCmáx o **Karvonen**", "Moderada **40–59 % FCR**", "Vigorosa **60–89 % FCR**"] },
  ];
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 60, right: 60, top: 130, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, fontFamily: FUENTE, color: C.texto }}>
        {cards.map((k) => {
          const op = entre(b, k.a, k.a + 0.2);
          return (
            <div key={k.n} style={{ opacity: op, transform: `translateY(${(1 - op) * 20}px)`, background: "rgba(4,9,20,0.86)", borderRadius: 16, padding: "18px 18px", borderTop: `6px solid ${k.c}` }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: k.c, marginBottom: 12 }}>{k.n}</div>
              <div style={{ fontSize: 26 }}>
                <Lista items={k.l} color={k.c} />
              </div>
            </div>
          );
        })}
      </div>
    </Fondo>
  );
};

const Preguntas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const q = b < 1 ? 0 : 1;
  const pregs = [
    { p: "VO₂ de 3.0 L/min y 60 kg: ¿VO₂ relativo y METs?", r: ["3 000 ÷ 60 = **50 ml/kg/min**", "50 ÷ 3.5 ≈ **14 METs**"] },
    { p: "Termina la carrera y sigues jadeando 5 minutos: ¿qué es?", r: ["El **EPOC** (deuda de oxígeno)", "Rápido: **PCr y mioglobina** · Lento: **lactato, temperatura, hormonas**"] },
  ];
  const pr = pregs[q];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -260, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo="corre" brilla={0.3} colorBrillo={COL_K.o2} />
      </div>
      <div key={q} style={{ position: "absolute", left: 700, top: 150, width: 1160, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 28, color: C.acento2, fontWeight: 800, letterSpacing: 3 }}>PREGUNTA DE REPASO {q + 1}</div>
        <div style={{ fontSize: 42, fontWeight: 900, marginTop: 10, opacity: entre(b, q, q + 0.15) }}>{pr.p}</div>
        <div style={{ marginTop: 26, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "20px 28px", borderLeft: `6px solid ${COL_K.o2}`, fontSize: 34 }}>
          {pr.r.map((t, i) => (
            <div key={t} style={{ opacity: entre(b, q + 0.35 + i * 0.2, q + 0.45 + i * 0.2), marginBottom: 8 }}>
              <Rico t={t} color={COL_K.o2} />
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Final: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <CorazonIzq b={b} lpm={70} dx={-700} />
      <TituloGrande b={b} a={0} z={1.2} sup="Unidad 3" t="¡Corazón entendido!" sub="FC · VO₂máx · Deuda de O₂ · MET · Control por FC" />
    </AbsoluteFill>
  );
};

export const K4: PlanoDef[] = [
  {
    id: "k-pulso",
    seccion: SEC + " · Medir la FC",
    textos: [
      "Para controlar la intensidad primero hay que **medir la FC**. Se toma el **pulso radial**, en la muñeca del lado del pulgar, o el **carotídeo**, en el cuello sin presionar fuerte, con los dedos **índice y medio**. Se cuentan los latidos en **15 segundos y se multiplica por 4**.",
      "También se usa una **banda de pecho**, que es la más precisa, o un **reloj de muñeca**, más cómodo pero menos exacto en esfuerzos intensos. La FC de reposo se mide **al despertar**, acostado.",
    ],
    Escena: Pulso,
  },
  {
    id: "k-fcmax",
    seccion: SEC + " · FC máxima",
    textos: [
      "Después se necesita la **FC máxima**. Lo ideal es medirla en una **prueba de esfuerzo**; si no, se estima: **220 menos la edad**, o con la de **Tanaka, 208 menos 0.7 por la edad**. Para 30 años: **190** y **187**.",
      "Son estimaciones con un error de **más o menos 10 a 12 latidos**. La FC máxima **no mejora con el entrenamiento**: depende sobre todo de la **edad**.",
    ],
    Escena: FCmax,
  },
  {
    id: "k-metodos",
    seccion: SEC + " · Métodos",
    textos: [
      "Hay dos métodos: el **porcentaje de la FC máxima**, sencillo pero que ignora la FC de reposo; y el de **Karvonen**, o **FC de reserva**: FC objetivo = FC de reposo + porcentaje × (FC máxima − FC de reposo). Es más individual, porque se parece al porcentaje del VO₂ de reserva.",
      "Según el **Colegio Americano de Medicina del Deporte (ACSM)**: intensidad **moderada**, del **64 al 76 % de la FC máxima** o del **40 al 59 % de la FC de reserva**; **vigorosa**, del **77 al 95 %** de la máxima o del **60 al 89 %** de la reserva.",
    ],
    Escena: Metodos,
  },
  {
    id: "k-ejemplo",
    seccion: SEC + " · Ejemplo",
    textos: [
      "Ejemplo: **30 años** y FC de reposo de **70**. FC máxima = 220 − 30 = **190**; reserva = 190 − 70 = **120**. Al **40 %**: 70 + 0.4 × 120 = **118**; al **59 %**: 70 + 0.59 × 120 = **141**.",
      "Su zona **moderada** va de **118 a 141 latidos por minuto**, y su zona **vigorosa**, del 60 al 89 %, va de **142 a 177**.",
    ],
    Escena: Ejemplo,
  },
  {
    id: "k-limitaciones",
    seccion: SEC + " · Limitaciones",
    textos: [
      "Ojo: la FC puede cambiar **sin que cambie la intensidad**: por **calor y deshidratación**, por medicamentos como los **betabloqueadores**, por **cafeína**, **estrés**, falta de sueño, **altitud** o el **tipo de ejercicio**.",
      "Por eso lo mejor es usar la FC **junto con la percepción del esfuerzo** y el **test del habla**.",
    ],
    Escena: Limitaciones,
  },
  {
    id: "k-repaso",
    seccion: "Repaso",
    textos: [
      "**Resumen.** FC: en reposo de **60 a 100**, sube **lineal** con la intensidad, y el gasto cardiaco es **FC × volumen sistólico**. VO₂: **gasto cardiaco × diferencia arteriovenosa**; el **VO₂máx** es la meseta de la prueba incremental.",
      "Deuda de oxígeno: un **déficit** al inicio y el **EPOC** al terminar, con componente rápido y lento. **1 MET = 3.5 ml por kilo por minuto**. Y para controlar la intensidad: **% de FC máxima** o **Karvonen**.",
    ],
    Escena: Repaso,
  },
  {
    id: "k-preguntas",
    seccion: "Repaso · Preguntas",
    textos: [
      "Pregunta: una persona de **60 kilos** con un VO₂ de **3 litros por minuto**, ¿cuál es su VO₂ relativo y cuántos METs son? 3 000 ÷ 60 = **50 ml por kilo por minuto**, y 50 ÷ 3.5 ≈ **14 METs**.",
      "Otra: terminas de correr y sigues jadeando cinco minutos, ¿qué es? Es el **EPOC**: el componente rápido repone **fosfocreatina y mioglobina**, y el lento se encarga del **lactato, la temperatura y las hormonas**.",
    ],
    Escena: Preguntas,
  },
  {
    id: "k-final",
    seccion: "",
    textos: [
      "Con esto ya tienes la base de la **Unidad 3**. ¡Ahora sí, a entrenar ese corazón!",
    ],
    Escena: Final,
  },
];
