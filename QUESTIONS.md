# CardVault - Questions & Clarifications

This document outlines questions and decisions needed before development begins.

## 1. Card Number Display & Security

### Q1.1: Card Number Masking
- **Question**: How should card numbers be displayed by default?
  - Option A: Fully masked (**** **** **** ****)
  - Option B: Last 4 digits visible (**** **** **** 1234)
  - Option C: First 6 + last 4 (1234 56** **** 7890)
- **Recommendation**: Option B (last 4 digits visible) - most common in financial apps
- **Action Required**: Option B

### Q1.2: Card Number Reveal
- **Question**: How should users reveal the full card number?
  - Option A: Tap on card to reveal (toggles)
  - Option B: Long press to reveal (momentary)
  - Option C: Swipe gesture to reveal
- **Recommendation**: Option A (tap to toggle) - most intuitive
- **Action Required**: Keep configurable in setting between option A and B, keep A as default

### Q1.3: CVV Display
- **Question**: How should CVV be displayed?
  - Option A: Always masked (***)
  - Option B: Always visible
  - Option C: Tap to reveal (like card number)
- **Recommendation**: Option A (always masked) with tap to reveal - security best practice
- **Action Required**: Keep configurable between always visible and tap to reveal

## 2. Bank Selection & Logos

### Q2.1: Bank List
- **Question**: Which banks should be included in the initial list?
  - Option A: Major banks only (Chase, Bank of America, Wells Fargo, Citi, etc.)
  - Option B: Comprehensive list (50+ banks)
  - Option C: Allow custom bank entry (free text)
- **Recommendation**: Option A (major banks) with Option C (custom entry) for flexibility
- **Action Required**: 
  - For now lets keep a few example ones (HDFC, SBI, ICICI, AXIS).

### Q2.2: Bank Logo Sources
- **Question**: Where should bank logos come from?
  - Option A: Pre-downloaded assets in app bundle
  - Option B: CDN/API (requires internet, but out of scope for offline app)
- **Recommendation**: Option A (pre-downloaded assets) for the future.
- **Action Required**:  Not applicable for this version as logos are out of scope.

### Q2.3: Bank Logo Display
- **Question**: Where should bank logo appear on the card?
  - Option A: Top-right corner
  - Option B: Bottom-left corner
  - Option C: Center
  - Option D: User-configurable position
- **Recommendation**: Option A (top-right) - standard credit card design
- **Action Required**: Not applicable for this version as logos are out of scope.

## 3. Card Design & Styling

### Q3.1: Card Colors
- **Question**: How should card colors be determined?
  - Option A: Bank-specific colors (each bank has its brand colors)
  - Option B: User-selectable colors
  - Option C: Generic gradient (same for all cards)
  - Option D: Card type colors (Credit = blue, Debit = green)
- **Recommendation**: Option C (generic gradient) for V1, Option A for future
- **Action Required**: Option B, while choosing colors they can choose Option C also.

### Q3.2: Card Dimensions
- **Question**: What should be the card dimensions in the UI?
  - Option A: Standard credit card ratio (85.60 × 53.98 mm = ~3.375" × 2.125")
  - Option B: Larger for better readability
  - Option C: Compact for list view
- **Recommendation**: Option A (standard ratio) scaled appropriately for mobile
- **Action Required**: Option A

### Q3.3: Card Animations
- **Question**: What animations should be included?
  - Option A: Minimal (basic transitions)
  - Option B: Moderate (smooth scroll, reveal animations)
  - Option C: Rich (3D card flip, parallax effects)
- **Recommendation**: Option B (moderate) - good balance of polish and performance
- **Action Required**: Option B (UI should be fast but should also look modern)

## 4. Usage Tracking & Sorting

### Q4.1: Usage Metric
- **Question**: What counts as "usage"?
  - Option A: Any copy action (number, CVV, or expiry)
  - Option B: Only card number copy
  - Option C: Weighted (card number = 3 points, CVV = 2 points, expiry = 1 point)
- **Recommendation**: Option A (any copy action) - simple and effective
- **Action Required**: Option B

