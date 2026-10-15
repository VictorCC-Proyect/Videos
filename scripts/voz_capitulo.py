"""Integra la narracion externa (ElevenLabs) de un capitulo de video largo.

El audio se genera con el texto de voces-elevenlabs/*-texto.txt, que separa cada
texto con [pause]. ElevenLabs no siempre respeta todas las pausas, asi que cada
corte se elige entre los silencios del audio buscando que la duracion de cada
tramo se parezca a la esperada por su numero de caracteres. Cada clip se guarda
en public/narracion/<hash>.mp3 y se actualiza src/fisio/narracion.json.

Uso: python3 scripts/voz_capitulo.py src/fisio/actividad/a2.tsx voces-elevenlabs/tema4-a2.mp3
"""

import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from narracion import INDICE, SALIDA, fnv1a, textos  # noqa: E402
from voz_externa import duracion  # noqa: E402

INF = float("inf")


def silencios(audio: Path):
    r = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(audio), "-af", "silencedetect=noise=-35dB:d=0.3", "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    ini = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    fin = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return list(zip(ini, fin))


def cortes(largos: list[int], sil, total: float):
    """Elige len(largos)-1 silencios (programacion dinamica)."""
    n, m = len(largos), len(sil)
    habla = total - sum(b - a for a, b in sil if b - a > 0.8)
    ritmo = habla / sum(largos)

    def coste(seg, k):
        e = largos[k] * ritmo
        return ((seg - e) / e) ** 2

    dp = [[INF] * m for _ in range(n)]
    par = [[-1] * m for _ in range(n)]
    for j in range(m):
        dp[0][j] = coste(sil[j][0], 0) - 2 * (sil[j][1] - sil[j][0])
    for k in range(1, n - 1):
        for j in range(m):
            pausa = 2 * (sil[j][1] - sil[j][0])
            for i in range(j):
                v = dp[k - 1][i] + coste(sil[j][0] - sil[i][1], k) - pausa
                if v < dp[k][j]:
                    dp[k][j], par[k][j] = v, i
    j = min(range(m), key=lambda j: dp[n - 2][j] + coste(total - sil[j][1], n - 1))
    elegidos = [j]
    for k in range(n - 2, 0, -1):
        elegidos.append(par[k][elegidos[-1]])
    return [sil[j] for j in reversed(elegidos)]


def main():
    archivo, audio = Path(sys.argv[1]), Path(sys.argv[2])
    ts = textos([archivo])
    total = duracion(audio)
    elegidos = cortes([len(t.replace("**", "")) for t in ts], silencios(audio), total)
    inicios = [0.0] + [b - 0.12 for _, b in elegidos]
    finales = [a + 0.15 for a, _ in elegidos] + [total]
    indice = json.loads(INDICE.read_text())
    SALIDA.mkdir(parents=True, exist_ok=True)
    for t, a, z in zip(ts, inicios, finales):
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
