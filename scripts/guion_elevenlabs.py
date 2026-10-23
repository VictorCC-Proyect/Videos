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
    (r"\bMETs\b", "mets"),
    (r"\bMET\b", "met"),
    (r"\bkcal\b", "kilocalorías"),
    (r"km/h", "kilómetros por hora"),
    (r"\bml\b", "mililitros"),
    (r"\bNEAT\b", "nit"),
    (r"\bOMS\b", "o eme ese"),
    (r"(\d+)\.(\d+)", r"\1 punto \2"),
    (r"\s\+\s", " más "),
    (r"(\d) aproximadamente", r"\1, da aproximadamente"),
    (r",:", ":"),
    (r"(cinco|nueve) aproximadamente", r"\1, da aproximadamente"),
]


ANTES = [
    (r"VO₂\s*máx(imo)?", "ve o dos máximo"),
    (r"VO₂", "ve o dos"),
    (r"CO₂", "ce o dos"),
    (r"Hill \((\d+)\)", r"Hill, en \1"),
    (r"\(ACSM\)", ", o A C S M,"),
    (r"\bEPOC\b", "épok"),
    (r"1\.0278", "uno punto cero dos siete ocho"),
    (r"0\.0278", "cero punto cero dos siete ocho"),
    (r"0\.805", "cero punto ochocientos cinco"),
    (r"0\.889", "cero punto ochocientos ochenta y nueve"),
    (r"9\.81", "nueve punto ochenta y uno"),
    (r"\bHIIT\b", "jit"),
    (r"\bFMS\b", "efe eme ese"),
    (r"\bFNP\b", "efe ene pe"),
    (r"\((\d{4})\)", r"de \1"),
    (r"80/20", "ochenta veinte"),
    (r"\bFatMax\b", "fat max"),
]


def voz(t: str) -> str:
    for a, b in ANTES:
        t = re.sub(a, b, t)
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
