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
const NOTIFICATION_COOLDOWN_MS = 500; // Reducido de 3000 a 500ms
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
  // DEBUG: Log todo lo que llega
  const config = getConfig();
  logger.info(`🐛 DEBUG: handleSelectionChange - kind=${event.kind}, enabled=${config.enabled}, mode=${config.mode}`);
  
  // Solo ignorar cambios EXPLÍCITOS de teclado o comandos
  // En Windsurf, event.kind puede ser undefined para clics de ratón
  if (event.kind === vscode.TextEditorSelectionChangeKind.Keyboard ||
      event.kind === vscode.TextEditorSelectionChangeKind.Command) {
    logger.info(`🐛 DEBUG: Ignorando - tipo Keyboard o Command`);
    return;
  }

  if (!config.enabled) {
    logger.info(`🐛 DEBUG: Ignorando - KeyMaster desactivado`);
    return;
  }

  // Modo estricto/training: detectar CUALQUIER cambio de selección como potencial clic de ratón
  // Incluyendo cuando event.kind es undefined
  if (config.mode === 'strict' || config.mode === 'training') {
    const now = Date.now();
    if (now - lastNotificationTime < NOTIFICATION_COOLDOWN_MS) {
      logger.info(`🐛 DEBUG: Cooldown activo, pero en modo strict detectamos de todos modos`);
      // En modo strict, no retornamos - seguimos procesando
    } else {
      lastNotificationTime = now;
    }
    
    logger.info(`🐛 DEBUG: 🖱️ CLIC DE RATÓN DETECTADO (kind=${event.kind ?? 'undefined'}) - modo=${config.mode}`);
    const shortcut = trackAndPickShortcut(config);
    respondToClick(config, shortcut);
    return;
  }

  // Modo soft: cooldown normal
  const now = Date.now();
  if (now - lastNotificationTime < NOTIFICATION_COOLDOWN_MS) {
    logger.info(`🐛 DEBUG: Ignorando - cooldown activo (${now - lastNotificationTime}ms)`);
    return;
  }
  lastNotificationTime = now;

  logger.info(`🐛 DEBUG: CLIC DETECTADO (modo soft)`);
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
