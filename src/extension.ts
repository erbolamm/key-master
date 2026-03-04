import * as vscode from 'vscode';
import { logger } from './utils/logger';
import * as config from './utils/config';
import * as sound from './utils/sound';
import * as statusBar from './ui/statusBar';
import * as mouseGuard from './core/mouseGuard';
import * as commandInterceptor from './core/commandInterceptor';
import * as sessionStats from './core/sessionStats';
import { openPanel as openKeyboardPanel } from './ui/keyboardPanel/keyboardPanel';
import { shortcuts, getShortcutForPlatform, getDescription } from './data/shortcuts';

/**
 * Punto de entrada de la extensión.
 * VS Code llama a esta función cuando la extensión se activa.
 */
export function activate(context: vscode.ExtensionContext): void {
  // 1. Inicializar logger
  logger.activate();
  logger.info('KeyMaster v0.1.0 — activando extensión...');

  // 2. Inicializar módulos
  config.activate(context);
  sound.init(context.extensionPath);
  statusBar.activate(context);
  mouseGuard.activate(context);
  commandInterceptor.activate(context);
  sessionStats.activate(context);

  // 3. Registrar comandos
  registerCommands(context);

  // 4. Confirmación visual de activación
  showActivationMessage();

  logger.info('KeyMaster activado correctamente');
}

/** VS Code llama a esta función cuando la extensión se desactiva */
export function deactivate(): void {
  commandInterceptor.deactivate();
  mouseGuard.deactivate();
  sessionStats.deactivate();
  logger.info('KeyMaster desactivado');
  logger.deactivate();
}

/** Muestra un mensaje de activación según el estado actual */
function showActivationMessage(): void {
  try {
    const cfg = config.getConfig();
    const isES = cfg.language === 'es';
    const statusMsg = cfg.enabled
      ? (isES
          ? `⌨️ KeyMaster ACTIVO — modo ${cfg.mode.toUpperCase()}.`
          : `⌨️ KeyMaster ACTIVE — mode ${cfg.mode.toUpperCase()}.`)
      : (isES
          ? '⌨️ KeyMaster cargado pero DESACTIVADO. Pulsa Cmd+Shift+K para activar.'
          : '⌨️ KeyMaster loaded but DISABLED. Press Cmd+Shift+K to enable.');
    vscode.window.showWarningMessage(statusMsg);
  } catch (err) {
    logger.error('Error al mostrar mensaje de activación', err);
  }
}

/** Registra todos los comandos de la extensión */
function registerCommands(context: vscode.ExtensionContext): void {
  registerToggleCommand(context);
  registerSetModeCommand(context);
  registerOpenKeyboardCommand(context);
  registerStatsCommands(context);
  registerShortcutRefCommand(context);
  logger.info('Comandos registrados correctamente');
}

/** Comando keymaster.toggle — Menú principal desde la barra de estado */
function registerToggleCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.toggle', async () => {
      try {
        const selection = await showMainMenu();
        if (selection) {
          await handleMenuSelection(selection);
        }
      } catch (err) {
        logger.error('Error en menú principal', err);
      }
    }),
  );
}

/** Muestra el QuickPick del menú principal y devuelve la selección */
async function showMainMenu(): Promise<vscode.QuickPickItem | undefined> {
  const current = config.getConfig();
  const isES = current.language === 'es';
  const enabledIcon = current.enabled ? '$(check)' : '$(x)';
  const enabledLabel = current.enabled
    ? (isES ? 'Activado' : 'Enabled')
    : (isES ? 'Desactivado' : 'Disabled');
  const modeLabels = getModeLabels(isES);
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
    },
    {
      label: `$(globe) ${isES ? 'Idioma' : 'Language'}`,
      description: langLabels[current.language],
    },
    { label: '', kind: vscode.QuickPickItemKind.Separator },
    { label: `$(list-unordered) ${isES ? 'Referencia de atajos' : 'Shortcut Reference'}` },
    { label: `$(keyboard) ${isES ? 'Teclado visual' : 'Visual Keyboard'}` },
    { label: `$(graph) ${isES ? 'Estadísticas' : 'Statistics'}` },
  ];

  return vscode.window.showQuickPick(items, {
    placeHolder: `⌨️ KeyMaster — ${enabledLabel} · ${modeLabels[current.mode]}`,
  });
}

/** Devuelve las etiquetas de modo según idioma */
function getModeLabels(isES: boolean): Record<string, string> {
  return {
    soft: isES ? 'Suave' : 'Soft',
    strict: isES ? 'Estricto' : 'Strict',
    training: isES ? 'Entrenamiento' : 'Training',
  };
}

