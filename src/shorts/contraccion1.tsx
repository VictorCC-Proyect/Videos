// Short: ¿Cómo le ordena tu cerebro al músculo que se contraiga? (Parte 1)
// Del atleta al cerebro, la médula, la motoneurona, la placa motora, la membrana de la fibra,
// los túbulos T y la tríada, hasta que el retículo libera el calcio.
import React from "react";
import { AbsoluteFill } from "remotion";
import { camara, entre, lineal, mix, mix3, PlanoDef, useBeat, V3 } from "../fisio/motor";
import { Particulas, Polvo } from "../fisio/modelos/comun";
import { MiniATP } from "../fisio/energia/e1";
import { Triada, triadas } from "../fisio/capitulos/cap1";
import { Cerebro as CerebroMotor } from "../fisio/capitulos/cap6";
import { Escena3D, Etiquetas } from "../fisio/ui";
import { EscenaComentarios } from "./cierre";
import { Chip, Dato, Destello, K, ShortDef, Titular } from "./marco";
import { Atleta, Piso } from "./modelos";
import {
  ACH_C,
  CA_C,
  DHPR_C,
  NA_C,
  NERVIO_C,
  PlacaMotora,
  puntoAxonPM,
  RECEPTOR_ACH,
  RECEPTORES_ACH,
  RETICULO_C,
  RYR_C,
  SOMA,
  AXON_UM,
  FIBRAS_UM,
  TriadaZoom,
  TUBOT_C,
  UnidadMotora,
  ViaMotora,
  Y_CISTERNA,
  Y_MIOFIBRILLA,
  CANALES_X,
  R_TUBOT,
} from "./modelos-contraccion";

const CAB: V3 = [0, 1.68, 0.01];

// 0 · Gancho: atleta en sentadilla + ATP girando ------------------------------------
const Gancho: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const k = Math.sin(((b * 2.3) % 1) * Math.PI);
  const cam = camara(
    [
      { b: 0, p: [3.2, 1.6, 5.6], l: [0.1, 0.95, 0], fov: 36 },
      { b: 1, p: [-2.4, 1.5, 5.5], l: [0.1, 0.97, 0], fov: 36 },
    ],
    b,
  );
  const atp: V3 = [0.62, 1.45, 0.1];
  const gasta = entre(b, 0.3, 0.5);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <Atleta ej="sentadilla" k={k} brilla={0.2 + 0.6 * k * gasta} colorBrillo={K.naranja} pesa={false} />
        <Piso color={K.naranja} />
        <group position={atp} rotation={[0.3, b * 9, 0.2]}>
          <MiniATP p={[0, 0, 0]} escala={1} brillo={0.6 + 0.4 * Math.sin(b * 20)} />
        </group>
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas cam={cam} b={b} items={[{ p: atp, t: "ATP", a: 0.04, z: 0.42, o: [70, -70], color: K.naranja }]} />
      <Titular b={b} a={0.4} z={1} y={270} tam={120} t={<>¿Cómo se <span style={{ color: K.naranja }}>contrae</span> tu músculo?</>} />
      <Chip b={b} a={0.78} z={1} t="PARTE 1" x={540} y={1100} color={K.lima} />
    </AbsoluteFill>
  );
};

