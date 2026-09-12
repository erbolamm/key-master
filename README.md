<p align="center">
  <img src="icon.png" alt="KeyMaster" width="128" />
</p>

<h1 align="center">KeyMaster ⌨️</h1>

<p align="center">
  <strong>Domina el teclado. Olvida el ratón.</strong><br>
  Extensión de entrenamiento para aprender a usar VS Code, Cursor y Windsurf sin ratón.
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=apliarte.keymaster">
    <img src="https://img.shields.io/visual-studio-marketplace/v/apliarte.keymaster?label=Marketplace&color=blue" alt="VS Marketplace Version" />
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=apliarte.keymaster">
    <img src="https://img.shields.io/visual-studio-marketplace/i/apliarte.keymaster?label=Installs&color=green" alt="VS Marketplace Installs" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/erbolamm/key-master" alt="License" />
  </a>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=apliarte.keymaster">VS Marketplace</a> · 
  <a href="https://open-vsx.org/extension/apliarte/keymaster">Open VSX (Cursor/Windsurf/Antigravity)</a> · 
  <a href="https://github.com/erbolamm/key-master">GitHub</a>
  <a href="https://discord.gg/GF7FK3fmzu">Discord</a>
</p>

---

Cuando haces clic con el ratón en el editor, KeyMaster te muestra el atajo de teclado que deberías usar en su lugar.

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
- Antigravity
- VS Codium
- Windows / macOS / Linux

## Autor

Javier Mateo (ApliArte) — [github.com/erbolamm](https://github.com/erbolamm)

### 💬 Una nota personal del autor / A personal note from the author

Se movió a la landing: [erbolamm.github.io/key-master](https://erbolamm.github.io/key-master/#author), escrita en 6 idiomas.

## � Comparte

Si te gusta KeyMaster, ayuda a que más gente lo conozca:

[![Compartir en Twitter](https://img.shields.io/badge/Twitter-Compartir-1DA1F2?logo=twitter&logoColor=white)](https://twitter.com/intent/tweet?text=Domina%20el%20teclado%2C%20olvida%20el%20rat%C3%B3n.%20Extensi%C3%B3n%20de%20entrenamiento%20de%20atajos%20para%20VS%20Code.&url=https%3A%2F%2Fgithub.com%2Ferbolamm%2Fkey-master&via=erbolamm)
[![Compartir en LinkedIn](https://img.shields.io/badge/LinkedIn-Compartir-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fgithub.com%2Ferbolamm%2Fkey-master)
[![Compartir en Reddit](https://img.shields.io/badge/Reddit-Compartir-FF4500?logo=reddit&logoColor=white)](https://www.reddit.com/submit?url=https%3A%2F%2Fgithub.com%2Ferbolamm%2Fkey-master&title=KeyMaster%20%E2%80%94%20Domina%20el%20teclado%20en%20VS%20Code)
[![Compartir en WhatsApp](https://img.shields.io/badge/WhatsApp-Compartir-25D366?logo=whatsapp&logoColor=white)](https://api.whatsapp.com/send?text=KeyMaster%20%E2%80%94%20Domina%20el%20teclado%20en%20VS%20Code%2C%20Cursor%20y%20Windsurf.%20https%3A%2F%2Fgithub.com%2Ferbolamm%2Fkey-master)

## �💖 Apoya el proyecto

Herramienta gratuita y open source. Si te ahorra tiempo, un café ayuda a mantener el desarrollo.

| Plataforma | Enlace |
|-----------|--------|
| PayPal | [paypal.me/erbolamm](https://paypal.me/erbolamm) |
| Ko-fi | [ko-fi.com/C0C11TWR1K](https://ko-fi.com/C0C11TWR1K) |
| Twitch Tip | [streamelements.com/apliarte/tip](https://streamelements.com/apliarte/tip) |

🌐 [Landing](https://erbolamm.github.io/key-master/) · 📦 [GitHub](https://github.com/erbolamm/key-master)

## Licencia

MIT — © 2026 ApliArte
