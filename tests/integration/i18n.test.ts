import assert from 'node:assert/strict';
import test from 'node:test';
import { type Lang, translations } from '../../src/i18n.ts';

function extractKeyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  let paths: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      paths = paths.concat(extractKeyPaths(value as Record<string, unknown>, currentPath));
    } else {
      paths.push(currentPath);
    }
  }

  return paths;
}

function assertNoEmptyStrings(obj: Record<string, unknown>, pathPrefix = ''): void {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;

    if (typeof value === 'string') {
      assert.ok(value.trim().length > 0, `Empty translation string found at: ${currentPath}`);
    } else if (Array.isArray(value)) {
      assert.ok(value.length > 0, `Empty array found at: ${currentPath}`);
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === 'string') {
          assert.ok(item.trim().length > 0, `Empty string at ${currentPath}[${i}]`);
        } else if (item !== null && typeof item === 'object') {
          assertNoEmptyStrings(item as Record<string, unknown>, `${currentPath}[${i}]`);
        }
      }
    } else if (value !== null && typeof value === 'object') {
      assertNoEmptyStrings(value as Record<string, unknown>, currentPath);
    }
  }
}

test('all supported locales exist in translations', () => {
  const supportedLocales: Lang[] = ['en', 'pt', 'es'];

  for (const locale of supportedLocales) {
    assert.ok(translations[locale], `Missing locale dictionary for: ${locale}`);
  }
});

test('translations maintain strict key structure parity across all locales', () => {
  const enPaths = new Set(extractKeyPaths(translations.en));
  const ptPaths = new Set(extractKeyPaths(translations.pt));
  const esPaths = new Set(extractKeyPaths(translations.es));

  assert.deepStrictEqual(ptPaths, enPaths);
  assert.deepStrictEqual(esPaths, enPaths);
});

test('no translation entry contains empty or whitespace-only strings', () => {
  const supportedLocales: Lang[] = ['en', 'pt', 'es'];

  for (const locale of supportedLocales) {
    assertNoEmptyStrings(translations[locale], locale);
  }
});

test('collection lengths match exactly across all locales', () => {
  const locales: Lang[] = ['en', 'pt', 'es'];

  for (const loc of locales) {
    assert.strictEqual(translations[loc].exp.jobs.length, translations.en.exp.jobs.length);
    assert.strictEqual(translations[loc].methodology.pillars.length, translations.en.methodology.pillars.length);
    assert.strictEqual(translations[loc].methodology.workflow.length, translations.en.methodology.workflow.length);
    assert.strictEqual(translations[loc].tech.categories.length, translations.en.tech.categories.length);
    assert.strictEqual(translations[loc].hero.stats.length, translations.en.hero.stats.length);
  }
});
