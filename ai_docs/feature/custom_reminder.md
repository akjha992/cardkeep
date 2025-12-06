# Feature: Custom Card Reminders

**Status:** `CLARIFICATION`
**Owner:** Codex

---

## 1. Feature Description (User)
Allow users to create custom reminders tied to a specific card directly from the Reminders tab. A custom reminder consists of a card selection, reminder date, and reminder text, and it should surface alongside existing statement/due/renewal reminders with the same actions (dismiss, mute).

---

## 2. Clarification & Requirements (AI + User)
**Interaction Log:**
- [ ] **AI:** To build custom reminders from the Reminders screen, I need to understand:
  1. Should custom reminders support both absolute calendar dates and offsets (e.g., “3 days before bill day”), or just a fixed calendar date? - fix calander day (assumed cadence is monthly)
  2. Can a card have multiple custom reminders at once, and is there any limit the user expects? - can have multiple
  3. When a custom reminder fires, should it recur automatically (monthly/yearly) or is it one-time unless the user recreates it? - monthly
  4. Where should users edit/delete existing custom reminders—inline within each reminder card, or through a dedicated management modal/list? - a new modal which can help edit the reminer text, day and also allows to delete the reminder.

**Gate 1: Requirements Sign-off**
- [x] I (User) have answered all questions. The requirements are clear. **Proceed to Planning.**

---

## 3. Technical Task Breakdown (AI)
**Proposed Plan:**
1. **Data Model & Storage**
   - Extend `Card` schema to include `customReminders` array (id, dayOfMonth, label).
   - Update storage import/export and helper methods to persist these reminders.
2. **Reminder Generation**
   - Update reminder service to emit custom reminders monthly based on `dayOfMonth`, respecting reminder window and dismissal logic.
3. **Reminder Screen UI**
   - Add CTA “Add custom reminder” opening a modal with card picker, day input, and label field.
   - Modal also lists existing custom reminders for the selected card with edit/delete options.
4. **Reminder Cards**
   - Render custom reminders within the list with their text; include edit button that reopens the modal focused on that reminder.
5. **Dismissal & Editing**
   - Ensure dismiss/mute interactions work identically; editing updates storage and reruns reminder generation.

**Gate 2: Plan Sign-off**
- [x] The plan looks good. No further changes needed. **Proceed to Implementation.**

---

## 4. Implementation Log (AI + User)
**Task Checklist:**
- [x] [Task-01] Data model & storage updates for custom reminders
- [x] [Task-02] Reminder generation logic for custom reminders
- [x] [Task-03] Reminders screen UI (CTA + modal for create/edit/delete)
- [x] [Task-04] Render custom reminder cards with edit button and dismissal parity

**Gate 3: Completion**
- [ ] Feature tested and verified.
