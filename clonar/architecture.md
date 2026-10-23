# Arquitectura: (nombre en la etapa 9), una reconstrucción de las funciones principales de ElevenLabs

Uso propio. Una sola persona, en internet con contraseña, usable desde la
computadora y desde el celular.

## Países

No aplica. La app es de uso propio: no se vende, no cobra, no emite facturas ni
tiene canal de atención. Si algún día se quiere vender, hay que volver a esta
sección y leer `paises.md`.

## Stack

| capa | elección | por qué |
| --- | --- | --- |
| web | Next.js (App Router) + TypeScript + Tailwind | el usuario ya trabaja con React y TypeScript en este repo (Remotion) |
| celular | la misma web, responsive y como PWA (se instala en la pantalla de inicio) | no hace falta una app nativa para escribir texto y escuchar audio |
| base de datos | Postgres en Supabase | administrado, con nivel gratuito, y trae autenticación y almacenamiento en el mismo lugar |
| autenticación | Supabase Auth con correo y contraseña, registro desactivado | una sola cuenta: la del usuario. Nadie más puede crear una |
| archivos | Supabase Storage, buckets privados `audio` y `samples`, enlaces firmados | los audios y las muestras de voz no quedan públicos |
| motor 1: ElevenLabs | API oficial de ElevenLabs con la clave del usuario | para Emiliano y las demás voces de su cuenta. Gasta los créditos de su plan |
| motor 2: gratuito | Chatterbox Multilingual (Resemble AI, licencia MIT), en una GPU bajo demanda en Modal | modelo abierto que habla español, suena natural, clona voz con una muestra corta y controla la emoción. Ver "Motor gratuito" abajo |
| unir audios | función de Modal con ffmpeg (CPU) | une los trozos de un texto largo en un solo MP3, para los dos motores |
| tareas | ninguna programada | todo ocurre cuando el usuario pide un audio |
| pagos, facturación, correo, WhatsApp | no aplica | uso propio |
| hosting | Netlify | ya está conectado a la sesión, tiene nivel gratuito y soporta Next.js |

