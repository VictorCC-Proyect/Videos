"""Genera la narracion en voz (Piper TTS) para cada texto del video.

Uso:
  pip install piper-tts
  python3 scripts/narracion.py ruta/a/es_MX-claude-high.onnx

Crea public/narracion/<hash>.mp3 y src/fisio/narracion.json con la duracion
de cada audio. El hash (FNV-1a de 32 bits sobre el texto original) es el mismo
que calcula src/fisio/motor.tsx, asi cada subtitulo encuentra su audio.
"""

import json
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CAPS = sorted((RAIZ / "src/fisio/capitulos").glob("cap*.tsx")) + sorted((RAIZ / "src/fisio/energia").glob("e*.tsx"))
# Shorts verticales: sus textos van en "const T = [...]" y se leen un poco mas rapido.
SHORTS = sorted((RAIZ / "src/shorts").glob("*.tsx"))
VEL_SHORTS = 0.93
SALIDA = RAIZ / "public/narracion"
INDICE = RAIZ / "src/fisio/narracion.json"


def fnv1a(texto: str) -> str:
    h = 0x811C9DC5
    for ch in texto:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def textos(archivos=None, patron=r"textos: \[([\s\S]*?)\n    \],"):
    vistos = []
    for f in archivos or CAPS:
        s = f.read_text(encoding="utf-8")
        for bloque in re.findall(patron, s):
            for t in re.findall(r'"((?:[^"\\]|\\.)*)"', bloque):
                t = json.loads('"' + t + '"')
                if t not in vistos:
                    vistos.append(t)
    return vistos


REEMPLAZOS = [
    (r"\*\*", ""),
    (r"\bPCr\b", "fosfocreatina"),
    (r"\bpH\b", "pe hache"),
    (r"(\d+(?:\.\d+)?)\s*g/kg", r"\1 gramos por kilo"),
    (r"(\d+)\s*mg\b", r"\1 miligramos"),
    (r"\bGLUT4\b", "glut cuatro"),
    (r"(\d+)\s*g\b", r"\1 gramos"),
    (r"(\d+)\s*kg\b", r"\1 kilos"),
    (r"\s*\(Ca²⁺\)", ""),
    (r"fosfato \(Pi\)", "fosfato inorgánico"),
    (r"\s+/\s+", " o "),
    (r",?\s*Ca₁₀\(PO₄\)₆\(OH\)₂,?", ","),
    (r"\(ACh\)", ""),
    (r"\bACh\b", "acetilcolina"),
    (r"\(MHC\)", ""),
    (r"\(MSC\)", ""),
    (r"\(Osx\)", ""),
    (r"\(OTG\)", ""),
    (r"\(SNC\)", ""),
    (r"\(SNP\)", ""),
    (r"\(FA\)", ""),
    (r"\(MEC\)", ""),
    (r" o ST\)", ")"),
    (r" o FOG\)", ")"),
    (r" o FG\)", ")"),
    (r"\bMHC\b", "eme hache ce"),
    (r"\bMEC\b", "matriz extracelular"),
    (r"H⁺-ATPasa", "hache más A T P asa"),
    (r"H⁺", "protones"),
    (r"Ca²⁺", "calcio"),
    (r"Na⁺", "sodio"),
    (r"O₂", "oxígeno"),
    (r"\bATPasa\b", "A T P asa"),
    (r"\bATP\b", "A T P"),
    (r"\bADP\b", "A D P"),
    (r"\bNADH\b", "nad hache"),
    (r"\(Pi\)", "(fosfato inorgánico)"),
    (r"\bPi\b", "fosfato"),
    (r"\bPTH\b", "parathormona"),
    (r"\bDMP1\b", "de eme pe uno"),
    (r"\bBMPs\b", "proteínas morfogenéticas óseas"),
    (r"\bRunx2\b", "runx dos"),
    (r"\bS1\b", "ese uno"),
    (r"\bS2\b", "ese dos"),
    (r"\bC1\b", "ce uno"),
    (r"\bC2\b", "ce dos"),
    (r"Andrew F\. Huxley", "Andrew Huxley"),
    (r"Hugh E\. Huxley", "Hugh Huxley"),
    (r"\by col\.", "y colaboradores"),
    (r"IIC/IC", "dos C o uno C"),
    (r"\bIIXA\b", "dos equis A"),
    (r"\bIIAX\b", "dos A equis"),
    (r"\bIIX\b", "dos equis"),
    (r"\bIIA\b", "dos A"),
    (r"\bIID\b", "dos D"),
    (r"\bIIB\b", "dos B"),
    (r"[Tt]roponina I\b", "troponina i"),
    (r"([Bb]andas?) I\b", r"\1 i"),
    (r"\bIV\b", "cuatro"),
    (r"\bIII\b", "tres"),
    (r"\bII\b", "dos"),
    (r"\bI\b", "uno"),
    (r"\bX\b(?=\))", "diez"),
    (r"1\.er", "primer"),
    (r"1\.ª", "primera"),
    (r"\b(\d)\.(\d)\b", r"\1 punto \2"),
    (r"(\d) (\d{3})\b", r"\1\2"),
    (r"(\d)\s*[–-]\s*(\d)", r"\1 a \2"),
    (r"~\s*", "aproximadamente "),
    (r"≈\s*", "aproximadamente "),
    (r"\s*%", " por ciento"),
    (r"µm", "micras"),
    (r"\s*→\s*", ", "),
    (r"[“”]", ""),
    (r"…", "..."),
    (r"\s+,", ","),
    (r",\s*,", ","),
    (r"\(\s*\)", ""),
    (r"\s{2,}", " "),
    (r"\s+([.,;:])", r"\1"),
]


