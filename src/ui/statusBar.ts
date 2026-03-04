import * as vscode from 'vscode';
import { getConfig, onConfigChanged, type KeyMasterMode } from '../utils/config';
import { logger } from '../utils/logger';

// Configuración visual por modo
interface ModeDisplay {
  icon: string;
  label: string;
  tooltip: string;
  color: string;
}

const MODE_DISPLAY: Record<KeyMasterMode | 'off', ModeDisplay> = {
  off: {
    icon: '$(keyboard)',
    label: 'OFF',
    tooltip: 'KeyMaster desactivado — clic para abrir menú',
    color: '',
  },
  soft: {
    icon: '$(warning)',
    label: 'AVISO',
    tooltip: 'KeyMaster: modo aviso suave — clic para abrir menú',
    color: 'statusBarItem.warningBackground',
  },
  strict: {
    icon: '$(circle-slash)',
    label: 'ESTRICTO',
    tooltip: 'KeyMaster: modo estricto — clic para abrir menú',
    color: 'statusBarItem.errorBackground',
  },
  training: {
    icon: '$(flame)',
    label: 'TRAIN',
    tooltip: 'KeyMaster: modo entrenamiento — clic para abrir menú',
    color: 'statusBarItem.errorBackground',
  },
};

let statusBarItem: vscode.StatusBarItem | undefined;

/** Crea y muestra el ítem en la barra de estado */
export function activate(context: vscode.ExtensionContext): void {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    0,
  );
  statusBarItem.command = 'keymaster.toggle';
  context.subscriptions.push(statusBarItem);

  // Actualizar según configuración actual
  updateDisplay();

  // Escuchar cambios de configuración
  const disposable = onConfigChanged(() => {
    updateDisplay();
  });
  context.subscriptions.push(disposable);

  statusBarItem.show();
  logger.info('StatusBar activada');
}

/** Actualiza el aspecto del ítem según el estado actual */
function updateDisplay(): void {
  if (!statusBarItem) {
    return;
  }
  try {
    const config = getConfig();
    const key = config.enabled ? config.mode : 'off';
    const display = MODE_DISPLAY[key];

    statusBarItem.text = `${display.icon} KeyMaster: ${display.label}`;
    statusBarItem.tooltip = display.tooltip;
    statusBarItem.backgroundColor = display.color
      ? new vscode.ThemeColor(display.color)
      : undefined;
  } catch (err) {
    logger.error('Error al actualizar StatusBar', err);
  }
}

/** Fuerza la actualización del display (para llamar desde extension.ts) */
export function refresh(): void {
  updateDisplay();
}
