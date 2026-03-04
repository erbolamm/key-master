import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getConfig } from '../../utils/config';
import { logger } from '../../utils/logger';

let currentPanel: vscode.WebviewPanel | undefined;
const panelDisposables: vscode.Disposable[] = [];

/** Genera un nonce criptográfico para CSP */
function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Abre el panel de teclado visual en la segunda columna del editor.
 * Si ya hay uno abierto, lo enfoca.
 */
export function openPanel(context: vscode.ExtensionContext): void {
  try {
    if (currentPanel) {
      currentPanel.reveal(vscode.ViewColumn.Two);
      return;
    }

    currentPanel = createPanel();
    currentPanel.webview.html = buildHTML(context.extensionPath);
    registerListeners(context);

    logger.info('KeyboardPanel abierto');
  } catch (err) {
    logger.error('Error al abrir KeyboardPanel', err);
  }
}

/** Cierra el panel si está abierto */
export function closePanel(): void {
  currentPanel?.dispose();
}

/**
 * Envía un mensaje al panel para resaltar una tecla.
 * Se usa desde mouseGuard/commandInterceptor para guía visual.
 */
export function highlightKey(key: string, description: string): void {
  if (!currentPanel) { return; }
  try {
    currentPanel.webview.postMessage({
      command: 'highlight',
      key,
      description,
    });
  } catch (err) {
    logger.error('Error al enviar highlight al KeyboardPanel', err);
  }
}

/** Crea el WebviewPanel con configuración adecuada */
function createPanel(): vscode.WebviewPanel {
  const isES = getConfig().language === 'es';
  return vscode.window.createWebviewPanel(
    'keymasterKeyboard',
    isES ? '⌨️ Teclado Visual' : '⌨️ Visual Keyboard',
    vscode.ViewColumn.Two,
    { enableScripts: true, retainContextWhenHidden: true },
  );
}

/** Registra listeners del panel y guarda disposables */
function registerListeners(context: vscode.ExtensionContext): void {
  if (!currentPanel) { return; }

  // Mensajes del WebView
  const msgDisposable = currentPanel.webview.onDidReceiveMessage(
    (msg: { command: string; key?: string; code?: string }) => {
      if (msg.command === 'keypress') {
        logger.debug(`KeyboardPanel: tecla presionada ${msg.key}`);
      }
    },
  );
  panelDisposables.push(msgDisposable);
  context.subscriptions.push(msgDisposable);

  // Limpieza al cerrar
  const disposeDisposable = currentPanel.onDidDispose(() => {
    currentPanel = undefined;
    cleanupDisposables();
    logger.info('KeyboardPanel cerrado');
  });
  panelDisposables.push(disposeDisposable);
  context.subscriptions.push(disposeDisposable);
}

/** Limpia los disposables del panel */
function cleanupDisposables(): void {
  for (const d of panelDisposables) {
    d.dispose();
  }
  panelDisposables.length = 0;
}

/** Construye el HTML del teclado cargando la plantilla */
function buildHTML(extensionPath: string): string {
  const nonce = generateNonce();
  const isES = getConfig().language === 'es';
  const htmlPath = path.join(extensionPath, 'src', 'ui', 'keyboardPanel', 'keyboard.html');

  let html = fs.readFileSync(htmlPath, 'utf8');

  // Inyectar valores dinámicos
  const replacements = getReplacements(isES, nonce);
  for (const [placeholder, value] of Object.entries(replacements)) {
    html = html.replace(new RegExp(`\\$\\{${placeholder}\\}`, 'g'), value);
  }

  return html;
}

/** Devuelve los reemplazos de plantilla según idioma */
function getReplacements(isES: boolean, nonce: string): Record<string, string> {
  return {
    nonce,
    title: isES ? 'Teclado Visual' : 'Visual Keyboard',
    legendPinkyL: isES ? 'Meñique izq.' : 'Left pinky',
    legendRingL: isES ? 'Anular izq.' : 'Left ring',
    legendMiddleL: isES ? 'Corazón izq.' : 'Left middle',
    legendIndexL: isES ? 'Índice izq.' : 'Left index',
    legendIndexR: isES ? 'Índice der.' : 'Right index',
    legendMiddleR: isES ? 'Corazón der.' : 'Right middle',
    legendRingR: isES ? 'Anular der.' : 'Right ring',
    legendPinkyR: isES ? 'Meñique der.' : 'Right pinky',
    legendThumbs: isES ? 'Pulgares' : 'Thumbs',
    defaultInfo: isES
      ? 'Pulsa una tecla o haz clic en el editor para ver la guía de dedos'
      : 'Press a key or click in the editor to see the finger guide',
  };
}
