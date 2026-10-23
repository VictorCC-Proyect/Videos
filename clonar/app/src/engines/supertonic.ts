// Motor Supertonic 3 (Supertone) con ONNX Runtime Web. Corre dentro del Web Worker.
// Basado en el ejemplo web oficial (código MIT, github.com/supertone-inc/supertonic),
// reescrito en TypeScript con arreglos tipados. Los pesos del modelo usan la licencia OpenRAIL-M.
import * as ort from "onnxruntime-web/webgpu";
import { fetchCached, fetchJsonCached } from "./fetchCached";
import type { Pcm } from "./types";

const REPO = "https://huggingface.co/supertone-oss-archive/supertonic-3/resolve/aafc6e32416a594460b32413efc49d7fe4ce6d46";

type Cfg = {
  ae: { sample_rate: number; base_chunk_size: number };
  ttl: { chunk_compress_factor: number; latent_dim: number };
};
type StyleJson = { style_ttl: { dims: number[]; data: unknown[] }; style_dp: { dims: number[]; data: unknown[] } };
type Style = { ttl: ort.Tensor; dp: ort.Tensor };

type Loaded = {
  cfg: Cfg;
  indexer: number[];
  dp: ort.InferenceSession;
  enc: ort.InferenceSession;
  est: ort.InferenceSession;
  voc: ort.InferenceSession;
  device: "webgpu" | "wasm";
};

let loaded: Loaded | null = null;
let loading: Promise<Loaded> | null = null;
const styles = new Map<string, Style>();

export function supertonicDevice() {
  return loaded?.device;
}

export function loadSupertonic(onProgress: (fraction: number, label: string) => void): Promise<Loaded> {
  if (loaded) return Promise.resolve(loaded);
  loading ??= (async () => {
    ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;

    const cfg = await fetchJsonCached<Cfg>(`${REPO}/onnx/tts.json`);
    const indexer = await fetchJsonCached<number[]>(`${REPO}/onnx/unicode_indexer.json`);
    const names = ["duration_predictor", "text_encoder", "vector_estimator", "vocoder"];
    const buffers: Uint8Array[] = [];
    for (let i = 0; i < names.length; i++) {
      buffers.push(await fetchCached(`${REPO}/onnx/${names[i]}.onnx`, (f) => onProgress((i + f) / names.length, "Descargando la voz")));
    }

    onProgress(1, "Preparando la voz");
    const create = (device: "webgpu" | "wasm") =>
      Promise.all(buffers.map((b) => ort.InferenceSession.create(b, { executionProviders: [device], graphOptimizationLevel: "all" })));
    let sessions: ort.InferenceSession[];
    let device: "webgpu" | "wasm" = "wasm";
    try {
      if (!("gpu" in navigator)) throw new Error("sin WebGPU");
      sessions = await create("webgpu");
      device = "webgpu";
    } catch {
      sessions = await create("wasm");
    }
    const [dp, enc, est, voc] = sessions;
    loaded = { cfg, indexer, dp, enc, est, voc, device };
    return loaded;
  })();
  loading.catch(() => (loading = null));
  return loading;
}

async function getStyle(voiceId: string): Promise<Style> {
  const hit = styles.get(voiceId);
  if (hit) return hit;
  const json = await fetchJsonCached<StyleJson>(`${REPO}/voice_styles/${voiceId}.json`);
  const tensor = (s: StyleJson["style_ttl"]) =>
    new ort.Tensor("float32", Float32Array.from(s.data.flat(Infinity) as number[]), s.dims);
  const style = { ttl: tensor(json.style_ttl), dp: tensor(json.style_dp) };
  styles.set(voiceId, style);
  return style;
}

