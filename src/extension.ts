import * as vscode from 'vscode';
import { logger } from './utils/logger';
import * as config from './utils/config';
import * as sound from './utils/sound';
import * as statusBar from './ui/statusBar';
import * as mouseGuard from './core/mouseGuard';
import { shortcuts, getShortcutForPlatform, getDescription } from './data/shortcuts';

/**
 * Punto de entrada de la extensión.
 * VS Code llama a esta función cuando la extensión se activa.
 */
export function activate(context: vscode.ExtensionContext): void {
  // 1. Inicializar logger
  logger.activate();
  logger.info('KeyMaster v0.1.0 — activando extensión...');

  // 2. Inicializar módulo de configuración
  config.activate(context);

  // 3. Inicializar sonido con la ruta de la extensión
  sound.init(context.extensionPath);

  // 4. Inicializar barra de estado
  statusBar.activate(context);

  // 4. Inicializar MouseGuard
  mouseGuard.activate(context);

  // 5. Registrar comandos
  registerCommands(context);

  // 6. Confirmación visual de activación — SIEMPRE visible
  const cfg = config.getConfig();
  const lang = cfg.language;
  const statusMsg = cfg.enabled
    ? (lang === 'es'
        ? '⌨️ KeyMaster ACTIVO — modo ' + cfg.mode.toUpperCase() + '. Haz clic en el editor para probar.'
        : '⌨️ KeyMaster ACTIVE — mode ' + cfg.mode.toUpperCase() + '. Click in the editor to test.')
    : (lang === 'es'
        ? '⌨️ KeyMaster cargado pero DESACTIVADO. Pulsa Cmd+Shift+K para activar.'
        : '⌨️ KeyMaster loaded but DISABLED. Press Cmd+Shift+K to enable.');
  vscode.window.showWarningMessage(statusMsg);

  logger.info('KeyMaster activado correctamente — enabled=' + cfg.enabled + ' mode=' + cfg.mode);
}

/**
 * VS Code llama a esta función cuando la extensión se desactiva.
 */
export function deactivate(): void {
  mouseGuard.deactivate();
  logger.info('KeyMaster desactivado');
  logger.deactivate();
}

