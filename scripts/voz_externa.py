"""Usa una narración externa (ej. ElevenLabs) en un short.

La narración completa debe tener una pausa larga (~1 s, tag [pause]) entre cada texto
de la lista "const T" del short. Este script detecta esas pausas, corta el audio en un
clip por texto y lo guarda como public/narracion/<hash>.mp3, actualizando
src/fisio/narracion.json (el mismo sistema que usa scripts/narracion.py).

Uso: python3 scripts/voz_externa.py src/shorts/contraccion1.tsx narracion.mp3
"""

import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from narracion import INDICE, SALIDA, fnv1a, textos  # noqa: E402

PAUSA_MIN = 0.85  # segundos de silencio que separan dos textos


def silencios(audio: Path):
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(audio), "-af", "silencedetect=noise=-35dB:d=0.45", "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    fin = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return list(zip(ini, fin))


def duracion(audio: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(audio)],
        capture_output=True,
        text=True,
    )
    return float(r.stdout.strip())


def main():
    archivo, audio = Path(sys.argv[1]), Path(sys.argv[2])
    ts = textos([archivo], r"const T = \[([\s\S]*?)\n\];")
    largos = [(a, b) for a, b in silencios(audio) if b - a >= PAUSA_MIN]
    if len(largos) != len(ts) - 1:
        largos = sorted(sorted(silencios(audio), key=lambda s: s[0] - s[1])[: len(ts) - 1])
    if len(largos) != len(ts) - 1:
        sys.exit(f"Esperaba {len(ts) - 1} pausas y encontré {len(largos)}")
    cortes = [0.0] + [b - 0.12 for _, b in largos]
    finales = [a + 0.15 for a, _ in largos] + [duracion(audio)]
    indice = json.loads(INDICE.read_text())
    SALIDA.mkdir(parents=True, exist_ok=True)
    for t, a, z in zip(ts, cortes, finales):
        h = fnv1a(t)
        mp3 = SALIDA / f"{h}.mp3"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(audio), "-ss", f"{a:.3f}", "-to", f"{z:.3f}",
             "-af", "afade=t=in:d=0.03,areverse,afade=t=in:d=0.08,areverse", "-ac", "1", "-b:a", "128k", str(mp3)],
            check=True,
        )
        indice[h] = round(duracion(mp3), 3)
        print(f"{h} {indice[h]:5.1f}s  {t[:60]}")
    INDICE.write_text(json.dumps(indice, indent=0, sort_keys=True) + "\n")


if __name__ == "__main__":
    main()
