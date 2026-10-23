# Progreso: (nombre por definir en la etapa 9) (clon de ElevenLabs)

App original: https://elevenlabs.io  Plataforma: web
Países: no aplica (uso propio)
Empezado: 2026-10-23

| # | etapa | estado | aprobada el | resumen |
| --- | --- | --- | --- | --- |
| 1 | Explorar | aprobada | 2026-10-23 | 7 pantallas, 5 flujos, 29 funciones; uso propio |
| 2 | Arquitectura | aprobada | 2026-10-23 | PWA estática en GitHub Pages; voz generada en el dispositivo (Supertonic/Kokoro); ElevenLabs opcional con clave | |
| 3 | Diseño | aprobada | 2026-10-23 | tokens claro y oscuro (15 pares, 0 fallas AA), 15 componentes, muestrario en clonar/app |
| 4 | Construir | aprobada | 2026-10-23 | app en voz-victor.netlify.app; Supertonic en computadora, ElevenLabs opcional; Kokoro quitado |
| 5 | Backend | detenida | | uso propio: no se continúa |
| 6 | Probar | detenida | | uso propio: no se continúa |
| 7 | Comparar | detenida | | uso propio: no se continúa |
| 8 | Emprender | detenida | | uso propio: no se continúa |
| 9 | Marca | detenida | | uso propio: no se continúa |
| 10 | Lanzar | detenida | | uso propio: no se continúa |
| 11 | Publicar | detenida | | uso propio: no se continúa |
| 12 | Redes | detenida | | uso propio: no se continúa |

Estados: pendiente, en curso, esperando aprobación, aprobada, saltada (motivo),
detenida.

## Vueltas atrás y notas

- 2026-10-23: inicio. Alcance aprobado: texto a voz, biblioteca, mis voces, clonación propia e historial. Solo para uso propio: no se publica ni se vende.
- 2026-10-23: elevenlabs.io no se pudo abrir desde el entorno; la etapa 1 usó resultados de búsqueda y no tiene capturas.
- 2026-10-23: etapa 2. Países: no aplica. En internet con contraseña. Dos motores: ElevenLabs con la clave del usuario (para Emiliano) y uno gratuito que suene natural, elegido con una prueba a ciegas.
- 2026-10-23: cambios en la etapa 2: todo gratis, sin cuentas nuevas, usable desde el celular fuera de casa sin la laptop (AMD Athlon 3050U, 8 GB, HDD: no sirve de servidor). Se reemplazó Supabase, Netlify y Modal por una PWA en GitHub Pages con el motor de voz en el navegador. schema.sql eliminado: los datos van en IndexedDB.
- 2026-10-23: etapa 3. Sin capturas del original: el sistema sigue el patrón general (claro, neutro, acción oscura). Proyecto de la app creado en clonar/app (Vite + React + Tailwind) con los primitivos; se moverá a su propio repositorio público al publicar en GitHub Pages.
- 2026-10-23: etapa 4. App funcional salvo la prueba real de voz: Hugging Face está bloqueado en el entorno, así que la voz se prueba en el celular del usuario después de publicar.
- 2026-10-23: el usuario decide usar la app solo en la laptop y detener /clonar en la etapa 4. Las etapas 5 a 12 están pensadas para vender la app y no aplican al uso propio.
