import * as vscode from 'vscode';
import { getConfig, onConfigChanged } from '../utils/config';
import { showShortcutNotification } from '../ui/notifier';
import { showBlocker } from '../ui/blockerPanel';
import { playSoft, playAlert } from '../utils/sound';
import { logger } from '../utils/logger';
import { recordMouseClick, recordShortcutShown } from './sessionStats';
import {
  getRandomShortcut,
  shortcuts,
  type ShortcutEntry,
} from '../data/shortcuts';

let selectionListener: vscode.Disposable | undefined;
let configListener: vscode.Disposable | undefined;
// Control de frecuencia para evitar spam de notificaciones
let lastNotificationTime = 0;
const NOTIFICATION_COOLDOWN_MS = 3000;
// Índice rotatorio para no repetir atajos consecutivos
let lastShortcutIndex = -1;

/**
 * Activa el módulo MouseGuard.
 * Escucha cambios de selección en el editor y filtra los originados por ratón.
 */
export function activate(context: vscode.ExtensionContext): void {
  // Registrar el listener de selección SIEMPRE (internamente comprueba enabled)
  selectionListener = vscode.window.onDidChangeTextEditorSelection((event) => {
    try {
      handleSelectionChange(event);
    } catch (err) {
      logger.error('Error en MouseGuard handleSelectionChange', err);
    }
  });
  context.subscriptions.push(selectionListener);

  // Reaccionar a cambios de configuración (solo para logging)
  configListener = onConfigChanged((newConfig) => {
    logger.info(`MouseGuard: enabled=${newConfig.enabled}, mode=${newConfig.mode}`);
  });
  context.subscriptions.push(configListener);

  logger.info('MouseGuard activado — listener de selección registrado');
}

/** Desactiva el módulo y limpia listeners */
export function deactivate(): void {
  selectionListener?.dispose();
  selectionListener = undefined;
  configListener?.dispose();
  configListener = undefined;
  logger.info('MouseGuard desactivado');
}

/**
 * Maneja un evento de cambio de selección.
 * Detecta clics de ratón y responde según el modo activo:
 *   - soft: notificación + sonido suave
 *   - strict: WebView bloqueante + sonido alerta
 *   - training: WebView bloqueante + sonido alerta (igual que strict por ahora)
 */
function handleSelectionChange(
  event: vscode.TextEditorSelectionChangeEvent,
): void {
  // Descartar cambios explícitos de teclado o comandos programáticos
  if (event.kind === vscode.TextEditorSelectionChangeKind.Keyboard ||
      event.kind === vscode.TextEditorSelectionChangeKind.Command) {
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

  logger.info(`MouseGuard: selección detectada (kind=${event.kind ?? 'undefined'}, mode=${config.mode})`);

  const shortcut = trackAndPickShortcut(config);
  respondToClick(config, shortcut);
}

/** Registra el clic en estadísticas y elige un atajo rotatorio */
function trackAndPickShortcut(config: ReturnType<typeof getConfig>): ShortcutEntry {
  if (config.statsEnabled) {
    recordMouseClick();
  }
  const shortcut = getNextShortcut();
  if (config.statsEnabled) {
    recordShortcutShown(shortcut.command);
  }
  return shortcut;
}

/** Responde al clic según el modo activo */
function respondToClick(
  config: ReturnType<typeof getConfig>,
  shortcut: ShortcutEntry,
): void {
  switch (config.mode) {
    case 'soft':
      showShortcutNotification(shortcut);
      if (config.soundEnabled) {
        playSoft();
      }
      break;

    case 'strict':
    case 'training':
      showBlocker(shortcut);
      playAlert();
      break;
  }
}

/**
 * Devuelve un atajo diferente cada vez, evitando repetir el anterior.
 * Rota entre todos los atajos de la base de datos.
 */
function getNextShortcut(): ShortcutEntry {
  let shortcut = getRandomShortcut();
  if (shortcuts.length > 1) {
    const idx = shortcuts.indexOf(shortcut);
    if (idx === lastShortcutIndex) {
      const newIdx = (idx + 1) % shortcuts.length;
      shortcut = shortcuts[newIdx];
    }
    lastShortcutIndex = shortcuts.indexOf(shortcut);
  }
  return shortcut;
}