def para_voz(t: str) -> str:
    for a, b in REEMPLAZOS:
        t = re.sub(a, b, t)
    return t.strip()


def ffmpeg_bin():
    import shutil

    for c in [shutil.which("ffmpeg"), RAIZ / "node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg"]:
        if c and Path(c).exists():
            return [str(c)]
    return ["npx", "remotion", "ffmpeg"]


def main():
    if len(sys.argv) < 2:
        sys.exit("Indica la ruta del modelo de voz .onnx")
    from piper import PiperVoice, SynthesisConfig

    voz_modelo = PiperVoice.load(sys.argv[1])
    config = SynthesisConfig(length_scale=1.0)
    rapido = SynthesisConfig(length_scale=VEL_SHORTS)
    SALIDA.mkdir(parents=True, exist_ok=True)
    indice = json.loads(INDICE.read_text()) if INDICE.exists() else {}
    ffmpeg = ffmpeg_bin()
    de_shorts = textos(SHORTS, r"const T = \[([\s\S]*?)\n\];")
    lista = textos() + [t for t in de_shorts if t not in textos()]
    nuevo = {}
    for i, t in enumerate(lista):
        h = fnv1a(t)
        mp3 = SALIDA / f"{h}.mp3"
        if h in indice and mp3.exists():
            nuevo[h] = indice[h]
            continue
        voz = para_voz(t)
        with tempfile.TemporaryDirectory() as d:
            wav = Path(d) / "a.wav"
            with wave.open(str(wav), "wb") as w:
                voz_modelo.synthesize_wav(voz, w, syn_config=rapido if t in de_shorts else config)
            with wave.open(str(wav)) as w:
                seg = w.getnframes() / w.getframerate()
            subprocess.run(
                ffmpeg + ["-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-b:a", "56k", str(mp3)],
                check=True,
                cwd=RAIZ,
            )
        nuevo[h] = round(seg, 3)
        print(f"[{i + 1}/{len(lista)}] {h} {seg:5.1f}s  {voz[:70]}", flush=True)
    INDICE.write_text(json.dumps(nuevo, indent=0, sort_keys=True) + "\n")
    print("Total:", round(sum(nuevo.values()) / 60, 1), "min de narracion")


if __name__ == "__main__":
    main()
