import { describe, expect, it } from 'vitest';
import { allLegacyQuestionsForMigration, bavariaQuestions, generalQuestions } from './question-bank';
import { bundeslaender, getStateQuestions, hasCompleteStateBank } from './bundeslaender';

describe('legacy question data extraction', () => {
  it('retains all 300 general questions', () => {
    expect(generalQuestions).toHaveLength(300);
  });

  it('retains all 10 Bavaria questions with their original IDs', () => {
    expect(bavariaQuestions).toHaveLength(10);
    expect(bavariaQuestions.map((question) => question.n)).toEqual(
      ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'],
    );
  });

  it('preserves every legacy question and unique ID', () => {
    expect(allLegacyQuestionsForMigration).toHaveLength(310);
    const ids = allLegacyQuestionsForMigration.map((question) => String(question.n));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has four options and a valid answer index for every question', () => {
    for (const question of allLegacyQuestionsForMigration) {
      expect(question.o).toHaveLength(4);
      expect(question.oe).toHaveLength(4);
      expect(question.a).toBeGreaterThanOrEqual(0);
      expect(question.a).toBeLessThan(4);
    }
  });

  it('registers all 16 Bundesländer without pretending missing banks are complete', () => {
    expect(bundeslaender).toHaveLength(16);
    expect(getStateQuestions('by')).toHaveLength(10);
    expect(hasCompleteStateBank('by')).toBe(true);
    expect(hasCompleteStateBank('he')).toBe(false);
    expect(getStateQuestions('he')).toEqual([]);
  });
});
