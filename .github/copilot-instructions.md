# Instrucciones para Agentes IA — Proyecto key-master (KeyMaster)

## IDENTIDAD DEL PROYECTO

**KeyMaster** es una extensión de VS Code que ayuda a aprender atajos de teclado.
Registra settings en `package.json > contributes > configuration` bajo el prefijo `keymaster.*`.

- **Publisher:** apliarte
- **Autor:** Javier Mateo (ApliArte / erbolamm)
- **Licencia:** MIT

## ⚠️ PROTECCIÓN DEL SETTINGS.JSON GLOBAL — OBLIGATORIO ⚠️

Esta extensión registra settings que se guardan en el settings.json global del usuario:
- `keymaster.enabled` (boolean)
- `keymaster.mode` (string: "soft" | "strict")
- `keymaster.language` (string)
- `keymaster.notificationDuration` (number)
- `keymaster.showKeyboardOnStart` (boolean)
- `keymaster.ignoredCommands` (array)
- `keymaster.soundEnabled` (boolean)
- `keymaster.statsEnabled` (boolean)

### Reglas de protección:

1. **NUNCA** añadir settings que modifiquen configuración nativa de VS Code (`editor.*`, `terminal.*`, `workbench.*`, `window.*`). KeyMaster solo debe gestionar sus propias propiedades `keymaster.*`.

2. **NUNCA** usar `vscode.workspace.getConfiguration()` para escribir en claves que no empiecen por `keymaster.`. Solo lectura de claves nativas está permitida (por ejemplo, leer keybindings).

3. **Si necesitas usar `ConfigurationTarget.Global`**, pregunta primero a Javier y explica exactamente qué va a cambiar.

4. **No registres comandos** que modifiquen atajos de teclado del sistema (`keybindings.json`). KeyMaster enseña, no modifica.

5. **Contexto:** Hubo un incidente donde extensiones en desarrollo dejaron residuos en el settings.json global del usuario. Se limpió el 8-marzo-2026. No repetir.

## REGLAS GENERALES

- Idioma: Todo el código, comentarios y UI en español
- Responder siempre en español castellano
- Autor: Javier Mateo (ApliArte/erbolamm), desarrollador autodidacta