### Q4.2: Sorting Algorithm
- **Question**: How should cards be sorted when usage counts are equal?
  - Option A: Most recently used first
  - Option B: Most recently added first
  - Option C: Alphabetical by bank name
  - Option D: Manual order (user can drag to reorder)
- **Recommendation**: Option A (most recently used) with Option D (manual reorder) for future
- **Action Required**: Option A

### Q4.3: Pinned Cards Position
- **Question**: Where should pinned cards appear?
  - Option A: Always at the top (separate section)
  - Option B: In their pinned position (mixed with unpinned)
  - Option C: User-configurable (pin to top or specific position)
- **Recommendation**: Option A (always at top) - clearest UX
- **Action Required**: Option A

## 5. Copy Functionality

### Q5.1: Copy Options
- **Question**: What copy options should be available?
  - Option A: Individual fields (number, CVV, expiry separately)
  - Option B: All details at once (number + CVV + expiry)
  - Option C: Both options available
- **Recommendation**: Option C (both options) - maximum flexibility
- **Action Required**: Only card number has copy option for now.

### Q5.2: Copy Feedback
- **Question**: How should users know data was copied?
  - Option A: Toast notification
  - Option B: Haptic feedback
  - Option C: Both toast and haptic
  - Option D: Visual indicator on card
- **Recommendation**: Option C (both toast and haptic) - best user experience
- **Action Required**: Option C

### Q5.3: Copy Format
- **Question**: What format should copied data be in?
  - Card Number: "1234 5678 9012 3456" or "1234567890123456"?
  - Expiry: "12/25" or "12/2025" or "December 2025"?
- **Recommendation**: 
  - Card Number: Without spaces (1234567890123456) - most compatible
  - Expiry: MM/YY (12/25) - standard format - Not required for now, only keep card number copy option
- **Action Required**: Card Number: Without spaces 

## 6. Data Validation

### Q6.1: Card Number Validation
- **Question**: How strict should card number validation be?
  - Option A: Luhn algorithm validation (detects most errors)
  - Option B: Length only (16 digits)
  - Option C: No validation (user responsibility)
- **Recommendation**: Option A (Luhn algorithm) - best user experience
- **Action Required**: Option C for now

### Q6.2: Expiry Date Validation
- **Question**: Should we validate expiry dates?
  - Option A: Validate format only (MM/YY)
  - Option B: Validate format and ensure not expired
  - Option C: Validate format and warn if expiring soon (< 3 months)
- **Recommendation**: Option B (validate not expired) with Option C (warn if expiring soon) for future
- **Action Required**: Option B

### Q6.3: CVV Validation
- **Question**: How should CVV be validated?
  - Option A: Length only (3-4 digits)
  - Option B: Numeric only
  - Option C: Both length and numeric
- **Recommendation**: Option C (both) - standard practice
- **Action Required**: Option C

## 7. User Interface

### Q7.1: Main Screen Layout
- **Question**: How should cards be displayed on the main screen?
  - Option A: Vertical list (one card per row)
  - Option B: Grid layout (multiple cards per row)
  - Option C: Carousel (swipeable cards)
- **Recommendation**: Option A (vertical list) - best for many cards, familiar UX
- **Action Required**: Option A

### Q7.2: Add Card Flow
- **Question**: How should users add a new card?
  - Option A: Modal overlay (quick add)
  - Option B: Full screen form
  - Option C: Step-by-step wizard
- **Recommendation**: Option A (modal overlay) - quick and non-intrusive
- **Action Required**: Option A

### Q7.3: Empty State
- **Question**: What should show when no cards are added?
  - Option A: Empty state with "Add Card" button
  - Option B: Onboarding screen
  - Option C: Both (onboarding first time, empty state after)
- **Recommendation**: Option C (onboarding first time) - better first impression
- **Action Required**: Option C

## 8. Data Storage

### Q8.1: Storage Solution
- **Question**: Which storage solution should we use?
  - Option A: `expo-secure-store` (encrypted, keychain/keystore)
  - Option B: `@react-native-async-storage/async-storage` (simple key-value)
  - Option C: SQLite (structured database)
