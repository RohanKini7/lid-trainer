import { describe, expect, it } from 'vitest';
import { allLegacyQuestionsForMigration, bavariaQuestions, generalQuestions } from './question-bank';
import { bundeslaender, getStateQuestions, hasCompleteStateBank, hasVerifiedStateBank } from './bundeslaender';

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

  it('adds all ten state questions to each of the 15 other Bundesländer with image placeholders', () => {
    const ids: string[] = [];
    for (const state of bundeslaender.filter((item) => item.code !== 'by')) {
      for (const question of getStateQuestions(state.code)) {
        ids.push(String(question.n));
        expect(question.t).toBe(state.code);
        expect(question.o).toHaveLength(4);
        expect(question.oe).toHaveLength(4);
        expect(question.a).toBeGreaterThanOrEqual(0);
        expect(question.a).toBeLessThan(4);
        const questionNumber = Number(String(question.n).replace(/^[A-Z]+/, ''));
        expect(questionNumber).toBeGreaterThanOrEqual(1);
        expect(questionNumber).toBeLessThanOrEqual(10);
        if (questionNumber === 1 || questionNumber === 8) expect(question.im).toBe('text-placeholder');
        else expect(question.im).toBeNull();
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('registers all 16 Bundesländer and requires real Q1/Q8 images for exam readiness', () => {
    expect(bundeslaender).toHaveLength(16);
    expect(getStateQuestions('by')).toHaveLength(10);
    expect(hasCompleteStateBank('by')).toBe(true);
    expect(hasVerifiedStateBank('by')).toBe(false);
    expect(getStateQuestions('by').find((question) => question.n === 'B1')?.im).not.toBe('text-placeholder');
    expect(getStateQuestions('by').find((question) => question.n === 'B8')?.im).not.toBe('text-placeholder');
    expect(hasCompleteStateBank('he')).toBe(false);
    expect(getStateQuestions('he')).toHaveLength(10);
    expect(getStateQuestions('he').map((question) => question.n)).toEqual(
      ['HE1', 'HE2', 'HE3', 'HE4', 'HE5', 'HE6', 'HE7', 'HE8', 'HE9', 'HE10'],
    );
    for (const state of bundeslaender.filter((item) => item.code !== 'by')) {
      expect(getStateQuestions(state.code), state.name).toHaveLength(10);
      expect(hasCompleteStateBank(state.code), state.name).toBe(false);
      expect(hasVerifiedStateBank(state.code), state.name).toBe(false);
    }
  });
});


describe('official state-bank verification ledger', () => {
  it('does not mark any state answer key verified before the BAMF online check is recorded', () => {
    for (const state of bundeslaender) {
      expect(hasVerifiedStateBank(state.code), state.name).toBe(false);
    }
  });
});


describe('state question-bank structural integrity', () => {
  it('contains exactly one non-empty question for each number 1–10 in every Bundesland', () => {
    for (const state of bundeslaender) {
      const questions = getStateQuestions(state.code);
      expect(questions, state.name).toHaveLength(10);
      const numbers = questions.map((question) => Number(String(question.n).replace(/^[A-Z]+/, ''))).sort((a, b) => a - b);
      expect(numbers, state.name).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      for (const question of questions) {
        expect(question.q.trim(), String(question.n)).not.toBe('');
        expect(question.e.trim(), String(question.n)).not.toBe('');
        expect(question.ea.trim(), String(question.n)).not.toBe('');
        expect(question.o, String(question.n)).toHaveLength(4);
        expect(question.oe, String(question.n)).toHaveLength(4);
        expect(question.o.every((option) => option.trim().length > 0), String(question.n)).toBe(true);
        expect(new Set(question.o).size, String(question.n)).toBe(4);
        expect(Number.isInteger(question.a), String(question.n)).toBe(true);
        expect(question.a, String(question.n)).toBeGreaterThanOrEqual(0);
        expect(question.a, String(question.n)).toBeLessThan(4);
      }
    }
  });
});
