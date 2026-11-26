import { useEffect, useMemo, useState } from 'react';
import type { Bundesland, Question } from '../../types/question';
import { bavariaQuestions, generalQuestions } from '../../data/question-bank';
import { getStateQuestions } from '../../data/bundeslaender';
import { getQuestionImage } from '../../data/images';
import { topics } from '../../data/topics';

type Stats = Record<string, { r: boolean }>;
const STATS_KEY = 'lid2-stats';
const BOOKMARKS_KEY = 'lid2-bm';
const EN_KEY = 'lid-en';
const POS_KEY = 'lid2-pos';
const DATE_KEY = 'lid-exam-date';
const allQuestions = (state: Bundesland) => [...generalQuestions, ...getStateQuestions(state.code)];\n// LID1 is the legacy 310-question format: 300 general questions followed by Bavaria B1–B10.\nconst legacyTransferQuestions = [...generalQuestions, ...bavariaQuestions];
const read = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
};
const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
};

interface Props { selectedState: Bundesland; onChangeState: () => void; }
type View = 'home' | 'topic' | 'practice' | 'mock' | 'result';
interface MockItem { q: Question; pick: number | null; order: number[]; }

export default function StudyApp({ selectedState, onChangeState }: Props) {
  const questions = useMemo(() => allQuestions(selectedState), [selectedState]);
  const [stats, setStats] = useState<Stats>(() => read(STATS_KEY, {}));
  const [bookmarks, setBookmarks] = useState<string[]>(() => read(BOOKMARKS_KEY, []).map(String));
  const [showEnglish, setShowEnglish] = useState(() => read(EN_KEY, true));
  const [position, setPosition] = useState(() => read(POS_KEY, 0));
  const [examDate, setExamDate] = useState(() => read(DATE_KEY, '2026-11-25'));
  const [view, setView] = useState<View>('home');
  const [topicId, setTopicId] = useState('gg');
  const [practiceList, setPracticeList] = useState<Question[]>([]);
  const [practiceTitle, setPracticeTitle] = useState('');
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceOrder, setPracticeOrder] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [mockItems, setMockItems] = useState<MockItem[]>([]);
  const [mockIndex, setMockIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(3600);
  const [mockScore, setMockScore] = useState(0);
  const [resultIsMock, setResultIsMock] = useState(false);
  const [mockMisses, setMockMisses] = useState<MockItem[]>([]);
  const [importText, setImportText] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem(EN_KEY, JSON.stringify(showEnglish)); }, [showEnglish]);
  useEffect(() => { localStorage.setItem(POS_KEY, JSON.stringify(position)); }, [position]);
  useEffect(() => { localStorage.setItem(DATE_KEY, JSON.stringify(examDate)); }, [examDate]);
  useEffect(() => {
    if (view !== 'mock') return;
    const id = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [view]);
  useEffect(() => { if (view === 'mock' && secondsLeft === 0) finishMock(); }, [secondsLeft, view]);

  const stateQuestions = getStateQuestions(selectedState.code);
  const score = (list: Question[]) => ({ total: list.length, right: list.filter((q) => stats[String(q.n)]?.r).length });
  const toggleBookmark = (q: Question) => setBookmarks((current) => current.includes(String(q.n)) ? current.filter((id) => id !== String(q.n)) : [...current, String(q.n)]);
  const beginPractice = (list: Question[], title: string, start = 0) => {
    setPracticeList(list); setPracticeTitle(title); setPracticeIndex(start); setSelectedAnswer(null); setSessionCorrect(0);
    setPracticeOrder(shuffle([0, 1, 2, 3])); setResultIsMock(false); setView('practice');
  };
  const beginMock = () => {
    const general = shuffle(generalQuestions).slice(0, 30);
    const state = shuffle(stateQuestions).slice(0, 3);
    const chosen = [...general, ...state].map((q) => ({ q, pick: null, order: shuffle([0, 1, 2, 3]) }));
    setMockItems(chosen); setMockIndex(0); setSecondsLeft(3600); setView('mock');
  };
  function finishMock() {
    const misses = mockItems.filter((item) => item.pick !== item.q.a);
    let correct = 0;
    const next: Stats = { ...stats };
    mockItems.forEach((item) => { const ok = item.pick === item.q.a; if (ok) correct++; next[String(item.q.n)] = { r: ok }; });
    setStats(next); setMockScore(correct); setMockMisses(misses); setResultIsMock(true); setView('result');
  }
  const answerPractice = (answer: number) => {
    if (selectedAnswer !== null) return;
    const q = practiceList[practiceIndex];
    setSelectedAnswer(answer);
    const ok = answer === q.a;
    if (ok) setSessionCorrect((n) => n + 1);
    setStats((current) => ({ ...current, [String(q.n)]: { r: ok } }));
  };
  const nextPractice = () => {
    const next = practiceIndex + 1;
    if (practiceTitle === 'All questions in order') setPosition(next >= practiceList.length ? 0 : next);
    if (next >= practiceList.length) { setView('result'); setMockScore(sessionCorrect); setMockMisses([]); }
    else { setPracticeIndex(next); setSelectedAnswer(null); setPracticeOrder(shuffle([0, 1, 2, 3])); }
  };
  const exportCode = () => 'LID1-' + (showEnglish ? '1' : '0') + legacyTransferQuestions.map((q) => {
    const status = stats[String(q.n)]; return (status ? (status.r ? 1 : 2) : 0) + (bookmarks.includes(String(q.n)) ? 3 : 0);
  }).join('');
  const importCode = () => {
    const match = /^LID1-([01])([0-5]+)$/.exec(importText.replace(/\s+/g, ''));
    if (!match || match[2].length !== legacyTransferQuestions.length) { setNotice('That code is invalid or belongs to a different question catalogue.'); return; }
    const nextStats: Stats = {}; const nextBookmarks: string[] = [];
    legacyTransferQuestions.forEach((q, i) => { let value = Number(match[2][i]); if (value >= 3) { nextBookmarks.push(String(q.n)); value -= 3; } if (value) nextStats[String(q.n)] = { r: value === 1 }; });
    setStats(nextStats); setBookmarks(nextBookmarks); setShowEnglish(match[1] === '1'); setNotice('Progress imported.');
  };
  const totalScore = score(questions);
  const days = Math.ceil((new Date(examDate + 'T00:00:00').getTime() - new Date(new Date().toDateString()).getTime()) / 86400000);
  const topic = topics.find((item) => item.id === topicId);
  const current = practiceList[practiceIndex];
  const image = current?.im ? getQuestionImage(current.im) : undefined;
  const bookmarkButton = (q: Question) => <button className="small-button" aria-pressed={bookmarks.includes(String(q.n))} onClick={() => toggleBookmark(q)}>{bookmarks.includes(String(q.n)) ? '★ Bookmarked' : '☆ Bookmark'}</button>;

  return <div className="study-app">
    <div className="study-toolbar"><div><p className="eyebrow">LEBEN IN DEUTSCHLAND · {selectedState.name.toUpperCase()}</p><h1 className="study-title">LiD Test Trainer</h1></div><button className="small-button" onClick={onChangeState}>Change Bundesland</button></div>
    {view === 'home' && <>
      <section className="study-hero">
        <div><p className="eyebrow">YOUR EXAM PREPARATION</p><h2>{days >= 0 ? days : 0} <span>days</span></h2><p>until your exam</p><label className="inline-field">My exam date <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></label></div>
        <div className="progress-summary"><strong>{totalScore.right}/{totalScore.total}</strong><span>questions answered correctly</span><div className="progress-track"><i style={{ width: (totalScore.total ? totalScore.right / totalScore.total * 100 : 0) + '%' }} /></div></div>
      </section>
      <section className="mock-banner"><div><p className="eyebrow">MOCK TEST</p><h2>33 questions · 60 minutes</h2><p>30 general + 3 {selectedState.name} questions. Pass mark: 17.</p></div><button className="action-button" disabled={stateQuestions.length !== 10} onClick={beginMock}>Start mock test</button></section>
      {stateQuestions.length !== 10 && <p className="state-warning">The {selectedState.name} question bank is not yet verified. Mock exams will be enabled when its 10 questions are ready. You can still practise all general questions.</p>}
      <section className="ordered-box"><div><h2>All questions in order</h2><p>Continue where you left off, or jump to a question.</p></div><div className="inline-controls"><button className="action-button" onClick={() => beginPractice(questions, 'All questions in order', position)}>Continue at {position + 1}</button><select id="jump-question" defaultValue={position} aria-label="Jump to question">{questions.map((q, i) => <option key={q.n} value={i}>{String(q.n).startsWith('B') ? 'Bayern ' + String(q.n).slice(1) : 'Nr. ' + q.n}</option>)}</select><button className="small-button" onClick={() => beginPractice(questions, 'All questions in order', Number((document.getElementById('jump-question') as HTMLSelectElement).value))}>Go</button></div></section>
      <div className="section-heading"><h2>Topics</h2><label className="toggle-label"><input type="checkbox" checked={showEnglish} onChange={(e) => setShowEnglish(e.target.checked)} /> English translations</label></div>
      <div className="topic-list">{topics.map((item) => { const qs = questions.filter((q) => q.t === item.id); const s = score(qs); return <button className="topic-row" key={item.id} onClick={() => { setTopicId(item.id); setView('topic'); }}><span><strong>{item.de}</strong><small>{item.en} · {qs.length} questions</small></span><span className="topic-score">{s.right}/{s.total}</span></button>; })}</div>
      <div className="practice-shortcuts"><button className="small-button" disabled={!bookmarks.length} onClick={() => beginPractice(questions.filter((q) => bookmarks.includes(String(q.n))), 'Bookmarked questions')}>Bookmarks ({bookmarks.length})</button><button className="small-button" disabled={!questions.some((q) => stats[String(q.n)] && !stats[String(q.n)].r)} onClick={() => beginPractice(shuffle(questions.filter((q) => stats[String(q.n)] && !stats[String(q.n)].r)), 'My mistakes')}>My mistakes</button><button className="small-button" onClick={() => beginPractice(shuffle(questions.filter((q) => !stats[String(q.n)])).slice(0, 20), '20 unseen questions')}>Unseen questions</button><button className="small-button" onClick={() => { if (window.confirm('Reset all progress?')) { setStats({}); setBookmarks([]); setPosition(0); } }}>Reset progress</button></div>
      <section className="ordered-box"><h2>Move progress to another device</h2><p>Copy this code and import it on your other device.</p><textarea readOnly value={exportCode()} /><div className="inline-controls"><button className="small-button" onClick={() => { void navigator.clipboard?.writeText(exportCode()); setNotice('Progress code copied.'); }}>Copy code</button><input value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste LID1- code" /><button className="small-button" onClick={importCode}>Import</button></div>{notice && <p role="status">{notice}</p>}</section>
    </>}
    {view === 'topic' && topic && <><button className="back-button" onClick={() => setView('home')}>← All topics</button><p className="eyebrow">{topic.en}</p><h2 className="page-heading">{topic.de}</h2><div className="tabs"><button className="active-tab">Key facts</button><button onClick={() => beginPractice(questions.filter((q) => q.t === topic.id), topic.de)}>Questions ({questions.filter((q) => q.t === topic.id).length})</button></div><div className="facts-list">{topic.facts.map((fact, i) => <div className="fact-row" key={i}><strong>{fact[0]}</strong><span dangerouslySetInnerHTML={{ __html: fact[1] }} />{fact[2] && <small>{fact[2]}</small>}</div>)}</div><div className="practice-shortcuts"><button className="action-button" onClick={() => beginPractice(shuffle(questions.filter((q) => q.t === topic.id)).slice(0, 10), '10 random · ' + topic.de)}>10 random</button><button className="small-button" onClick={() => beginPractice(questions.filter((q) => q.t === topic.id), topic.de)}>All in order</button><button className="small-button" onClick={() => beginPractice(shuffle(questions.filter((q) => q.t === topic.id && !stats[String(q.n)])), 'Unseen · ' + topic.de)}>Not tried yet</button><button className="small-button" onClick={() => beginPractice(shuffle(questions.filter((q) => q.t === topic.id && stats[String(q.n)] && !stats[String(q.n)].r)), 'My mistakes · ' + topic.de)}>My mistakes</button><button className="small-button" onClick={() => beginPractice(questions.filter((q) => q.t === topic.id && bookmarks.includes(String(q.n))), 'Bookmarked · ' + topic.de)}>Bookmarked</button></div></>}
    {view === 'practice' && current && <><button className="back-button" onClick={() => setView('home')}>← Back</button><h2 className="page-heading">{practiceTitle}</h2><div className="question-card"><div className="question-meta"><span>{practiceIndex + 1} / {practiceList.length}</span><span>Nr. {current.n}</span></div><div className="question-title">{current.q}</div>{showEnglish && <p className="translation">{current.e}</p>}{Array.isArray(image) ? <div className="question-images">{image.map((src, i) => <img key={i} src={src} alt={'Question image ' + (i + 1)} />)}</div> : image && <img className="question-image" src={image} alt="Illustration for the question" />}{bookmarkButton(current)}<div className="answer-options">{practiceOrder.map((option, i) => <button key={option} disabled={selectedAnswer !== null} className={'answer-option ' + (selectedAnswer !== null && option === current.a ? 'correct' : selectedAnswer === option ? 'incorrect' : '')} onClick={() => answerPractice(option)}><b>{'abcd'[i]}</b><span>{current.o[option]}{showEnglish && <small>{current.oe[option]}</small>}</span></button>)}</div>{selectedAnswer !== null && <div className="answer-feedback"><strong>{selectedAnswer === current.a ? 'Richtig!' : 'Falsch.'}</strong><p>{selectedAnswer === current.a ? '' : current.o[current.a] + ' — '}{current.ea}</p><h3>Vocabulary</h3><table><tbody>{current.v.map(([de, en]) => <tr key={de}><td>{de}</td><td>{en}</td></tr>)}</tbody></table><button className="action-button" onClick={nextPractice}>{practiceIndex + 1 === practiceList.length ? 'Finish' : 'Next question'}</button></div>}</div></>}
    {view === 'mock' && mockItems[mockIndex] && <><div className="mock-topline"><button className="back-button" onClick={() => { if (window.confirm('Quit this mock exam?')) setView('home'); }}>Quit</button><strong>{String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}</strong></div><h2 className="page-heading">Mock exam · {mockIndex + 1}/33</h2><div className="question-card"><div className="question-title">{mockItems[mockIndex].q.q}</div><div className="answer-options">{mockItems[mockIndex].order.map((option, i) => <button key={option} className={'answer-option ' + (mockItems[mockIndex].pick === option ? 'chosen' : '')} onClick={() => setMockItems((items) => items.map((item, index) => index === mockIndex ? { ...item, pick: option } : item))}><b>{'abcd'[i]}</b><span>{mockItems[mockIndex].q.o[option]}</span></button>)}</div><div className="inline-controls"><button className="small-button" disabled={!mockIndex} onClick={() => setMockIndex((i) => i - 1)}>Back</button><button className="action-button" onClick={() => mockIndex === 32 ? finishMock() : setMockIndex((i) => i + 1)}>{mockIndex === 32 ? 'Hand in' : 'Next'}</button></div><div className="mock-dots">{mockItems.map((item, i) => <button key={i} aria-label={'Go to question ' + (i + 1)} className={i === mockIndex ? 'current' : item.pick !== null ? 'answered' : ''} onClick={() => setMockIndex(i)} />)}</div></div></>}
    {view === 'result' && <><div className="result-card"><p className="eyebrow">SESSION COMPLETE</p><strong>{resultIsMock ? mockScore + '/33' : sessionCorrect + '/' + practiceList.length}</strong><h2>{resultIsMock ? (mockScore >= 17 ? 'Passed!' : 'Keep practising') : 'Practice complete'}</h2><p>{resultIsMock ? (mockScore >= 17 ? 'You reached the pass mark.' : 'Review your mistakes and try again.') : 'Your answers have been saved. Your mistakes are available from the dashboard.'}</p><button className="action-button" onClick={() => setView('home')}>Back to dashboard</button></div>{mockMisses.length > 0 && <section className="review-list"><h2>Review mistakes ({mockMisses.length})</h2>{mockMisses.map((item) => <article key={item.q.n}><strong>{item.q.q}</strong><p>Your answer: {item.pick === null ? 'Not answered' : item.q.o[item.pick]}</p><p>Correct: {item.q.o[item.q.a]}</p><small>{item.q.ea}</small></article>)}</section>}</>}
  </div>;
}
