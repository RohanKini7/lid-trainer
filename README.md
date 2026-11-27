# LiD Test Trainer

A single-page study app for the German **Leben in Deutschland** / **Einbürgerungstest**, for Bavaria.

- All 300 general questions plus the 10 Bavaria questions from the BAMF catalogue (as of 07.05.2025)
- Questions grouped into 9 topics, each with a key-facts summary
- Optional English help: the question, and all four options once you answer
- A German–English vocabulary table for every question
- Bookmarks, mistake tracking and an "unseen questions" mode
- Timed mock test: 30 general + 3 Bavaria questions, 60 minutes, pass mark 17

Progress and bookmarks are saved in your own browser only.

**Note:** The official catalogue doesn't mark the correct answers, so the answer key and translations were added for this app. Always check against the [BAMF online test centre](https://oet.bamf.de). Questions about current office holders (Nr. 72, 73, 75) can change.

The question texts and images are from the official BAMF catalogue (Bundesamt für Migration und Flüchtlinge).


## Question-bank verification status

The app currently includes ten state-specific questions for each of the 16 Bundesländer. Presence in the app does not mean a bank has been officially verified. The BAMF PDF (catalogue version 07.05.2025) publishes the question wording and options but does not mark the correct answers. The answer indexes must be checked individually in the [official BAMF online test centre](https://oet.bamf.de/ords/oetut/f?p=534:1:0).

Mock exams are available for every structurally complete state bank so learners are not blocked while answer-key verification is in progress. These are **provisional practice simulations**: the current answer indexes are used for scoring, and any key found to be wrong will be corrected later. The UI clearly warns users that scores are provisional. The strict verification ledger remains separate: do not add IDs to `answerKeysVerified` until each answer has been checked in the official BAMF online test centre. State-specific illustrations for questions 1 and 8 are deferred and do not block practice or mock exams.
