import * as path from 'path';
import { exec } from 'child_process';
import { logger } from './logger';

let extensionPath = '';

/** Inicializa el módulo de sonido con la ruta de la extensión */
export function init(extPath: string): void {
  extensionPath = extPath;
}

/** Reproduce un archivo de sonido de la carpeta media/ */
export function play(filename: string): void {
  if (!extensionPath) {
    logger.warn('Sound: extensionPath no inicializado');
    return;
  }

  const soundPath = path.join(extensionPath, 'media', filename);

  // macOS: afplay, Windows: powershell, Linux: paplay/aplay
  let cmd: string;
  if (process.platform === 'darwin') {
    cmd = `afplay "${soundPath}"`;
  } else if (process.platform === 'win32') {
    cmd = `powershell -c "(New-Object System.Media.SoundPlayer '${soundPath}').PlaySync()"`;
  } else {
    cmd = `paplay "${soundPath}" 2>/dev/null || aplay "${soundPath}" 2>/dev/null`;
  }

  exec(cmd, (err) => {
    if (err) {
      logger.warn(`Sound: error reproduciendo ${filename}`, err.message);
    }
  });
}

/** Sonido suave para modo soft (tuturu) */
export function playSoft(): void {
  play('soft.mp3');
}

/** Sonido de alerta para modo strict (chat alert) */
export function playAlert(): void {
  play('alert.mp3');
}
