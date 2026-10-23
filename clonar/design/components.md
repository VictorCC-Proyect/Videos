# Componentes

Primitivos de la app, construidos una vez en `clonar/app/src/ui/` y mostrados
juntos en la ruta `#/design`. Íconos: Lucide (ISC). Fuente: Inter (OFL), con
la fuente del sistema como respaldo. Todos los textos son propios.

Reglas para todos:
- Área táctil mínima de 44 px (se usa en el celular).
- Foco visible con anillo de 2 px en `focus`, separado 2 px del borde.
- Colores solo por rol (`bg-surface`, `text-muted`), nunca hex directo.
- Funcionan en tema claro y oscuro (sigue al sistema).

```
Button
  variantes  primary, secondary, ghost, danger, icon
  tamaños    sm 36px, md 44px, lg 52px
  estados    default, hover, active, focus-visible, disabled, loading
  tokens     primary: bg accent, text on-accent; secondary: bg surface, borde border; danger: bg danger, text on-danger; radius md; font sm/600
  a11y       <button> real; icon lleva aria-label; al cargar, aria-busy y conserva la etiqueta
  se usa en  todas

TextArea (editor de texto con contador)
  variantes  editor (alto flexible, sin borde, ocupa el panel)
  estados    vacío (texto de ayuda), con texto, sobre el límite (contador en danger), deshabilitado mientras genera
  tokens     bg bg, text text, placeholder text-muted, font base
  a11y       <label> asociada; el contador con aria-live="polite" solo al pasar el límite
  se usa en  S01

Slider (con etiqueta, valor y extremos)
  variantes  continuo; por pasos (estabilidad de v3: creativa, natural, robusta)
  estados    default, foco, deshabilitado ("no disponible con este modelo")
  tokens     pista surface-2, relleno accent, pulgar bg con borde border-input
  a11y       <input type="range"> nativo, aria-valuetext con el valor legible, flechas del teclado
  se usa en  S01

Toggle
  estados    encendido, apagado, foco, deshabilitado
  tokens     apagado surface-2, encendido accent, perilla bg
  a11y       <button role="switch" aria-checked>
  se usa en  S01 (speaker boost), S07

Select
  variantes  simple (nativo), con buscador (lista filtrable)
  estados    cerrado, abierto, sin resultados, deshabilitado
  tokens     bg bg, borde border-input, radius md
  a11y       <select> nativo para el simple; el de buscador es un combobox con flechas y Enter
  se usa en  S01, S02, S03, S07

VoiceCard
  variantes  biblioteca (botón +), mis voces (botón usar y eliminar), selector (fila compacta)
  estados    default, reproduciendo, seleccionada, guardada
  contenido  avatar con la inicial, nombre, etiquetas (idioma, género, categoría), botón escuchar
  tokens     bg bg, borde border, seleccionada borde accent; radius lg
  a11y       el botón escuchar dice "Escuchar <nombre>"; seleccionada con aria-pressed o aria-selected
  se usa en  S02, S03, S04

FilterChips
  estados    activo, inactivo, foco
  tokens     inactivo bg surface; activo bg accent, text on-accent; radius pill
  a11y       grupo con role="group" y aria-label; cada chip con aria-pressed
  se usa en  S03, S06

AudioPlayer
  variantes  barra (fija abajo, encima de la barra de pestañas en el celular), fila (en listas)
  estados    sin audio, cargando, detenido, reproduciendo, error
  contenido  play/pausa, tiempo actual / total, barra de progreso que se puede arrastrar, descargar
  tokens     bg surface, progreso accent
  a11y       botones con aria-label; la barra es un <input type="range">; espacio pausa
  se usa en  S01, S03, S04, S06

ProgressBar (descarga del modelo y generación por trozos)
  estados    indeterminado, con porcentaje, completado, error
  tokens     pista surface-2, relleno accent
  a11y       role="progressbar" con aria-valuenow y una etiqueta ("Descargando la voz: 40 %")
  se usa en  S01, S07

Dropzone (subir o grabar muestra, solo ElevenLabs)
  variantes  subir, grabar
  estados    vacío, arrastrando, subiendo, error
  tokens     borde punteado border-input, arrastrando borde accent y bg surface
  a11y       es un <button> que abre el selector de archivos; arrastrar es solo un atajo
  se usa en  S05

HistoryRow
  estados    default, reproduciendo, seleccionada, fallida
  contenido  primeras palabras del texto, voz, motor, duración, fecha relativa, acciones (escuchar, descargar, reutilizar, borrar)
  a11y       las acciones son botones con aria-label; en el celular quedan en un menú de tres puntos
  se usa en  S06

Modal
  variantes  centrado (escritorio), hoja inferior (celular)
  estados    abierto, cerrado
  tokens     bg bg, sombra pop, fondo rgba(0,0,0,.4); radius lg
  a11y       <dialog> nativo con showModal(): foco atrapado, Esc cierra, el foco vuelve al botón que lo abrió
  se usa en  S02, S05

Toast
  variantes  éxito, error, información
  estados    entrando, visible, saliendo
  tokens     bg accent, text on-accent; ícono success o danger
  a11y       role="status" (o "alert" para errores); desaparece a los 4 s salvo los errores
  se usa en  todas

Nav
  variantes  barra lateral (desde 768 px), barra de pestañas inferior (celular)
  elementos  Texto a voz, Voces, Historial, Configuración
  estados    elemento activo, hover, foco
  tokens     bg surface (lateral) o bg (pestañas), activo bg surface-2 y text text, inactivo text-muted
  a11y       <nav aria-label="Principal">, el activo con aria-current="page"
  se usa en  todas

EmptyState
  contenido  ícono, una oración, una acción
  se usa en  S04 (sin voces guardadas), S06 (historial vacío), S03 (sin resultados)
```
