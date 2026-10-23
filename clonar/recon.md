# Mapa de reconocimiento: ElevenLabs (web)

Alcance: el ciclo principal de texto a voz: editor de texto a voz, biblioteca de
voces, mis voces, clonación instantánea de la voz propia (con consentimiento) e
historial de generaciones.
Para: uso propio del usuario (voz en off para sus videos, Reels, Shorts y TikTok).
No se publica ni se vende. Sin cuentas de otros usuarios, sin planes ni cobros.
Fecha: 2026-10-23

## Fuentes

Solo fuentes públicas. No se usó la cuenta del usuario. Desde este entorno no se
pudo abrir elevenlabs.io directamente (el dominio no resuelve), así que la
información viene de los resultados de búsqueda sobre su documentación y su
centro de ayuda. Por eso `screens/` está vacío: no hay capturas de referencia.

| # | fuente | URL | notas |
| --- | --- | --- | --- |
| 1 | documentación: Text to Speech (playground) | https://elevenlabs.io/docs/eleven-creative/playground/text-to-speech | ajustes, rangos y límites por modelo |
| 2 | documentación: Voice Library | https://elevenlabs.io/docs/eleven-creative/voices/voice-library | búsqueda, filtros, orden, botones + y T |
| 3 | centro de ayuda: What is the Voice Library? | https://help.elevenlabs.io/hc/en-us/articles/23143350045329-What-is-the-Voice-Library | |
| 4 | documentación: Instant Voice Cloning | https://elevenlabs.io/docs/product-guides/voices/voice-cloning/instant-voice-cloning | muestra de 1 a 3 minutos, casilla de consentimiento |
| 5 | blog: Eleven v3 audio tags | https://elevenlabs.io/blog/v3-audiotags | etiquetas como [whispers], [laughs] |
| 6 | centro de ayuda: audio tags con v3 | https://help.elevenlabs.io/hc/en-us/articles/35869142561297-How-do-audio-tags-work-with-Eleven-v3 | |
| 7 | Tom's Guide: recorrido | https://tomsguide.com/how-to-use-elevenlabs-to-dive-into-ai-generated-storytelling | ajustar y volver a generar |
| 8 | guía de descarga (alemán) | https://www.antwort.net/a/tutorial/elevenlabs-audio-herunterladen-der-ultimative-guide-2025-easy-guide.html | descarga MP3 desde el reproductor e historial |
| 9 | documentación de terceros (ComfyUI) | https://docs.comfy.org/built-in-nodes/ElevenLabsTextToSpeech | parámetros de la API |

## Ciclo principal

Escribir un texto, elegir una voz, ajustar cómo suena y descargar el audio listo
para usar en un video.

## Pantallas

| ID | pantalla | ruta / cómo se llega | propósito | componentes clave | estados vistos |
| --- | --- | --- | --- | --- | --- |
| S01 | Texto a voz (editor) | inicio de la app | escribir el texto y generar el audio | área de texto con contador de caracteres, selector de voz, selector de modelo, panel de ajustes (estabilidad, similitud, estilo, velocidad, speaker boost), botón Generar, reproductor con descarga | vacío, escribiendo, generando, con audio, error, texto sobre el límite |
| S02 | Selector de voz | desde S01, clic en la voz | cambiar de voz sin salir del editor | buscador, lista de mis voces con botón de escuchar | con datos, sin resultados |
| S03 | Biblioteca de voces | menú lateral | descubrir voces nuevas | buscador, filtros (idioma, acento solo después del idioma, categoría, género, edad), orden (tendencia, recientes, más usadas), tarjetas con play y botón + | cargando, con datos, sin resultados |
| S04 | Mis voces | menú lateral | administrar las voces guardadas | lista de voces, play, botón T (usar en texto a voz), eliminar, botón "clonar mi voz" | vacío, con datos |
| S05 | Clonación instantánea | desde S04 | crear una voz a partir de una grabación propia | subir o grabar muestras (1 a 3 minutos en total), nombre, descripción, casilla de consentimiento | vacío, subiendo, procesando, lista, error (audio muy corto o con ruido) |
| S06 | Historial | menú lateral | recuperar audios ya generados | lista con texto, voz, modelo y fecha; play; descargar; reutilizar los ajustes en S01; selección múltiple para descargar en zip | vacío, con datos |
| S07 | Configuración | menú lateral | elegir el motor de voz y los valores por defecto | motor de voz y su clave, modelo por defecto, formato de salida por defecto | sin configurar, configurado, clave inválida |

S07 no existe así en ElevenLabs: en el clon hace falta porque el audio lo genera
un motor de voz externo o local.

## Flujos

