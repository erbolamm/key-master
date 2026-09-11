import * as crypto from 'crypto';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as process from 'process';
import { shortcuts, ShortcutEntry, ShortcutCategory } from '../../data/shortcuts';
import { getConfig } from '../../utils/config';
import { logger } from '../../utils/logger';

export const SHORTCUTS_VIEW_TYPE = 'keymasterShortcuts';
export const SHORTCUTS_VIEW_ID = 'keymaster.shortcuts';

export function activateShortcutsPanel(context: vscode.ExtensionContext): void {
  const provider = new ShortcutsTreeProvider(context);
  const disposable = vscode.window.registerWebviewViewProvider(
    SHORTCUTS_VIEW_TYPE,
    provider,
  );
  context.subscriptions.push(disposable);

  // Command to open it manually
  const cmd = vscode.commands.registerCommand('keymaster.openShortcuts', () => {
    vscode.commands.executeCommand('keymaster.shortcuts.focus');
  });
  context.subscriptions.push(cmd);

  logger.info('ShortcutsPanel registrado');
}

class ShortcutsTreeProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _context: vscode.ExtensionContext) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    view.webview.options = {
      localResourceRoots: [
        vscode.Uri.file(
          path.join(this._context.extensionPath, 'src', 'ui', 'shortcutsPanel'),
        ),
      ],
      enableScripts: true,
    };
    view.webview.html = this._buildHtml();
    view.webview.onDidReceiveMessage(this._handleMessage.bind(this));
  }

  private _handleMessage(msg: {
    command: string;
    data?: unknown;
  }): void {
    if (msg.command === 'copy') {
      const text = String(msg.data ?? '');
      vscode.env.clipboard.writeText(text);
    }
  }

  private _nonce(): string {
    return crypto.randomBytes(16).toString('base64');
  }

  private _buildHtml(): string {
    const cfg = getConfig();
    const isES = cfg.language === 'es';
    const nonce = this._nonce();
    const extPath = this._context.extensionPath;

    // Build shortcut rows JSON for JS
    const rows = shortcuts.map((s) => this._shortcutToRow(s, isES));

    const htmlPath = path.join(extPath, 'src', 'ui', 'shortcutsPanel', 'shortcuts.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    html = html
      .replace(/\$\{nonce\}/g, nonce)
      .replace(/\$\{lang\}/g, isES ? 'es' : 'en')
      .replace(/\$\{title\}/g, isES ? 'Referencia de Atajos' : 'Shortcut Reference')
      .replace(/\${shortcutsJson}/g, JSON.stringify(rows))
      .replace(/\${categoriesJson\}/g, JSON.stringify(this._categories(isES)))
      .replace(/\${tSearch\}/g, isES ? 'Buscar atajo…' : 'Search shortcut…')
      .replace(/\${tAll\}/g, isES ? 'Todos' : 'All')
      .replace(/\${tCopy\}/g, isES ? 'Copiar' : 'Copy')
      .replace(/\${tCopied\}/g, isES ? '¡Copiado!' : 'Copied!')
      .replace(/\${tEmpty\}/g, isES ? 'Sin resultados' : 'No results');

    return html;
  }

  private _shortcutToRow(
    s: ShortcutEntry,
    isES: boolean,
  ): ShortcutRow {
    const shortcut = process.platform === 'darwin' ? s.shortcutMac : s.shortcutWin;
    return {
      id: s.command,
      command: s.command,
      shortcut,
      description: isES ? s.descriptionES : s.descriptionEN,
      category: s.category,
      categoryLabel: this._categoryLabel(s.category, isES),
    };
  }

  private _categoryLabel(cat: ShortcutCategory, isES: boolean): string {
    const map: Record<ShortcutCategory, { es: string; en: string }> = {
      navigation: { es: 'Navegación', en: 'Navigation' },
      editing: { es: 'Edición', en: 'Editing' },
      terminal: { es: 'Terminal', en: 'Terminal' },
      search: { es: 'Búsqueda', en: 'Search' },
      sidebar: { es: 'Barra lateral', en: 'Sidebar' },
      general: { es: 'General', en: 'General' },
      git: { es: 'Git', en: 'Git' },
    };
    return isES ? map[cat].es : map[cat].en;
  }

  private _categories(isES: boolean): { id: string; label: string }[] {
    return [
      { id: 'all', label: isES ? 'Todos' : 'All' },
      { id: 'navigation', label: this._categoryLabel('navigation', isES) },
      { id: 'editing', label: this._categoryLabel('editing', isES) },
      { id: 'terminal', label: this._categoryLabel('terminal', isES) },
      { id: 'search', label: this._categoryLabel('search', isES) },
      { id: 'sidebar', label: this._categoryLabel('sidebar', isES) },
      { id: 'general', label: this._categoryLabel('general', isES) },
      { id: 'git', label: this._categoryLabel('git', isES) },
    ];
  }
}

interface ShortcutRow {
  id: string;
  command: string;
  shortcut: string;
  description: string;
  category: ShortcutCategory;
  categoryLabel: string;
}