// 1 · Cerebro: corteza motora -> medula espinal -------------------------------------
const C1 = 0.22;
const C2 = 0.6;
const Cerebro: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const tramo = b < C1 ? 0 : b < C2 ? 1 : 2;
  const cam =
    tramo === 0
      ? camara(
          [
            { b: 0, p: [0.6, 1.25, 6.2], l: [0, 0.75, 0], fov: 36 },
            { b: 0.08, p: [0.6, 1.3, 5.6], l: [0, 0.85, 0], fov: 36 },
            { b: C1, p: [0.4, 1.82, 1.35], l: [0, 1.62, 0], fov: 36 },
          ],
          b,
        )
      : tramo === 1
        ? camara(
            [
              { b: C1, p: [4.6, 2.0, 6.6], l: [0, -0.6, 0], fov: 40 },
              { b: C2, p: [5.8, 2.2, 4.8], l: [0, -0.65, 0], fov: 40 },
            ],
            b,
          )
        : camara(
            [
              { b: C2, p: [2.2, 1.5, 3.6], l: [0, 1.02, 0], fov: 38 },
              { b: 1, p: [2.6, 1.25, 3.2], l: [0.05, 0.98, 0], fov: 38 },
            ],
            b,
          );
  const motor = tramo === 0 ? entre(b, 0.1, 0.2) : 1;
  // senales que bajan de la corteza motora al tronco del encefalo
  const senal: V3[] = [0, 1, 2, 3, 4, 5].map((k) => {
    const t = (b * 3 + k / 6) % 1;
    const lado = k % 2 ? 1 : -1;
    return mix3([lado * 0.4, 0.68, 0.1], [0, -1.3, -0.42], t);
  });
  const pulso = lineal(b, C2 + 0.02, 0.98);
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={tramo === 1 ? "#1d1a2e" : K.fondo2}>
        {tramo === 0 ? (
          <>
            <Atleta ej="parado" musculo={0.55} />
            <Piso />
            <group position={CAB} scale={0.125}>
              <CerebroMotor motor={motor} />
            </group>
          </>
        ) : null}
        {tramo === 1 ? (
          <>
            <group rotation={[0, (b - C1) * 0.6, 0]}>
              <CerebroMotor motor={1} />
              {b > C1 + 0.06 ? <Particulas pos={senal} radio={0.05} color="#fff3b0" brillo={2.5} /> : null}
            </group>
            <Polvo b={b} radio={4} />
          </>
        ) : null}
        {tramo === 2 ? (
          <>
            <Atleta ej="parado" musculo={0.28} brilla={0} />
            <group position={CAB} scale={0.125}>
              <CerebroMotor motor={1} />
            </group>
            <ViaMotora medula={entre(b, C2, C2 + 0.08)} nervio={entre(b, 0.85, 0.95)} pulso={pulso} />
            {pulso > 0.93 ? (
              <mesh position={[0.1, 0.73, 0.02]} scale={[1, 2.6, 1]}>
                <sphereGeometry args={[0.09, 20, 16]} />
                <meshBasicMaterial color={NERVIO_C} transparent opacity={0.35 * entre(b, 0.93, 0.97)} depthWrite={false} />
              </mesh>
            ) : null}
          </>
        ) : null}
      </Escena3D>
      <Destello b={b} en={[C1, C2]} />
      {tramo === 1 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [0.42, 0.66, 0.1], t: "Corteza motora", a: C1 + 0.05, z: C2, o: [-40, -150], color: NERVIO_C },
            { p: [0, -1.1, -0.38], t: "Tronco del encéfalo", a: C1 + 0.2, z: C2, o: [-60, 90], color: "#e3b0b0" },
          ]}
        />
      ) : null}
      {tramo === 2 ? (
        <Etiquetas
          cam={cam}
          b={b}
          items={[
            { p: [0, 1.4, -0.075], t: "Médula espinal", a: C2 + 0.04, z: 1, o: [-70, -60], color: NERVIO_C },
            { p: [0.12, 0.84, 0.06], t: "Nervio al músculo", a: 0.86, z: 1, o: [70, 50], color: NERVIO_C },
          ]}
        />
      ) : null}
      <Chip b={b} a={0.02} z={C1} t="CEREBRO" x={540} y={330} color="#ff8fb0" />
      <Dato b={b} a={C1 + 0.04} z={C2} t="Corteza motora" sub="decide el movimiento" color={NERVIO_C} y={260} tam={90} />
      <Dato b={b} a={C2 + 0.02} z={1.1} t="⚡ Señal eléctrica" sub="baja por la médula espinal" color={NERVIO_C} y={230} tam={70} />
    </AbsoluteFill>
  );
};