```
F01 Generar una voz en off
    S01 escribir texto -> S02 elegir voz -> S01 Generar -> escuchar -> descargar
    clics del camino feliz: 4
    límite: texto más largo que el límite del modelo, motor caído, voz eliminada, texto vacío

F02 Encontrar y guardar una voz
    S03 filtrar por idioma y categoría -> escuchar muestras -> + -> S04 -> T -> S01
    clics del camino feliz: 5
    límite: sin resultados, muestra que no carga

F03 Clonar la voz propia
    S04 -> S05 subir o grabar muestra -> marcar consentimiento -> guardar -> S01 con la voz nueva
    clics del camino feliz: 5
    límite: muestra muy corta, ruido de fondo, formato no soportado

F04 Recuperar un audio anterior
    S06 -> buscar -> escuchar -> descargar (o reutilizar los ajustes en S01)
    clics del camino feliz: 3
    límite: historial vacío, archivo borrado del disco

F05 Dirigir la actuación con etiquetas
    S01 escribir texto con etiquetas como [whispers], [laughs], [sighs] -> elegir un modelo que las soporte -> Generar
    clics del camino feliz: 2
    límite: el modelo elegido no soporta etiquetas (se leen en voz alta o se ignoran)
```

## Componentes

| componente | variantes | estados | se usa en |
| --- | --- | --- | --- |
| Botón | primario, secundario, fantasma, peligro, icono | normal, hover, foco, deshabilitado, cargando | todas |
| Área de texto con contador | normal | vacío, con texto, sobre el límite | S01 |
| Deslizador (slider) con etiqueta y valor | continuo; con pasos (estabilidad en v3: creativa, natural, robusta) | normal, deshabilitado (no aplica al modelo) | S01 |
| Interruptor (toggle) | normal | encendido, apagado, deshabilitado | S01 (speaker boost) |
| Selector desplegable | simple, con buscador | cerrado, abierto, sin resultados | S01, S02, S03, S07 |
| Tarjeta de voz | biblioteca, mis voces | normal, reproduciendo, guardada | S02, S03, S04 |
| Chips de filtro | normal | activo, inactivo | S03 |
| Reproductor de audio | barra inferior global, en fila | detenido, reproduciendo, cargando | S01, S03, S04, S06 |
| Zona de subida / grabación | subir, grabar | vacío, arrastrando, subiendo, error | S05 |
| Fila de historial | normal | seleccionada, reproduciendo | S06 |
| Modal | normal | abierto, cerrado | S02, S05 |
| Aviso (toast) | éxito, error | visible, oculto | todas |
| Navegación lateral | normal | elemento activo | todas |

## Modelo de datos inferido

```
Voice        id, name, source (premade | library | cloned), language, accent, gender,
             age, category (conversational | narration | characters | advertisement),
             description, preview_url, engine_voice_id, created_at
             evidencia: filtros de S03, tarjetas de S04, fuente 2
             confianza: alta

VoiceSample  id, voice_id, file_path, duration_s, created_at
             evidencia: S05, fuente 4
             confianza: alta

Generation   id, text, voice_id, model_id, settings (json: stability, similarity,
             style, speed, speaker_boost), output_format, audio_path, char_count,
             duration_s, created_at
             evidencia: S06, descargas del historial (fuente 8), parámetros de la API (fuente 9)
             confianza: alta

Model        id, name, languages, char_limit, supports_tags, supported_settings
             evidencia: límites por modelo (fuente 1): v3 hasta 5000 caracteres y
             sin velocidad, similitud ni speaker boost; Multilingual v2 con 29 idiomas
             confianza: media (en el clon sería configuración, no una tabla)

Settings     engine, engine_key_ref, default_model_id, default_output_format
             evidencia: ninguna en el original, es necesario para el clon
             confianza: suposición
```

Relaciones: Voice 1-n VoiceSample, Voice 1-n Generation, Model 1-n Generation.
Sin entidad User: es una app de una sola persona.

## Matriz de funciones

Ver `features.csv`. Must: 9, should: 8, could: 5, skip: 7.

## Fuera del alcance (no se puede o no se debe clonar)

- Los modelos de voz de ElevenLabs y su calidad: el audio lo genera otro motor.
- Sus voces prediseñadas y las voces de la comunidad: son de ElevenLabs o de sus creadores.
- La clonación de voces de otras personas sin su consentimiento.
- Planes, créditos y cobros: no aplican al uso propio.
- Doblaje, música, efectos de sonido, agentes de voz y estudio de audiolibros: fuera del alcance acordado.

## Tamaño

Pantallas 7, flujos 5, entidades 4. Partes difíciles: elegir un motor de voz que
suene natural en español, la calidad de la clonación de voz, y los textos largos
(hay que partirlos en trozos y unir los audios). Tamaño: S a M (un fin de semana
para lo imprescindible, unas semanas con la clonación y el pulido).
