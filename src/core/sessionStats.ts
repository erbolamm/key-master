import * as vscode from 'vscode';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';

/** Estructura de datos de estadísticas persistentes */
interface SessionStatsData {
  mouseClicksToday: number;
  mouseClicksTotal: number;
  shortcutsShownToday: Record<string, number>;
  streak: number;
  lastActiveDate: string;
}

// Clave para almacenamiento en globalState
const STATS_KEY = 'keymaster.stats';

let context: vscode.ExtensionContext | undefined;

/** Activa el módulo de estadísticas */
export function activate(ctx: vscode.ExtensionContext): void {
  context = ctx;

  // Actualizar racha al iniciar
  updateStreak();

  logger.info('SessionStats activado');
}

/** Desactiva el módulo de estadísticas */
export function deactivate(): void {
  context = undefined;
  logger.info('SessionStats desactivado');
}

/** Registra un clic de ratón detectado */
export function recordMouseClick(): void {
  const stats = getStats();
  stats.mouseClicksToday++;
  stats.mouseClicksTotal++;
  saveStats(stats);
}

/** Registra qué atajo se le mostró al usuario */
export function recordShortcutShown(commandId: string): void {
  const stats = getStats();
  stats.shortcutsShownToday[commandId] = (stats.shortcutsShownToday[commandId] ?? 0) + 1;
  saveStats(stats);
}

/** Devuelve los datos de estadísticas actuales */
export function getStats(): SessionStatsData {
  if (!context) {
    return getDefaultStats();
  }

  const stored = context.globalState.get<SessionStatsData>(STATS_KEY);
  if (!stored) {
    return getDefaultStats();
  }

  // Si cambió el día, resetear contadores diarios
  const today = getTodayDateString();
  if (stored.lastActiveDate !== today) {
    stored.mouseClicksToday = 0;
    stored.shortcutsShownToday = {};
    stored.lastActiveDate = today;
  }

  return stored;
}

/** Limpia todas las estadísticas */
export function clearStats(): void {
  const empty = getDefaultStats();
  saveStats(empty);
  logger.info('SessionStats: estadísticas limpiadas');
}

/** Muestra las estadísticas en un WebView sencillo */
export function showStatsPanel(): void {
  try {
    const stats = getStats();
    const isES = getConfig().language === 'es';
    const html = buildStatsHTML(stats, isES);

    const panel = vscode.window.createWebviewPanel(
      'keymasterStats',
      isES ? '📊 KeyMaster Estadísticas' : '📊 KeyMaster Statistics',
      vscode.ViewColumn.One,
      { enableScripts: false },
    );
    panel.webview.html = html;
  } catch (err) {
    logger.error('Error al mostrar estadísticas', err);
  }
}

/** Actualiza la racha de días consecutivos */
function updateStreak(): void {
  const stats = getStats();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (stats.lastActiveDate === yesterday) {
    stats.streak++;
  } else if (stats.lastActiveDate !== today) {
    stats.streak = 1;
  }

  stats.lastActiveDate = today;
  saveStats(stats);
}

/** Guarda las estadísticas en globalState */
function saveStats(stats: SessionStatsData): void {
  if (!context) { return; }
  try {
    context.globalState.update(STATS_KEY, stats);
  } catch (err) {
    logger.error('Error al guardar estadísticas', err);
  }
}

/** Devuelve estadísticas vacías por defecto */
function getDefaultStats(): SessionStatsData {
  return {
    mouseClicksToday: 0,
    mouseClicksTotal: 0,
    shortcutsShownToday: {},
    streak: 1,
    lastActiveDate: getTodayDateString(),
  };
}

/** Devuelve la fecha de hoy en formato ISO (YYYY-MM-DD) */
function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Devuelve la fecha de ayer en formato ISO */
function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Construye el HTML de estadísticas */
function buildStatsHTML(
  stats: SessionStatsData,
  isES: boolean,
): string {
  const top5 = getTop5Shortcuts(stats.shortcutsShownToday);
  const motivational = getMotivationalMessage(stats.streak, isES);

  return `<!DOCTYPE html>
<html lang="${isES ? 'es' : 'en'}">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src 'unsafe-inline';">
<style>
  body { background: #0d1117; color: #c9d1d9; font-family: system-ui; padding: 40px; }
  h1 { color: #58a6ff; margin-bottom: 24px; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
  .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #21262d; }
  .stat-label { color: #8b949e; }
  .stat-value { color: #58a6ff; font-weight: 700; font-size: 18px; }
  .motivational { background: linear-gradient(135deg, #667eea, #764ba2); padding: 16px; border-radius: 10px; color: white; font-size: 16px; text-align: center; margin-top: 16px; }
  .top-list { list-style: none; padding: 0; }
  .top-list li { padding: 6px 0; border-bottom: 1px solid #21262d; color: #c9d1d9; }
  .top-list li .count { color: #f85149; font-weight: 600; float: right; }
</style>
</head>
<body>
  <h1>📊 ${isES ? 'Estadísticas de KeyMaster' : 'KeyMaster Statistics'}</h1>
  <div class="card">
    <div class="stat-row">
      <span class="stat-label">${isES ? 'Clics de ratón hoy' : 'Mouse clicks today'}</span>
      <span class="stat-value">${stats.mouseClicksToday}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">${isES ? 'Clics de ratón totales' : 'Total mouse clicks'}</span>
      <span class="stat-value">${stats.mouseClicksTotal}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">${isES ? 'Racha de días activos' : 'Active days streak'}</span>
      <span class="stat-value">🔥 ${stats.streak}</span>
    </div>
  </div>
  <div class="card">
    <h3 style="color: #f85149; margin-bottom: 12px;">${isES ? 'Top 5 — Atajos más mostrados (repasa estos)' : 'Top 5 — Most shown shortcuts (practice these)'}</h3>
    <ul class="top-list">
      ${top5.length > 0
        ? top5.map(([cmd, count]) => `<li>${cmd} <span class="count">${count}×</span></li>`).join('')
        : `<li style="color:#8b949e">${isES ? 'Sin datos todavía' : 'No data yet'}</li>`}
    </ul>
  </div>
  <div class="motivational">${motivational}</div>
</body>
</html>`;
}

/** Devuelve los 5 atajos más mostrados */
function getTop5Shortcuts(
  shown: Record<string, number>,
): [string, number][] {
  return Object.entries(shown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

/** Devuelve un mensaje motivacional según la racha */
function getMotivationalMessage(streak: number, isES: boolean): string {
  if (streak >= 30) {
    return isES ? '🏆 ¡Maestro del teclado! 30+ días de racha.' : '🏆 Keyboard master! 30+ day streak.';
  }
  if (streak >= 7) {
    return isES ? '🔥 ¡Gran racha! Llevas ' + streak + ' días seguidos.' : '🔥 Great streak! ' + streak + ' consecutive days.';
  }
  if (streak >= 3) {
    return isES ? '💪 ¡Buen ritmo! ' + streak + ' días de práctica.' : '💪 Good pace! ' + streak + ' days of practice.';
  }
  return isES ? '🚀 ¡Sigue así! Cada día cuenta.' : '🚀 Keep going! Every day counts.';
}