// 2 · Motoneurona y unidad motora ------------------------------------------------
const Unidad: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const p1 = lineal(b, 0.04, 0.38);
  const p2 = lineal(b, 0.56, 0.84);
  const pulso = b < 0.42 ? p1 : b > 0.55 && b < 0.86 ? p2 : -1;
  const act1 = entre(b, 0.36, 0.4) * (1 - entre(b, 0.46, 0.56));
  const act2 = entre(b, 0.82, 0.86);
  const activa = Math.max(act1, act2);
  const cam = camara(
    [
      { b: 0, p: [2.2, 1.2, 12.4], l: [-0.3, -0.6, 0], fov: 40 },
      { b: 0.45, p: [0.9, 0.9, 11.8], l: [-0.1, -0.65, 0], fov: 40 },
      { b: 1, p: [-2.0, 1.1, 12.0], l: [0, -0.65, 0], fov: 40 },
    ],
    b,
  );
  const mia = FIBRAS_UM.find((f) => f.mia)!;
  const otra = FIBRAS_UM.find((f) => !f.mia && f.y < -1.1)!;
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <UnidadMotora pulso={pulso} activa={activa} />
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: SOMA, t: "Motoneurona", a: 0.06, z: 1, o: [80, -60], color: NERVIO_C },
          { p: AXON_UM[2], t: "Axón con mielina", a: 0.18, z: 0.55, o: [70, -20], color: "#fff6e0" },
          { p: [mia.x + 1.2, mia.y, mia.z + 0.13], t: "Sus fibras", a: 0.62, z: 1, o: [60, 110], color: K.amarillo },
          { p: [otra.x - 1, otra.y, otra.z + 0.13], t: "Otra unidad", a: 0.72, z: 1, o: [-60, 130], color: "#e88a7a" },
        ]}
      />
      <Chip b={b} a={0.02} z={0.5} t="MOTONEURONA" x={540} y={330} color={NERVIO_C} />
      <Dato b={b} a={0.55} z={1.1} t="Unidad motora" sub="1 neurona + todas sus fibras" color={K.amarillo} y={260} tam={96} />
    </AbsoluteFill>
  );
};

// 3 · Placa motora: se libera acetilcolina -----------------------------------------
const Placa: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const llega = lineal(b, 0.02, 0.3);
  const fusion = entre(b, 0.32, 0.52);
  const ach = lineal(b, 0.45, 1);
  const cam = camara(
    [
      { b: 0, p: [-0.6, 3.0, 8.4], l: [-0.9, 0.6, 0], fov: 40 },
      { b: 0.3, p: [0.2, 1.9, 5.2], l: [-0.2, 0.3, 0], fov: 40 },
      { b: 0.55, p: [1.0, 0.7, 3.6], l: [0, 0.3, 0], fov: 40 },
      { b: 1, p: [-0.7, 0.5, 3.3], l: [0, 0.28, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <PlacaMotora b={b} llega={llega} fusion={fusion} ach={ach} />
        <Polvo b={b} radio={6} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: puntoAxonPM(0.35), t: "Axón", a: 0.02, z: 0.3, o: [70, -60], color: NERVIO_C },
          { p: [-0.3, 0.85, 0.3], t: "Placa motora", a: 0.22, z: 0.62, o: [-50, -110], color: NERVIO_C },
          { p: [0.25, 0.25, 0.2], t: "Acetilcolina", a: 0.62, z: 1, o: [60, -130], color: ACH_C },
          { p: [-0.6, 0.0, 0.5], t: "Fibra muscular", a: 0.7, z: 1, o: [-40, 120], color: "#e88a7a" },
        ]}
      />
      <Chip b={b} a={0.02} z={0.5} t="PLACA MOTORA" x={540} y={330} color={NERVIO_C} />
      <Dato b={b} a={0.6} z={1.1} t="Acetilcolina" sub="mensajero químico" color={ACH_C} y={260} tam={96} />
    </AbsoluteFill>
  );
};

