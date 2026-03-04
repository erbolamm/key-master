import * as vscode from 'vscode';
import { getConfig, onConfigChanged } from '../utils/config';
import { showShortcutNotification } from '../ui/notifier';
import { logger } from '../utils/logger';
import {
  findShortcutByCommand,
  getRandomShortcut,
} from '../data/shortcuts';

let selectionListener: vscode.Disposable | undefined;
let configListener: vscode.Disposable | undefined;
// Control de frecuencia para evitar spam de notificaciones
let lastNotificationTime = 0;
const NOTIFICATION_COOLDOWN_MS = 2000;

/**
 * Activa el módulo MouseGuard.
 * Escucha cambios de selección en el editor y filtra los originados por ratón.
 */
export function activate(context: vscode.ExtensionContext): void {
  // Arrancar si la extensión está habilitada
  const config = getConfig();
  if (config.enabled) {
    startListening(context);
  }

  // Reaccionar a cambios de configuración
  configListener = onConfigChanged((newConfig) => {
    if (newConfig.enabled) {
      startListening(context);
    } else {
      stopListening();
    }
  });
  context.subscriptions.push(configListener);

  logger.info('MouseGuard activado');
}

/** Desactiva el módulo y limpia listeners */
export function deactivate(): void {
  stopListening();
  configListener?.dispose();
  configListener = undefined;
  logger.info('MouseGuard desactivado');
}

/** Registra el listener de selección si no existe ya */
function startListening(context: vscode.ExtensionContext): void {
  if (selectionListener) {
    return; // Ya está escuchando
  }

  selectionListener = vscode.window.onDidChangeTextEditorSelection((event) => {
    try {
      handleSelectionChange(event);
    } catch (err) {
      logger.error('Error en MouseGuard handleSelectionChange', err);
    }
  });
  context.subscriptions.push(selectionListener);

  logger.debug('MouseGuard: listener de selección registrado');
}

/** Elimina el listener de selección */
function stopListening(): void {
  selectionListener?.dispose();
  selectionListener = undefined;
  logger.debug('MouseGuard: listener de selección eliminado');
}

/**
 * Maneja un evento de cambio de selección.
 * Solo actúa si el cambio fue provocado por el ratón.
 */
function handleSelectionChange(
  event: vscode.TextEditorSelectionChangeEvent,
): void {
  // Solo nos interesa si el cambio fue por clic de ratón
  if (event.kind !== vscode.TextEditorSelectionChangeKind.Mouse) {
    return;
  }

  const config = getConfig();
  if (!config.enabled) {
    return;
  }

  // Control de frecuencia para no spamear notificaciones
  const now = Date.now();
  if (now - lastNotificationTime < NOTIFICATION_COOLDOWN_MS) {
    return;
  }
  lastNotificationTime = now;

  logger.debug('MouseGuard: clic de ratón detectado en el editor');

  // Para la Fase 1 mostramos atajos de navegación sugeridos
  // En la Fase 2, el CommandInterceptor dará atajos más específicos
  const navigationShortcuts = [
    findShortcutByCommand('workbench.action.gotoLine'),
    findShortcutByCommand('workbench.action.quickOpen'),
    findShortcutByCommand('actions.find'),
  ].filter((s): s is NonNullable<typeof s> => s !== undefined);

  // Elegimos uno de los atajos de navegación o uno aleatorio
  const shortcut = navigationShortcuts.length > 0
    ? navigationShortcuts[Math.floor(Math.random() * navigationShortcuts.length)]
    : getRandomShortcut();

  showShortcutNotification(shortcut);
}
