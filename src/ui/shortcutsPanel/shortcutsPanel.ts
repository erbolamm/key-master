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
    vscode.commands.executeCommand('keymasterShortcuts.focus');
  });
  context.subscriptions.push(cmd);

  logger.info('ShortcutsPanel registrado');
}

class ShortcutsTreeProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _context: vscode.ExtensionContext) {}

  resolveWebviewView(view: vscode.WebviewView): void {
    const extPath = this._context.extensionPath;
    view.webview.options = {
      localResourceRoots: [
        vscode.Uri.file(path.join(extPath, 'src', 'ui', 'shortcutsPanel')),
        vscode.Uri.file(path.join(extPath, 'media')),
      ],
      enableScripts: true,
    };

    const iconCorrectorUri = view.webview.asWebviewUri(
      vscode.Uri.file(path.join(extPath, 'media', 'icons', 'corrector.png'))
    );
    const iconAiUri = view.webview.asWebviewUri(
      vscode.Uri.file(path.join(extPath, 'media', 'icons', 'apliarte-ai.png'))
    );
    const iconKeymasterUri = view.webview.asWebviewUri(
      vscode.Uri.file(path.join(extPath, 'media', 'icons', 'keymaster.png'))
    );

    view.webview.html = this._buildHtml(
      view.webview.cspSource,
      iconCorrectorUri.toString(),
      iconAiUri.toString(),
      iconKeymasterUri.toString()
    );
    view.webview.onDidReceiveMessage((msg) => this._handleMessage(msg, view));

    // Send ecosystem status initially
    this._sendEcosystemStatus(view);
  }

  private _handleMessage(
    msg: {
      command: string;
      data?: unknown;
      id?: string;
      url?: string;
    },
    view: vscode.WebviewView
  ): void {
    if (msg.command === 'copy') {
      const text = String(msg.data ?? '');
      vscode.env.clipboard.writeText(text);
    } else if (msg.command === 'openExtension') {
      const ext = msg.id;
      if (ext === 'corrector') {
        const hasCorr = Boolean(vscode.extensions?.getExtension?.('apliarte.corrector-espanol'));
        if (hasCorr) {
          try {
            vscode.commands.executeCommand('corrector.iaLocalView.focus');
          } catch {
            vscode.commands.executeCommand('workbench.view.extension.apliarteCorrector');
          }
        } else {
          vscode.commands.executeCommand('workbench.extensions.search', 'apliarte.corrector-espanol');
        }
      } else if (ext === 'apliarte-ai') {
        const hasAi = Boolean(vscode.extensions?.getExtension?.('apliarte.apliarte-ai'));
        if (hasAi) {
          try {
            vscode.commands.executeCommand('apliarteAi.chatView.focus');
          } catch {
            vscode.commands.executeCommand('workbench.view.extension.apliarteAi');
          }
        } else {
          vscode.commands.executeCommand('workbench.extensions.search', 'apliarte.apliarte-ai');
        }
      }
    } else if (msg.command === 'openExternal') {
      if (msg.url) {
        vscode.env.openExternal(vscode.Uri.parse(msg.url));
      }
    } else if (msg.command === 'requestEcosystemStatus') {
      this._sendEcosystemStatus(view);
    }
  }

  private _sendEcosystemStatus(view: vscode.WebviewView): void {
    const hasCorr = Boolean(vscode.extensions?.getExtension?.('apliarte.corrector-espanol'));
    const hasAi = Boolean(vscode.extensions?.getExtension?.('apliarte.apliarte-ai'));
    view.webview.postMessage({
      type: 'ecosystemStatus',
      installed: {
        corrector: hasCorr,
        'apliarte-ai': hasAi,
        keymaster: true,
      },
    });
  }

  private _nonce(): string {
    return crypto.randomBytes(16).toString('base64');
  }

  private _buildHtml(
    cspSource: string,
    iconCorrectorUri: string,
    iconAiUri: string,
    iconKeymasterUri: string
  ): string {
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
      .replace(/\$\{cspSource\}/g, cspSource)
      .replace(/\$\{iconCorrectorUri\}/g, iconCorrectorUri)
      .replace(/\$\{iconAiUri\}/g, iconAiUri)
      .replace(/\$\{iconKeymasterUri\}/g, iconKeymasterUri)
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
