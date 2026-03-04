# KeyMaster ⌨️

**Domina el teclado. Olvida el ratón.**

Extensión de entrenamiento para aprender a usar VS Code, Cursor y Windsurf sin ratón. Cuando haces clic con el ratón en el editor, KeyMaster te muestra el atajo de teclado que deberías usar en su lugar.

## Características

- **Detección de clics de ratón** en el editor de código con notificación del atajo equivalente
- **3 modos de funcionamiento**: Suave (avisa), Estricto (bloquea), Entrenamiento (teclado visual)
- **Toggle rápido** desde la barra de estado o con `Ctrl+Shift+K` / `Cmd+Shift+K`
- **Referencia de atajos** buscable integrada en VS Code
- **Bilingüe**: español e inglés
- Compatible con **VS Code**, **Cursor** y **Windsurf**

## Cómo funciona

1. Instala la extensión
2. KeyMaster aparece en la barra de estado inferior izquierda
3. Actívalo con clic en la barra o con `Cmd+Shift+K` / `Ctrl+Shift+K`
4. Cada vez que hagas clic con el ratón en el editor, verás una notificación con el atajo de teclado que deberías usar

## Modos

| Modo | Comportamiento |
|------|----------------|
| 🟡 Suave (soft) | Detecta clic → muestra atajo → permite la acción |
| 🟠 Estricto (strict) | Detecta clic → muestra atajo → bloquea la acción |
| 🔴 Entrenamiento (training) | Teclado visual con guía de dedos |

## Atajos de la extensión

| Atajo | Acción |
|-------|--------|
| `Ctrl+Shift+K` / `Cmd+Shift+K` | Activar/Desactivar KeyMaster |
| `Ctrl+Shift+J` / `Cmd+Shift+J` | Abrir teclado visual |

## Comandos

- `KeyMaster: Activar/Desactivar` — Toggle on/off
- `KeyMaster: Cambiar modo` — Elegir entre suave, estricto y entrenamiento
- `KeyMaster: Referencia de atajos` — Lista buscable de atajos de VS Code
- `KeyMaster: Abrir teclado visual` — Panel de entrenamiento (próximamente)
- `KeyMaster: Mostrar estadísticas` — Estadísticas de uso (próximamente)

## Configuración

| Opción | Tipo | Predeterminado | Descripción |
|--------|------|----------------|-------------|
| `keymaster.enabled` | boolean | `true` | Activar/desactivar |
| `keymaster.mode` | enum | `"soft"` | Modo: soft, strict, training |
| `keymaster.language` | enum | `"es"` | Idioma: es, en |
| `keymaster.notificationDuration` | number | `3000` | Duración del aviso (ms) |
| `keymaster.showKeyboardOnStart` | boolean | `false` | Abrir teclado al activar |
| `keymaster.statsEnabled` | boolean | `true` | Guardar estadísticas |

## Compatibilidad

- VS Code >= 1.85.0
- Cursor AI
- Windsurf IDE
- Windows / macOS / Linux

## Autor

**Javier Mateo** — [ApliArte](https://github.com/apliarte)

## Licencia

MIT