// Limpia el texto igual que el modelo espera y lo envuelve en la etiqueta de idioma.
function preprocess(text: string, lang: string): string {
  let t = text.normalize("NFKD");
  t = t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]+/gu, "");
  const swaps: Record<string, string> = {
    "–": "-", "‑": "-", "—": "-", _: " ", "“": '"', "”": '"', "‘": "'", "’": "'",
    "´": "'", "`": "'", "[": " ", "]": " ", "|": " ", "/": " ", "#": " ", "→": " ", "←": " ",
  };
  for (const [k, v] of Object.entries(swaps)) t = t.replaceAll(k, v);
  t = t.replace(/[♥☆♡©\\]/g, "");
  t = t.replace(/ ([,.!?;:'])/g, "$1");
  t = t.replace(/"{2,}/g, '"').replace(/'{2,}/g, "'");
  t = t.replace(/\s+/g, " ").trim();
  if (!/[.!?;:,'")\]}…»]$/.test(t)) t += ".";
  return `<${lang}>${t}</${lang}>`;
}

function gaussian(n: number): Float32Array {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 2) {
    const u1 = Math.max(1e-4, Math.random());
    const u2 = Math.random();
    const r = Math.sqrt(-2 * Math.log(u1));
    out[i] = r * Math.cos(2 * Math.PI * u2);
    if (i + 1 < n) out[i + 1] = r * Math.sin(2 * Math.PI * u2);
  }
  return out;
}

export async function synthSupertonic(
  text: string,
  voiceId: string,
  opts: { speed: number; steps: number; lang?: string },
  onStep?: (step: number, total: number) => void,
): Promise<Pcm> {
  if (!loaded) throw new Error("El motor no está cargado");
  const { cfg, indexer, dp, enc, est, voc } = loaded;
  const style = await getStyle(voiceId);

  const processed = preprocess(text, opts.lang ?? "es");
  const len = processed.length;
  const ids = new BigInt64Array(len);
  for (let j = 0; j < len; j++) {
    const cp = processed.codePointAt(j)!;
    ids[j] = BigInt(cp < indexer.length ? indexer[cp] : -1);
  }
  const textIds = new ort.Tensor("int64", ids, [1, len]);
  const textMask = new ort.Tensor("float32", new Float32Array(len).fill(1), [1, 1, len]);

  const { duration } = await dp.run({ text_ids: textIds, style_dp: style.dp, text_mask: textMask });
  const seconds = (duration.data as Float32Array)[0] / opts.speed;

  const { text_emb } = await enc.run({ text_ids: textIds, style_ttl: style.ttl, text_mask: textMask });

  const sr = cfg.ae.sample_rate;
  const wavLen = Math.floor(seconds * sr);
  const chunk = cfg.ae.base_chunk_size * cfg.ttl.chunk_compress_factor;
  const latentLen = Math.max(1, Math.floor((wavLen + chunk - 1) / chunk));
  const latentDim = cfg.ttl.latent_dim * cfg.ttl.chunk_compress_factor;
  const latentMask = new ort.Tensor("float32", new Float32Array(latentLen).fill(1), [1, 1, latentLen]);
  const totalStep = new ort.Tensor("float32", new Float32Array([opts.steps]), [1]);

  let xt = gaussian(latentDim * latentLen);
  for (let step = 0; step < opts.steps; step++) {
    onStep?.(step + 1, opts.steps);
    const out = await est.run({
      noisy_latent: new ort.Tensor("float32", xt, [1, latentDim, latentLen]),
      text_emb,
      style_ttl: style.ttl,
      latent_mask: latentMask,
      text_mask: textMask,
      current_step: new ort.Tensor("float32", new Float32Array([step]), [1]),
      total_step: totalStep,
    });
    xt = new Float32Array(out.denoised_latent.data as Float32Array);
  }

  const { wav_tts } = await voc.run({ latent: new ort.Tensor("float32", xt, [1, latentDim, latentLen]) });
  const wav = wav_tts.data as Float32Array;
  return { samples: wav.slice(0, Math.min(wav.length, wavLen)), sampleRate: sr };
}
