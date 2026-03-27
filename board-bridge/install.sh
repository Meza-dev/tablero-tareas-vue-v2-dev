#!/bin/bash

# 📋 Script de instalación del Board System
# Este script configura todo automáticamente

set -e

echo "📋 Instalando Board System..."
echo ""

# Detectar ubicación del home
HOME_DIR=${HOME:-~}

# Crear directorio si no existe
mkdir -p "$HOME_DIR"

# Copiar archivos
echo "📁 Copiando archivos..."
cp board-data.json "$HOME_DIR/board-data.json"
cp board-cli.js "$HOME_DIR/board-cli.js"
chmod +x "$HOME_DIR/board-cli.js"

echo "✅ Archivos copiados a $HOME_DIR"
echo ""

# Detectar shell
SHELL_RC=""
if [ -f "$HOME_DIR/.bashrc" ]; then
    SHELL_RC="$HOME_DIR/.bashrc"
elif [ -f "$HOME_DIR/.zshrc" ]; then
    SHELL_RC="$HOME_DIR/.zshrc"
fi

# Configurar alias
if [ -n "$SHELL_RC" ]; then
    if ! grep -q "alias board=" "$SHELL_RC" 2>/dev/null; then
        echo ""
        echo "🔧 Configurando alias en $SHELL_RC..."
        echo "" >> "$SHELL_RC"
        echo "# Board CLI" >> "$SHELL_RC"
        echo "alias board=\"node $HOME_DIR/board-cli.js\"" >> "$SHELL_RC"
        echo "export BOARD_FILE=\"$HOME_DIR/board-data.json\"" >> "$SHELL_RC"
        echo "✅ Alias configurado"
        echo ""
        echo "⚠️  Ejecuta: source $SHELL_RC"
        echo "   o abre una nueva terminal para usar el comando 'board'"
    else
        echo "ℹ️  El alias ya está configurado en $SHELL_RC"
    fi
fi

echo ""
echo "✅ ¡Instalación completa!"
echo ""
echo "Prueba estos comandos:"
echo "  node $HOME_DIR/board-cli.js help"
echo "  node $HOME_DIR/board-cli.js show-board"
echo ""

if [ -n "$SHELL_RC" ]; then
    echo "Después de ejecutar: source $SHELL_RC"
    echo "Podrás usar simplemente:"
    echo "  board help"
    echo "  board show-board"
fi

echo ""
echo "📖 Lee el README.md para más información"
