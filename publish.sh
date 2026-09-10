#!/bin/bash
# Script para configurar vsce y publicar la extensión KeyMaster

# 1. Instalar vsce globalmente (si no lo tienes)
npm install -g @vscode/vsce

# 2. Iniciar sesión con el token
echo "Ingresa tu PAT cuando se te solicite:"
vsce login apliarte

# 3. Verificar que no hay errores de empaquetado
vsce package

# 4. Publicar (descomenta la siguiente línea cuando estés listo)
# vsce publish

echo "Configuración completa. Revisa que no haya errores arriba."
echo "Cuando estés listo, descomenta la línea 'vsce publish' y ejecuta de nuevo."