// 4 · Receptores, entra sodio, potencial de accion ------------------------------------
const Potencial: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const union = entre(b, 0.04, 0.26);
  const sodio = lineal(b, 0.28, 0.62);
  const onda = lineal(b, 0.58, 0.98);
  const cam = camara(
    [
      { b: 0, p: [-0.7, 0.5, 3.3], l: [0, 0.25, 0], fov: 40 },
      { b: 0.28, p: [0.3, 0.3, 2.9], l: [0, 0.1, 0], fov: 40 },
      { b: 0.5, p: [0.9, 0.3, 3.2], l: [0, 0.0, 0], fov: 40 },
      { b: 0.66, p: [15, 7.0, 13], l: [-1, -2.4, 0], fov: 40 },
      { b: 1, p: [17, 6.0, 10], l: [-2, -2.6, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <PlacaMotora b={b} fusion={1} ach={1} achOp={1 - entre(b, 0.26, 0.4) * 0.6} union={union} sodio={sodio} onda={onda} largoFibra={22} />
        <Polvo b={b} radio={8} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: RECEPTORES_ACH[4], t: "Receptores", a: 0.05, z: 0.3, o: [-40, 140], color: RECEPTOR_ACH },
          { p: [0.3, 0.25, 0.25], t: "Acetilcolina", a: 0.05, z: 0.3, o: [50, -130], color: ACH_C },
          { p: [-0.2, -0.3, 0.3], t: "Entra Na⁺ (sodio)", a: 0.3, z: 0.56, o: [-50, 140], color: NA_C },
          { p: [-5.5, 0.0, 0], t: "Membrana de la fibra", a: 0.75, z: 1, o: [-40, -110], color: "#e88a7a" },
        ]}
      />
      <Chip b={b} a={0.3} z={0.56} t="Na⁺ ENTRA" x={540} y={330} color={NA_C} />
      <Dato b={b} a={0.6} z={1.1} t="Potencial de acción" sub="onda eléctrica por toda la membrana" color={NA_C} y={260} tam={86} />
    </AbsoluteFill>
  );
};

