#!/usr/bin/env bash
# Instalador de Remotion para macOS y Linux.
# Uso (en la carpeta del proyecto):  bash instalar-mac-linux.sh
set -euo pipefail
cd "$(dirname "$0")"

have() { command -v "$1" >/dev/null 2>&1; }

echo "== 1/4 Comprobando Node.js =="
need_node=1
if have node && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 18 ]; then
  need_node=0
  echo "Node.js $(node -v) ya instalado."
fi
if [ "$need_node" = 1 ]; then
  if [ "$(uname)" = "Darwin" ] && have brew; then
    brew install node
  else
    echo "Instalando Node.js LTS con nvm..."
    export NVM_DIR="$HOME/.nvm"
    if [ ! -s "$NVM_DIR/nvm.sh" ]; then
      curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
    fi
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh"
    nvm install --lts
    nvm use --lts
  fi
fi

echo "== 2/4 Librerias del sistema (solo Linux) =="
if [ "$(uname)" = "Linux" ]; then
  if have apt-get; then
    sudo apt-get update
    sudo apt-get install -y libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2t64 \
      libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 \
      libatk-bridge2.0-0 libpango-1.0-0 libcairo2 libcups2 \
      || sudo apt-get install -y libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 \
      libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 \
      libatk-bridge2.0-0 libpango-1.0-0 libcairo2 libcups2
  elif have dnf; then
    sudo dnf install -y nss dbus-libs atk mesa-libgbm alsa-lib libXrandr \
      libxkbcommon libXfixes libXcomposite libXdamage at-spi2-atk pango cairo cups-libs
  else
    echo "Distribucion no reconocida: consulta https://www.remotion.dev/docs/miscellaneous/linux-dependencies"
  fi
fi

echo "== 3/4 Instalando dependencias del proyecto =="
npm install --loglevel=error

echo "== 4/4 Descargando el navegador que usa Remotion para renderizar =="
npx remotion browser ensure

echo
echo "Listo. Prueba con:"
echo "  npm run dev      (abre el editor Remotion Studio)"
echo "  npm run render   (crea out/video.mp4)"
echo "  npm run lote     (renderiza todos los videos de videos.json)"
