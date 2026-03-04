# Changelog

## [0.2.0] - 2026-03-04

### Added
- Interceptor de 20 comandos nativos con comportamiento por modo
- Panel de teclado visual QWERTY con guía de colores por dedo
- Estadísticas de sesión: clics hoy/total, racha diaria, top 5 atajos
- Panel WebView de estadísticas con persistencia vía globalState
- Efectos de sonido opcionales (suave y alerta)
- Compatibilidad con entornos remotos (Remote SSH)

### Changed
- Base de datos ampliada de 21 a 42 atajos (navegación, edición, búsqueda, terminal, Git)
- Selección rotatoria de atajos en mouseGuard (no repite el anterior)
- registerCommands() descompuesto en funciones de ≤40 líneas
- sound.ts: execFile en lugar de exec, whitelist de archivos, guarda remota
- PowerShell: path como argumento separado (sin interpolación)
- Panel bloqueador con CSP/nonce
- try/catch en todas las llamadas a la API de VS Code
- Logger en nivel INFO para producción

### Security
- CSP con nonce en todos los WebViews que usan scripts
- execFile reemplaza exec para prevenir inyección de comandos
- Whitelist explícita de archivos de sonido permitidos

## [0.1.0] - 2026-03-04

### Added
- Detección de clics de ratón en el editor con notificación del atajo equivalente
- Barra de estado con toggle activar/desactivar
- 3 modos de funcionamiento: soft, strict, training
- Referencia de atajos buscable
- Soporte bilingüe (español/inglés)
- Atajo rápido Ctrl+Shift+K / Cmd+Shift+K para toggle
- Atajo Ctrl+Shift+J / Cmd+Shift+J para teclado visual
- Compatible con VS Code, Cursor y Windsurf