/** Registra todos los comandos de la extensión */
function registerCommands(context: vscode.ExtensionContext): void {
  // keymaster.toggle — Menú principal desde la barra de estado
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.toggle', async () => {
      try {
        const current = config.getConfig();
        const lang = current.language;
        const isES = lang === 'es';

        // Indicadores del estado actual
        const enabledIcon = current.enabled ? '$(check)' : '$(x)';
        const enabledLabel = current.enabled
          ? (isES ? 'Activado' : 'Enabled')
          : (isES ? 'Desactivado' : 'Disabled');
        const modeLabels: Record<string, string> = {
          soft: isES ? 'Suave' : 'Soft',
          strict: isES ? 'Estricto' : 'Strict',
          training: isES ? 'Entrenamiento' : 'Training',
        };
        const langLabels: Record<string, string> = { es: 'Español', en: 'English' };

        const items: vscode.QuickPickItem[] = [
          {
            label: `${enabledIcon} ${isES ? 'Activar/Desactivar' : 'Enable/Disable'}`,
            description: enabledLabel,
            detail: isES ? 'Pulsa para cambiar el estado' : 'Press to toggle state',
          },
          { label: '', kind: vscode.QuickPickItemKind.Separator },
          {
            label: `$(settings-gear) ${isES ? 'Modo' : 'Mode'}`,
            description: modeLabels[current.mode] ?? current.mode,
            detail: isES ? 'Soft · Strict · Training' : 'Soft · Strict · Training',
          },
          {
            label: `$(globe) ${isES ? 'Idioma' : 'Language'}`,
            description: langLabels[current.language],
            detail: isES ? 'Español / English' : 'Spanish / English',
          },
          { label: '', kind: vscode.QuickPickItemKind.Separator },
          {
            label: `$(list-unordered) ${isES ? 'Referencia de atajos' : 'Shortcut Reference'}`,
            description: isES ? '21 atajos' : '21 shortcuts',
          },
          {
            label: `$(keyboard) ${isES ? 'Teclado visual' : 'Visual Keyboard'}`,
            description: isES ? 'Fase 3' : 'Phase 3',
          },
          {
            label: `$(graph) ${isES ? 'Estadísticas' : 'Statistics'}`,
            description: isES ? 'Fase 4' : 'Phase 4',
          },
        ];

        const selection = await vscode.window.showQuickPick(items, {
          placeHolder: isES
            ? `⌨️ KeyMaster — ${enabledLabel} · ${modeLabels[current.mode]}` 
            : `⌨️ KeyMaster — ${enabledLabel} · ${modeLabels[current.mode]}`,
        });

        if (!selection) { return; }

        // Activar/Desactivar
        if (selection.label.includes(isES ? 'Activar' : 'Enable')) {
          const newEnabled = !current.enabled;
          await config.setConfigValue('enabled', newEnabled);
          statusBar.refresh();
          const msg = newEnabled
            ? (isES ? 'KeyMaster activado ✅' : 'KeyMaster enabled ✅')
            : (isES ? 'KeyMaster desactivado ⏸️' : 'KeyMaster disabled ⏸️');
          vscode.window.showInformationMessage(msg);
        }

        // Cambiar modo
        else if (selection.label.includes(isES ? 'Modo' : 'Mode')) {
          const modeItems: vscode.QuickPickItem[] = [
            {
              label: `$(warning) Soft`,
              description: current.mode === 'soft' ? (isES ? '← actual' : '← current') : '',
              detail: isES ? 'Detecta clic y muestra atajo, permite la acción' : 'Detects click, shows shortcut, allows action',
            },
            {
              label: `$(circle-slash) Strict`,
              description: current.mode === 'strict' ? (isES ? '← actual' : '← current') : '',
              detail: isES ? 'Detecta clic, muestra atajo y bloquea la acción' : 'Detects click, shows shortcut, blocks action',
            },
            {
              label: `$(flame) Training`,
              description: current.mode === 'training' ? (isES ? '← actual' : '← current') : '',
              detail: isES ? 'Teclado visual obligatorio (próximamente)' : 'Visual keyboard required (coming soon)',
            },
          ];
          const modeSelection = await vscode.window.showQuickPick(modeItems, {
            placeHolder: isES ? 'Selecciona el modo' : 'Select mode',
          });
          if (modeSelection) {
            const modeMap: Record<string, config.KeyMasterMode> = {
              '$(warning) Soft': 'soft',
              '$(circle-slash) Strict': 'strict',
              '$(flame) Training': 'training',
            };
            const newMode = modeMap[modeSelection.label];
            if (newMode) {
              await config.setConfigValue('mode', newMode);
              statusBar.refresh();
              logger.info(`Modo cambiado a: ${newMode}`);
            }
          }
        }

        // Cambiar idioma
        else if (selection.label.includes(isES ? 'Idioma' : 'Language')) {
          const langItems: vscode.QuickPickItem[] = [
            { label: '🇪🇸 Español', description: current.language === 'es' ? '← actual' : '' },
            { label: '🇬🇧 English', description: current.language === 'en' ? '← current' : '' },
          ];
          const langSelection = await vscode.window.showQuickPick(langItems, {
            placeHolder: isES ? 'Selecciona idioma' : 'Select language',
          });
          if (langSelection) {
            const newLang = langSelection.label.includes('Español') ? 'es' : 'en';
            await config.setConfigValue('language', newLang as config.KeyMasterLanguage);
            statusBar.refresh();
            logger.info(`Idioma cambiado a: ${newLang}`);
          }
        }

        // Referencia de atajos
        else if (selection.label.includes(isES ? 'Referencia' : 'Reference')) {
          await vscode.commands.executeCommand('keymaster.showShortcutRef');
        }

        // Teclado visual
        else if (selection.label.includes(isES ? 'Teclado' : 'Keyboard')) {
          await vscode.commands.executeCommand('keymaster.openKeyboard');
        }

        // Estadísticas
        else if (selection.label.includes(isES ? 'Estadísticas' : 'Statistics')) {
          await vscode.commands.executeCommand('keymaster.showStats');
        }

      } catch (err) {
        logger.error('Error en menú principal', err);
      }
    }),
  );

  // keymaster.setMode — Cambiar modo (acceso directo por comando)
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.setMode', async () => {
      // Reutilizamos el menú principal
      await vscode.commands.executeCommand('keymaster.toggle');
    }),
  );

  // keymaster.openKeyboard — Abrir panel de teclado visual (Fase 3)
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.openKeyboard', () => {
      const lang = config.getConfig().language;
      const msg = lang === 'es'
        ? 'El panel de teclado visual estará disponible en la Fase 3'
        : 'Visual keyboard panel will be available in Phase 3';
      vscode.window.showInformationMessage(msg);
    }),
  );

  // keymaster.showStats — Mostrar estadísticas (Fase 4)
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.showStats', () => {
      const lang = config.getConfig().language;
      const msg = lang === 'es'
        ? 'Las estadísticas estarán disponibles en la Fase 4'
        : 'Statistics will be available in Phase 4';
      vscode.window.showInformationMessage(msg);
    }),
  );

  // keymaster.clearStats — Limpiar estadísticas (Fase 4)
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.clearStats', () => {
      const lang = config.getConfig().language;
      const msg = lang === 'es'
        ? 'Las estadísticas estarán disponibles en la Fase 4'
        : 'Statistics will be available in Phase 4';
      vscode.window.showInformationMessage(msg);
    }),
  );

  // keymaster.showShortcutRef — Referencia de atajos
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.showShortcutRef', async () => {
      try {
        const cfg = config.getConfig();
        const lang = cfg.language;

        const items: vscode.QuickPickItem[] = shortcuts.map((s) => ({
          label: getShortcutForPlatform(s),
          description: s.command,
          detail: getDescription(s, lang),
        }));

        await vscode.window.showQuickPick(items, {
          placeHolder: lang === 'es'
            ? 'Referencia de atajos de teclado'
            : 'Keyboard shortcuts reference',
          matchOnDescription: true,
          matchOnDetail: true,
        });
      } catch (err) {
        logger.error('Error al mostrar referencia de atajos', err);
      }
    }),
  );

  logger.info('Comandos registrados correctamente');
}