Secretos (solo en las variables de entorno de Netlify y Modal, nunca en la base
de datos ni en el código): `ELEVENLABS_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`MODAL_TOKEN` (para que solo la app pueda llamar al motor gratuito). Los crea y
los pega el usuario.

### Motor gratuito: cómo se elige para que no suene robotizado

El usuario pidió una voz muy natural, nada robotizada. Los motores locales
ligeros (como el Piper que usa hoy `scripts/narracion.py`) suenan robotizados
porque corren en CPU con modelos pequeños. Los modelos abiertos recientes
suenan mucho mejor, pero necesitan una GPU, por eso van en Modal: se paga por
segundo de uso y se apaga solo. Modal da un crédito mensual gratuito que,
para el volumen de una persona, probablemente lo cubre (el usuario debe
verificarlo en modal.com/pricing).

Candidato principal: **Chatterbox Multilingual** (MIT, 23 idiomas con español,
clonación con unos segundos de muestra, control de exageración emocional).

Antes de decidir, en el primer hito de la etapa 4 se hace una **prueba a ciegas**:
el mismo guion de un Short tuyo, en español, con tres motores abiertos
(Chatterbox Multilingual, F5-TTS con el modelo afinado en español y XTTS-v2),
más Emiliano en ElevenLabs como referencia. El usuario escucha sin saber cuál
es cuál y elige. Se queda el que gane. F5-TTS y XTTS-v2 tienen licencias no
comerciales, que sirven para uso propio pero no si algún día se vende.

Expectativa honesta: el mejor modelo abierto en español suena natural, pero
puede quedar un paso por debajo de Emiliano en ElevenLabs. Para los videos
finales, Emiliano; para borradores, o para usar tu propia voz clonada sin
gastar créditos, el motor gratuito.

## Esquema

Tablas: 5. Reglas de acceso: row level security de Postgres en Supabase
(`user_id = auth.uid()` en todas). Ver `clonar/schema.sql`.

```
voices             las voces guardadas, de cualquiera de los dos motores
voice_samples      las muestras de audio de las voces clonadas
generations        cada audio pedido: texto, voz, ajustes, estado, archivo final
generation_chunks  los trozos de un texto largo y el audio de cada uno
settings           los valores por defecto del usuario (una fila)
```

## API

Rutas de Next.js (route handlers). Todas exigen la sesión del usuario. Las que
hablan con ElevenLabs o Modal corren en el servidor, así las claves nunca
llegan al navegador.

### Sesión (S00)

| método ruta | hace | quién | entrada | salida | flujo |
| --- | --- | --- | --- | --- | --- |
| Supabase Auth (cliente) | iniciar y cerrar sesión | el usuario | correo, contraseña | sesión | todos |

### F01 Generar una voz en off y F05 etiquetas

| método ruta | hace | quién | entrada | salida | flujo |
| --- | --- | --- | --- | --- | --- |
| GET /api/engines | modelos de cada motor con su límite de caracteres y qué ajustes y etiquetas soportan | usuario | | lista | F01, F05 |
| POST /api/generations | crea la generación y parte el texto en trozos por oraciones, por debajo del límite del modelo | usuario | text, voice_id, engine, model_id, settings, output_format | generation con sus chunks | F01 |
| POST /api/generations/:id/chunks/:n | genera un trozo. ElevenLabs: llamada directa con `previous_text` y `next_text` para que la entonación siga entre trozos. Gratuito: encarga el trabajo a Modal y responde de inmediato | usuario | | chunk (status) | F01 |
| GET /api/generations/:id | estado de la generación y de cada trozo (el navegador pregunta cada 2 s) | usuario | | generation | F01 |
| POST /api/generations/:id/join | une los trozos en Modal con ffmpeg y guarda el MP3 final | usuario | | generation con audio_path | F01 |
| GET /api/generations/:id/download | enlace firmado de descarga, válido 10 minutos | usuario | | url | F01, F04 |
| GET /api/elevenlabs/credits | créditos restantes del plan del usuario (`GET /v1/user/subscription`) | usuario | | usados, límite, renovación | F01 |

### F02 Encontrar y guardar una voz

| método ruta | hace | quién | entrada | salida | flujo |
| --- | --- | --- | --- | --- | --- |
| GET /api/library | busca en la biblioteca pública de ElevenLabs (`GET /v1/shared-voices`) | usuario | q, language, accent, category, gender, age, sort, page | voces con preview_url | F02 |
| POST /api/library/add | agrega la voz a la cuenta de ElevenLabs del usuario (`POST /v1/voices/add/{public_user_id}/{voice_id}`) y la guarda en `voices` | usuario | public_user_id, voice_id, name | voice | F02 |
| POST /api/voices/import | trae las voces que ya están en la cuenta de ElevenLabs del usuario (`GET /v2/voices`), como Emiliano | usuario | | voices | F02 |
| GET /api/voices | mis voces, de los dos motores | usuario | engine | voices | F02, F01 |
| DELETE /api/voices/:id | quita la voz de mis voces | usuario | | ok | F02 |

### F03 Clonar la voz propia

| método ruta | hace | quién | entrada | salida | flujo |
| --- | --- | --- | --- | --- | --- |
| POST /api/voices/clone | sube las muestras a `samples`. ElevenLabs: crea la voz con `POST /v1/voices/add`. Gratuito: la muestra queda como audio de referencia | usuario | engine, name, files, consent=true | voice | F03 |

Sin `consent=true` la ruta responde 400. La casilla dice que la voz es del
usuario o que tiene permiso de su dueño.

### F04 Recuperar un audio anterior

| método ruta | hace | quién | entrada | salida | flujo |
| --- | --- | --- | --- | --- | --- |
| GET /api/generations | historial, del más nuevo al más viejo, con búsqueda en el texto | usuario | q, cursor | generations | F04 |
| DELETE /api/generations/:id | borra la generación y sus archivos | usuario | | ok | F04 |
| POST /api/generations/zip | junta varias en un zip (opcional) | usuario | ids | url | F04 |

### Configuración (S07)

| método ruta | hace | quién | entrada | salida | flujo |
| --- | --- | --- | --- | --- | --- |
| GET /api/settings, PUT /api/settings | motor, modelo, voz y formato por defecto | usuario | settings | settings | todos |
| GET /api/engines/health | prueba que la clave de ElevenLabs funcione y que Modal responda | usuario | | estado de cada motor | S07 |

### Modal (motor gratuito)

| método ruta | hace | quién | entrada | salida |
| --- | --- | --- | --- | --- |
| POST /tts | encola un trozo: baja la muestra de referencia, genera el audio en la GPU, lo sube a `audio` y marca el chunk como listo | solo la app (MODAL_TOKEN) | chunk_id, text, reference_path, exaggeration, cfg_weight, language=es | call_id |
| POST /join | une los trozos de una generación con ffmpeg | solo la app | generation_id | audio_path |

Webhooks: ninguno. Tareas programadas: ninguna.

## Las partes que muerden

- **Tiempo de espera:** las funciones de Netlify cortan a los pocos segundos y la GPU de Modal puede tardar 30 s o más en despertar. Por eso el motor gratuito trabaja en segundo plano y el navegador pregunta el estado; nunca se espera dentro de una función.
- **Textos largos:** cada modelo tiene un límite por solicitud (v3 de ElevenLabs: 5,000 caracteres). Se parte por oraciones; en ElevenLabs se pasan `previous_text` y `next_text` para que no cambie la entonación entre trozos.
- **Créditos:** cada trozo de ElevenLabs gasta créditos, también si se vuelve a generar. Se muestran los créditos restantes y cuántos caracteres va a gastar antes de generar.
- **Plan de ElevenLabs:** las voces de la biblioteca, como Emiliano, no están disponibles por la API en el plan gratuito.
- **Ajustes según el modelo:** v3 no acepta velocidad, similitud ni speaker boost, y su estabilidad es por pasos (creativa, natural, robusta). La interfaz desactiva lo que el modelo no soporte en vez de mandarlo y fallar.
- **Idempotencia:** volver a pedir un trozo que ya está listo devuelve el existente y no gasta créditos otra vez.
- **Seguridad:** registro desactivado en Supabase, RLS en todas las tablas, buckets privados, claves solo en el servidor. Sin esto, cualquiera que encuentre la URL gastaría los créditos del usuario.
- **Consentimiento al clonar:** solo la voz propia o con permiso de su dueño.
- **Zonas horarias, pagos, facturación:** no aplican.

## Orden de construcción

1. **Corte vertical:** S00 inicio de sesión, S01 editor mínimo (texto, voz fija Emiliano, Generar, escuchar, descargar). Tablas `generations` y `generation_chunks`. Rutas POST /api/generations, POST chunks, GET y download, solo con ElevenLabs. Desplegado en Netlify con contraseña: se prueba desde el celular.
2. **Prueba a ciegas del motor gratuito** (ver arriba) y el motor ganador en Modal: POST /tts, POST /join.
3. **Imprescindibles:** ajustes (estabilidad, similitud, estilo, velocidad), selector de voz S02, historial S06, configuración S07, contador de caracteres y créditos.
4. **Deseables:** selector de modelo con sus límites, textos largos con trozos y unión, biblioteca S03, mis voces S04, clonación S05 con los dos motores, etiquetas de actuación, reutilizar ajustes del historial.
5. **Opcionales:** speaker boost, WAV, zip del historial, grabar la muestra desde el navegador, diccionario de pronunciación.
6. **Arreglos de clonar-emprendedor:** si se corre la etapa 8.