// 5 · Tubulos T: la onda se mete a la fibra ---------------------------------------------
const XS = triadas();
const xOnda = (b: number) => mix(2.4, -5.2, lineal(b, 0.06, 0.72));
const bTubulo = (x: number) => 0.06 + ((2.4 - x) / 7.6) * 0.66;
const R_T = 0.56;
const Tubulos: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const xw = xOnda(b);
  const cam = camara(
    [
      { b: 0, p: [2.6, 4.2, 4.6], l: [0.6, 0.9, 0], fov: 40 },
      { b: 0.35, p: [1.2, 2.6, 4.4], l: [-0.2, 0.4, 0], fov: 40 },
      { b: 1, p: [-1.3, 1.7, 4.6], l: [-1.0, 0.1, 0], fov: 40 },
    ],
    b,
  );
  const luces: V3[] = [];
  const brillos = XS.map((x) => {
    const s = (b - bTubulo(x)) / 0.16;
    if (s > 0 && s < 0.4) luces.push([x, mix(1.25, R_T, s / 0.4), 0]);
    if (s >= 0.4 && s < 1) {
      const a = ((s - 0.4) / 0.6) * Math.PI;
      luces.push([x, Math.cos(a) * R_T, Math.sin(a) * R_T], [x, Math.cos(a) * R_T, -Math.sin(a) * R_T]);
    }
    return s > 0 ? Math.max(0, 1 - Math.max(0, s - 1) * 0.5) : 0;
  });
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo={K.fondo2}>
        <Triada b={b} reticuloOp={0.08} />
        {/* onda por el sarcolema */}
        {b > 0.04 && b < 0.74 ? (
          <group position={[xw, 1.27, 0]}>
            <mesh>
              <boxGeometry args={[0.08, 0.02, 5]} />
              <meshBasicMaterial color="#fff7c2" />
            </mesh>
            <mesh>
              <boxGeometry args={[0.45, 0.04, 5]} />
              <meshBasicMaterial color={NA_C} transparent opacity={0.35} depthWrite={false} />
            </mesh>
          </group>
        ) : null}
        {/* tubulos T que se encienden */}
        {XS.map((x, i) =>
          brillos[i] > 0 ? (
            <group key={i} position={[x, 0, 0]}>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[R_T, 0.045, 10, 48]} />
                <meshBasicMaterial color={TUBOT_C} transparent opacity={0.85 * brillos[i]} />
              </mesh>
              <mesh position={[0, (R_T + 1.25) / 2, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 1.25 - R_T, 10]} />
                <meshBasicMaterial color={TUBOT_C} transparent opacity={0.85 * brillos[i]} />
              </mesh>
            </group>
          ) : null,
        )}
        {luces.length ? <Particulas pos={luces} radio={0.045} color="#ffffff" brillo={3} /> : null}
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [xw, 1.27, 1.2], t: "Onda eléctrica", a: 0.06, z: 0.4, o: [60, -100], color: NA_C },
          { p: [XS[3], 0.9, 0], t: "Túbulos T", a: 0.38, z: 1, o: [-70, -120], color: TUBOT_C },
          { p: [-2.5, -1.25, -0.4], t: "Miofibrillas", a: 0.62, z: 1, o: [-50, 120], color: "#e88a7a" },
        ]}
      />
      <Chip b={b} a={0.02} z={0.36} t="MEMBRANA DE LA FIBRA" x={540} y={330} color="#f39aa0" />
      <Dato b={b} a={0.38} z={1.1} t="Túbulos T" sub="túneles hacia el interior" color={TUBOT_C} y={260} tam={100} />
    </AbsoluteFill>
  );
};

// 6 · Triada: sensores (DHPR) abren compuertas (RyR) del reticulo -------------------------
const Sensores: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const onda = lineal(b, 0.0, 0.16);
  const sensor = entre(b, 0.12, 0.28);
  const abre = entre(b, 0.3, 0.46);
  const ca = 0.12 * entre(b, 0.86, 1);
  const cam = camara(
    [
      { b: 0, p: [2.2, 1.0, 9.4], l: [0, -0.6, 0], fov: 40 },
      { b: 0.4, p: [0.7, 0.7, 8.4], l: [0, -0.55, 0], fov: 40 },
      { b: 1, p: [-1.8, 1.0, 8.8], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#0b1d33">
        <TriadaZoom b={b} onda={onda} sensor={sensor} abre={abre} ca={ca} />
        <Polvo b={b} radio={4} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [1.5, 0, R_TUBOT], t: "Túbulo T", a: 0.0, z: 0.3, o: [-40, 90], color: TUBOT_C },
          { p: [CANALES_X[2], R_TUBOT + 0.04, 0.09], t: "Sensor", a: 0.14, z: 1, o: [80, 40], color: DHPR_C },
          { p: [CANALES_X[1], -(Y_CISTERNA - 0.48), 0.1], t: "Compuerta", a: 0.32, z: 1, o: [-70, 110], color: RYR_C },
          { p: [-0.8, Y_CISTERNA + 0.3, 0.3], t: "Retículo sarcoplásmico", a: 0.52, z: 1, o: [-20, -170], color: RETICULO_C },
        ]}
      />
      <Dato b={b} a={0.66} z={1.1} t="Almacén de Ca²⁺" sub="retículo sarcoplásmico" color={CA_C} y={260} tam={96} />
    </AbsoluteFill>
  );
};

