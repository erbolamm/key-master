import * as vscode from 'vscode';
import { logger } from './utils/logger';
import * as config from './utils/config';
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

  // 3. Inicializar barra de estado
  statusBar.activate(context);

  // 4. Inicializar MouseGuard
  mouseGuard.activate(context);

  // 5. Registrar comandos
  registerCommands(context);

  logger.info('KeyMaster activado correctamente');
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
  // keymaster.toggle — Activar/Desactivar
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.toggle', async () => {
      try {
        const current = config.getConfig();
        const newEnabled = !current.enabled;
        await config.setConfigValue('enabled', newEnabled);

        const lang = current.language;
        const msg = newEnabled
          ? (lang === 'es' ? 'KeyMaster activado ✅' : 'KeyMaster enabled ✅')
          : (lang === 'es' ? 'KeyMaster desactivado ⏸️' : 'KeyMaster disabled ⏸️');

        vscode.window.showInformationMessage(msg);
        statusBar.refresh();
        logger.info(msg);
      } catch (err) {
        logger.error('Error al hacer toggle', err);
      }
    }),
  );

  // keymaster.setMode — Cambiar modo con QuickPick
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.setMode', async () => {
      try {
        const current = config.getConfig();
        const lang = current.language;

        const items: vscode.QuickPickItem[] = [
          {
            label: '$(warning) Soft',
            description: lang === 'es'
              ? 'Aviso suave: detecta clic y muestra atajo'
              : 'Soft warning: detect click and show shortcut',
          },
          {
            label: '$(circle-slash) Strict',
            description: lang === 'es'
              ? 'Estricto: bloquea la acción del ratón'
              : 'Strict: blocks mouse action',
          },
          {
            label: '$(flame) Training',
            description: lang === 'es'
              ? 'Entrenamiento: teclado visual obligatorio'
              : 'Training: visual keyboard required',
          },
        ];

        const selection = await vscode.window.showQuickPick(items, {
          placeHolder: lang === 'es' ? 'Selecciona el modo de KeyMaster' : 'Select KeyMaster mode',
        });

        if (!selection) {
          return;
        }

        const modeMap: Record<string, config.KeyMasterMode> = {
          '$(warning) Soft': 'soft',
          '$(circle-slash) Strict': 'strict',
          '$(flame) Training': 'training',
        };
        const newMode = modeMap[selection.label];
        if (newMode) {
          await config.setConfigValue('mode', newMode);
          statusBar.refresh();
          logger.info(`Modo cambiado a: ${newMode}`);
        }
      } catch (err) {
        logger.error('Error al cambiar modo', err);
      }
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
