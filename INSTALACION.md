# Instalar Remotion en tu ordenador

## 1. Descarga el proyecto

Con Git:

```bash
git clone https://github.com/VictorCC-Proyect/Videos.git
cd Videos
git checkout claude/practical-hopper-igo39b
```

Sin Git: en GitHub, elige la rama `claude/practical-hopper-igo39b`, pulsa **Code → Download ZIP** y descomprímelo.

## 2. Ejecuta el instalador

**Windows** (abre PowerShell en la carpeta del proyecto):

```powershell
powershell -ExecutionPolicy Bypass -File .\instalar-windows.ps1
```

**macOS / Linux** (abre una terminal en la carpeta del proyecto):

```bash
bash instalar-mac-linux.sh
```

El instalador hace lo siguiente:

1. Instala **Node.js LTS** si no lo tienes (o si tienes una versión anterior a la 18).
2. En Linux, instala las librerías del sistema que necesita el navegador.
3. Instala las dependencias del proyecto (`npm install`).
4. Descarga el navegador interno con el que Remotion renderiza (`npx remotion browser ensure`).

FFmpeg ya viene incluido en Remotion, así que no hay que instalarlo aparte.

> Si en Windows acaba de instalarse Node.js y aparece "npm no se reconoce", cierra PowerShell, ábrelo de nuevo y vuelve a ejecutar el script.

## 3. Úsalo

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Abre **Remotion Studio** en el navegador para ver y editar el vídeo en tiempo real |
| `npm run render` | Renderiza `out/video.mp4` |
| `npm run lote` | Renderiza automáticamente todos los vídeos definidos en `videos.json` |

## Edición automática con `videos.json`

Cada entrada genera un vídeo distinto con el mismo diseño y datos diferentes:

```json
[
  { "archivo": "bienvenida", "composicion": "HelloWorld", "props": { "titleText": "Bienvenidos a mi canal", "titleColor": "#000000" } },
  { "archivo": "oferta",     "composicion": "HelloWorld", "props": { "titleText": "Oferta de la semana",   "titleColor": "#d12f2f" } }
]
```

Ejecuta `npm run lote` y los vídeos aparecerán en `out/bienvenida.mp4`, `out/oferta.mp4`, etc.
Para usar otra lista: `node scripts/render-lote.mjs mi-lista.json`.

El diseño del vídeo está en `src/HelloWorld.tsx`, y la duración, el tamaño y los FPS se configuran en `src/Root.tsx`.