- **Recommendation**: Option A (`expo-secure-store`) - best security for sensitive data
- **Action Required**: I want data to be stored locally, should not be transferred on network. Use Option A if that is the case. Otherwise calrify again.

## 9. Card Editing & Billing Enhancements

### Q9.1: Edit Entry Point
- **Question**: How should users initiate the edit flow for an existing card? (e.g., add an “Edit” option to the current long-press menu, a dedicated button on the card, or open the add-card modal pre-filled from another screen?)
- **Action Required**: Clarify the desired UX so we know where to place the edit affordance.

### Q9.2: Editable Fields & Side Effects
- **Question**: During editing, can users change every field (including card number) or should some values be read-only? If a card number changes, should usage counters (`usageCount`, `lastUsedAt`) reset or stay as-is?
- **Action Required**: Provide guidance on which fields are editable and whether edits impact usage statistics or timestamps.

### Q9.3: Bill Generation Date Details
- **Question**: For credit cards, should the bill generation date be stored as a simple day-of-month (1–31), a specific calendar date, or something else? Are there timezone or reminder behaviors tied to it, and should it appear anywhere in the UI besides the edit form?
- **Action Required**: Confirm expected format, validation rules, and display requirements for the bill generation date field.

### Q9.4: Reminder Window UX
- **Question**: For the upcoming bill reminder feature, where should we surface the reminder list (dedicated tab, banner, modal)? Should users dismiss/snooze reminders per card, or is viewing enough?
- **Action Required**: Dedicated tab. User should dismiss

### Q9.5: Reminder Window Settings
- **Question**: Should the reminder window (e.g., “show bills due in next N days”) be a single global number defined in Settings, or per-card? Also confirm the acceptable range (1–15 as in due window, or wider?).
- **Action Required**: It can be in settings. 1-15 is acceptable.

### Q9.6: Reminder Types
- **Question**: Do we need two reminder buckets (“Upcoming statements” vs “Payment due”) or just a single list? Should the UI explicitly show both dates (statement date and due date) for each card?
- **Action Required**: Just one list, the info can state if the reminder is because of bill date or due date.

### Q9.7: Delete/Pin in Edit Screen
- **Question**: When long-press opens the edit form, should delete and pin actions live inside the form UI (e.g., footer buttons), or in the modal header? Should we still ask for confirmation before deleting?
- **Action Required**: Form header

### Q9.8: Delete All Cards Setting
- **Question**: For the new “Delete all cards” option in Settings, should it simply show a confirmation dialog (with export reminder), or require any additional authentication (PIN/biometrics)? After deletion, should the app automatically take the user to the empty state?
- **Action Required**: simply show a confirmation dialog (with export reminder), no pin required. Yes, take to empty state.

### Q8.2: Data Migration
- **Question**: How should we handle data structure changes in future updates?
  - Option A: Version-based migration system
  - Option B: Start fresh (user re-adds cards)
  - Option C: Not applicable for V1
- **Recommendation**: Option C (not applicable for V1) - plan for future
- **Action Required**: Option C

## 9. Card Types & Categories

### Q9.1: Card Type Tracking
- **Question**: Should we track card type (Credit vs Debit)?
  - Option A: Yes, include in card model
  - Option B: No, not needed for V1
  - Option C: Optional field
- **Recommendation**: Option C (optional field) - useful for future features
- **Action Required**: Option A

### Q9.2: Card Categories
- **Question**: Should users be able to categorize cards?
  - Option A: Yes (Personal, Business, etc.)
  - Option B: No, not needed for V1
- **Recommendation**: Option B (not needed for V1) - keep it simple
- **Action Required**: Option B

## 10. Error Handling

### Q10.1: Storage Errors
- **Question**: How should we handle storage errors (e.g., device full)?
  - Option A: Show error toast
  - Option B: Retry mechanism
  - Option C: Both
- **Recommendation**: Option C (both) - best user experience
- **Action Required**: Option C 

### Q10.2: Validation Errors
- **Question**: How should validation errors be displayed?
  - Option A: Inline errors below fields
  - Option B: Toast notifications
  - Option C: Both
- **Recommendation**: Option C (both) - clearest feedback
- **Action Required**: Option C

## 11. Performance & Optimization

