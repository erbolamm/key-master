import * as assert from 'assert';
import {
  shortcuts,
  findShortcutByCommand,
  findShortcutsByCategory,
  getRandomShortcut,
  getShortcutForPlatform,
  getDescription,
} from '../../src/data/shortcuts';

suite('Shortcuts Database', () => {
  test('debe contener al menos 20 atajos', () => {
    assert.ok(shortcuts.length >= 20, `Solo hay ${shortcuts.length} atajos`);
  });

  test('cada atajo tiene todos los campos requeridos', () => {
    for (const s of shortcuts) {
      assert.ok(s.command, `Falta command en: ${JSON.stringify(s)}`);
      assert.ok(s.shortcutWin, `Falta shortcutWin en: ${s.command}`);
      assert.ok(s.shortcutMac, `Falta shortcutMac en: ${s.command}`);
      assert.ok(s.descriptionES, `Falta descriptionES en: ${s.command}`);
      assert.ok(s.descriptionEN, `Falta descriptionEN en: ${s.command}`);
      assert.ok(s.category, `Falta category en: ${s.command}`);
    }
  });

  test('findShortcutByCommand devuelve el atajo correcto', () => {
    const result = findShortcutByCommand('workbench.action.quickOpen');
    assert.ok(result, 'No encontró workbench.action.quickOpen');
    assert.strictEqual(result.shortcutWin, 'Ctrl+P');
  });

  test('findShortcutByCommand devuelve undefined para comando inexistente', () => {
    const result = findShortcutByCommand('comando.que.no.existe');
    assert.strictEqual(result, undefined);
  });

  test('findShortcutsByCategory devuelve atajos de navegación', () => {
    const navShortcuts = findShortcutsByCategory('navigation');
    assert.ok(navShortcuts.length > 0, 'No hay atajos de navegación');
    for (const s of navShortcuts) {
      assert.strictEqual(s.category, 'navigation');
    }
  });

  test('getRandomShortcut devuelve un atajo válido', () => {
    const random = getRandomShortcut();
    assert.ok(random.command, 'El atajo aleatorio no tiene command');
    assert.ok(random.shortcutWin, 'El atajo aleatorio no tiene shortcutWin');
  });

  test('getShortcutForPlatform devuelve el atajo según plataforma', () => {
    const entry = findShortcutByCommand('workbench.action.quickOpen')!;
    const shortcut = getShortcutForPlatform(entry);
    // En el entorno de test, depende de la plataforma real
    assert.ok(
      shortcut === 'Ctrl+P' || shortcut === 'Cmd+P',
      `Atajo inesperado: ${shortcut}`,
    );
  });

  test('getDescription devuelve descripción en español', () => {
    const entry = findShortcutByCommand('workbench.action.quickOpen')!;
    const desc = getDescription(entry, 'es');
    assert.ok(desc.length > 0, 'Descripción ES vacía');
  });

  test('getDescription devuelve descripción en inglés', () => {
    const entry = findShortcutByCommand('workbench.action.quickOpen')!;
    const desc = getDescription(entry, 'en');
    assert.ok(desc.length > 0, 'Descripción EN vacía');
  });

  test('no hay comandos duplicados', () => {
    const commands = shortcuts.map((s) => s.command);
    const unique = new Set(commands);
    assert.strictEqual(
      commands.length,
      unique.size,
      'Hay comandos duplicados en shortcuts',
    );
  });
});
