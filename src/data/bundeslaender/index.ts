import type { Bundesland, BundeslandCode, Question } from '../../types/question';
import { bavariaQuestions } from '../question-bank';
import { partialStateQuestionBanks } from './partial-questions';

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

/** Returns all ten transcribed questions; image questions remain incomplete until their assets are added. */
export function getStateQuestions(code: BundeslandCode): Question[] {
  return stateQuestionBanks[code] ?? [];
}

export function hasCompleteStateBank(code: BundeslandCode): boolean {
  const questions = getStateQuestions(code);
  return questions.length === 10 && questions.every((question) => {
    const questionNumber = Number(String(question.n).replace(/^[A-Z]+/, ''));
    return (questionNumber !== 1 && questionNumber !== 8) || question.im !== null;
  });
}

export function getBundesland(code: BundeslandCode): Bundesland | undefined {
  return bundeslaender.find((state) => state.code === code);
}
