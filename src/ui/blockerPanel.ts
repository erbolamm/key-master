import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { getConfig } from '../utils/config';
import { type ShortcutEntry, getShortcutForPlatform, getDescription } from '../data/shortcuts';
import { logger } from '../utils/logger';

let currentPanel: vscode.WebviewPanel | undefined;
// Disposables del panel actual para limpieza
const panelDisposables: vscode.Disposable[] = [];

/** Genera un nonce criptográfico para CSP */
function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Muestra un panel WebView bloqueante que cubre el editor.
 * Los clics de ratón dentro del WebView NO hacen nada.
 * Solo se puede cerrar con Enter o Escape (teclado).
 */
export function showBlocker(shortcut: ShortcutEntry): void {
  try {
    const config = getConfig();
    const isES = config.language === 'es';
    const key = getShortcutForPlatform(shortcut);
    const desc = getDescription(shortcut, config.language);
    const nonce = generateNonce();

    // Si ya hay un panel abierto, actualizamos el contenido
    if (currentPanel) {
      currentPanel.webview.html = buildBlockerHTML(key, desc, isES, nonce);
      currentPanel.reveal(vscode.ViewColumn.One);
      return;
    }

    currentPanel = createBlockerPanel(isES);
    currentPanel.webview.html = buildBlockerHTML(key, desc, isES, nonce);
    registerPanelListeners();

    logger.info('BlockerPanel abierto — requiere teclado para cerrar');
  } catch (err) {
    logger.error('Error al abrir BlockerPanel', err);
  }
}

/** Crea el WebviewPanel con la configuración necesaria */
function createBlockerPanel(isES: boolean): vscode.WebviewPanel {
  return vscode.window.createWebviewPanel(
    'keymasterBlocker',
    isES ? '⌨️ ¡USA EL TECLADO!' : '⌨️ USE THE KEYBOARD!',
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: false },
  );
}

/** Registra los listeners del panel y los guarda para limpieza */
function registerPanelListeners(): void {
  if (!currentPanel) { return; }

  // Escuchar mensajes del WebView (cierre por teclado)
  const msgDisposable = currentPanel.webview.onDidReceiveMessage(
    (message: { command: string }) => {
      if (message.command === 'close') {
        currentPanel?.dispose();
      }
    },
  );
  panelDisposables.push(msgDisposable);

  // Limpiar al cerrar el panel
  const disposeDisposable = currentPanel.onDidDispose(() => {
    currentPanel = undefined;
    disposePanelListeners();
    logger.info('BlockerPanel cerrado');
  });
  panelDisposables.push(disposeDisposable);
}

/** Limpia todos los disposables asociados al panel */
function disposePanelListeners(): void {
  for (const d of panelDisposables) {
    d.dispose();
  }
  panelDisposables.length = 0;
}

/** Cierra el panel bloqueante si está abierto */
export function closeBlocker(): void {
  currentPanel?.dispose();
}

/** Construye el HTML del blocker con CSP y nonce */
function buildBlockerHTML(
  shortcutKey: string,
  description: string,
  isES: boolean,
  nonce: string,
): string {
  const styles = getBlockerStyles();
  const body = getBlockerBody(shortcutKey, description, isES);
  const script = getBlockerScript();

  return `<!DOCTYPE html>
<html lang="${isES ? 'es' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>${styles}</style>
</head>
<body>
${body}
<script nonce="${nonce}">${script}</script>
</body>
</html>`;
}

/** Devuelve los estilos CSS del blocker */
function getBlockerStyles(): string {
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0d1117; color: #c9d1d9;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    overflow: hidden; user-select: none; cursor: not-allowed;
  }
  body * { pointer-events: none; }
  .container { text-align: center; max-width: 600px; padding: 40px; }
  .icon { font-size: 80px; margin-bottom: 20px; }
  .title {
    font-size: 28px; font-weight: 800; color: #f85149;
    text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;
  }
  .subtitle { font-size: 18px; color: #8b949e; margin-bottom: 40px; }
  .shortcut-box {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px; padding: 30px 40px; margin-bottom: 15px;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
  .shortcut-label {
    font-size: 14px; color: rgba(255,255,255,0.7);
    text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px;
  }
  .shortcut-key {
    font-size: 48px; font-weight: 900; color: white;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  }
  .shortcut-desc { font-size: 16px; color: rgba(255,255,255,0.85); margin-top: 12px; }
  .dismiss {
    margin-top: 40px; padding: 12px 30px; background: #21262d;
    border: 1px solid #30363d; border-radius: 8px;
    color: #58a6ff; font-size: 14px; font-weight: 600;
  }
  .dismiss kbd {
    background: #30363d; border: 1px solid #484f58; border-radius: 4px;
    padding: 2px 8px; font-family: monospace; font-size: 13px; color: #c9d1d9;
  }
  .mouse-flash {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(248, 81, 73, 0.15); display: none;
    align-items: center; justify-content: center; z-index: 9999;
    pointer-events: none;
  }
  .mouse-flash.active { display: flex; }
  .mouse-flash-text {
    font-size: 24px; font-weight: 800; color: #f85149; text-transform: uppercase;
  }`;
}

/** Devuelve el cuerpo HTML del blocker */
function getBlockerBody(
  shortcutKey: string,
  description: string,
  isES: boolean,
): string {
  const noMouseText = isES ? '¡SIN RATÓN!' : 'NO MOUSE!';
  const titleText = isES ? '¡Clic de ratón detectado!' : 'Mouse click detected!';
  const subtitleText = isES ? 'Usa el teclado en su lugar:' : 'Use the keyboard instead:';
  const labelText = isES ? 'Atajo de teclado' : 'Keyboard shortcut';
  const dismissText = isES
    ? 'Pulsa <kbd>ENTER</kbd> o <kbd>ESCAPE</kbd> para cerrar'
    : 'Press <kbd>ENTER</kbd> or <kbd>ESCAPE</kbd> to close';

  return `
  <div class="mouse-flash" id="mouseFlash">
    <span class="mouse-flash-text">🖱️ ${noMouseText}</span>
  </div>
  <div class="container">
    <div class="icon">🚫🖱️</div>
    <div class="title">${titleText}</div>
    <div class="subtitle">${subtitleText}</div>
    <div class="shortcut-box">
      <div class="shortcut-label">${labelText}</div>
      <div class="shortcut-key">${shortcutKey}</div>
      <div class="shortcut-desc">${description}</div>
    </div>
    <div class="dismiss">${dismissText}</div>
  </div>`;
}

/** Devuelve el script JS del blocker */
function getBlockerScript(): string {
  return `
    var api = acquireVsCodeApi();
    var flash = document.getElementById('mouseFlash');
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === 'Escape') {
        api.postMessage({ command: 'close' });
      }
    });
    document.addEventListener('mousedown', function(e) {
      e.preventDefault(); e.stopPropagation();
      flash.classList.add('active');
      setTimeout(function() { flash.classList.remove('active'); }, 300);
    }, true);
    document.addEventListener('mouseup', function(e) {
      e.preventDefault(); e.stopPropagation();
    }, true);
    document.addEventListener('click', function(e) {
      e.preventDefault(); e.stopPropagation();
    }, true);
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault(); e.stopPropagation();
    }, true);
    window.focus();`;
}
