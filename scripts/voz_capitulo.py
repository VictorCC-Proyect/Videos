"""Integra la narracion externa (ElevenLabs) de un capitulo de video largo.

El audio debe tener una pausa ([pause]) entre cada texto de los planos del
archivo. Corta un clip por texto en public/narracion/<hash>.mp3 y actualiza
src/fisio/narracion.json, igual que scripts/voz_externa.py para los shorts.

Uso: python3 scripts/voz_capitulo.py src/fisio/actividad/a1.tsx narracion-a1.mp3
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import voz_externa  # noqa: E402
from narracion import textos  # noqa: E402

if __name__ == "__main__":
    archivo, audio = Path(sys.argv[1]), Path(sys.argv[2])
    ts = textos([archivo])
    voz_externa.textos = lambda *_a, **_k: ts
    voz_externa.main()
