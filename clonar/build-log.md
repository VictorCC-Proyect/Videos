# Registro de construcción

| pantalla | fecha | estado | qué falta | más difícil de lo esperado |
| --- | --- | --- | --- | --- |
| base (rutas, layout, tokens, PWA) | 2026-10-23 | terminada | íconos definitivos (etapa 9) | nada |
| S01 Texto a voz | 2026-10-23 | parcial | confirmar en el celular que la voz se genera (Supertonic y Kokoro) | no se pudo probar la voz real: Hugging Face está bloqueado en el entorno de construcción |
| S02 Selector de voz | 2026-10-23 | terminada | | |
| S03/S04 Voces | 2026-10-23 | parcial | búsqueda en la biblioteca pública de ElevenLabs, favoritas | |
| S05 Clonación | | pendiente | todo (solo con ElevenLabs) | |
| S06 Historial | 2026-10-23 | terminada | zip de varios audios | |
| S07 Configuración | 2026-10-23 | terminada | | |
| Prueba a ciegas | 2026-10-23 | terminada | correrla en el celular del usuario | |

Notas:
- Kokoro-js solo trae voces en inglés. Para español se usa la conversión a fonemas de eSpeak NG (variante latinoamericana) con las voces ef_dora, em_alex y em_santa del mismo modelo. Es experimental: puede sonar peor que Supertonic.
- Supertonic 3 se carga desde Hugging Face (revisión fija) la primera vez y queda en la Cache del navegador.
- Sin servidor: la carpeta dist se publica tal cual. Pesa unos 50 MB por los archivos de ONNX Runtime.
- Pruebas: división de texto y codificación MP3 (unitarias), y recorrido en Chromium a 390 y 1440 px sin errores en la consola.
- 2026-10-23: en el iPhone del usuario la pestaña se cerró por falta de memoria al generar. Arreglo: descarga directa a la Cache sin copias, sesiones de ONNX creadas una por una, un worker por motor (solo uno vivo a la vez) y WebAssembly en iPhone. Si vuelve a pasar, siguiente paso: versión INT8 de Supertonic (unos 100 MB en vez de 400).
- 2026-10-23: diagnóstico del iPhone: Supertonic carga completo en WebAssembly pero la pestaña se cierra en el primer paso de generación; Kokoro carga pero no se vio terminar. Cambio: Supertonic intenta WebGPU primero y un guardián recuerda el modo que cerró la pestaña para usar el otro la próxima vez.
