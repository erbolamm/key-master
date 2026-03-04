import * as vscode from 'vscode';

// Niveles de log disponibles
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Canal de salida para los logs de KeyMaster
let outputChannel: vscode.OutputChannel | undefined;

// Nivel mínimo de log — DEBUG para diagnosticar problemas
let currentLevel: LogLevel = LogLevel.DEBUG;

/** Inicializa el logger creando el canal de salida */
function activate(): void {
  outputChannel = vscode.window.createOutputChannel('KeyMaster');
}

/** Libera el canal de salida */
function deactivate(): void {
  outputChannel?.dispose();
  outputChannel = undefined;
}

/** Escribe un mensaje con timestamp y nivel */
function log(level: LogLevel, message: string, ...args: unknown[]): void {
  if (level < currentLevel || !outputChannel) {
    return;
  }
  const timestamp = new Date().toISOString().slice(11, 23);
  const levelName = LogLevel[level];
  const extra = args.length > 0 ? ' ' + args.map(a => JSON.stringify(a)).join(' ') : '';
  outputChannel.appendLine(`[${timestamp}] [${levelName}] ${message}${extra}`);
}

/** Log de depuración */
function debug(message: string, ...args: unknown[]): void {
  log(LogLevel.DEBUG, message, ...args);
}

/** Log informativo */
function info(message: string, ...args: unknown[]): void {
  log(LogLevel.INFO, message, ...args);
}

/** Log de advertencia */
function warn(message: string, ...args: unknown[]): void {
  log(LogLevel.WARN, message, ...args);
}

/** Log de error */
function error(message: string, ...args: unknown[]): void {
  log(LogLevel.ERROR, message, ...args);
}

/** Establece el nivel mínimo de log */
function setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
  const map: Record<string, LogLevel> = {
    debug: LogLevel.DEBUG,
    info: LogLevel.INFO,
    warn: LogLevel.WARN,
    error: LogLevel.ERROR,
  };
  currentLevel = map[level] ?? LogLevel.INFO;
}

export const logger = {
  activate,
  deactivate,
  debug,
  info,
  warn,
  error,
  setLevel,
};
