import type { Bundesland, BundeslandCode, Question } from '../../types/question';
import { bavariaQuestions } from '../question-bank';
import { partialStateQuestionBanks } from './partial-questions';
import { getQuestionImage } from '../images';

export const bundeslaender: Bundesland[] = [
  { code: 'bw', name: 'Baden-Württemberg', nameEn: 'Baden-Württemberg' },
  { code: 'by', name: 'Bayern', nameEn: 'Bavaria' },
  { code: 'be', name: 'Berlin', nameEn: 'Berlin' },
  { code: 'bb', name: 'Brandenburg', nameEn: 'Brandenburg' },
  { code: 'hb', name: 'Bremen', nameEn: 'Bremen' },
  { code: 'hh', name: 'Hamburg', nameEn: 'Hamburg' },
  { code: 'he', name: 'Hessen', nameEn: 'Hesse' },
  { code: 'mv', name: 'Mecklenburg-Vorpommern', nameEn: 'Mecklenburg-Western Pomerania' },
  { code: 'ni', name: 'Niedersachsen', nameEn: 'Lower Saxony' },
  { code: 'nw', name: 'Nordrhein-Westfalen', nameEn: 'North Rhine-Westphalia' },
  { code: 'rp', name: 'Rheinland-Pfalz', nameEn: 'Rhineland-Palatinate' },
  { code: 'sl', name: 'Saarland', nameEn: 'Saarland' },
  { code: 'sn', name: 'Sachsen', nameEn: 'Saxony' },
  { code: 'st', name: 'Sachsen-Anhalt', nameEn: 'Saxony-Anhalt' },
  { code: 'sh', name: 'Schleswig-Holstein', nameEn: 'Schleswig-Holstein' },
  { code: 'th', name: 'Thüringen', nameEn: 'Thuringia' },
];

const stateQuestionBanks: Partial<Record<BundeslandCode, Question[]>> = {
  by: bavariaQuestions,
  ...partialStateQuestionBanks,
};

/** Returns all ten transcribed questions for the selected Bundesland. */
export function getStateQuestions(code: BundeslandCode): Question[] {
  return stateQuestionBanks[code] ?? [];
}

export function hasCompleteStateBank(code: BundeslandCode): boolean {
  const questions = getStateQuestions(code);
  if (questions.length !== 10) return false;

  // Q1 (coat of arms) and Q8 (map) are required visual questions in every
  // Bundesland bank. A text placeholder must never make a bank exam-ready.
  const requiredImageQuestions = questions.filter((question) => {
    const number = String(question.n).replace(/^[A-Z]+/, '');
    return number === '1' || number === '8';
  });

  return requiredImageQuestions.length === 2 && requiredImageQuestions.every((question) =>
    typeof question.im === 'string' &&
    question.im !== 'text-placeholder' &&
    Boolean(getQuestionImage(question.im)),
  );
}

export function getBundesland(code: BundeslandCode): Bundesland | undefined {
  return bundeslaender.find((state) => state.code === code);
}
