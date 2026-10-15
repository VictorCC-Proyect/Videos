import React from "react";
import { entre } from "../motor";
import { C, FUENTE } from "../tema";
import { Rico } from "../ui";

export const SEC_K = "Unidad 3 · Sistema cardiovascular";
export const COL_K = { fc: "#ff6b81", vs: "#5ec8ff", o2: "#7cff8a", deuda: "#ffcf5a", met: "#c25bff", rojo: "#ff4d4d" };

export type Serie = { f: (x: number) => number; color: string; t?: string; hasta?: number; punteada?: boolean };

/** Grafica de lineas en coordenadas 0..1 (x e y), con dibujo progresivo por serie. */
export const Curvas: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  series: Serie[];
  ejeX?: string;
  ejeY?: string;
  ticksX?: string[];
  ticksY?: string[];
  areas?: { x0: number; x1: number; color: string; t?: string; op?: number; bajo?: (x: number) => number; sobre?: (x: number) => number }[];
  marcas?: { x: number; t: string; color: string; op?: number }[];
  op?: number;
}> = ({ x, y, w, h, series, ejeX, ejeY, ticksX = [], ticksY = [], areas = [], marcas = [], op = 1 }) => {
  const L = 70;
  const B = 56;
  const sx = (u: number) => L + u * (w - L - 30);
  const sy = (v: number) => h - B - v * (h - B - 24);
  const n = 160;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, opacity: op, background: "rgba(4,9,20,0.88)", borderRadius: 16 }}>
      {areas.map((a, i) => {
        if ((a.op ?? 1) <= 0) return null;
        const pts: string[] = [];
        const N = 60;
        for (let k = 0; k <= N; k++) {
          const u = a.x0 + ((a.x1 - a.x0) * k) / N;
          pts.push(`${sx(u)},${sy(a.sobre ? a.sobre(u) : 1)}`);
        }
        for (let k = N; k >= 0; k--) {
          const u = a.x0 + ((a.x1 - a.x0) * k) / N;
          pts.push(`${sx(u)},${sy(a.bajo ? a.bajo(u) : 0)}`);
        }
        return (
          <g key={i} opacity={a.op ?? 1}>
            <polygon points={pts.join(" ")} fill={a.color} fillOpacity={0.35} />
            {a.t ? (
              <text x={sx((a.x0 + a.x1) / 2)} y={34 + (i % 2) * 30} fill={a.color} fontSize={24} fontWeight={800} textAnchor="middle" fontFamily={FUENTE}>
                {a.t}
              </text>
            ) : null}
          </g>
        );
      })}
      <line x1={L} y1={h - B} x2={w - 20} y2={h - B} stroke={C.suave} strokeWidth={2} />
      <line x1={L} y1={h - B} x2={L} y2={14} stroke={C.suave} strokeWidth={2} />
      {ejeX ? (
        <text x={w - 24} y={h - 12} fill={C.suave} fontSize={20} textAnchor="end" fontFamily={FUENTE}>
          {ejeX}
        </text>
      ) : null}
      {ejeY ? (
        <text x={22} y={h / 2} fill={C.suave} fontSize={20} fontFamily={FUENTE} transform={`rotate(-90 22 ${h / 2})`} textAnchor="middle">
          {ejeY}
        </text>
      ) : null}
      {ticksX.map((t, i) => (
        <text key={`x${i}`} x={sx(i / Math.max(1, ticksX.length - 1))} y={h - B + 26} fill={C.suave} fontSize={18} textAnchor="middle" fontFamily={FUENTE}>
          {t}
        </text>
      ))}
      {ticksY.map((t, i) => (
        <text key={`y${i}`} x={L - 10} y={sy(i / Math.max(1, ticksY.length - 1)) + 6} fill={C.suave} fontSize={18} textAnchor="end" fontFamily={FUENTE}>
          {t}
        </text>
      ))}
      {marcas.map((m, i) =>
        (m.op ?? 1) > 0 ? (
          <g key={i} opacity={m.op ?? 1}>
            <line x1={sx(m.x)} x2={sx(m.x)} y1={20} y2={h - B} stroke={m.color} strokeWidth={3} strokeDasharray="8 8" />
            <text x={sx(m.x) + 8} y={h - B - 12} fill={m.color} fontSize={22} fontWeight={800} fontFamily={FUENTE}>
              {m.t}
            </text>
          </g>
        ) : null,
      )}
      {series.map((s, i) => {
        const hasta = s.hasta ?? 1;
        if (hasta <= 0) return null;
        const pts: string[] = [];
        const m = Math.max(1, Math.round(n * hasta));
        for (let k = 0; k <= m; k++) {
          const u = (k / n);
          pts.push(`${sx(u)},${sy(s.f(u))}`);
        }
        const ux = m / n;
        return (
          <g key={i}>
            <polyline points={pts.join(" ")} fill="none" stroke={s.color} strokeWidth={6} strokeDasharray={s.punteada ? "10 10" : undefined} strokeLinejoin="round" />
            <circle cx={sx(ux)} cy={sy(s.f(ux))} r={8} fill={s.color} />
            {s.t && hasta > 0.95 ? (
              <text x={sx(ux) - 6} y={sy(s.f(ux)) - 18} fill={s.color} fontSize={24} fontWeight={800} textAnchor="end" fontFamily={FUENTE}>
                {s.t}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

/** Panel oscuro con lineas que aparecen en orden (b >= a de cada linea). */
export const Pasos: React.FC<{
  b: number;
  x: number;
  y: number;
  w: number;
  titulo?: string;
  color?: string;
  lineas: { a: number; t: string; grande?: boolean; color?: string }[];
  tam?: number;
  op?: number;
}> = ({ b, x, y, w, titulo, color = C.acento, lineas, tam = 31, op = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, opacity: op, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.88)", borderRadius: 16, padding: "20px 28px", borderTop: `6px solid ${color}`, boxSizing: "border-box" }}>
    {titulo ? <div style={{ fontSize: tam * 1.12, fontWeight: 900, color, marginBottom: 12 }}>{titulo}</div> : null}
    {lineas.map((l, i) => {
      const o = entre(b, l.a, l.a + 0.15);
      return (
        <div key={i} style={{ opacity: o, transform: `translateX(${(1 - o) * 20}px)`, fontSize: l.grande ? tam * 1.3 : tam, fontWeight: l.grande ? 900 : 500, color: l.color ?? C.texto, marginBottom: 10, fontVariantNumeric: "tabular-nums", lineHeight: 1.3 }}>
          <Rico t={l.t} />
        </div>
      );
    })}
  </div>
);

/** Contador grande (lpm, ml/kg/min...). */
export const Indicador: React.FC<{ x: number; y: number; valor: string; unidad: string; color: string; etiqueta?: string; op?: number }> = ({ x, y, valor, unidad, color, etiqueta, op = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: op, fontFamily: FUENTE, color: C.texto, background: "rgba(4,9,20,0.85)", borderRadius: 16, padding: "12px 22px", borderLeft: `6px solid ${color}` }}>
    {etiqueta ? <div style={{ fontSize: 22, color: C.suave }}>{etiqueta}</div> : null}
    <div style={{ fontSize: 58, fontWeight: 900, color, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
      {valor} <span style={{ fontSize: 28, fontWeight: 700 }}>{unidad}</span>
    </div>
  </div>
);
