# Question Bank

## Source files
`content/questions/{en,fr,rw}/<category>.json`

```json
{
  "id": "q_000123",
  "category": "sports",
  "difficulty": "medium",
  "language": "en",
  "body": "Who won the 2022 FIFA World Cup?",
  "options": ["Brazil", "Argentina", "France"],
  "correct": 1,
  "source": "https://...",
  "tags": ["football"]
}
```

## Process
Write -> fact-check with source -> peer review -> approve -> import via admin or script -> monitor stats.

## Quality rules
Unambiguous, single correct answer, culturally appropriate, up to date, no trick wording. Retire questions with correct rate above 85% or with repeated reports. Translate, do not machine-translate without review.

## Targets
500+ questions per category at launch; refresh monthly; categories: Music, Sports, General knowledge, then Rwanda, Africa, World, Technology, Science, History, Movies.
