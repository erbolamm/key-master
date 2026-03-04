import * as vscode from 'vscode';
import { getConfig, onConfigChanged } from '../utils/config';
import { showShortcutNotification } from '../ui/notifier';
import { showBlocker } from '../ui/blockerPanel';
import { findShortcutByCommand, getRandomShortcut } from '../data/shortcuts';
import { logger } from '../utils/logger';

// Lista de comandos nativos a interceptar
const INTERCEPTED_COMMANDS: string[] = [
  'workbench.action.openSettings',
  'workbench.action.showCommands',
  'workbench.action.quickOpen',
  'workbench.action.terminal.toggleTerminal',
  'workbench.action.terminal.new',
  'workbench.action.closeActiveEditor',
  'workbench.action.nextEditor',
  'workbench.action.previousEditor',
  'workbench.action.toggleSidebarVisibility',
  'workbench.action.togglePanel',
  'workbench.view.scm',
  'workbench.action.splitEditor',
  'workbench.action.focusFirstEditorGroup',
  'editor.action.revealDefinition',
  'editor.action.goToReferences',
  'workbench.action.gotoLine',
  'workbench.action.openRecent',
  'editor.action.formatDocument',
  'workbench.action.showAllSymbols',
  'workbench.action.files.saveAll',
];

const registeredDisposables: vscode.Disposable[] = [];
let configDisposable: vscode.Disposable | undefined;

/**
 * Activa el interceptor de comandos.
 * Registra overrides para los comandos nativos más usados con ratón.
 */
export function activate(context: vscode.ExtensionContext): void {
  registerOverrides(context);

  // Reaccionar a cambios de config para logging
  configDisposable = onConfigChanged(() => {
    logger.info('CommandInterceptor: configuración actualizada');
  });
  context.subscriptions.push(configDisposable);

  logger.info(`CommandInterceptor activado — ${INTERCEPTED_COMMANDS.length} comandos interceptados`);
}

/** Desactiva el interceptor y limpia todos los overrides */
export function deactivate(): void {
  for (const d of registeredDisposables) {
    d.dispose();
  }
  registeredDisposables.length = 0;
  configDisposable?.dispose();
  configDisposable = undefined;
  logger.info('CommandInterceptor desactivado');
}

/** Registra un override para cada comando de la lista */
function registerOverrides(context: vscode.ExtensionContext): void {
  for (const commandId of INTERCEPTED_COMMANDS) {
    try {
      const disposable = vscode.commands.registerCommand(
        commandId,
        () => handleInterceptedCommand(commandId),
      );
      registeredDisposables.push(disposable);
      context.subscriptions.push(disposable);
    } catch (err) {
      // En algunos forks el comando puede no existir — silenciar
      logger.debug(`CommandInterceptor: no se pudo registrar ${commandId}`, err);
    }
  }
}

/**
 * Maneja la ejecución de un comando interceptado.
 * Según el modo activo, permite o bloquea la acción original.
 */
async function handleInterceptedCommand(commandId: string): Promise<void> {
  try {
    const config = getConfig();

    // Si KeyMaster está desactivado, ejecutar original
    if (!config.enabled) {
      await executeOriginal(commandId);
      return;
    }

    // Si el comando está en la lista de ignorados, ejecutar original
    if (config.ignoredCommands.includes(commandId)) {
      await executeOriginal(commandId);
      return;
    }

    // Buscar el atajo correspondiente
    const shortcut = findShortcutByCommand(commandId) ?? getRandomShortcut();

    switch (config.mode) {
      case 'soft':
        // Modo suave: avisar Y ejecutar el comando original
        showShortcutNotification(shortcut);
        await executeOriginal(commandId);
        break;

      case 'strict':
      case 'training':
        // Modo estricto/training: avisar y NO ejecutar
        showBlocker(shortcut);
        logger.info(`CommandInterceptor: bloqueado ${commandId} en modo ${config.mode}`);
        break;
    }
  } catch (err) {
    logger.error(`CommandInterceptor: error al manejar ${commandId}`, err);
    // En caso de error, intentar ejecutar el original para no dejar al usuario bloqueado
    await executeOriginal(commandId);
  }
}

/**
 * Ejecuta el comando original usando el prefijo underscore.
 * VS Code expone los comandos nativos con prefijo _ cuando son sobreescritos.
 */
async function executeOriginal(commandId: string): Promise<void> {
  try {
    await vscode.commands.executeCommand(`_${commandId}`);
  } catch {
    logger.debug(`CommandInterceptor: _${commandId} no disponible`);
  }
}
