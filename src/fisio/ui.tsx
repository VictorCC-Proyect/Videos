import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  AbsoluteFill,
  interpolate,
  Series,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  beatDeFrame,
  Cam,
  durPlano,
  durTexto,
  entre,
  FADE,
  PlanoDef,
  V3,
  visible,
} from "./motor";
import { C, FUENTE } from "./tema";

// ---- 3D -----------------------------------------------------------------

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...cam.p);
  c.lookAt(new THREE.Vector3(...cam.l));
  if (c.fov !== cam.fov) {
    c.fov = cam.fov;
    c.updateProjectionMatrix();
  }
  return null;
};

export const Escena3D: React.FC<{
  cam: Cam;
  children: React.ReactNode;
  fondo?: string;
  niebla?: [number, number];
  luz?: number;
}> = ({ cam, children, fondo = C.fondo2, niebla, luz = 1 }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${fondo} 0%, ${C.fondo} 75%)`,
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ fov: cam.fov, near: 0.01, far: 2000 }}
        gl={{ antialias: true }}
      >
        <Rig cam={cam} />
        {niebla ? (
          <fog attach="fog" args={[C.fondo, niebla[0], niebla[1]]} />
        ) : null}
        <ambientLight intensity={0.35 * luz} />
        <hemisphereLight args={["#cfe6ff", "#2a0d12", 0.7 * luz]} />
        <directionalLight position={[5, 8, 6]} intensity={2.2 * luz} />
        <directionalLight
          position={[-6, -2, -4]}
          intensity={1.2 * luz}
          color="#5ec8ff"
        />
        <pointLight position={[0, 3, 8]} intensity={20 * luz} distance={40} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

// ---- Etiquetas que siguen puntos 3D --------------------------------------

export type Etiqueta = {
  p: V3;
  t: string;
  a: number;
  z: number;
  o?: [number, number];
  color?: string;
};

const proyectar = (cam: Cam, p: V3, w: number, h: number) => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.01, 2000);
  c.position.set(...cam.p);
  c.lookAt(new THREE.Vector3(...cam.l));
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, ok: v.z < 1 };
};

export const Etiquetas: React.FC<{
  cam: Cam;
  b: number;
  items: Etiqueta[];
}> = ({ cam, b, items }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {items.map((e, i) => {
          const op = visible(b, e.a, e.z);
          if (op <= 0) return null;
          const q = proyectar(cam, e.p, width, height);
          if (!q.ok) return null;
          const [dx, dy] = e.o ?? [70, -60];
          const col = e.color ?? C.acento;
          return (
            <g key={i} opacity={op}>
              <circle cx={q.x} cy={q.y} r={8} fill={col} />
              <circle
                cx={q.x}
                cy={q.y}
                r={16}
                fill="none"
                stroke={col}
                strokeWidth={2}
              />
              <line
                x1={q.x}
                y1={q.y}
                x2={q.x + dx}
                y2={q.y + dy}
                stroke={col}
                strokeWidth={3}
              />
            </g>
          );
        })}
      </svg>
      {items.map((e, i) => {
        const op = visible(b, e.a, e.z);
        if (op <= 0) return null;
        const q = proyectar(cam, e.p, width, height);
        if (!q.ok) return null;
        const [dx, dy] = e.o ?? [70, -60];
        const col = e.color ?? C.acento;
        const izq = dx < 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: izq ? undefined : q.x + dx,
              right: izq ? width - (q.x + dx) : undefined,
              top: q.y + dy - 26,
              opacity: op,
              fontFamily: FUENTE,
              fontSize: 30,
              fontWeight: 700,
              color: C.texto,
              background: "rgba(4,8,18,0.78)",
              borderLeft: izq ? undefined : `6px solid ${col}`,
              borderRight: izq ? `6px solid ${col}` : undefined,
              padding: "8px 16px",
              borderRadius: 8,
              whiteSpace: "nowrap",
            }}
          >
            {e.t}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---- Texto con **resaltado** -------------------------------------------

export const Rico: React.FC<{ t: string; color?: string }> = ({
  t,
  color = C.acento2,
}) => (
  <>
    {t.split("**").map((s, i) =>
      i % 2 ? (
        <span key={i} style={{ color, fontWeight: 800 }}>
          {s}
        </span>
      ) : (
        <span key={i}>{s}</span>
      ),
    )}
  </>
);

// ---- Subtitulos (narracion en pantalla) ---------------------------------

export const Subtitulo: React.FC<{ textos: string[] }> = ({ textos }) => {
  const frame = useCurrentFrame();
  const b = beatDeFrame(textos, frame);
  const i = Math.min(Math.floor(b), textos.length - 1);
  const t = b - i;
  const d = durTexto(textos[i]);
  const fin = i === textos.length - 1 ? 1 : 1 - entre(t, 1 - 8 / d, 1);
  const op = Math.min(entre(t, 0, 8 / d), fin);
  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", padding: 44 }}
    >
      <div
        style={{
          opacity: op,
          transform: `translateY(${(1 - op) * 14}px)`,
          maxWidth: 1580,
          background: "rgba(3,6,14,0.82)",
          border: "1px solid rgba(94,224,255,0.25)",
          borderRadius: 18,
          padding: "22px 36px",
          fontFamily: FUENTE,
          fontSize: 38,
          lineHeight: 1.35,
          color: C.texto,
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <Rico t={textos[i]} />
      </div>
    </AbsoluteFill>
  );
};

const Seccion: React.FC<{ t: string }> = ({ t }) =>
  t ? (
    <div
      style={{
        position: "absolute",
        left: 48,
        top: 40,
        fontFamily: FUENTE,
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: C.acento,
        background: "rgba(3,6,14,0.6)",
        padding: "8px 18px",
        borderRadius: 8,
        borderLeft: `5px solid ${C.acento}`,
      }}
    >
      {t}
    </div>
  ) : null;

// ---- Tarjetas y tablas 2D ----------------------------------------------

export const Tarjeta: React.FC<{
  b: number;
  a: number;
  z: number;
  x: number;
  y: number;
  w: number;
  titulo?: string;
  color?: string;
  children?: React.ReactNode;
  tam?: number;
}> = ({ b, a, z, x, y, w, titulo, color = C.acento, children, tam = 30 }) => {
  const op = visible(b, a, z);
  if (op <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        opacity: op,
        transform: `translateX(${(1 - op) * 30}px)`,
        background: "rgba(4,9,20,0.84)",
        border: `1px solid ${color}55`,
        borderTop: `6px solid ${color}`,
        borderRadius: 16,
        padding: "20px 26px",
        fontFamily: FUENTE,
        color: C.texto,
        fontSize: tam,
        lineHeight: 1.3,
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
      }}
    >
      {titulo ? (
        <div
          style={{
            fontSize: tam * 1.1,
            fontWeight: 800,
            color,
            marginBottom: 10,
          }}
        >
          {titulo}
        </div>
      ) : null}
      {children}
    </div>
  );
};

export const Lista: React.FC<{
  items: string[];
  b?: number;
  a?: number;
  paso?: number;
  color?: string;
}> = ({ items, b, a = 0, paso = 0, color = C.acento }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {items.map((it, i) => {
      const op = b === undefined || paso === 0 ? 1 : entre(b, a + i * paso, a + i * paso + 0.15);
      return (
        <div key={i} style={{ display: "flex", gap: 12, opacity: op }}>
          <span style={{ color, fontWeight: 900 }}>•</span>
          <span>
            <Rico t={it} />
          </span>
        </div>
      );
    })}
  </div>
);

export const Tabla: React.FC<{
  cab: string[];
  filas: string[][];
  tam?: number;
  anchos?: string;
  b?: number;
  a?: number;
  paso?: number;
  resalta?: number;
}> = ({ cab, filas, tam = 24, anchos, b, a = 0, paso = 0, resalta }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: anchos ?? `repeat(${cab.length}, 1fr)`,
      fontSize: tam,
      lineHeight: 1.25,
    }}
  >
    {cab.map((c, i) => (
      <div
        key={`c${i}`}
        style={{
          fontWeight: 800,
          color: C.acento,
          padding: "8px 12px",
          borderBottom: `2px solid ${C.acento}`,
        }}
      >
        {c}
      </div>
    ))}
    {filas.map((f, r) => {
      const op =
        b === undefined || paso === 0 ? 1 : entre(b, a + r * paso, a + r * paso + 0.12);
      return f.map((celda, k) => (
        <div
          key={`${r}-${k}`}
          style={{
            opacity: op,
            padding: "8px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            fontWeight: k === 0 ? 700 : 400,
            color: k === 0 ? C.acento2 : C.texto,
            background: resalta === r ? "rgba(94,224,255,0.12)" : undefined,
          }}
        >
          {celda}
        </div>
      ));
    })}
  </div>
);

export const TituloGrande: React.FC<{
  b: number;
  a: number;
  z: number;
  sup?: string;
  t: string;
  sub?: string;
}> = ({ b, a, z, sup, t, sub }) => {
  const op = visible(b, a, z, 0.25);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FUENTE,
        textAlign: "center",
        opacity: op,
        paddingBottom: 200,
      }}
    >
      {sup ? (
        <div
          style={{
            fontSize: 40,
            letterSpacing: 8,
            color: C.acento,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {sup}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          color: C.texto,
          textShadow: "0 6px 40px rgba(0,0,0,0.8)",
          transform: `scale(${0.94 + 0.06 * op})`,
        }}
      >
        {t}
      </div>
      {sub ? (
        <div style={{ fontSize: 42, color: C.suave, marginTop: 12 }}>{sub}</div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---- Composicion de planos ----------------------------------------------

export const PlanoView: React.FC<{ plano: PlanoDef }> = ({ plano }) => {
  const frame = useCurrentFrame();
  const dur = durPlano(plano);
  const op = Math.min(
    interpolate(frame, [0, FADE], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [dur - FADE, dur], [1, 0], { extrapolateLeft: "clamp" }),
  );
  const E = plano.Escena;
  return (
    <AbsoluteFill style={{ background: C.fondo }}>
      <AbsoluteFill style={{ opacity: op }}>
        <E textos={plano.textos} />
        <Seccion t={plano.seccion} />
        <Subtitulo textos={plano.textos} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const durPlanos = (planos: PlanoDef[]) =>
  planos.reduce((a, p) => a + durPlano(p), 0);

export const Planos: React.FC<{ planos: PlanoDef[] }> = ({ planos }) => (
  <Series>
    {planos.map((p) => (
      <Series.Sequence key={p.id} durationInFrames={durPlano(p)} name={p.id}>
        <PlanoView plano={p} />
      </Series.Sequence>
    ))}
  </Series>
);
