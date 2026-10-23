# Arquitectura: (nombre en la etapa 9), una reconstrucción de las funciones principales de ElevenLabs

Uso propio. Gratis, sin cuentas nuevas y sin créditos. Se abre desde el celular
fuera de casa sin depender de la laptop.

## Países

No aplica. La app es de uso propio: no se vende, no cobra, no emite facturas ni
tiene canal de atención.

## La idea: la voz se genera en el dispositivo

No hay servidor. La app es una página web estática (una PWA que se instala en la
pantalla de inicio) y el modelo de voz corre dentro del navegador del
dispositivo que la abre, con WebGPU o, si no hay, con WebAssembly. La primera vez
descarga el modelo (decenas de MB) y queda guardado; después funciona incluso
sin internet.

Por qué así:
- **Sin cuentas nuevas:** se aloja en GitHub Pages con la cuenta de GitHub que el usuario ya tiene.
- **Sin créditos ni servidor que pagar:** el cálculo lo hace el dispositivo.
- **Sin depender de la laptop:** el celular genera su propio audio.
- **La laptop no alcanza para servir a otros:** AMD Athlon Silver 3050U de 2 núcleos, 8 GB de RAM y disco mecánico. Puede abrir la app como cualquier navegador, pero no correr modelos grandes como Chatterbox.

## Stack

| capa | elección | por qué |
| --- | --- | --- |
| web | Vite + React + TypeScript + Tailwind, como PWA | estática, sin servidor; el usuario ya usa React y TypeScript |
| motor gratuito | Supertonic (Supertone; SDK MIT, pesos OpenRAIL-M) con ONNX Runtime Web | corre en el navegador, habla español, es muy rápido incluso sin GPU dedicada |
| motor opcional | API oficial de ElevenLabs, llamada desde el navegador con la clave del usuario | solo si algún día pega su clave: Emiliano y las voces de su cuenta |
| datos | IndexedDB del navegador (con la librería Dexie) | historial, voces guardadas y ajustes, en el propio dispositivo |
| audio | WAV que sale del modelo, convertido a MP3 en el navegador (lamejs) | descarga en MP3 para los videos |
| contraseña | no hace falta | no hay servidor ni datos en internet que proteger: el historial y la clave viven solo en el dispositivo. Un PIN local opcional para abrir la app |
| hosting | GitHub Pages | gratis y sin cuenta nueva |
| autenticación, base de datos en la nube, pagos, correo, tareas | no aplica | |

### Motor gratuito: cómo se elige para que no suene robotizado

Primer paso de la etapa 4: una **prueba a ciegas** con el guion de uno de tus
Shorts en español, generado en tu celular con Supertonic y con Kokoro (y con
Emiliano como referencia si tienes clave). Escuchas sin saber cuál es cuál y
eliges. Se queda el que gane, o los dos.

Expectativa honesta:
- Los dos suenan mucho más naturales que Piper (el de `scripts/narracion.py`), pero quedan por debajo de Emiliano en ElevenLabs.
- **No clonan voces.** La clonación de tu propia voz queda solo con ElevenLabs, si algún día pones tu clave.
- La velocidad depende del celular. En uno de gama media debería generar un minuto de audio en segundos o pocas decenas de segundos. Se mide en la prueba.
- El historial de cada dispositivo es independiente: lo que generes en el celular no aparece en la laptop. Se pasa descargando el MP3.

## Datos (IndexedDB)

Stores: 4. Sin reglas de acceso: los datos no salen del dispositivo.

```
voices       id, engine (free-supertonic | free-kokoro | elevenlabs), source (builtin | account | library | cloned),
             engine_voice_id, name, language, accent, gender, age, category, preview_url, created_at
             índices: engine, name

generations  id, voice_id, voice_name, engine, model_id, text, char_count,
             settings { speed, steps, stability, similarity, style, speaker_boost },
             status (rendering | done | failed), error, audio (Blob MP3), duration_s, created_at
             índices: created_at, voice_id

chunks       id, generation_id, position, text, status, audio (Blob WAV)   (se borran al unir)
             índices: [generation_id+position]

settings     una fila: default_engine, default_voice_id, default_speed, pin_hash,
             elevenlabs_key (solo si el usuario la pega; nunca sale del dispositivo salvo hacia api.elevenlabs.io)
```

Se pide al navegador almacenamiento persistente (`navigator.storage.persist()`)
para que no borre el historial solo. Aun así, borrar los datos del navegador
borra el historial: el aviso aparece en Configuración.

## Funciones internas (no hay API propia)

