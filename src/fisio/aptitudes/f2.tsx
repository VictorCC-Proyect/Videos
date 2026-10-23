import React from "react";
import { AbsoluteFill } from "remotion";
import { entre, lineal, PlanoDef, useBeat } from "../motor";
import { C, FUENTE } from "../tema";
import { Lista, Rico, Tabla, Tarjeta } from "../ui";
import { Fondo } from "../actividad/a1";
import { Curvas, Pasos } from "../cardio/comun";
import { Atleta, COL_F } from "./comun";

const SEC = "5.2 Entrenamiento de la resistencia aeróbica";

const Definicion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <Atleta b={b} modo={b < 1 ? "camina" : "corre"} color={COL_F.res} brilla={0.3} />
      <Pasos
        b={b}
        x={640}
        y={130}
        w={1220}
        titulo="Resistencia"
        color={COL_F.res}
        tam={29}
        lineas={[
          { a: 0, t: "Capacidad de **sostener un esfuerzo** el mayor tiempo posible **frente a la fatiga**" },
          { a: 1, t: "**Aeróbica**: intensidad moderada (≈ **65 % del VO₂máx**), larga duración · maratón", color: COL_F.res },
          { a: 1.3, t: "**Anaeróbica**: por encima del **umbral de lactato**, alta intensidad y duración corta", color: COL_F.fuerza },
          { a: 2, t: "Componentes de la aeróbica:", color: C.acento2 },
          { a: 2.1, t: "**VO₂máx** (potencia) · **umbral** (capacidad) · **economía** de carrera" },
        ]}
      />
    </AbsoluteFill>
  );
};

// ---- Zonas, lactato y FatMax ------------------------------------------------------

const lactato = (x: number) => 0.06 + 0.04 * x + (x > 0.62 ? Math.pow((x - 0.62) / 0.38, 2.2) * 0.85 : 0);
const grasa = (x: number) => Math.max(0, 0.75 * Math.exp(-Math.pow((x - 0.63) / 0.24, 2)) - (x > 0.8 ? (x - 0.8) * 3 : 0));

const Zonas: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, top: 120, fontFamily: FUENTE, fontSize: 34, fontWeight: 900, color: C.texto }}>Zonas de intensidad, lactato y oxidación de grasas</div>
      <Curvas
        x={90}
        y={180}
        w={1740}
        h={560}
        series={[
          { f: grasa, color: COL_F.vel, hasta: lineal(b, 0.1, 1.6), t: "Grasa (g/min)" },
          { f: lactato, color: COL_F.fuerza, hasta: lineal(b, 0.5, 2.5), t: "Lactato" },
        ]}
        ejeX="Intensidad (% VO₂máx)"
        ejeY="Oxidación de grasa · lactato"
        ticksX={["Reposo", "20 %", "40 %", "60 %", "80 %", "100 %"]}
        areas={[
          { x0: 0, x1: 0.55, color: COL_F.res, t: "Zonas 1–2", op: entre(b, 0.2, 0.4) },
          { x0: 0.58, x1: 0.7, color: COL_F.vel, t: "Zona 3 · FatMax", op: entre(b, 1, 1.2) },
          { x0: 0.8, x1: 1, color: COL_F.fuerza, t: "Zonas 4–5", op: entre(b, 2, 2.2) },
        ]}
        marcas={[{ x: 0.8, t: "4 mmol/L", color: COL_F.fuerza, op: entre(b, 2.1, 2.3) }]}
      />
    </Fondo>
  );
};

// ---- Metodos ----------------------------------------------------------------------

const METODOS = [
  ["Continuo uniforme extensivo", "30–120 min en zona 2", "Base aeróbica, mitocondrias, uso de grasa"],
  ["Continuo intensivo (tempo)", "20–40 min cerca del umbral", "Subir el umbral de lactato"],
  ["Continuo variable · fartlek", "Cambios de ritmo libres", "Adaptarse a ritmos cambiantes"],
  ["Interválico extensivo", "Intervalos de 2–15 min, pausa corta", "Capacidad aeróbica a ritmo alto"],
  ["Interválico intensivo · HIIT", "10 s–4 min muy intensos; 10–20 min", "VO₂máx y nuevas mitocondrias"],
];

