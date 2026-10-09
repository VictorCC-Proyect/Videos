"""Narracion de un short con Piper TTS (una pista por beat).

Uso: python3 shorts/voz.py ruta/es_MX-claude-high.onnx shorts/creatina [shorts/ardor ...]

Lee <short>/guion.json ({"beats": ["texto", ...]}) y escribe
<short>/audio/bNN.wav + <short>/audio/tiempos.json (segundos de cada beat).
"""

import json
import re
import sys
import wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from narracion import para_voz  # noqa: E402

EXTRA = [
    (r"\bPCr\b", "fosfocreatina"),
    (r"\bCr\b", "creatina"),
    (r"\bpH\b", "pe hache"),
    (r"(\d+(?:\.\d+)?)\s*g/kg", r"\1 gramos por kilo"),
    (r"(\d+)\s*g\b", r"\1 gramos"),
    (r"(\d+)\s*kg\b", r"\1 kilos"),
]


def texto_voz(t: str) -> str:
    for a, b in EXTRA:
        t = re.sub(a, b, t)
    return para_voz(t)


def main():
    from piper import PiperVoice, SynthesisConfig

    voz = PiperVoice.load(sys.argv[1])
    cfg = SynthesisConfig(length_scale=0.93)
    for carpeta in map(Path, sys.argv[2:]):
        beats = json.loads((carpeta / "guion.json").read_text(encoding="utf-8"))["beats"]
        out = carpeta / "audio"
        out.mkdir(exist_ok=True)
        tiempos = []
        for i, b in enumerate(beats):
            wav = out / f"b{i:02d}.wav"
            with wave.open(str(wav), "wb") as w:
                voz.synthesize_wav(texto_voz(b), w, syn_config=cfg)
            with wave.open(str(wav)) as w:
                tiempos.append(round(w.getnframes() / w.getframerate(), 3))
            print(carpeta.name, i, tiempos[-1], texto_voz(b)[:70], flush=True)
        (out / "tiempos.json").write_text(json.dumps(tiempos) + "\n")
        print(carpeta.name, "total", round(sum(tiempos), 1), "s")


if __name__ == "__main__":
    main()
