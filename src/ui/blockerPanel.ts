import * as vscode from 'vscode';
import { getConfig } from '../utils/config';
import { type ShortcutEntry, getShortcutForPlatform, getDescription } from '../data/shortcuts';
import { logger } from '../utils/logger';

let currentPanel: vscode.WebviewPanel | undefined;

/**
 * Muestra un panel WebView bloqueante que cubre el editor.
 * Los clics de ratón dentro del WebView NO hacen nada.
 * Solo se puede cerrar con Enter, Escape o el atajo mostrado.
 */
export function showBlocker(shortcut: ShortcutEntry): void {
  const config = getConfig();
  const lang = config.language;
  const isES = lang === 'es';
  const key = getShortcutForPlatform(shortcut);
  const desc = getDescription(shortcut, lang);

  // Si ya hay un panel abierto, actualizamos el contenido
  if (currentPanel) {
    currentPanel.webview.html = getBlockerHTML(key, desc, isES);
    currentPanel.reveal(vscode.ViewColumn.One);
    return;
  }

  currentPanel = vscode.window.createWebviewPanel(
    'keymasterBlocker',
    isES ? '⌨️ ¡USA EL TECLADO!' : '⌨️ USE THE KEYBOARD!',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: false,
    },
  );

  currentPanel.webview.html = getBlockerHTML(key, desc, isES);

  // Escuchar mensajes del WebView (cierre por teclado)
  currentPanel.webview.onDidReceiveMessage((message) => {
    if (message.command === 'close') {
      currentPanel?.dispose();
    }
  });

  currentPanel.onDidDispose(() => {
    currentPanel = undefined;
    logger.info('BlockerPanel cerrado');
  });

  logger.info('BlockerPanel abierto — requiere teclado para cerrar');
}

/** Cierra el panel bloqueante si está abierto */
export function closeBlocker(): void {
  currentPanel?.dispose();
}

/** Genera el HTML del panel bloqueante */
function getBlockerHTML(shortcutKey: string, description: string, isES: boolean): string {
  return `<!DOCTYPE html>
<html lang="${isES ? 'es' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    background: #0d1117;
    color: #c9d1d9;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    user-select: none;
    cursor: not-allowed;
  }

  /* Bloquear TODOS los clics de ratón */
  body * { pointer-events: none; }

  .container {
    text-align: center;
    max-width: 600px;
    padding: 40px;
  }

  .icon { font-size: 80px; margin-bottom: 20px; }

  .title {
    font-size: 28px;
    font-weight: 800;
    color: #f85149;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 15px;
  }

  .subtitle {
    font-size: 18px;
    color: #8b949e;
    margin-bottom: 40px;
  }

  .shortcut-box {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 30px 40px;
    margin-bottom: 15px;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }

  .shortcut-label {
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 10px;
  }

  .shortcut-key {
    font-size: 48px;
    font-weight: 900;
    color: white;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  }

  .shortcut-desc {
    font-size: 16px;
    color: rgba(255,255,255,0.85);
    margin-top: 12px;
  }

  .dismiss {
    margin-top: 40px;
    padding: 12px 30px;
    background: #21262d;
    border: 1px solid #30363d;
    border-radius: 8px;
    color: #58a6ff;
    font-size: 14px;
    font-weight: 600;
  }

  .dismiss kbd {
    background: #30363d;
    border: 1px solid #484f58;
    border-radius: 4px;
    padding: 2px 8px;
    font-family: monospace;
    font-size: 13px;
    color: #c9d1d9;
  }

  /* Flash rojo al hacer clic */
  .mouse-flash {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(248, 81, 73, 0.15);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    pointer-events: none;
  }

  .mouse-flash.active { display: flex; }

  .mouse-flash-text {
    font-size: 24px;
    font-weight: 800;
    color: #f85149;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="mouse-flash" id="mouseFlash">
    <span class="mouse-flash-text">🖱️ ${isES ? '¡SIN RATÓN!' : 'NO MOUSE!'}</span>
  </div>

  <div class="container">
    <div class="icon">🚫🖱️</div>
    <div class="title">${isES ? '¡Clic de ratón detectado!' : 'Mouse click detected!'}</div>
    <div class="subtitle">${isES ? 'Usa el teclado en su lugar:' : 'Use the keyboard instead:'}</div>

    <div class="shortcut-box">
      <div class="shortcut-label">${isES ? 'Atajo de teclado' : 'Keyboard shortcut'}</div>
      <div class="shortcut-key">${shortcutKey}</div>
      <div class="shortcut-desc">${description}</div>
    </div>

    <div class="dismiss">
      ${isES
        ? 'Pulsa <kbd>ENTER</kbd> o <kbd>ESCAPE</kbd> para cerrar'
        : 'Press <kbd>ENTER</kbd> or <kbd>ESCAPE</kbd> to close'}
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const flash = document.getElementById('mouseFlash');

    // Cerrar con Enter o Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        vscode.postMessage({ command: 'close' });
      }
    });

    // Bloquear clics y mostrar flash rojo
    document.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      flash.classList.add('active');
      setTimeout(() => flash.classList.remove('active'), 300);
    }, true);

    document.addEventListener('mouseup', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, true);

    document.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, true);

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, true);

    // Focus automático para capturar teclado
    window.focus();
  </script>
</body>
</html>`;
}