const Metodos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const visibles = b < 1 ? 3 : 5;
  return (
    <Fondo>
      <div style={{ position: "absolute", left: 90, right: 90, top: 130, fontFamily: FUENTE, color: C.texto }}>
        <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 14 }}>Métodos de entrenamiento aeróbico</div>
        <div style={{ background: "rgba(4,9,20,0.9)", borderRadius: 14, padding: "10px 16px" }}>
          <Tabla tam={27} anchos="1.4fr 1.4fr 1.6fr" cab={["Método", "Cómo", "Para qué"]} filas={METODOS.slice(0, visibles)} resalta={b < 1 ? 0 : 4} b={b} a={0} paso={0.2} />
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 0, height: 70, borderRadius: 12, overflow: "hidden", opacity: entre(b, 2, 2.2), fontWeight: 900, fontSize: 28, color: "#08121f" }}>
          <div style={{ flex: 80, background: COL_F.res, display: "flex", alignItems: "center", justifyContent: "center" }}>80 % baja intensidad (zonas 1–2)</div>
          <div style={{ flex: 20, background: COL_F.fuerza, display: "flex", alignItems: "center", justifyContent: "center" }}>20 % alta</div>
        </div>
        <div style={{ fontSize: 26, color: C.suave, marginTop: 8, opacity: entre(b, 2.1, 2.3) }}>Modelo polarizado: así entrenan la mayoría de los atletas de resistencia de élite</div>
      </div>
    </Fondo>
  );
};

// ---- Adaptaciones -------------------------------------------------------------------

const Adaptaciones: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  return (
    <AbsoluteFill>
      <Atleta b={b} modo="corre" color={COL_F.flex} brilla={0.35} />
      <Tarjeta b={b} a={0} z={2} x={640} y={130} w={1220} titulo="Adaptaciones al entrenamiento aeróbico" color={COL_F.flex} tam={28}>
        <Lista
          items={[
            "**Más y mejores mitocondrias**: los atletas de élite tienen hasta **300 % más** capacidad oxidativa que un sedentario",
            "**Más capilares** alrededor de cada fibra muscular",
            "**Corazón**: más volumen sistólico y **FC de reposo más baja**",
            "**VO₂máx** sube 15–20 % y el **umbral** se desplaza a ritmos más altos",
            "Mejor uso de la **grasa**: se ahorra **glucógeno**",
          ]}
          b={b}
          a={0}
          paso={0.2}
          color={COL_F.flex}
        />
      </Tarjeta>
      <div style={{ position: "absolute", left: 640, top: 640, width: 1220, fontFamily: FUENTE, fontSize: 29, color: C.texto, background: "rgba(4,9,20,0.86)", borderLeft: `6px solid ${COL_F.fuerza}`, borderRadius: 12, padding: "16px 24px", opacity: entre(b, 1, 1.15) }}>
        <Rico t="El **HIIT** también es un estímulo muy potente para crear mitocondrias, en solo **10 a 20 minutos**." color={COL_F.fuerza} />
      </div>
    </AbsoluteFill>
  );
};

// ---- Evaluacion -------------------------------------------------------------------

const Evaluacion: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const rivas = b >= 2;
  return (
    <AbsoluteFill>
      <Atleta b={b} modo="corre" color={COL_F.res} brilla={0.3} />
      {!rivas ? (
        <Tarjeta b={b} a={0} z={2} x={640} y={130} w={1220} titulo="Pruebas de campo" color={COL_F.res} tam={28}>
          <Lista
            items={[
              "**Test de Cooper**: máxima distancia en **12 minutos**",
              "**Carrera de 3 000 m** o de 2 400 m",
              "**Course Navette**: ida y vuelta de 20 m con ritmo creciente",
              "**Yo-Yo test**: intermitente, ideal para deportes de equipo",
              "En laboratorio: **ergoespirometría** (VO₂máx y umbrales directos)",
            ]}
            b={b}
            a={0}
            paso={0.25}
            color={COL_F.res}
          />
        </Tarjeta>
      ) : (
        <Pasos
          b={b}
          x={640}
          y={130}
          w={1220}
          titulo="Ejemplo real: futbolistas (Rivas, 2015)"
          color={COL_F.flex}
          tam={29}
          lineas={[
            { a: 2, t: "**7 semanas** de pretemporada, evaluados con el **Yo-Yo IR2**" },
            { a: 2.15, t: "Intensidad: del **50–60 % al 90 %** · el volumen **bajó**" },
            { a: 2.3, t: "Primero **fartlek e intervalos extensivos**; al final, **juegos en espacio reducido**" },
            { a: 2.5, t: "VO₂máx: **55.4 → 57.9 ml/kg/min**", grande: true, color: COL_F.flex },
          ]}
        />
      )}
    </AbsoluteFill>
  );
};

