# KeyMaster ⌨️

**Domina el teclado. Olvida el ratón.**

Extensión de entrenamiento para aprender a usar VS Code, Cursor y Windsurf sin ratón. Cuando haces clic con el ratón en el editor, KeyMaster te muestra el atajo de teclado que deberías usar en su lugar.

## Características

- **Detección de clics de ratón** en el editor de código con notificación del atajo equivalente
- **3 modos de funcionamiento**: Suave (avisa), Estricto (bloquea), Entrenamiento (teclado visual)
- **Interceptor de comandos**: bloquea 20 comandos nativos (abrir settings, terminal, cerrar pestaña...) y te enseña el atajo
- **42 atajos incluidos**: navegación, edición, búsqueda, terminal, Git y más
- **Teclado visual QWERTY** con guía de colores por dedo y posición de reposo
- **Estadísticas de uso**: clics de ratón, atajos mostrados, racha diaria, top 5 atajos
- **Efectos de sonido** opcionales al detectar clic (modo suave y alerta)
- **Toggle rápido** desde la barra de estado o con `Ctrl+Shift+K` / `Cmd+Shift+K`
- **Referencia de atajos** buscable integrada en VS Code
- **Bilingüe**: español e inglés
- Compatible con **VS Code**, **Cursor** y **Windsurf**

## Cómo funciona

1. Instala la extensión
2. KeyMaster aparece en la barra de estado inferior izquierda
3. Actívalo con clic en la barra o con `Cmd+Shift+K` / `Ctrl+Shift+K`
4. Cada vez que hagas clic con el ratón en el editor, verás una notificación con el atajo de teclado que deberías usar
5. En modo estricto, además se bloquean 20 comandos nativos que sueles ejecutar con el ratón

## Modos

| Modo | Comportamiento |
|------|----------------|
| 🟡 Suave (soft) | Detecta clic → muestra atajo → permite la acción |
| 🟠 Estricto (strict) | Detecta clic → muestra atajo → bloquea la acción + intercepta comandos |
| 🔴 Entrenamiento (training) | Como estricto + teclado visual con guía de dedos |

## Atajos de la extensión

| Atajo | Acción |
|-------|--------|
| `Ctrl+Shift+K` / `Cmd+Shift+K` | Activar/Desactivar KeyMaster |
| `Ctrl+Shift+J` / `Cmd+Shift+J` | Abrir teclado visual |

## Comandos

- `KeyMaster: Activar/Desactivar` — Toggle on/off
- `KeyMaster: Cambiar modo` — Elegir entre suave, estricto y entrenamiento
- `KeyMaster: Referencia de atajos` — Lista buscable de atajos de VS Code
- `KeyMaster: Abrir teclado visual` — Panel QWERTY con colores por dedo
- `KeyMaster: Mostrar estadísticas` — Panel con clics, racha y top 5 atajos
- `KeyMaster: Limpiar estadísticas` — Reiniciar contadores

## Configuración

| Opción | Tipo | Predeterminado | Descripción |
|--------|------|----------------|-------------|
| `keymaster.enabled` | boolean | `true` | Activar/desactivar |
| `keymaster.mode` | enum | `"soft"` | Modo: soft, strict, training |
| `keymaster.language` | enum | `"es"` | Idioma: es, en |
| `keymaster.notificationDuration` | number | `3000` | Duración del aviso (ms) |
| `keymaster.showKeyboardOnStart` | boolean | `false` | Abrir teclado al activar |
| `keymaster.soundEnabled` | boolean | `false` | Reproducir sonido al detectar clic |
| `keymaster.statsEnabled` | boolean | `true` | Guardar estadísticas de sesión |

## Compatibilidad

- VS Code >= 1.85.0
- Cursor AI
- Windsurf IDE
- Windows / macOS / Linux

## Autor

**Javier Mateo** — [ApliArte](https://github.com/apliarte)

## 💖 Apoya el proyecto

Herramienta gratuita y open source. Si te ahorra tiempo, un cafe ayuda a mantener el desarrollo.

| Plataforma | Enlace |
|------------|--------|
| PayPal | [paypal.me/erbolamm](https://paypal.me/erbolamm) |
| Ko-fi | [ko-fi.com/C0C11TWR1K](https://ko-fi.com/C0C11TWR1K) |
| Twitch Tip | [streamelements.com/apliarte/tip](https://streamelements.com/apliarte/tip) |

🌐 [Sitio oficial](https://apliarte-click-pro-2026.web.app/) · 📦 [GitHub](https://github.com/erbolamm/key-master)

## Licencia

MIT