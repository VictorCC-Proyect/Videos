"""Escribe el guion para ElevenLabs de cada capitulo de un video largo.

Cada texto queda separado por la etiqueta [pause] para que scripts/voz_capitulo.py
pueda cortar la narracion generada en un clip por texto.

Uso: python3 scripts/guion_elevenlabs.py src/fisio/actividad/a1.tsx [...]
"""

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from narracion import para_voz, textos  # noqa: E402

EXTRA = [
    (r"\b1 MET\b", "un met"),
    (r"\b1 kcal\b", "una kilocaloría"),
    (r"\s*×\s*", " por "),
    (r"\s*−\s*", " menos "),
    (r"\s*÷\s*", " entre "),
    (r"\s*=\s*", " igual a "),
    (r"VO₂\s*máx(ima)?", "ve o dos máximo"),
    (r"\b1RM\b", "una erre eme"),
    (r"\bRIR\b", "erre i erre"),
    (r"\bRPE\b", "erre pe e"),
    (r"\bCR-10\b", "ce erre diez"),
    (r"\bFC\b", "efe ce"),
    (r"\bMETs?\b", "mets"),
    (r"\bkcal\b", "kilocalorías"),
    (r"km/h", "kilómetros por hora"),
    (r"\bml\b", "mililitros"),
    (r"\bNEAT\b", "nit"),
    (r"\bOMS\b", "o eme ese"),
    (r"(\d) punto (\d)", r"\1 punto \2"),
]


def voz(t: str) -> str:
    t = para_voz(t)
    for a, b in EXTRA:
        t = re.sub(a, b, t)
    return re.sub(r"\s{2,}", " ", t).strip()


def main():
    for f in sys.argv[1:]:
        ts = textos([Path(f)])
        print(f"===== {f} ({len(ts)} textos)")
        print(" [pause] ".join(voz(t) for t in ts))


if __name__ == "__main__":
    main()
