import * as vscode from 'vscode';
import { logger } from './logger';

// Tipos de configuración de KeyMaster
export type KeyMasterMode = 'soft' | 'strict' | 'training';
export type KeyMasterLanguage = 'es' | 'en';

export interface KeyMasterConfig {
  enabled: boolean;
  mode: KeyMasterMode;
  language: KeyMasterLanguage;
  notificationDuration: number;
  showKeyboardOnStart: boolean;
  ignoredCommands: string[];
  soundEnabled: boolean;
  statsEnabled: boolean;
}

// Emitter para notificar cambios de configuración
const onConfigChangedEmitter = new vscode.EventEmitter<KeyMasterConfig>();

/** Evento que se emite cuando cambia la configuración */
export const onConfigChanged = onConfigChangedEmitter.event;

/** Lee la configuración actual desde VS Code */
export function getConfig(): KeyMasterConfig {
  const cfg = vscode.workspace.getConfiguration('keymaster');
  return {
    enabled: cfg.get<boolean>('enabled', true),
    mode: cfg.get<KeyMasterMode>('mode', 'soft'),
    language: cfg.get<KeyMasterLanguage>('language', 'es'),
    notificationDuration: cfg.get<number>('notificationDuration', 3000),
    showKeyboardOnStart: cfg.get<boolean>('showKeyboardOnStart', false),
    ignoredCommands: cfg.get<string[]>('ignoredCommands', []),
    soundEnabled: cfg.get<boolean>('soundEnabled', false),
    statsEnabled: cfg.get<boolean>('statsEnabled', true),
  };
}

/** Actualiza una propiedad de configuración */
export async function setConfigValue<K extends keyof KeyMasterConfig>(
  key: K,
  value: KeyMasterConfig[K],
): Promise<void> {
  try {
    const cfg = vscode.workspace.getConfiguration('keymaster');
    await cfg.update(key, value, vscode.ConfigurationTarget.Global);
  } catch (err) {
    logger.error(`Error al actualizar config ${key}`, err);
  }
}

/** Registra el listener de cambios de configuración */
export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('keymaster')) {
      const newConfig = getConfig();
      logger.info('Configuración actualizada', newConfig);
      onConfigChangedEmitter.fire(newConfig);
    }
  });
  context.subscriptions.push(disposable, onConfigChangedEmitter);
}
