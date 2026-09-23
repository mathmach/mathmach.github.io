import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { DOCS_INDEX, type DocItem } from '../../src/docsData.ts';
import type { Lang } from '../../src/i18n.ts';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../..');

test('docs index contains identical document IDs across all supported languages', () => {
  const languages: Lang[] = ['en', 'pt', 'es'];

  for (const lang of languages) {
    assert.ok(Array.isArray(DOCS_INDEX[lang]));
    assert.ok(DOCS_INDEX[lang].length > 0);
  }

  const enIds = DOCS_INDEX.en.map((item: DocItem) => item.id);
  const ptIds = DOCS_INDEX.pt.map((item: DocItem) => item.id);
  const esIds = DOCS_INDEX.es.map((item: DocItem) => item.id);

  assert.strictEqual(enIds.length, ptIds.length);
  assert.strictEqual(enIds.length, esIds.length);

  assert.deepStrictEqual(new Set(ptIds), new Set(enIds));
  assert.deepStrictEqual(new Set(esIds), new Set(enIds));
});

test('every document item conforms to structural metadata requirements', () => {
  const languages: Lang[] = ['en', 'pt', 'es'];
  const validCategories = new Set(['Architecture', 'Foundation']);

  for (const lang of languages) {
    for (const item of DOCS_INDEX[lang]) {
      assert.ok(typeof item.id === 'string' && item.id.length > 0);
      assert.ok(validCategories.has(item.category));
      assert.ok(typeof item.title === 'string' && item.title.trim().length > 0);
      assert.ok(typeof item.subtitle === 'string' && item.subtitle.trim().length > 0);
      assert.ok(typeof item.file === 'string' && item.file.endsWith('.md'));
      assert.match(item.readTime, /^\d+\s*min$/);
      assert.ok(Array.isArray(item.highlights));
      assert.ok(item.highlights.length >= 3);

      for (const highlight of item.highlights) {
        assert.ok(typeof highlight === 'string' && highlight.trim().length > 0);
      }
    }
  }
});

test('every registered document file exists in repository and public distribution', () => {
  const languages: Lang[] = ['en', 'pt', 'es'];

  for (const lang of languages) {
    for (const item of DOCS_INDEX[lang]) {
      const canonicalDocPath = path.resolve(projectRoot, 'docs', item.file);
      assert.ok(fs.existsSync(canonicalDocPath), `Canonical doc file missing: ${canonicalDocPath}`);

      const localizedPublicPath = path.resolve(projectRoot, 'public/docs', lang, item.file);
      const fallbackPublicPath = path.resolve(projectRoot, 'public/docs', item.file);

      const publicExists = fs.existsSync(localizedPublicPath) || fs.existsSync(fallbackPublicPath);
      assert.ok(
        publicExists,
        `Public mirror missing for ${item.id} (${lang}): checked ${localizedPublicPath} and ${fallbackPublicPath}`
      );
    }
  }
});
