import type { BundeslandCode, Question } from '../../types/question';

/**
 * Verification ledger for state-specific questions.
 *
 * The BAMF PDF publishes question wording and options, but not the answer key.
 * Correct answers must therefore be checked in the official BAMF online test
 * centre, one question at a time. Do not populate these lists from an
 * unofficial answer key or mark a bank verified based on plausibility.
 *
 * Source catalogue: BAMF Gesamtfragenkatalog, Stand 07.05.2025.
 * Baden-Württemberg question wording/options (BW1–BW10) were compared
 * against pages 112–116. Bayern question wording/options (B1–B10) were
 * compared against pages 117–121. Berlin (BE1–BE10) was compared against
 * pages 122–126, and Brandenburg (BB1–BB10) against pages 127–131.
 * Brandenburg Q4's option order was corrected to match the catalogue.
 * No answer keys are marked verified here.
 * Official answer feedback: https://oet.bamf.de/ords/oetut/f?p=534:1:0
 */
export const stateBankVerification: Record<BundeslandCode, {
  questionTextVerified: string[];
  answerKeysVerified: string[];
}> = {
  bw: { questionTextVerified: ['BW1', 'BW2', 'BW3', 'BW4', 'BW5', 'BW6', 'BW7', 'BW8', 'BW9', 'BW10'], answerKeysVerified: [] },
  by: { questionTextVerified: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'], answerKeysVerified: [] },
  be: { questionTextVerified: ['BE1', 'BE2', 'BE3', 'BE4', 'BE5', 'BE6', 'BE7', 'BE8', 'BE9', 'BE10'], answerKeysVerified: [] },
  bb: { questionTextVerified: ['BB1', 'BB2', 'BB3', 'BB4', 'BB5', 'BB6', 'BB7', 'BB8', 'BB9', 'BB10'], answerKeysVerified: [] },
  hb: { questionTextVerified: [], answerKeysVerified: [] },
  hh: { questionTextVerified: [], answerKeysVerified: [] },
  he: { questionTextVerified: [], answerKeysVerified: [] },
  mv: { questionTextVerified: [], answerKeysVerified: [] },
  ni: { questionTextVerified: [], answerKeysVerified: [] },
  nw: { questionTextVerified: [], answerKeysVerified: [] },
  rp: { questionTextVerified: [], answerKeysVerified: [] },
  sl: { questionTextVerified: [], answerKeysVerified: [] },
  sn: { questionTextVerified: [], answerKeysVerified: [] },
  st: { questionTextVerified: [], answerKeysVerified: [] },
  sh: { questionTextVerified: [], answerKeysVerified: [] },
  th: { questionTextVerified: [], answerKeysVerified: [] },
};

/** True only when all ten exact question IDs and all ten answer keys are checked. */
export function hasVerifiedStateBank(code: BundeslandCode, questions: Question[]): boolean {
  const verification = stateBankVerification[code];
  if (questions.length !== 10 || !verification) return false;

  const expectedIds = questions.map((question) => String(question.n));
  return expectedIds.every((id) =>
    verification.questionTextVerified.includes(id) &&
    verification.answerKeysVerified.includes(id),
  ) &&
    new Set(verification.questionTextVerified).size === 10 &&
    new Set(verification.answerKeysVerified).size === 10;
}
