import { describe, expect, it } from 'vitest';
import { allLegacyQuestionsForMigration, bavariaQuestions, generalQuestions } from './question-bank';
import { bundeslaender, getStateQuestions, hasCompleteStateBank, hasVerifiedStateBank } from './bundeslaender';
import { stateBankVerification } from './bundeslaender/verification';

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

  it('registers all 16 Bundesländer and treats ten questions as a complete bank while illustrations are deferred', () => {
    expect(bundeslaender).toHaveLength(16);
    expect(getStateQuestions('by')).toHaveLength(10);
    expect(hasCompleteStateBank('by')).toBe(true);
    expect(hasVerifiedStateBank('by')).toBe(false);
    expect(getStateQuestions('by').find((question) => question.n === 'B1')?.im).not.toBe('text-placeholder');
    expect(getStateQuestions('by').find((question) => question.n === 'B8')?.im).not.toBe('text-placeholder');
    expect(hasCompleteStateBank('he')).toBe(true);
    expect(getStateQuestions('he')).toHaveLength(10);
    expect(getStateQuestions('he').map((question) => question.n)).toEqual(
      ['HE1', 'HE2', 'HE3', 'HE4', 'HE5', 'HE6', 'HE7', 'HE8', 'HE9', 'HE10'],
    );
    for (const state of bundeslaender.filter((item) => item.code !== 'by')) {
      expect(getStateQuestions(state.code), state.name).toHaveLength(10);
      expect(hasCompleteStateBank(state.code), state.name).toBe(true);
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


describe('state-bank verification ledger behaviour', () => {
  it('keeps Brandenburg question 4 options in the official BAMF order', () => {
    const question = getStateQuestions('bb').find((item) => item.n === 'BB4');
    expect(question?.o).toEqual(['14', '16', '18', '20']);
    expect(question?.a).toBe(1);
  });


  it('matches the independently cross-checked answer keys for all illustration-based state questions', () => {
    // Cross-check reference: Level Exams states that its keys were compiled from
    // two independent solutions and checked against the BAMF online question
    // catalogue. This is a secondary cross-check, not the project's direct
    // official verification ledger.
    const expected: Record<string, [number, number]> = {
      bw: [0, 1], by: [1, 3], be: [3, 3], bb: [0, 3],
      hb: [2, 0], hh: [1, 2], he: [0, 2], mv: [2, 2],
      ni: [2, 0], nw: [1, 2], rp: [0, 0], sl: [3, 1],
      sn: [3, 3], st: [3, 2], sh: [2, 0], th: [3, 1],
    };

    for (const state of bundeslaender) {
      const questions = getStateQuestions(state.code);
      const q1 = questions.find((question) => String(question.n).endsWith('1'));
      const q8 = questions.find((question) => String(question.n).endsWith('8'));
      expect(q1?.a, `${state.code} Q1 coat of arms`).toBe(expected[state.code][0]);
      expect(q8?.a, `${state.code} Q8 map`).toBe(expected[state.code][1]);
    }
  });

  it('requires all ten exact IDs in both verification lists', () => {
    const entry = stateBankVerification.by;
    const originalTextChecks = [...entry.questionTextVerified];
    const originalAnswerChecks = [...entry.answerKeysVerified];
    const ids = getStateQuestions('by').map((question) => String(question.n));

    try {
      entry.questionTextVerified.splice(0, entry.questionTextVerified.length, ...ids);
      entry.answerKeysVerified.splice(0, entry.answerKeysVerified.length, ...ids);
      expect(hasVerifiedStateBank('by')).toBe(true);
      entry.answerKeysVerified.pop();
      expect(hasVerifiedStateBank('by')).toBe(false);
    } finally {
      entry.questionTextVerified.splice(0, entry.questionTextVerified.length, ...originalTextChecks);
      entry.answerKeysVerified.splice(0, entry.answerKeysVerified.length, ...originalAnswerChecks);
    }
  });
});

describe('remaining state-bank BAMF transcription corrections', () => {
  it('uses the catalogue wording and gendered option order for Q9 and Q10', () => {
    const audited = ['ni', 'nw', 'rp', 'sl', 'sn', 'st', 'sh', 'th'] as const;
    const q9Options = [
      'Erste Ministerin/Erster Minister',
      'Premierministerin/Premierminister',
      'Bürgermeisterin/Bürgermeister',
      'Ministerpräsidentin/Ministerpräsident',
    ];
    const q10Options = [
      'Justizministerin/Justizminister',
      'Außenministerin/Außenminister',
      'Finanzministerin/Finanzminister',
      'Innenministerin/Innenminister',
    ];

    for (const code of audited) {
      const questions = getStateQuestions(code);
      const q9 = questions.find((question) => String(question.n).endsWith('9'));
      const q10 = questions.find((question) => String(question.n).endsWith('10'));
      expect(q9?.q).toContain('Wie nennt man die Regierungschefin/den Regierungschef');
      expect(q9?.o).toEqual(q9Options);
      expect(q10?.q).toContain('Welche Ministerin/welchen Minister');
      expect(q10?.o).toEqual(q10Options);
    }
  });

  it('keeps Saarland Q8 wording and Thüringen Q4 options in BAMF order', () => {
    const saarlandQ8 = getStateQuestions('sl').find((question) => question.n === 'SL8');
    expect(saarlandQ8?.q).toBe('Welches Bundesland ist das Saarland?');

    const thuringiaQ4 = getStateQuestions('th').find((question) => question.n === 'TH4');
    expect(thuringiaQ4?.o).toEqual(['14', '16', '18', '20']);
    expect(thuringiaQ4?.a).toBe(1);
  });

  it('uses the official Schleswig-Holstein civic-education option wording', () => {
    const question = getStateQuestions('sh').find((item) => item.n === 'SH6');
    expect(question?.o[2]).toBe('beim / bei der Landesbeauftragten für politische Bildung');
  });
});
