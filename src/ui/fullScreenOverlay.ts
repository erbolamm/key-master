import * as vscode from 'vscode';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';

let overlayPanel: vscode.WebviewPanel | undefined;
let isOverlayActive = false;

/**
 * Activa el overlay full-screen transparente en modo estricto.
 * Este overlay cubre toda la ventana de VS Code y detecta cualquier clic.
 */
export function activateFullScreenOverlay(): void {
  if (isOverlayActive || !getConfig().enabled || getConfig().mode === 'soft') {
    return;
  }

  isOverlayActive = true;
  
  // Crear panel en modo full-screen
  overlayPanel = vscode.window.createWebviewPanel(
    'keymasterOverlay',
    '', // Sin título
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    {
      enableScripts: true,
      retainContextWhenHidden: false,
      localResourceRoots: [],
    }
  );

  // Hacer el panel transparente y sin bordes
  overlayPanel.webview.html = buildOverlayHTML();
  
  // Manejar mensajes del webview (clics detectados)
  overlayPanel.webview.onDidReceiveMessage((message) => {
    if (message.type === 'clickDetected') {
      handleOverlayClick();
    }
  });

  // Cuando se cierra el overlay, reactivarlo si seguimos en modo strict
  overlayPanel.onDidDispose(() => {
    overlayPanel = undefined;
    isOverlayActive = false;
    // Reactivar después de un breve delay si seguimos en modo strict
    setTimeout(() => {
      if (getConfig().enabled && getConfig().mode !== 'soft') {
        activateFullScreenOverlay();
      }
    }, 100);
  });

  logger.info('FullScreenOverlay activado - cubriendo ventana completa');
}

/**
 * Desactiva el overlay full-screen.
 */
export function deactivateFullScreenOverlay(): void {
  if (overlayPanel) {
    overlayPanel.dispose();
    overlayPanel = undefined;
  }
  isOverlayActive = false;
  logger.info('FullScreenOverlay desactivado');
}

/**
 * Maneja un clic detectado en el overlay.
 * Muestra el mensaje de advertencia.
 */
function handleOverlayClick(): void {
  const config = getConfig();
  if (!config.enabled || config.mode === 'soft') {
    return;
  }

  // Aquí mostraremos el blocker tradicional
  // Importar dinámicamente para evitar dependencia circular
  const { showBlocker } = require('./blockerPanel');
  const { getNextShortcut } = require('../core/mouseGuard');
  
  const shortcut = getNextShortcut();
  showBlocker(shortcut);
  
  logger.info('Clic interceptado en overlay full-screen');
}

/**
 * Construye el HTML del overlay transparente.
 * Es un div transparente que cubre toda la pantalla y detecta clics.
 */
function buildOverlayHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
    
    #overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: transparent;
      cursor: not-allowed;
      z-index: 999999;
    }
    
    #warning {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #f85149 0%, #da3633 100%);
      color: white;
      padding: 40px 60px;
      border-radius: 20px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      text-align: center;
      box-shadow: 0 20px 60px rgba(248, 81, 73, 0.4);
      z-index: 1000000;
      animation: pulse 1s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.05); }
    }
    
    #warning .icon {
      font-size: 60px;
      margin-bottom: 15px;
    }
    
    #warning .title {
      font-size: 32px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 10px;
    }
    
    #warning .subtitle {
      font-size: 18px;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div id="overlay"></div>
  <div id="warning">
    <div class="icon">🚫🖱️</div>
    <div class="title">MODO ESTRICTO</div>
    <div class="subtitle">Usa el teclado, no el ratón</div>
  </div>
  
  <script>
    const vscode = acquireVsCodeApi();
    const overlay = document.getElementById('overlay');
    const warning = document.getElementById('warning');
    let clickCount = 0;
    
    // Interceptar TODOS los eventos de ratón
    overlay.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      clickCount++;
      
      // Mostrar advertencia
      warning.style.display = 'block';
      
      // Notificar a la extensión
      vscode.postMessage({ type: 'clickDetected', count: clickCount });
      
      // Ocultar advertencia después de 2 segundos
      setTimeout(() => {
        warning.style.display = 'none';
      }, 2000);
      
      return false;
    }, true);
    
    overlay.addEventListener('mouseup', function(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
    
    overlay.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
    
    overlay.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
    
    // Prevenir scroll
    overlay.addEventListener('wheel', function(e) {
      e.preventDefault();
      return false;
    }, true);
    
    // Mantener el foco
    window.focus();
  </script>
</body>
</html>`;
}