### Q11.1: Card List Performance
- **Question**: How should we optimize for many cards (50+)?
  - Option A: Virtualized list (FlatList)
  - Option B: Pagination
  - Option C: Search/filter
- **Recommendation**: Option A (FlatList) - React Native best practice
- **Action Required**: Option C, search using bank name

## 12. Accessibility

### Q12.1: Screen Reader Support
- **Question**: Should we support screen readers (VoiceOver, TalkBack)?
  - Option A: Yes, full support
  - Option B: Basic support
  - Option C: Not needed for V1
- **Recommendation**: Option B (basic support) - good practice
- **Action Required**: Option C

### Q12.2: Font Sizing
- **Question**: Should we support dynamic font sizes?
  - Option A: Yes, respect system font size
  - Option B: Fixed sizes
- **Recommendation**: Option A (respect system font size) - better accessibility
- **Action Required**: Option A 

## Summary of Decisions Needed

### High Priority (Block Development)
1. Card number masking strategy (Q1.1)
2. Bank list (Q2.1)
3. Storage solution (Q8.1)
4. Card design colors (Q3.1)
5. Usage tracking definition (Q4.1)
6. Data Import/Export strategy (Q13.1 - Q13.7)

### Medium Priority (Affect UX)
1. Copy functionality options (Q5.1)
2. Add card flow (Q7.2)
3. Pinned cards position (Q4.3)
4. Validation levels (Q6.1, Q6.2, Q6.3)

### Low Priority (Can Be Decided During Development)
1. Animation level (Q3.3)
2. Empty state design (Q7.3)
3. Error handling details (Q10.1, Q10.2)
4. Accessibility features (Q12.1, Q12.2)

## Next Steps

1. Review all questions and provide answers
2. Prioritize features for V1
3. Provide bank list and logo assets (if available)
4. Approve PRD and development prompt
5. Begin development once all high-priority questions are answered

## 13. Data Import/Export

### Q13.1: Export File Format
- **Question**: What file format should be used for the exported encrypted file (e.g., JSON, CSV)?
- **Recommendation**: JSON is recommended as it is structured and easy to parse.
- **Action Required**: JSON

### Q13.2: Encryption Standard
- **Question**: What encryption standard should be implemented (e.g., AES-256)?
- **Recommendation**: AES-256 is a strong and widely used encryption standard.
- **Action Required**: AES-256

### Q13.3: Import Conflict Resolution
- **Question**: How should the app handle import conflicts? For instance, if a card in the import file already exists in the app's database (e.g., same card number), should the existing card's data be overwritten, or should the new data be merged with it? If merging, what are the specific rules for merging fields?
- **Recommendation**: A clear strategy is needed. For example, we could skip duplicates, overwrite them, or attempt to merge fields. Merging can be complex. A simple approach would be to skip importing duplicate cards and notify the user.
- **Action Required**: Skip importing duplicate cards and notify the user. This can be simple bulk notification like "3 cards were found duplicates and were not imported".

### Q13.4: Export Password
- **Question**: How will the user be prompted to set a password for the export? Will this password be stored in the app for future exports, or will the user need to set it every time?
- **Recommendation**: For security, the user should be prompted to enter a password for each export. We should not store the export password.
- **Action Required**: Every time.

### Q13.5: Password Requirements
- **Question**: Are there any specific requirements for the password, such as minimum length or character complexity?
- **Recommendation**: We should enforce a minimum password length (e.g., 8 characters) to encourage stronger passwords.
- **Action Required**: No enforcement for now.

### Q13.6: Export Location
- **Question**: Where should the exported file be saved on the user's device?
- **Recommendation**: The app should use the system's file picker to allow the user to choose the location to save the file.
- **Action Required**: The app should use the system's file picker to allow the user to choose the location to save the file.

### Q13.7: File Integrity
- **Question**: How should the app verify the integrity of the imported file to ensure it hasn't been corrupted or tampered with?
- **Recommendation**: We can include a checksum or hash (e.g., SHA-256) of the data within the encrypted file. During import, we can recalculate the hash and compare it to the stored one.
- **Action Required**: Go with the recommendation.
