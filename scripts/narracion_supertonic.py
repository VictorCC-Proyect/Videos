"""Genera la narracion con Supertonic 3, la misma voz de la app "Voz" (clonar/app).

Uso:
  pip install onnxruntime numpy
  python3 scripts/narracion_supertonic.py                      # solo los textos que no tienen audio
  python3 scripts/narracion_supertonic.py --solo src/shorts/somatotipos.tsx   # rehace los de esos archivos
  python3 scripts/narracion_supertonic.py --forzar             # rehace todos
  Opciones: --voz M1 (F1..F5, M1..M5), --pasos 8 (mas = mas natural y mas lento), --velocidad 1.0

Usa el mismo sistema que scripts/narracion.py: public/narracion/<hash>.mp3 y
src/fisio/narracion.json con la duracion de cada audio. Sin --solo ni --forzar
no toca los audios que ya existen (por ejemplo los de ElevenLabs de voz_externa.py).

La primera vez descarga el modelo (unos 400 MB) de Hugging Face a .cache/supertonic.
Modelo: Supertone, pesos OpenRAIL-M; inferencia basada en su ejemplo oficial (MIT).
"""

import argparse
import json
import re
import subprocess
import sys
import tempfile
import unicodedata
import urllib.request
import wave
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from narracion import CAPS, INDICE, RAIZ, SALIDA, SHORTS, VEL_SHORTS, ffmpeg_bin, fnv1a, para_voz, textos  # noqa: E402

REPO = "https://huggingface.co/supertone-oss-archive/supertonic-3/resolve/aafc6e32416a594460b32413efc49d7fe4ce6d46"
CACHE = RAIZ / ".cache/supertonic"
MODELOS = ["duration_predictor", "text_encoder", "vector_estimator", "vocoder"]
MAX_CHARS = 300
SILENCIO = 0.3


def descargar(ruta: str) -> Path:
    destino = CACHE / ruta
    if destino.exists():
        return destino
    destino.parent.mkdir(parents=True, exist_ok=True)
    print(f"Descargando {ruta}...", flush=True)
    tmp = destino.with_suffix(destino.suffix + ".part")
    with urllib.request.urlopen(f"{REPO}/{ruta}") as r, open(tmp, "wb") as f:
        while bloque := r.read(1 << 20):
            f.write(bloque)
    tmp.rename(destino)
    return destino


