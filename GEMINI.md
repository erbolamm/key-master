# KeyMaster — Contexto para Antigravity

Extensión de VSCode que entrena al usuario en atajos de teclado.
Compatible con VS Code, Cursor y Windsurf. 3 modos: soft, strict y training.

## Usuario

Javier (ApliArte) — autodidacta, aprende con analogías de Flutter.

- Explica SIEMPRE con analogías de Flutter antes de codear
- PLANNING mode primero para cambios grandes
- Warnings inaceptables (lint y markdown)
- Terminal siempre visible

## Stack

- **Lenguaje**: TypeScript
- **Build**: esbuild (bundle optimizado)
- **API**: VS Code Commands API, Keybindings API
- **Marketplace**: `apliarte.keymaster`
- **Publisher**: `apliarte`

## Estructura

```text
key-master/
├── src/
│   ├── extension.ts       ← Punto de entrada, menú principal, comandos
│   ├── core/              ← Lógica: mouseGuard, sessionStats, etc.
│   ├── data/              ← Datos: atajos de teclado
│   ├── ui/                ← Interfaz: statusBar, keyboardPanel
│   └── utils/             ← Utilidades: logger, config, sound
├── package.json            ← Comandos, keybindings, configuración
├── esbuild.js              ← Build script
├── icon.png                ← Icono del marketplace
├── media/                  ← Assets (sonidos, HTML del panel)
└── test/                   ← Tests
```

## Reglas del proyecto

1. Mantener la arquitectura modular (core/, data/, ui/, utils/)
2. El mouseGuard es el componente clave — no simplificar sin cuidado
3. Los atajos en `data/shortcuts` cubren Mac y Windows — mantener ambos
4. Probar SIEMPRE en Extension Development Host antes de publicar
5. `npm run package` genera el bundle optimizado con esbuild

## Publicación

```bash
# Generar paquete local
npm run package && npx @vscode/vsce package

# Publicar al marketplace (necesita PAT de Azure DevOps)
npx @vscode/vsce publish
```
