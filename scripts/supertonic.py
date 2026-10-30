"""Narración de un short con Supertonic 3 (Supertone), voz local en ONNX.

Genera un clip por cada texto de la lista "const T" del short, así que la voz cuadra
con las escenas por construcción. Guarda public/narracion/<hash>.mp3 y actualiza
src/fisio/narracion.json (el mismo sistema que scripts/narracion.py).

Uso: python3 scripts/supertonic.py src/shorts/hipertrofia.tsx [--voz M1] [--modelo DIR]
     [--velocidad 1.05] [--pasos 10] [--solo 3 --toma 1]
El modelo se descarga una vez de huggingface.co/supertone-oss-archive/supertonic-3
(pesos con licencia OpenRAIL-M) y se guarda en --modelo.
"""

import argparse
import json
import subprocess
import sys
import unicodedata
import urllib.request
import wave
from pathlib import Path

import numpy as np
import onnxruntime as ort

sys.path.insert(0, str(Path(__file__).resolve().parent))
from narracion import INDICE, SALIDA, fnv1a, para_voz, textos  # noqa: E402

REPO = "https://huggingface.co/supertone-oss-archive/supertonic-3/resolve/aafc6e32416a594460b32413efc49d7fe4ce6d46"
ONNX = ["duration_predictor", "text_encoder", "vector_estimator", "vocoder"]

# Ajustes de pronunciación propios de Supertonic (se aplican después de para_voz).
EXTRA = [
    ("A T P", "a te pe"),
    ("A D P", "a de pe"),
    ("mTOR", "eme tor"),
    ("REM", "rem"),
    ("PGC-1", "pe ge ce uno"),
    ("Holway", "Jólguey"),
    ("Carl Lewis", "Carl Luis"),
    ("AMPK", "a, eme, pe, ka"),
]


def bajar(dir_: Path, rel: str) -> Path:
    p = dir_ / rel
    if not p.exists():
        p.parent.mkdir(parents=True, exist_ok=True)
        print(f"descargando {rel}…")
        urllib.request.urlretrieve(f"{REPO}/{rel}", p)
    return p


def preparar(t: str) -> str:
    t = unicodedata.normalize("NFKD", t)
    for a, b in {"–": "-", "—": "-", "“": '"', "”": '"', "’": "'", "/": " ", "→": " "}.items():
        t = t.replace(a, b)
    t = " ".join(t.split())
    if t[-1] not in '.!?;:,\'")…»':
        t += "."
    return f"<es>{t}</es>"


class Supertonic:
    def __init__(self, dir_: Path, voz: str):
        self.cfg = json.loads(bajar(dir_, "onnx/tts.json").read_text())
        self.indexer = json.loads(bajar(dir_, "onnx/unicode_indexer.json").read_text())
        opt = ort.SessionOptions()
        self.dp, self.enc, self.est, self.voc = [
            ort.InferenceSession(str(bajar(dir_, f"onnx/{n}.onnx")), opt, providers=["CPUExecutionProvider"])
            for n in ONNX
        ]
        s = json.loads(bajar(dir_, f"voice_styles/{voz}.json").read_text())
        self.ttl = np.array(s["style_ttl"]["data"], dtype=np.float32).reshape(s["style_ttl"]["dims"])
        self.sdp = np.array(s["style_dp"]["data"], dtype=np.float32).reshape(s["style_dp"]["dims"])

    def sintetizar(self, texto: str, velocidad: float, pasos: int, semilla: int) -> tuple[np.ndarray, int]:
        p = preparar(texto)
        ids = np.array([[self.indexer[ord(c)] if ord(c) < len(self.indexer) else -1 for c in p]], dtype=np.int64)
        mask = np.ones((1, 1, ids.shape[1]), dtype=np.float32)
        dur = self.dp.run(None, {"text_ids": ids, "style_dp": self.sdp, "text_mask": mask})[0]
        seg = float(np.ravel(dur)[0]) / velocidad
        emb = self.enc.run(None, {"text_ids": ids, "style_ttl": self.ttl, "text_mask": mask})[0]
        sr = self.cfg["ae"]["sample_rate"]
        n = int(seg * sr)
        chunk = self.cfg["ae"]["base_chunk_size"] * self.cfg["ttl"]["chunk_compress_factor"]
        largo = max(1, (n + chunk - 1) // chunk)
        dim = self.cfg["ttl"]["latent_dim"] * self.cfg["ttl"]["chunk_compress_factor"]
        rng = np.random.default_rng(semilla)
        x = rng.standard_normal((1, dim, largo)).astype(np.float32)
        lmask = np.ones((1, 1, largo), dtype=np.float32)
        total = np.array([pasos], dtype=np.float32)
        for i in range(pasos):
            x = self.est.run(None, {
                "noisy_latent": x, "text_emb": emb, "style_ttl": self.ttl, "latent_mask": lmask,
                "text_mask": mask, "current_step": np.array([i], dtype=np.float32), "total_step": total,
            })[0]
        wav = np.ravel(self.voc.run(None, {"latent": x})[0])[:n]
        return wav, sr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("short")
    ap.add_argument("--voz", default="M1")
    ap.add_argument("--modelo", default=str(Path.home() / ".cache/supertonic3"))
    ap.add_argument("--velocidad", type=float, default=1.05)
    ap.add_argument("--pasos", type=int, default=10)
    ap.add_argument("--solo", default="", help="índices (desde 0) de los textos a regenerar, ej. 3 o 3,7")
    ap.add_argument("--toma", type=int, default=0, help="otra semilla para la misma frase (si sale con un tropiezo)")
    a = ap.parse_args()

    ts = textos([Path(a.short)], r"const T = \[([\s\S]*?)\n\];")
    tts = Supertonic(Path(a.modelo), a.voz)
    indice = json.loads(INDICE.read_text())
    SALIDA.mkdir(parents=True, exist_ok=True)
    solo = {int(i) for i in a.solo.split(",") if i}
    for i, t in enumerate(ts):
        if solo and i not in solo:
            continue
        dicho = para_voz(t)
        for x, y in EXTRA:
            dicho = dicho.replace(x, y)
        h = fnv1a(t)
        wav, sr = tts.sintetizar(dicho, a.velocidad, a.pasos, semilla=int(h, 16) + a.toma)
        tmp = SALIDA / f"{h}.wav"
        with wave.open(str(tmp), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes((np.clip(wav, -1, 1) * 32767).astype(np.int16).tobytes())
        mp3 = SALIDA / f"{h}.mp3"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp),
             "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                    "afade=t=in:d=0.02,loudnorm=I=-16:TP=-1.5",
             "-ar", "44100", "-ac", "1", "-b:a", "128k", str(mp3)],
            check=True,
        )
        tmp.unlink()
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)],
                           capture_output=True, text=True)
        indice[h] = round(float(r.stdout.strip()), 3)
        print(f"{h} {indice[h]:5.1f}s  {t[:60]}")
    INDICE.write_text(json.dumps(indice, indent=0, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