export const F2: PlanoDef[] = [
  {
    id: "f-res-def",
    seccion: SEC,
    textos: [
      "La **resistencia** es la capacidad de **sostener un esfuerzo** el mayor tiempo posible **frente a la fatiga**.",
      "Se divide en **aeróbica**, a intensidades moderadas, alrededor del **65 % del VO₂máx**, y de larga duración, como el maratón; y **anaeróbica**, por encima del **umbral de lactato**, de alta intensidad y duración limitada.",
      "La resistencia aeróbica depende de tres componentes: el **VO₂máx**, o potencia aeróbica; el **umbral**, o capacidad de sostener un ritmo alto; y la **economía** del movimiento.",
    ],
    Escena: Definicion,
  },
  {
    id: "f-res-zonas",
    seccion: SEC + " · Zonas",
    textos: [
      "La intensidad se organiza en **zonas del 1 al 5**. En las **zonas 1 y 2** el lactato se mantiene bajo, de **1 a 2 milimoles por litro**, y la grasa es el combustible principal.",
      "En la **zona 3**, entre el **60 y 70 % del VO₂máx**, está el **FatMax**: la intensidad a la que se oxidan **más gramos de grasa por minuto**.",
      "En las **zonas 4 y 5**, por encima de **4 milimoles de lactato**, el cuerpo depende casi solo de los **hidratos de carbono** y la oxidación de grasa cae hasta casi cero.",
    ],
    Escena: Zonas,
  },
  {
    id: "f-res-metodos",
    seccion: SEC + " · Métodos",
    textos: [
      "Métodos **continuos**: el **uniforme extensivo**, de 30 a 120 minutos en zona 2, que construye la base aeróbica; el **intensivo o tempo**, de 20 a 40 minutos cerca del umbral; y el **variable o fartlek**, con cambios de ritmo.",
      "Métodos **interválicos**: los **extensivos**, con intervalos de 2 a 15 minutos y pausas cortas; y los **intensivos o HIIT**, con esfuerzos de 10 segundos a 4 minutos muy intensos, en sesiones de solo **10 a 20 minutos**.",
      "Los atletas de resistencia de élite suelen seguir un **modelo polarizado**: cerca del **80 % del tiempo a baja intensidad** y el **20 % a alta intensidad**.",
    ],
    Escena: Metodos,
  },
  {
    id: "f-res-adaptaciones",
    seccion: SEC + " · Adaptaciones",
    textos: [
      "Las adaptaciones: **más y mejores mitocondrias**, hasta **300 % más capacidad oxidativa** en atletas de élite que en sedentarios; **más capilares**; más volumen sistólico y menor FC de reposo; un **VO₂máx** más alto y un **umbral** a ritmos más rápidos.",
      "El **HIIT** también es un estímulo muy potente para crear mitocondrias, en sesiones cortas de 10 a 20 minutos.",
    ],
    Escena: Adaptaciones,
  },
  {
    id: "f-res-evaluacion",
    seccion: SEC + " · Evaluación",
    textos: [
      "Para evaluarla se usan pruebas de campo como el **test de Cooper**, de 12 minutos; la **carrera de 3 000 metros**; la **Course Navette**; o el **Yo-Yo test**, ideal para deportes de equipo. En laboratorio, la **ergoespirometría**.",
      "Si se usa un **test de campo**, conviene repetirlo **cada 6 a 8 semanas**, en las mismas condiciones, para ver si el programa funciona.",
      "Un ejemplo real: en futbolistas profesionales, **7 semanas** de pretemporada, subiendo la intensidad del **50 al 90 %** y bajando el volumen, con **fartlek e intervalos** al inicio y **juegos reducidos** al final, subieron su VO₂máx de **55.4 a 57.9 ml por kilo por minuto**.",
    ],
    Escena: Evaluacion,
  },
];
