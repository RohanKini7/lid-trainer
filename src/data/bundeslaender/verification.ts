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
 * Bremen (HB1–HB10) was compared against pages 132–136, Hamburg (HH1–HH10)
 * against pages 137–141, Hessen (HE1–HE10) against pages 142–146, and
 * Mecklenburg-Vorpommern (MV1–MV10) against pages 147–151. Brandenburg Q4's
 * option order was corrected to match the catalogue.
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
  hb: { questionTextVerified: ['HB1', 'HB2', 'HB3', 'HB4', 'HB5', 'HB6', 'HB7', 'HB8', 'HB9', 'HB10'], answerKeysVerified: [] },
  hh: { questionTextVerified: ['HH1', 'HH2', 'HH3', 'HH4', 'HH5', 'HH6', 'HH7', 'HH8', 'HH9', 'HH10'], answerKeysVerified: [] },
  he: { questionTextVerified: ['HE1', 'HE2', 'HE3', 'HE4', 'HE5', 'HE6', 'HE7', 'HE8', 'HE9', 'HE10'], answerKeysVerified: [] },
  mv: { questionTextVerified: ['MV1', 'MV2', 'MV3', 'MV4', 'MV5', 'MV6', 'MV7', 'MV8', 'MV9', 'MV10'], answerKeysVerified: [] },
  ni: { questionTextVerified: ['NI1', 'NI2', 'NI3', 'NI4', 'NI5', 'NI6', 'NI7', 'NI8', 'NI9', 'NI10'], answerKeysVerified: [] },
  nw: { questionTextVerified: ['NW1', 'NW2', 'NW3', 'NW4', 'NW5', 'NW6', 'NW7', 'NW8', 'NW9', 'NW10'], answerKeysVerified: [] },
  rp: { questionTextVerified: ['RP1', 'RP2', 'RP3', 'RP4', 'RP5', 'RP6', 'RP7', 'RP8', 'RP9', 'RP10'], answerKeysVerified: [] },
  sl: { questionTextVerified: ['SL1', 'SL2', 'SL3', 'SL4', 'SL5', 'SL6', 'SL7', 'SL8', 'SL9', 'SL10'], answerKeysVerified: [] },
  sn: { questionTextVerified: ['SN1', 'SN2', 'SN3', 'SN4', 'SN5', 'SN6', 'SN7', 'SN8', 'SN9', 'SN10'], answerKeysVerified: [] },
  st: { questionTextVerified: ['ST1', 'ST2', 'ST3', 'ST4', 'ST5', 'ST6', 'ST7', 'ST8', 'ST9', 'ST10'], answerKeysVerified: [] },
  sh: { questionTextVerified: ['SH1', 'SH2', 'SH3', 'SH4', 'SH5', 'SH6', 'SH7', 'SH8', 'SH9', 'SH10'], answerKeysVerified: [] },
  th: { questionTextVerified: ['TH1', 'TH2', 'TH3', 'TH4', 'TH5', 'TH6', 'TH7', 'TH8', 'TH9', 'TH10'], answerKeysVerified: [] },
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