// 7 · El calcio sale disparado hacia las miofibrillas -----------------------------------
const Calcio: React.FC<{ textos: string[] }> = ({ textos }) => {
  const b = useBeat(textos);
  const ca = mix(0.12, 1, entre(b, 0.0, 0.6));
  const cam = camara(
    [
      { b: 0, p: [-1.8, 1.0, 8.8], l: [0, -0.6, 0], fov: 40 },
      { b: 0.35, p: [-0.8, 1.2, 11.0], l: [0, -0.6, 0], fov: 40 },
      { b: 1, p: [2.0, 1.6, 14.0], l: [0, -0.6, 0], fov: 40 },
    ],
    b,
  );
  return (
    <AbsoluteFill>
      <Escena3D cam={cam} fondo="#0b1d33">
        <TriadaZoom b={b} sensor={1} abre={1} ca={ca} nCa={72} miofibrillas={1} brilloMio={0.25 * entre(b, 0.45, 0.8)} />
        <Polvo b={b} radio={5} />
      </Escena3D>
      <Etiquetas
        cam={cam}
        b={b}
        items={[
          { p: [-0.6, 0.5, 0.7], t: "Ca²⁺", a: 0.08, z: 1, o: [-60, -60], color: CA_C },
          { p: [1.2, Y_MIOFIBRILLA + 0.3, 0.45], t: "Miofibrilla", a: 0.45, z: 1, o: [40, -90], color: "#e88a7a" },
        ]}
      />
      <Dato b={b} a={0.06} z={0.6} t="¡Calcio liberado!" sub="hacia las miofibrillas" color={CA_C} y={260} tam={96} />
      <Chip b={b} a={0.62} z={1.1} t="⏱ MILÉSIMAS DE SEGUNDO" x={540} y={330} color={K.amarillo} />
    </AbsoluteFill>
  );
};

const Comentarios: React.FC<{ textos: string[] }> = ({ textos }) => (
  <EscenaComentarios
    textos={textos}
    pregunta={<>¿Te quedó <span style={{ color: K.lima }}>alguna duda</span>?</>}
    escribe="Mi duda es…"
    ideas={["¿Y LA FATIGA?", "¿Y LOS CALAMBRES?", "UNIDAD MOTORA", "TÚBULOS T"]}
  />
);

const T = [
  "Ya viste cómo tu cuerpo fabrica ATP. Ahora mira en qué lo gasta: en **contraer tus músculos**. Parte uno.",
  "Todo empieza en tu cerebro: la **corteza motora** decide el movimiento y manda una señal eléctrica por la médula espinal.",
  "Esa señal viaja por una **motoneurona** hasta el músculo. Una sola neurona controla muchas fibras: eso es una **unidad motora**.",
  "Al llegar a la **placa motora**, la neurona libera **acetilcolina**, un mensajero químico.",
  "La acetilcolina se une a sus receptores en la fibra, entra **sodio** y se dispara un **potencial de acción**: una onda eléctrica que recorre toda la membrana.",
  "La onda se mete al interior de la fibra por los **túbulos T**, unos túneles en la membrana.",
  "Ahí activa unos sensores que abren las compuertas del **retículo sarcoplásmico**, el almacén de calcio de la fibra.",
  "Y el **calcio** sale disparado hacia las miofibrillas. Todo esto, en **milésimas de segundo**.",
  "El calcio ya está libre... En la **parte dos** te muestro qué hace dentro del músculo. ¿Te quedó alguna duda? **Escríbela en los comentarios**, y sígueme para no perdértela.",
];

const ESCENAS = [Gancho, Cerebro, Unidad, Placa, Potencial, Tubulos, Sensores, Calcio, Comentarios];

export const CONTRACCION1: ShortDef = {
  id: "Short-Contraccion1",
  titulo: "¿Cómo le ordena tu cerebro al músculo que se contraiga? (Parte 1)",
  planos: ESCENAS.map((Escena, i) => ({ id: `contraccion1-${i}`, seccion: "", textos: [T[i]], Escena })) as PlanoDef[],
};