/** Procesa la opción seleccionada del menú principal */
async function handleMenuSelection(selection: vscode.QuickPickItem): Promise<void> {
  const label = selection.label;
  if (label.includes('Activar') || label.includes('Enable')) {
    await handleToggleEnabled();
  } else if (label.includes('Modo') || label.includes('Mode')) {
    await handleChangeMode();
  } else if (label.includes('Idioma') || label.includes('Language')) {
    await handleChangeLanguage();
  } else if (label.includes('Referencia') || label.includes('Reference')) {
    await vscode.commands.executeCommand('keymaster.showShortcutRef');
  } else if (label.includes('Teclado') || label.includes('Keyboard')) {
    await vscode.commands.executeCommand('keymaster.openKeyboard');
  } else if (label.includes('Estadísticas') || label.includes('Statistics')) {
    await vscode.commands.executeCommand('keymaster.showStats');
  }
}

/** Alterna el estado activado/desactivado */
async function handleToggleEnabled(): Promise<void> {
  const current = config.getConfig();
  const isES = current.language === 'es';
  const newEnabled = !current.enabled;
  await config.setConfigValue('enabled', newEnabled);
  statusBar.refresh();
  const msg = newEnabled
    ? (isES ? 'KeyMaster activado ✅' : 'KeyMaster enabled ✅')
    : (isES ? 'KeyMaster desactivado ⏸️' : 'KeyMaster disabled ⏸️');
  vscode.window.showInformationMessage(msg);
}

/** Muestra selector de modo y aplica el cambio */
async function handleChangeMode(): Promise<void> {
  const current = config.getConfig();
  const isES = current.language === 'es';
  const modeItems: vscode.QuickPickItem[] = [
    {
      label: '$(warning) Soft',
      description: current.mode === 'soft' ? (isES ? '← actual' : '← current') : '',
      detail: isES ? 'Detecta clic y muestra atajo, permite la acción' : 'Detects click, shows shortcut, allows action',
    },
    {
      label: '$(circle-slash) Strict',
      description: current.mode === 'strict' ? (isES ? '← actual' : '← current') : '',
      detail: isES ? 'Detecta clic y bloquea la acción' : 'Detects click and blocks the action',
    },
    {
      label: '$(flame) Training',
      description: current.mode === 'training' ? (isES ? '← actual' : '← current') : '',
      detail: isES ? 'Teclado visual con guía de dedos' : 'Visual keyboard with finger guide',
    },
  ];

  const sel = await vscode.window.showQuickPick(modeItems, {
    placeHolder: isES ? 'Selecciona el modo' : 'Select mode',
  });
  if (!sel) { return; }

  const modeMap: Record<string, config.KeyMasterMode> = {
    '$(warning) Soft': 'soft',
    '$(circle-slash) Strict': 'strict',
    '$(flame) Training': 'training',
  };
  const newMode = modeMap[sel.label];
  if (newMode) {
    await config.setConfigValue('mode', newMode);
    statusBar.refresh();
    logger.info(`Modo cambiado a: ${newMode}`);
  }
}

/** Muestra selector de idioma y aplica el cambio */
async function handleChangeLanguage(): Promise<void> {
  const current = config.getConfig();
  const isES = current.language === 'es';
  const langItems: vscode.QuickPickItem[] = [
    { label: '🇪🇸 Español', description: current.language === 'es' ? '← actual' : '' },
    { label: '🇬🇧 English', description: current.language === 'en' ? '← current' : '' },
  ];

  const sel = await vscode.window.showQuickPick(langItems, {
    placeHolder: isES ? 'Selecciona idioma' : 'Select language',
  });
  if (!sel) { return; }

  const newLang = sel.label.includes('Español') ? 'es' : 'en';
  await config.setConfigValue('language', newLang as config.KeyMasterLanguage);
  statusBar.refresh();
  logger.info(`Idioma cambiado a: ${newLang}`);
}

/** Comando keymaster.setMode — Acceso directo al selector de modo */
function registerSetModeCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.setMode', async () => {
      try {
        await handleChangeMode();
      } catch (err) {
        logger.error('Error al cambiar modo', err);
      }
    }),
  );
}

/** Comando keymaster.openKeyboard — Abrir panel de teclado visual */
function registerOpenKeyboardCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.openKeyboard', () => {
      try {
        openKeyboardPanel(context);
      } catch (err) {
        logger.error('Error al abrir teclado visual', err);
      }
    }),
  );
}

/** Comandos keymaster.showStats y keymaster.clearStats */
function registerStatsCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.showStats', () => {
      try {
        sessionStats.showStatsPanel();
      } catch (err) {
        logger.error('Error al mostrar estadísticas', err);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('keymaster.clearStats', () => {
      try {
        sessionStats.clearStats();
        const isES = config.getConfig().language === 'es';
        vscode.window.showInformationMessage(
          isES ? 'Estadísticas limpiadas ✅' : 'Statistics cleared ✅',
        );
      } catch (err) {
        logger.error('Error al limpiar estadísticas', err);
      }
    }),
  );
}

/** Comando keymaster.showShortcutRef — Referencia de atajos */
function registerShortcutRefCommand(context: vscode.ExtensionContext): void {
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
}
