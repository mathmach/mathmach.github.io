import test from 'node:test';
import assert from 'node:assert/strict';
import { CAREER_START_YEAR, getYearsOfExperience, YEARS_OF_EXPERIENCE } from '../../src/domain/constants.ts';
import { translations } from '../../src/i18n.ts';

test('experience calculation returns correct delta from 2016', () => {
  assert.strictEqual(CAREER_START_YEAR, 2016);
  assert.strictEqual(getYearsOfExperience(2016), 0);
  assert.strictEqual(getYearsOfExperience(2024), 8);
  assert.strictEqual(getYearsOfExperience(2026), 10);
  assert.strictEqual(getYearsOfExperience(2030), 14);
});

test('YEARS_OF_EXPERIENCE matches current year calculation', () => {
  const currentYear = new Date().getFullYear();
  assert.strictEqual(YEARS_OF_EXPERIENCE, currentYear - 2016);
});

test('translations include dynamic years of experience across all locales', () => {
  const expectedValue = `${YEARS_OF_EXPERIENCE}+`;

  assert.ok(translations.en.hero.subtitle.includes(`${YEARS_OF_EXPERIENCE} years`));
  assert.strictEqual(translations.en.hero.stats[0].value, `${expectedValue} Years`);

  assert.ok(translations.pt.hero.subtitle.includes(`${YEARS_OF_EXPERIENCE} anos`));
  assert.strictEqual(translations.pt.hero.stats[0].value, `${expectedValue} Anos`);

  assert.ok(translations.es.hero.subtitle.includes(`${YEARS_OF_EXPERIENCE} años`));
  assert.strictEqual(translations.es.hero.stats[0].value, `${expectedValue} Años`);
});

