import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, PlanoDef, useBeat } from "../motor";
import { Humano } from "../modelos/cuerpo";
import { Polvo } from "../modelos/comun";
import { C, FUENTE } from "../tema";
import { Escena3D, Lista, Rico, Tabla, Tarjeta, TituloGrande } from "../ui";

export const SEC_A = "Unidad 4 · Ejercicio, actividad física y deporte";
const SEC = "4.1 Definiciones y características";

export const COL_A = { af: "#3fb6e0", ej: "#7cff8a", dep: "#ffcf5a", rojo: "#ff6b6b" };

export const Fondo: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${C.fondo2} 0%, ${C.fondo} 75%)` }}>{children}</AbsoluteFill>
);

/** Figura humana a la izquierda de la pantalla, con un movimiento a elegir. */
export const FiguraIzq: React.FC<{
  b: number;
  modo: "camina" | "corre" | "curl" | "sentadilla" | "quieto";
  brilla?: number;
  colorBrillo?: string;
  giro?: number;
}> = ({ b, modo, brilla = 0, colorBrillo, giro = 0.5 }) => {
  const cam = { p: [2.0, 1.25, 3.7] as [number, number, number], l: [0.95, 0.95, 0] as [number, number, number], fov: 36 };
  const ciclo = Math.sin(b * 7);
  const flex = (ciclo + 1) / 2;
  let fig: React.ReactNode;
  if (modo === "camina") fig = <Humano fase={b * 7} marcha={0.9} musculo={0.55} brilla={brilla} colorBrillo={colorBrillo} />;
  else if (modo === "corre") fig = <Humano fase={b * 12} marcha={1.7} musculo={0.55} brilla={brilla} colorBrillo={colorBrillo} />;
  else if (modo === "curl")
    fig = (
      <Humano
        musculo={0.55}
        pesa
        brilla={brilla}
        colorBrillo={colorBrillo}
        pose={{ hombroD: [-0.05, 0, 0.1], hombroI: [-0.05, 0, -0.1], codoD: -0.2 - flex * 2.1, codoI: -0.2 - flex * 2.1 }}
      />
    );
  else if (modo === "sentadilla")
    fig = (
      <group position={[0, -flex * 0.32, 0]}>
        <Humano
          musculo={0.55}
          brilla={brilla}
          colorBrillo={colorBrillo}
          pose={{
            caderaD: [-flex * 1.3, 0, 0],
            caderaI: [-flex * 1.3, 0, 0],
            rodillaD: flex * 1.9,
            rodillaI: flex * 1.9,
            hombroD: [-1.4, 0, 0.1],
            hombroI: [-1.4, 0, -0.1],
            codoD: 0,
            codoI: 0,
          }}
        />
      </group>
    );
  else fig = <Humano musculo={0.55} brilla={brilla} colorBrillo={colorBrillo} />;
  return (
    <Escena3D cam={cam}>
      <group rotation={[0, giro + Math.sin(b * 0.6) * 0.15, 0]}>{fig}</group>
      <Polvo b={b} radio={3} />
    </Escena3D>
  );
};

// ---- Portada ---------------------------------------------------------------

const Portada: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const cam = camara(
    [
      { b: 0, p: [0, 1.2, 4.4], l: [0, 1.0, 0], fov: 35 },
      { b: 2, p: [1.4, 1.3, 3.4], l: [0, 1.0, 0], fov: 35 },
    ],
    b,
  );
  const rapido = entre(b, 0.6, 1.6);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam}>
        <group rotation={[0, 0.6 + b * 0.3, 0]}>
          <Humano fase={b * (7 + rapido * 6)} marcha={0.9 + rapido * 0.8} musculo={0.55} brilla={rapido * 0.3} />
        </group>
      </Escena3D>
      <TituloGrande
        b={b}
        a={0}
        z={2}
        sup="Unidad 4 · Fisiología del ejercicio"
        t="Ejercicio, actividad física y deporte"
        sub="4.1 Definiciones · 4.2 Intensidad · 4.3 Carga-volumen"
      />
    </AbsoluteFill>
  );
};

// ---- Definiciones ------------------------------------------------------------

const Definicion: React.FC<{
  textos: string[];
  modo: "camina" | "corre" | "curl";
  titulo: string;
  color: string;
  def: string;
  items: { a: number; t: string; l: string[] }[];
}> = ({ textos, modo, titulo, color, def, items }) => {
  const b = useBeat(textos);
  const cual = items.reduce((k, it, i) => (b >= it.a ? i : k), 0);
  const it = items[cual];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -230, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo={modo} brilla={0.25 + 0.15 * Math.sin(b * 5)} colorBrillo={color} />
      </div>
      <Tarjeta b={b} a={0} z={textos.length} x={760} y={130} w={1100} titulo={titulo} color={color} tam={30}>
        <Rico t={def} color={color} />
      </Tarjeta>
      <div
        key={cual}
        style={{
          position: "absolute",
          left: 760,
          top: 420,
          width: 1100,
          opacity: entre(b, it.a, it.a + 0.15),
          fontFamily: FUENTE,
          color: C.texto,
          fontSize: 29,
          background: "rgba(4,9,20,0.84)",
          borderRadius: 16,
          padding: "18px 26px",
          borderLeft: `6px solid ${color}`,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, color, marginBottom: 10 }}>{it.t}</div>
        <Lista items={it.l} b={b} a={it.a} paso={0.12} color={color} />
      </div>
    </AbsoluteFill>
  );
};

const ActividadFisica: React.FC<{ textos: string[] }> = ({ textos }) => (
  <Definicion
    textos={textos}
    modo="camina"
    titulo="Actividad física"
    color={COL_A.af}
    def="**Cualquier movimiento corporal** producido por los **músculos esqueléticos** que exija un **gasto de energía** mayor al de reposo."
    items={[
      { a: 0, t: "Ejemplos", l: ["Caminar al trabajo o a la escuela", "Subir escaleras", "Limpiar la casa, jardinería", "Jugar, bailar, cargar las compras"] },
      { a: 1, t: "Características", l: ["**No necesita** estar planificada", "**No necesita** un objetivo concreto", "Lo único que exige: **mover músculos y gastar energía**"] },
      { a: 2, t: "Dominios", l: ["**Tiempo libre** (ocio, recreación)", "**Trabajo** u ocupación", "**Transporte** activo (caminar, bici)", "**Tareas del hogar**"] },
      { a: 3, t: "Gasto energético", l: ["Es el componente **más variable** del gasto total", "Incluye el **NEAT**: actividad cotidiana no deportiva", "Varía de unos cientos a **más de 1 000 kcal/día**"] },
    ]}
  />
);

const Ejercicio: React.FC<{ textos: string[] }> = ({ textos }) => (
  <Definicion
    textos={textos}
    modo="curl"
    titulo="Ejercicio físico"
    color={COL_A.ej}
    def="Subcategoría de la actividad física que es **planificada, estructurada y repetitiva**, con el objetivo de **mejorar o mantener la condición física**."
    items={[
      { a: 0, t: "Sus 4 rasgos", l: ["**Planificado**", "**Estructurado**", "**Repetitivo**", "**Con un objetivo** (condición física)"] },
      { a: 1, t: "¿Qué significa cada uno?", l: ["**Planificado**: se decide antes qué, cuándo y cuánto", "**Estructurado**: series, repeticiones, tiempos y descansos", "**Repetitivo**: sistemático durante semanas o meses"] },
      { a: 2, t: "Ejemplo", l: ["Caminar al súper = **actividad física**", "Caminar **30 min, 5 días/semana, a paso rápido** para mejorar la resistencia = **ejercicio**"] },
    ]}
  />
);

const Deporte: React.FC<{ textos: string[] }> = ({ textos }) => (
  <Definicion
    textos={textos}
    modo="corre"
    titulo="Deporte"
    color={COL_A.dep}
    def="Actividad física, generalmente en forma de **juego**, regida por **reglas**, que implica **competición** y está **institucionalizada** (federaciones)."
    items={[
      { a: 0, t: "Elementos", l: ["**Juego** y actividad física", "**Reglas** establecidas", "**Competición**", "**Institución** que lo regula"] },
      { a: 1, t: "Características", l: ["**Reglamento** oficial", "Competir contra otros **o contra uno mismo**", "**Técnica y táctica** específicas", "**Organización oficial** (federaciones, ligas)"] },
      { a: 2, t: "Objetivo", l: ["**Rendimiento** y ganar", "El alto rendimiento **no siempre es salud**:", "cargas extremas, lesiones, sobreentrenamiento"] },
    ]}
  />
);

// ---- Relacion entre conceptos -----------------------------------------------

const Relacion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const circ = (cx: number, cy: number, r: number, c: string, t: string, a: number, ty: number) => {
    const op = entre(b, a, a + 0.25);
    return (
      <g opacity={op}>
        <circle cx={cx} cy={cy} r={r * (0.85 + 0.15 * op)} fill={c} fillOpacity={0.18} stroke={c} strokeWidth={4} />
        <text x={cx} y={ty} fill={c} fontSize={32} fontWeight={800} textAnchor="middle" fontFamily={FUENTE}>
          {t}
        </text>
      </g>
    );
  };
  const tabla = entre(b, 1, 1.2);
  return (
    <Fondo>
      <svg width={760} height={640} style={{ position: "absolute", left: 50, top: 140 }}>
        {circ(360, 330, 300, COL_A.af, "Actividad física", 0, 75)}
        {circ(300, 380, 180, COL_A.ej, "Ejercicio", 0.3, 300)}
        {circ(450, 420, 150, COL_A.dep, "Deporte", 0.55, 500)}
      </svg>
      <div style={{ position: "absolute", left: 830, top: 150, width: 1040, opacity: Math.max(0.35, tabla), fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "14px 18px" }}>
        <Tabla
          tam={25}
          anchos="1.1fr 1.3fr 1.3fr 1.3fr"
          cab={["", "Actividad física", "Ejercicio", "Deporte"]}
          filas={[
            ["Definición", "Todo movimiento con gasto de energía", "AF planificada, estructurada y repetitiva", "AF reglada, competitiva e institucional"],
            ["Objetivo", "Moverse (salud, tareas)", "Mejorar o mantener la condición física", "Competir y rendir"],
            ["¿Planificado?", "No necesariamente", "Sí", "Sí"],
            ["¿Reglas?", "No", "No (pautas)", "Sí, oficiales"],
            ["Ejemplo", "Subir escaleras", "Rutina de gimnasio", "Partido de fútbol"],
          ]}
          b={b}
          a={1}
          paso={0.15}
        />
      </div>
    </Fondo>
  );
};

// ---- Condicion fisica y sedentarismo ------------------------------------------

const Condicion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const salud = ["Resistencia cardiorrespiratoria", "Fuerza muscular", "Resistencia muscular", "Flexibilidad", "Composición corporal"];
  const habil = ["Agilidad", "Equilibrio", "Coordinación", "Potencia", "Velocidad", "Tiempo de reacción"];
  const fase3 = b >= 3;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: -260, top: 0, width: 1920, height: 1080 }}>
        <FiguraIzq b={b} modo={fase3 ? "quieto" : "sentadilla"} brilla={fase3 ? 0 : 0.3} />
      </div>
      {!fase3 ? (
        <>
          <Tarjeta b={b} a={0} z={3} x={700} y={130} w={1160} titulo="Condición física" color={C.acento} tam={28}>
            <Rico t="Conjunto de **atributos** que una persona **tiene o adquiere** y que determinan su capacidad para realizar actividad física." />
          </Tarjeta>
          <Tarjeta b={b} a={1} z={3} x={700} y={380} w={560} titulo="Relacionados con la salud" color={COL_A.ej} tam={26}>
            <Lista items={salud} b={b} a={1} paso={0.12} color={COL_A.ej} />
          </Tarjeta>
          <Tarjeta b={b} a={2} z={3} x={1300} y={380} w={560} titulo="Relacionados con la habilidad" color={COL_A.dep} tam={26}>
            <Lista items={habil} b={b} a={2} paso={0.1} color={COL_A.dep} />
          </Tarjeta>
        </>
      ) : (
        <>
          <Tarjeta b={b} a={3} z={4} x={700} y={150} w={560} titulo="Inactividad física" color={COL_A.rojo} tam={28}>
            <Lista items={["**No cumplir** las recomendaciones de actividad física", "Se mide por **cuánto te mueves**"]} color={COL_A.rojo} />
          </Tarjeta>
          <Tarjeta b={b} a={3.2} z={4} x={1300} y={150} w={560} titulo="Sedentarismo" color="#c25bff" tam={28}>
            <Lista items={["Tiempo **sentado o acostado** despierto", "Gasto **≤ 1.5 METs**", "Se mide por **cuánto tiempo estás quieto**"]} color="#c25bff" />
          </Tarjeta>
          <div style={{ position: "absolute", left: 700, top: 560, width: 1160, opacity: entre(b, 3.5, 3.7), fontFamily: FUENTE, fontSize: 32, fontWeight: 800, color: C.acento2, background: "rgba(4,9,20,0.85)", borderRadius: 14, padding: "16px 24px", textAlign: "center" }}>
            Puedes ser <span style={{ color: COL_A.ej }}>activo</span> y <span style={{ color: "#c25bff" }}>sedentario</span> a la vez: entrenar 1 h y pasar 10 h sentado
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ---- Recomendaciones de la OMS ---------------------------------------------

const Barra: React.FC<{ t: string; min: number; max: number; color: string; op: number; tope?: number }> = ({ t, min, max, color, op, tope = 320 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: op, marginBottom: 18 }}>
    <div style={{ width: 230, fontSize: 28, fontWeight: 800, color }}>{t}</div>
    <div style={{ position: "relative", flex: 1, height: 46, background: "rgba(255,255,255,0.08)", borderRadius: 10 }}>
      <div style={{ position: "absolute", left: `${(min / tope) * 100 * op}%`, width: `${((max - min) / tope) * 100 * op}%`, top: 0, bottom: 0, background: color, borderRadius: 10, opacity: 0.85 }} />
      <div style={{ position: "absolute", left: `${(min / tope) * 100}%`, top: 8, fontSize: 24, fontWeight: 900, color: "#08121f", paddingLeft: 10 }}>
        {min}–{max} min/semana
      </div>
    </div>
  </div>
);

const OMS: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, right: 90, top: 140, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 42, fontWeight: 900, marginBottom: 20 }}>
          Recomendaciones de la <span style={{ color: C.acento }}>OMS (2020)</span>
        </div>
        <div style={{ background: "rgba(4,9,20,0.86)", borderRadius: 16, padding: "22px 28px", borderTop: `6px solid ${C.acento}`, }}>
          <div style={{ fontSize: 30, color: C.suave, marginBottom: 16 }}>Adultos de 18 a 64 años</div>
          <Barra t="Moderada" min={150} max={300} color={COL_A.ej} op={entre(b, 0.1, 0.4)} />
          <Barra t="Vigorosa" min={75} max={150} color={COL_A.dep} op={entre(b, 0.45, 0.75)} />
          <div style={{ display: "flex", gap: 24, marginTop: 6, opacity: entre(b, 1, 1.2) }}>
            {["Fuerza: **2 o más días** por semana", "**Reducir** el tiempo sedentario", "Más de 300 min: **beneficios extra**"].map((t) => (
              <div key={t} style={{ flex: 1, fontSize: 27, background: "rgba(94,224,255,0.08)", borderRadius: 12, padding: "14px 18px" }}>
                <Rico t={t} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 22, background: "rgba(4,9,20,0.86)", borderRadius: 16, padding: "20px 28px", borderTop: `6px solid ${COL_A.dep}`, opacity: entre(b, 2, 2.2) }}>
          <div style={{ fontSize: 30, color: C.suave, marginBottom: 8 }}>Niños y adolescentes de 5 a 17 años</div>
          <div style={{ fontSize: 32 }}>
            <Rico t="Promedio de **60 min al día** moderada a vigorosa · vigorosa y fuerza **al menos 3 días** por semana" />
          </div>
        </div>
      </div>
    </Fondo>
  );
};

export const A1: PlanoDef[] = [
  {
    id: "a-portada",
    seccion: "",
    textos: [
      "**Unidad 4: Ejercicio, actividad física y deporte.** Son tres palabras que usamos como sinónimos, pero en fisiología **no significan lo mismo**.",
      "Veremos sus **definiciones y características**, cómo **analizar la intensidad** de un entrenamiento y qué son la **carga y el volumen**.",
    ],
    Escena: Portada,
  },
  {
    id: "a-actividad-fisica",
    seccion: SEC + " · Actividad física",
    textos: [
      "**Actividad física**, según la OMS y la definición clásica de **Caspersen (1985)**: es **cualquier movimiento corporal producido por los músculos esqueléticos** que exija un **gasto de energía** mayor al de reposo.",
      "Es el concepto **más amplio**: caminar al trabajo, subir escaleras, limpiar la casa o cargar las compras. **No necesita estar planificada** ni tener un objetivo.",
      "Se realiza en cuatro **dominios**: el **tiempo libre**, el **trabajo**, el **transporte**, como caminar o ir en bici, y las **tareas del hogar**.",
      "Su característica clave es el **gasto energético**: es el componente **más variable** del gasto energético total, e incluye el **NEAT**, la energía de las actividades cotidianas que no son ejercicio.",
    ],
    Escena: ActividadFisica,
  },
  {
    id: "a-ejercicio",
    seccion: SEC + " · Ejercicio",
    textos: [
      "**Ejercicio físico**: es una **subcategoría de la actividad física** que es **planificada, estructurada y repetitiva**, y que tiene como objetivo **mejorar o mantener** uno o más componentes de la **condición física**.",
      "**Planificado**: se decide antes qué, cuándo y cuánto. **Estructurado**: tiene series, repeticiones, tiempos y descansos. **Repetitivo**: se hace de forma sistemática durante semanas.",
      "Ejemplo: caminar al súper es actividad física; caminar **30 minutos, 5 días a la semana, a paso rápido para mejorar tu resistencia**, ya es ejercicio.",
    ],
    Escena: Ejercicio,
  },
  {
    id: "a-deporte",
    seccion: SEC + " · Deporte",
    textos: [
      "**Deporte**: actividad física, generalmente en forma de **juego**, que se rige por **reglas** establecidas, implica **competición** y está **institucionalizada** por organismos como las **federaciones**.",
      "Sus características: un **reglamento**, la **competición** contra otros o contra uno mismo, una **técnica y táctica** específicas, y una **organización oficial** que lo regula.",
      "Su objetivo principal es el **rendimiento**. Por eso el deporte de alto nivel **no siempre es sinónimo de salud**: puede implicar cargas extremas y lesiones.",
    ],
    Escena: Deporte,
  },
  {
    id: "a-relacion",
    seccion: SEC + " · Relación entre conceptos",
    textos: [
      "¿Cómo se relacionan? La **actividad física es el concepto más amplio**. Dentro de ella está el **ejercicio**, y el **deporte** comparte rasgos con ambos: todo deporte es actividad física, pero **no toda actividad física es deporte**.",
      "Resumiendo: la actividad física busca **moverse**; el ejercicio, **mejorar la condición física**; y el deporte, **competir y rendir** bajo reglas oficiales.",
    ],
    Escena: Relacion,
  },
  {
    id: "a-condicion",
    seccion: SEC + " · Condición física",
    textos: [
      "**Condición física**: es el conjunto de **atributos** que una persona tiene o adquiere y que determinan su capacidad para realizar actividad física.",
      "Componentes **relacionados con la salud**: resistencia cardiorrespiratoria, fuerza muscular, resistencia muscular, flexibilidad y composición corporal.",
      "Componentes **relacionados con la habilidad**: agilidad, equilibrio, coordinación, potencia, velocidad y tiempo de reacción.",
      "Ojo con dos términos: **inactividad física** es **no cumplir las recomendaciones**; **sedentarismo** es pasar mucho tiempo **sentado o acostado**, con un gasto **menor o igual a 1.5 METs**. Se puede ser activo y sedentario a la vez.",
    ],
    Escena: Condicion,
  },
  {
    id: "a-oms",
    seccion: SEC + " · Recomendaciones",
    textos: [
      "Recomendaciones de la **OMS (2020)** para **adultos de 18 a 64 años**: de **150 a 300 minutos** por semana de actividad **moderada**, o de **75 a 150 minutos** de actividad **vigorosa**, o una combinación de ambas.",
      "Además, ejercicios de **fortalecimiento muscular** de los grandes grupos **2 o más días por semana**, y **reducir el tiempo sedentario**.",
      "En **niños y adolescentes de 5 a 17 años**: un promedio de **60 minutos diarios** de actividad moderada a vigorosa, con actividades vigorosas y de fuerza **al menos 3 días** por semana.",
    ],
    Escena: OMS,
  },
];
