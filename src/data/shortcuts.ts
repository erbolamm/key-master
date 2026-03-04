/**
 * Base de datos de atajos de teclado para VS Code.
 * Mínimo 40 atajos con cobertura completa de categorías.
 * Cada atajo incluye descripciones en español e inglés.
 */

export interface ShortcutEntry {
  /** ID del comando de VS Code */
  command: string;
  /** Atajo en Windows/Linux */
  shortcutWin: string;
  /** Atajo en macOS */
  shortcutMac: string;
  /** Descripción en español */
  descriptionES: string;
  /** Descripción en inglés */
  descriptionEN: string;
  /** Categoría del atajo */
  category: ShortcutCategory;
}

export type ShortcutCategory =
  | 'navigation'
  | 'editing'
  | 'terminal'
  | 'search'
  | 'sidebar'
  | 'general'
  | 'git';

export const shortcuts: ShortcutEntry[] = [
  // --- Navegación de archivos ---
  {
    command: 'workbench.action.quickOpen',
    shortcutWin: 'Ctrl+P',
    shortcutMac: 'Cmd+P',
    descriptionES: 'Abrir archivo rápido (Quick Open)',
    descriptionEN: 'Quick Open file',
    category: 'navigation',
  },
  {
    command: 'workbench.action.nextEditor',
    shortcutWin: 'Ctrl+Tab',
    shortcutMac: 'Ctrl+Tab',
    descriptionES: 'Cambiar a la siguiente pestaña',
    descriptionEN: 'Switch to next editor tab',
    category: 'navigation',
  },
  {
    command: 'workbench.action.previousEditor',
    shortcutWin: 'Ctrl+Shift+Tab',
    shortcutMac: 'Ctrl+Shift+Tab',
    descriptionES: 'Cambiar a la pestaña anterior',
    descriptionEN: 'Switch to previous editor tab',
    category: 'navigation',
  },
  {
    command: 'workbench.action.closeActiveEditor',
    shortcutWin: 'Ctrl+W',
    shortcutMac: 'Cmd+W',
    descriptionES: 'Cerrar pestaña activa',
    descriptionEN: 'Close active editor tab',
    category: 'navigation',
  },
  {
    command: 'workbench.action.gotoLine',
    shortcutWin: 'Ctrl+G',
    shortcutMac: 'Ctrl+G',
    descriptionES: 'Ir a una línea específica',
    descriptionEN: 'Go to specific line',
    category: 'navigation',
  },
  // --- Paleta y comandos generales ---
  {
    command: 'workbench.action.showCommands',
    shortcutWin: 'Ctrl+Shift+P',
    shortcutMac: 'Cmd+Shift+P',
    descriptionES: 'Abrir paleta de comandos',
    descriptionEN: 'Open Command Palette',
    category: 'general',
  },
  {
    command: 'workbench.action.openSettings',
    shortcutWin: 'Ctrl+,',
    shortcutMac: 'Cmd+,',
    descriptionES: 'Abrir ajustes',
    descriptionEN: 'Open Settings',
    category: 'general',
  },
  {
    command: 'workbench.action.openGlobalKeybindings',
    shortcutWin: 'Ctrl+K Ctrl+S',
    shortcutMac: 'Cmd+K Cmd+S',
    descriptionES: 'Abrir atajos de teclado',
    descriptionEN: 'Open Keyboard Shortcuts',
    category: 'general',
  },
  // --- Edición ---
  {
    command: 'editor.action.moveLinesUpAction',
    shortcutWin: 'Alt+↑',
    shortcutMac: 'Option+↑',
    descriptionES: 'Mover línea hacia arriba',
    descriptionEN: 'Move line up',
    category: 'editing',
  },
  {
    command: 'editor.action.moveLinesDownAction',
    shortcutWin: 'Alt+↓',
    shortcutMac: 'Option+↓',
    descriptionES: 'Mover línea hacia abajo',
    descriptionEN: 'Move line down',
    category: 'editing',
  },
  {
    command: 'editor.action.addSelectionToNextFindMatch',
    shortcutWin: 'Ctrl+D',
    shortcutMac: 'Cmd+D',
    descriptionES: 'Seleccionar siguiente coincidencia',
    descriptionEN: 'Add selection to next find match',
    category: 'editing',
  },
  {
    command: 'editor.action.commentLine',
    shortcutWin: 'Ctrl+/',
    shortcutMac: 'Cmd+/',
    descriptionES: 'Comentar/descomentar línea',
    descriptionEN: 'Toggle line comment',
    category: 'editing',
  },
  {
    command: 'editor.action.formatDocument',
    shortcutWin: 'Shift+Alt+F',
    shortcutMac: 'Shift+Option+F',
    descriptionES: 'Formatear documento',
    descriptionEN: 'Format document',
    category: 'editing',
  },
  // --- Búsqueda ---
  {
    command: 'actions.find',
    shortcutWin: 'Ctrl+F',
    shortcutMac: 'Cmd+F',
    descriptionES: 'Buscar en archivo',
    descriptionEN: 'Find in file',
    category: 'search',
  },
  {
    command: 'workbench.action.findInFiles',
    shortcutWin: 'Ctrl+Shift+F',
    shortcutMac: 'Cmd+Shift+F',
    descriptionES: 'Buscar en todos los archivos',
    descriptionEN: 'Find in all files',
    category: 'search',
  },
  {
    command: 'editor.action.startFindReplaceAction',
    shortcutWin: 'Ctrl+H',
    shortcutMac: 'Cmd+Option+F',
    descriptionES: 'Buscar y reemplazar',
    descriptionEN: 'Find and replace',
    category: 'search',
  },
  // --- Terminal ---
  {
    command: 'workbench.action.terminal.toggleTerminal',
    shortcutWin: 'Ctrl+`',
    shortcutMac: 'Ctrl+`',
    descriptionES: 'Abrir/cerrar terminal integrado',
    descriptionEN: 'Toggle integrated terminal',
    category: 'terminal',
  },
  // --- Panel lateral ---
  {
    command: 'workbench.action.toggleSidebarVisibility',
    shortcutWin: 'Ctrl+B',
    shortcutMac: 'Cmd+B',
    descriptionES: 'Mostrar/ocultar barra lateral',
    descriptionEN: 'Toggle sidebar visibility',
    category: 'sidebar',
  },
  {
    command: 'workbench.view.explorer',
    shortcutWin: 'Ctrl+Shift+E',
    shortcutMac: 'Cmd+Shift+E',
    descriptionES: 'Abrir explorador de archivos',
    descriptionEN: 'Open file explorer',
    category: 'sidebar',
  },
  // --- Ir a definición / referencias ---
  {
    command: 'editor.action.revealDefinition',
    shortcutWin: 'F12',
    shortcutMac: 'F12',
    descriptionES: 'Ir a definición',
    descriptionEN: 'Go to definition',
    category: 'navigation',
  },
  // --- Git ---
  {
    command: 'workbench.view.scm',
    shortcutWin: 'Ctrl+Shift+G',
    shortcutMac: 'Ctrl+Shift+G',
    descriptionES: 'Abrir panel de control de código fuente (Git)',
    descriptionEN: 'Open Source Control panel (Git)',
    category: 'git',
  },
  {
    command: 'git.commit',
    shortcutWin: 'Ctrl+Shift+G G',
    shortcutMac: 'Ctrl+Shift+G G',
    descriptionES: 'Confirmar cambios (Git commit)',
    descriptionEN: 'Commit changes (Git commit)',
    category: 'git',
  },
  {
    command: 'git.push',
    shortcutWin: 'Ctrl+Shift+G P',
    shortcutMac: 'Ctrl+Shift+G P',
    descriptionES: 'Enviar cambios al repositorio (Git push)',
    descriptionEN: 'Push changes to remote (Git push)',
    category: 'git',
  },
  {
    command: 'git.fetch',
    shortcutWin: 'Ctrl+Shift+G F',
    shortcutMac: 'Ctrl+Shift+G F',
    descriptionES: 'Obtener cambios del remoto (Git fetch)',
    descriptionEN: 'Fetch changes from remote (Git fetch)',
    category: 'git',
  },
  {
    command: 'git.stash',
    shortcutWin: 'Alt+F5',
    shortcutMac: 'Option+F5',
    descriptionES: 'Guardar cambios temporalmente (Git stash)',
    descriptionEN: 'Stash changes (Git stash)',
    category: 'git',
  },
  {
    command: 'git.stashPop',
    shortcutWin: 'Shift+Alt+F5',
    shortcutMac: 'Shift+Option+F5',
    descriptionES: 'Restaurar cambios guardados (Git stash pop)',
    descriptionEN: 'Restore stashed changes (Git stash pop)',
    category: 'git',
  },
  // --- Terminal avanzado ---
  {
    command: 'workbench.action.terminal.split',
    shortcutWin: 'Ctrl+Shift+5',
    shortcutMac: 'Cmd+\\',
    descriptionES: 'Dividir terminal',
    descriptionEN: 'Split terminal',
    category: 'terminal',
  },
  {
    command: 'workbench.action.terminal.new',
    shortcutWin: 'Ctrl+Shift+`',
    shortcutMac: 'Ctrl+Shift+`',
    descriptionES: 'Crear nuevo terminal',
    descriptionEN: 'Create new terminal',
    category: 'terminal',
  },
  {
    command: 'workbench.action.terminal.openNativeConsole',
    shortcutWin: 'Ctrl+Shift+C',
    shortcutMac: 'Cmd+Shift+C',
    descriptionES: 'Abrir terminal externo del sistema',
    descriptionEN: 'Open native console',
    category: 'terminal',
  },
  {
    command: 'workbench.action.terminal.scrollDown',
    shortcutWin: 'Ctrl+Alt+↓',
    shortcutMac: 'Cmd+↓',
    descriptionES: 'Desplazar terminal hacia abajo',
    descriptionEN: 'Scroll terminal down',
    category: 'terminal',
  },
  // --- Edición avanzada ---
  {
    command: 'editor.action.deleteLines',
    shortcutWin: 'Ctrl+Shift+K',
    shortcutMac: 'Cmd+Shift+K',
    descriptionES: 'Eliminar línea completa',
    descriptionEN: 'Delete entire line',
    category: 'editing',
  },
  {
    command: 'editor.action.insertLineAfter',
    shortcutWin: 'Ctrl+Enter',
    shortcutMac: 'Cmd+Enter',
    descriptionES: 'Insertar línea debajo',
    descriptionEN: 'Insert line below',
    category: 'editing',
  },
  {
    command: 'editor.action.insertLineBefore',
    shortcutWin: 'Ctrl+Shift+Enter',
    shortcutMac: 'Cmd+Shift+Enter',
    descriptionES: 'Insertar línea encima',
    descriptionEN: 'Insert line above',
    category: 'editing',
  },
  {
    command: 'editor.action.copyLinesDownAction',
    shortcutWin: 'Shift+Alt+↓',
    shortcutMac: 'Shift+Option+↓',
    descriptionES: 'Duplicar línea hacia abajo',
    descriptionEN: 'Copy line down',
    category: 'editing',
  },
  {
    command: 'editor.action.selectHighlights',
    shortcutWin: 'Ctrl+Shift+L',
    shortcutMac: 'Cmd+Shift+L',
    descriptionES: 'Seleccionar todas las coincidencias',
    descriptionEN: 'Select all occurrences',
    category: 'editing',
  },
  {
    command: 'editor.action.indentLines',
    shortcutWin: 'Ctrl+]',
    shortcutMac: 'Cmd+]',
    descriptionES: 'Indentar línea',
    descriptionEN: 'Indent line',
    category: 'editing',
  },
  {
    command: 'editor.action.outdentLines',
    shortcutWin: 'Ctrl+[',
    shortcutMac: 'Cmd+[',
    descriptionES: 'Desindentar línea',
    descriptionEN: 'Outdent line',
    category: 'editing',
  },
  // --- Navegación avanzada ---
  {
    command: 'workbench.action.gotoSymbol',
    shortcutWin: 'Ctrl+Shift+O',
    shortcutMac: 'Cmd+Shift+O',
    descriptionES: 'Ir a símbolo en archivo',
    descriptionEN: 'Go to symbol in file',
    category: 'navigation',
  },
  {
    command: 'workbench.action.navigateBack',
    shortcutWin: 'Alt+←',
    shortcutMac: 'Ctrl+-',
    descriptionES: 'Volver a la posición anterior',
    descriptionEN: 'Navigate back',
    category: 'navigation',
  },
  {
    command: 'workbench.action.navigateForward',
    shortcutWin: 'Alt+→',
    shortcutMac: 'Ctrl+Shift+-',
    descriptionES: 'Ir a la posición siguiente',
    descriptionEN: 'Navigate forward',
    category: 'navigation',
  },
  {
    command: 'workbench.action.closeAllEditors',
    shortcutWin: 'Ctrl+K Ctrl+W',
    shortcutMac: 'Cmd+K Cmd+W',
    descriptionES: 'Cerrar todas las pestañas',
    descriptionEN: 'Close all editors',
    category: 'navigation',
  },
  {
    command: 'editor.action.goToReferences',
    shortcutWin: 'Shift+F12',
    shortcutMac: 'Shift+F12',
    descriptionES: 'Ver todas las referencias',
    descriptionEN: 'Show all references',
    category: 'navigation',
  },
];

/**
 * Busca un atajo por el ID de comando.
 * Devuelve undefined si no se encuentra.
 */
export function findShortcutByCommand(command: string): ShortcutEntry | undefined {
  return shortcuts.find((s) => s.command === command);
}

/**
 * Busca atajos por categoría.
 */
export function findShortcutsByCategory(category: ShortcutCategory): ShortcutEntry[] {
  return shortcuts.filter((s) => s.category === category);
}

/**
 * Devuelve un atajo aleatorio de la base de datos.
 * Útil para mostrar sugerencias cuando se detecta un clic genérico.
 */
export function getRandomShortcut(): ShortcutEntry {
  const index = Math.floor(Math.random() * shortcuts.length);
  return shortcuts[index];
}

/**
 * Devuelve el atajo formateado para la plataforma actual.
 */
export function getShortcutForPlatform(entry: ShortcutEntry): string {
  return process.platform === 'darwin' ? entry.shortcutMac : entry.shortcutWin;
}

/**
 * Devuelve la descripción en el idioma indicado.
 */
export function getDescription(entry: ShortcutEntry, lang: 'es' | 'en'): string {
  return lang === 'es' ? entry.descriptionES : entry.descriptionEN;
}