class Supertonic:
    def __init__(self):
        import onnxruntime as ort

        self.cfg = json.loads(descargar("onnx/tts.json").read_text())
        self.indexer = json.loads(descargar("onnx/unicode_indexer.json").read_text())
        opciones = ort.SessionOptions()
        self.s = {m: ort.InferenceSession(str(descargar(f"onnx/{m}.onnx")), opciones, providers=["CPUExecutionProvider"]) for m in MODELOS}
        self.sr = self.cfg["ae"]["sample_rate"]
        self.estilos = {}

    def estilo(self, voz: str):
        if voz not in self.estilos:
            j = json.loads(descargar(f"voice_styles/{voz}.json").read_text())
            arr = lambda d: np.array(d["data"], dtype=np.float32).reshape(d["dims"])  # noqa: E731
            self.estilos[voz] = (arr(j["style_ttl"]), arr(j["style_dp"]))
        return self.estilos[voz]

    @staticmethod
    def limpiar(t: str, lang: str) -> str:
        t = unicodedata.normalize("NFKD", t)
        t = re.sub("[\U0001f300-\U0001faff☀-➿\U0001f1e6-\U0001f1ff]+", "", t)
        for a, b in {"–": "-", "‑": "-", "—": "-", "_": " ", "“": '"', "”": '"', "‘": "'", "’": "'",
                     "´": "'", "`": "'", "[": " ", "]": " ", "|": " ", "/": " ", "#": " ", "→": " ", "←": " "}.items():
            t = t.replace(a, b)
        t = re.sub(r"[♥☆♡©\\]", "", t)
        t = re.sub(r" ([,.!?;:'])", r"\1", t)
        t = re.sub(r'"{2,}', '"', t)
        t = re.sub(r"\s+", " ", t).strip()
        if not re.search(r"[.!?;:,'\")\]}…»]$", t):
            t += "."
        return f"<{lang}>{t}</{lang}>"

    def _trozo(self, texto: str, voz: str, pasos: int, velocidad: float) -> np.ndarray:
        ttl, dp = self.estilo(voz)
        t = self.limpiar(texto, "es")
        ids = np.array([[self.indexer[ord(c)] if ord(c) < len(self.indexer) else -1 for c in t]], dtype=np.int64)
        mask = np.ones((1, 1, ids.shape[1]), dtype=np.float32)
        dur, *_ = self.s["duration_predictor"].run(None, {"text_ids": ids, "style_dp": dp, "text_mask": mask})
        seg = float(dur[0]) / velocidad
        emb, *_ = self.s["text_encoder"].run(None, {"text_ids": ids, "style_ttl": ttl, "text_mask": mask})
        n = int(seg * self.sr)
        chunk = self.cfg["ae"]["base_chunk_size"] * self.cfg["ttl"]["chunk_compress_factor"]
        largo = max(1, (n + chunk - 1) // chunk)
        dim = self.cfg["ttl"]["latent_dim"] * self.cfg["ttl"]["chunk_compress_factor"]
        xt = np.random.randn(1, dim, largo).astype(np.float32)
        lmask = np.ones((1, 1, largo), dtype=np.float32)
        total = np.array([pasos], dtype=np.float32)
        for paso in range(pasos):
            xt, *_ = self.s["vector_estimator"].run(None, {
                "noisy_latent": xt, "text_emb": emb, "style_ttl": ttl, "text_mask": mask,
                "latent_mask": lmask, "current_step": np.array([paso], dtype=np.float32), "total_step": total,
            })
        wav, *_ = self.s["vocoder"].run(None, {"latent": xt})
        return wav.reshape(-1)[:n]

    def generar(self, texto: str, voz: str, pasos: int, velocidad: float) -> np.ndarray:
        partes = [self._trozo(t, voz, pasos, velocidad) for t in trocear(texto)]
        hueco = np.zeros(int(SILENCIO * self.sr), dtype=np.float32)
        return np.concatenate([x for p in partes for x in (p, hueco)][:-1])


def trocear(texto: str) -> list[str]:
    """Parte por oraciones (y si hace falta por comas) por debajo del limite del modelo."""
    if len(texto) <= MAX_CHARS:
        return [texto]
    trozos, actual = [], ""
    for pieza in re.split(r"(?<=[.!?…])\s+|(?<=[,;:])\s+", texto):
        if actual and len(actual) + 1 + len(pieza) > MAX_CHARS:
            trozos.append(actual)
            actual = pieza
        else:
            actual = f"{actual} {pieza}".strip()
    return trozos + ([actual] if actual else [])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--voz", default="M1", choices=[f"{g}{i}" for g in "FM" for i in range(1, 6)])
    ap.add_argument("--pasos", type=int, default=8)
    ap.add_argument("--velocidad", type=float, default=1.0)
    ap.add_argument("--solo", nargs="+", type=Path, help="rehace solo los textos de estos archivos .tsx")
    ap.add_argument("--forzar", action="store_true", help="rehace todos los textos")
    a = ap.parse_args()

    de_shorts = textos(SHORTS, r"const T = \[([\s\S]*?)\n\];")
    todos = textos() + [t for t in de_shorts if t not in textos()]
    rehacer: set[str] = set()
    if a.solo:
        archivos = [p if p.is_absolute() else (Path.cwd() / p).resolve() for p in a.solo]
        caps = [p for p in archivos if p in CAPS]
        otros = [p for p in archivos if p not in CAPS]
        # textos() con lista vacía lee todos los capítulos, así que solo se llama si hay archivos.
        if caps:
            rehacer |= set(textos(caps))
        if otros:
            rehacer |= set(textos(otros, r"const T = \[([\s\S]*?)\n\];"))
        if not rehacer:
            sys.exit("No encontre textos en esos archivos")
    if a.forzar:
        rehacer = set(todos)

    SALIDA.mkdir(parents=True, exist_ok=True)
    indice = json.loads(INDICE.read_text()) if INDICE.exists() else {}
    pendientes = [t for t in todos if t in rehacer or fnv1a(t) not in indice or not (SALIDA / f"{fnv1a(t)}.mp3").exists()]
    if not pendientes:
        print("Todos los textos ya tienen audio. Usa --solo o --forzar para rehacerlos.")
        return

    tts = Supertonic()
    ffmpeg = ffmpeg_bin()
    for i, t in enumerate(pendientes):
        h = fnv1a(t)
        voz = para_voz(t)
        # En narracion.py los Shorts van con length_scale 0.93 (mas rapido); aqui es velocidad / 0.93.
        vel = a.velocidad / VEL_SHORTS if t in de_shorts else a.velocidad
        audio = tts.generar(voz, a.voz, a.pasos, vel)
        with tempfile.TemporaryDirectory() as d:
            wav = Path(d) / "a.wav"
            with wave.open(str(wav), "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(tts.sr)
                w.writeframes((np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes())
            subprocess.run(ffmpeg + ["-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "64k", str(SALIDA / f"{h}.mp3")], check=True, cwd=RAIZ)
        indice[h] = round(len(audio) / tts.sr, 3)
        print(f"[{i + 1}/{len(pendientes)}] {h} {indice[h]:5.1f}s  {voz[:70]}", flush=True)
        INDICE.write_text(json.dumps(indice, indent=0, sort_keys=True) + "\n")
    print("Listo:", len(pendientes), "audios con la voz", a.voz)


if __name__ == "__main__":
    main()
