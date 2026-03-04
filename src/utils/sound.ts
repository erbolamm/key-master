import * as path from 'path';
import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { logger } from './logger';

let extensionPath = '';

// Nombres de archivo permitidos (whitelist contra injection)
const ALLOWED_FILES = new Set(['soft.mp3', 'alert.mp3']);

/** Inicializa el módulo de sonido con la ruta de la extensión */
export function init(extPath: string): void {
  extensionPath = extPath;
}

/** Ejecuta un comando de forma asíncrona sin pasar por shell */
function execFileAsync(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve) => {
    execFile(cmd, args, (err) => {
      if (err) {
        logger.warn(`Sound: error reproduciendo`, err.message);
      }
      resolve();
    });
  });
}

/** Reproduce un archivo de sonido de la carpeta media/ */
export async function play(filename: string): Promise<void> {
  // Validar nombre de archivo contra whitelist
  if (!ALLOWED_FILES.has(filename)) {
    logger.warn(`Sound: archivo no permitido: ${filename}`);
    return;
  }

  if (!extensionPath) {
    logger.warn('Sound: extensionPath no inicializado');
    return;
  }

  // En contexto remoto (SSH/WSL) no reproducir sonido
  if (vscode.env.remoteName) {
    logger.debug('Sound: contexto remoto detectado, sonido silenciado');
    return;
  }

  const soundPath = path.join(extensionPath, 'media', filename);

  // Usar execFile (sin shell) para cada plataforma
  if (process.platform === 'darwin') {
    await execFileAsync('afplay', [soundPath]);
  } else if (process.platform === 'win32') {
    await execFileAsync('powershell', [
      '-NoProfile', '-Command',
      `(New-Object System.Media.SoundPlayer '${soundPath}').PlaySync()`,
    ]);
  } else {
    // Linux: intentar paplay, luego aplay
    try {
      await execFileAsync('paplay', [soundPath]);
    } catch {
      await execFileAsync('aplay', [soundPath]);
    }
  }
}

/** Sonido suave para modo soft (tuturu) */
export async function playSoft(): Promise<void> {
  await play('soft.mp3');
}

/** Sonido de alerta para modo strict (chat alert) */
export async function playAlert(): Promise<void> {
  await play('alert.mp3');
}
