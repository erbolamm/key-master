import * as vscode from 'vscode';
import { getConfig } from '../utils/config';
import {
  type ShortcutEntry,
  getShortcutForPlatform,
  getDescription,
  getRandomShortcut,
} from '../data/shortcuts';
import { logger } from '../utils/logger';

// Mensajes según idioma
const MESSAGES = {
  es: {
    clickDetected: '🖱️ Clic detectado',
    useShortcut: 'Usa',
    instead: 'en su lugar',
    tip: '💡 Consejo',
  },
  en: {
    clickDetected: '🖱️ Click detected',
    useShortcut: 'Use',
    instead: 'instead',
    tip: '💡 Tip',
  },
};

/**
 * Muestra una notificación con el atajo de teclado correspondiente.
 * Si se proporciona un ShortcutEntry, muestra ese atajo específico.
 * Si no, muestra un atajo aleatorio como sugerencia.
 */
export function showShortcutNotification(entry?: ShortcutEntry): void {
  const config = getConfig();
  const lang = config.language;
  const msg = MESSAGES[lang];

  const shortcut = entry ?? getRandomShortcut();
  const key = getShortcutForPlatform(shortcut);
  const desc = getDescription(shortcut, lang);

  const text = `${msg.clickDetected} — ${msg.useShortcut} ${key} ${msg.instead}. ${desc}`;

  logger.info(`Notificación: ${text}`);

  // Usamos showWarningMessage para que sea más visible
  try {
    vscode.window.showWarningMessage(text);
  } catch (err) {
    logger.error('Error al mostrar notificación', err);
  }
}

/**
 * Muestra una sugerencia de atajo (sin el prefijo de "clic detectado").
 * Útil para avisos no relacionados con clics.
 */
export function showShortcutTip(entry: ShortcutEntry): void {
  const config = getConfig();
  const lang = config.language;
  const msg = MESSAGES[lang];
  const key = getShortcutForPlatform(entry);
  const desc = getDescription(entry, lang);

  const text = `${msg.tip}: ${desc} → ${key}`;
  try {
    vscode.window.showInformationMessage(text);
  } catch (err) {
    logger.error('Error al mostrar consejo', err);
  }
}
