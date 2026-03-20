

## Fix: FK constraint error on evaluation submission

### Problem
`evaluation_answers.question_id` has a foreign key referencing `evaluation_questions` table. But campaign questions are stored in `evaluation_campaign_questions` table. When submitting a campaign evaluation, the `question_id` values come from `evaluation_campaign_questions`, which violates the FK.

### Solution
Add a second FK (or replace the existing one) so `evaluation_answers.question_id` can reference either table. The cleanest approach: drop the existing FK and add no FK on `question_id` (since answers can come from either table), or add a FK to `evaluation_campaign_questions`.

Since campaign evaluations are the primary flow now, the fix is:
1. Drop the existing FK `evaluation_answers_question_id_fkey`
2. No replacement FK needed (the column is used for both legacy `evaluation_questions` and new `evaluation_campaign_questions`)

### File

| Arquivo | Acao |
|---------|------|
| **Migration SQL** | `ALTER TABLE evaluation_answers DROP CONSTRAINT evaluation_answers_question_id_fkey;` |

No code changes needed — only the database constraint removal.

