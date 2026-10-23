import { Mp3Encoder } from "@breezystack/lamejs";
import type { Pcm } from "./engines/types";

// Une los trozos con una pausa corta entre ellos. Si vienen con distinta
// frecuencia de muestreo (no debería pasar dentro de un mismo motor), se usa la del primero.
export function joinPcm(parts: Pcm[], gapSeconds = 0.25): Pcm {
  const sampleRate = parts[0].sampleRate;
  const gap = Math.floor(gapSeconds * sampleRate);
  const total = parts.reduce((n, p) => n + p.samples.length, 0) + gap * (parts.length - 1);
  const out = new Float32Array(total);
  let off = 0;
  parts.forEach((p, i) => {
    out.set(p.samples, off);
    off += p.samples.length + (i < parts.length - 1 ? gap : 0);
  });
  return { samples: out, sampleRate };
}

export function durationOf(pcm: Pcm) {
  return pcm.samples.length / pcm.sampleRate;
}

function toInt16(samples: Float32Array) {
  const out = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

export function encodeMp3(pcm: Pcm, kbps = 128): Blob {
  const enc = new Mp3Encoder(1, pcm.sampleRate, kbps);
  const data = toInt16(pcm.samples);
  const parts: ArrayBuffer[] = [];
  const push = (buf: Int8Array | Uint8Array) => {
    if (buf.length) parts.push(new Uint8Array(buf).buffer as ArrayBuffer);
  };
  for (let i = 0; i < data.length; i += 1152) push(enc.encodeBuffer(data.subarray(i, i + 1152)));
  push(enc.flush());
  return new Blob(parts, { type: "audio/mpeg" });
}

export function encodeWav(pcm: Pcm): Blob {
  const data = toInt16(pcm.samples);
  const buf = new ArrayBuffer(44 + data.length * 2);
  const v = new DataView(buf);
  const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  v.setUint32(4, 36 + data.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, pcm.sampleRate, true);
  v.setUint32(28, pcm.sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, data.length * 2, true);
  new Int16Array(buf, 44).set(data);
  return new Blob([buf], { type: "audio/wav" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// Nombre de archivo a partir de las primeras palabras del texto.
export function fileName(text: string, ext: string) {
  const base = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .toLowerCase();
  return `${base || "voz"}.${ext}`;
}