| función | hace | flujo |
| --- | --- | --- |
| `loadEngine(engine)` | descarga y guarda en caché el modelo la primera vez, con barra de progreso | F01 |
| `splitText(text, limit)` | parte por oraciones, por debajo del límite del motor | F01 |
| `synthesize(chunk, voice, settings)` | genera el audio de un trozo, en un Web Worker para no congelar la pantalla | F01, F05 |
| `joinAndEncode(chunks)` | une los trozos con una pausa corta y convierte a MP3 | F01 |
| `history.list(q)`, `history.remove(id)` | historial con búsqueda en el texto | F04 |
| `exportZip(ids)` | descarga varias en un zip (opcional) | F04 |

APIs externas, solo con la clave del usuario y solo si la pega (todas oficiales y públicas):

| llamada | para qué | flujo |
| --- | --- | --- |
| POST /v1/text-to-speech/{voice_id} con `previous_text` y `next_text` | generar con Emiliano y otras voces | F01, F05 |
| GET /v2/voices | traer las voces de su cuenta, como Emiliano | F02 |
| GET /v1/shared-voices, POST /v1/voices/add/{public_user_id}/{voice_id} | buscar y agregar voces de la biblioteca | F02 |
| POST /v1/voices/add | clonar su propia voz, con la casilla de consentimiento | F03 |
| GET /v1/user/subscription | créditos restantes | F01 |

Webhooks: ninguno. Tareas programadas: ninguna.

## Las partes que muerden

- **Descarga inicial del modelo:** la primera vez tarda según la conexión. Se muestra el progreso y se recomienda hacerlo con Wi-Fi.
- **Memoria del celular:** los textos largos se generan trozo por trozo y se liberan, para no llenar la memoria.
- **Soporte del navegador:** WebGPU funciona en Chrome para Android y en Safari reciente; si no, cae a WebAssembly (más lento). Se prueba en el celular del usuario en el corte vertical.
- **Llamar a ElevenLabs desde el navegador:** hay que confirmar en el corte vertical que su API lo permite (CORS). Si no, ElevenLabs queda solo en la laptop o se reconsidera.
- **La clave de ElevenLabs:** queda guardada solo en ese dispositivo. Si alguien toma el celular desbloqueado, podría usarla: para eso el PIN opcional.
- **Créditos:** cada trozo de ElevenLabs gasta créditos. Se muestra el costo en caracteres antes de generar. Las voces de la biblioteca, como Emiliano, requieren plan de pago por la API.
- **Ajustes según el motor:** cada motor tiene ajustes distintos (v3 de ElevenLabs no tiene velocidad ni similitud). La interfaz muestra solo los que aplican.
- **Licencia de Supertonic:** los pesos usan OpenRAIL-M, con restricciones de uso. Para uso propio no hay problema; si algún día se vende, revisarla.
- **Repositorio público:** GitHub Pages gratis necesita un repositorio público. El código no tiene secretos, así que no hay riesgo. Se propone un repositorio aparte solo para la app.
- **Zonas horarias, pagos, facturación, servidor:** no aplican.

## Orden de construcción

1. **Corte vertical:** S01 mínimo (texto, una voz de Supertonic, Generar, escuchar, descargar MP3), publicado en GitHub Pages y probado en tu celular. Incluye la prueba a ciegas Supertonic contra Kokoro.
2. **Imprescindibles:** selector de voz S02, ajustes por motor, historial S06, configuración S07, contador de caracteres, instalación como PWA.
3. **Deseables:** textos largos en trozos con unión, ElevenLabs con tu clave (Emiliano, créditos, etiquetas de actuación), biblioteca S03 y mis voces S04, reutilizar ajustes del historial.
4. **Opcionales:** clonación S05 (solo ElevenLabs), WAV, zip del historial, PIN, diccionario de pronunciación.
5. **Arreglos de clonar-emprendedor:** si se corre la etapa 8.

## Cambios después de construir (2026-10-23)

- **Kokoro se quitó.** kokoro-js solo convierte a fonemas en inglés (su librería eSpeak no trae español), así que no puede hablar español en el navegador.
- **iPhone:** Supertonic (unos 400 MB) carga pero la pestaña se cierra al generar, tanto con WebGPU como con WebAssembly. La app queda para usarse en la computadora; en el iPhone solo sirve ElevenLabs con clave.
- **Publicación:** en Netlify (cuenta que el usuario ya tenía), proyecto voz-victor, subiendo el zip de `dist` a mano porque el entorno no puede llegar al servicio de subida.
- **Voz para los videos sin la app:** `scripts/narracion_supertonic.py` usa el mismo modelo y voces desde Python y escribe en `public/narracion/` y `src/fisio/narracion.json`.
