# CardVault - Feature-Based Development TODO List

This document organizes development by **independent features** that can be reviewed and tested as complete app features. Each feature builds on previous ones and can be reviewed independently.

---

## Feature 1: Basic Setup & Add Card (MVP)

**Goal**: Users can add a card and see it in a list. Basic functionality only.

### 1.1 Project Setup
- [x] Install dependencies (`expo-secure-store`, `expo-clipboard`, `uuid`)
- [x] Update `app.json` (app name: "CardVault")
- [x] Create directory structure (`services/`, `types/`, `utils/`, `components/`)
- [x] Update theme for dark mode in `constants/theme.ts`

### 1.2 Type Definitions
- [x] Create `types/card.types.ts` with `Card` interface (all fields)
- [x] Create `types/bank.types.ts` with `Bank` interface

### 1.3 Storage Service
- [x] Create `services/storage.service.ts`
- [x] Implement `saveCard(card: Card): Promise<void>`
- [x] Implement `getCards(): Promise<Card[]>()`
- [x] Use `expo-secure-store` for sensitive data
- [x] Handle storage errors

### 1.4 Basic Add Card Form
- [x] Create `components/cards/AddCardForm.tsx`
- [x] Add card number input (basic, no formatting yet)
- [x] Add CVV input
- [x] Add expiry date input (MM/YY)
- [x] Add bank name input (text input for now)
- [x] Add cardholder name input
- [x] Add card type selector (Credit/Debit) - Required
- [x] Add submit button
- [x] Basic validation (CVV, expiry)
- [x] Save card to storage on submit

### 1.5 Basic Card List
- [x] Create `components/cards/CardList.tsx`
- [x] Display cards in FlatList
- [x] Create basic `CardItem.tsx` (simple card display)
- [x] Show cardholder name, bank name, card type
- [x] Load cards from storage on mount

### 1.6 Main Screen
- [x] Update `app/(tabs)/index.tsx`
- [x] Integrate CardList component
- [x] Add "Add Card" button
- [x] Create `app/add-card.tsx` modal
- [x] Navigate to add card modal
- [x] Refresh list after adding card

### 1.7 Navigation
- [x] Update `app/_layout.tsx` for modal presentation
- [x] Configure navigation stack

**Review Checkpoint**: Can add a card and see it in a list. Basic functionality works.

---

## Feature 1.5: Delete Card

**Goal**: Users can delete a card from the list via a long-press context menu.

### 1.5.1 Delete Action
- [x] Add delete action to a context menu on `CardItem.tsx` revealed by a long-press.
- [x] Add confirmation dialog before deleting

### 1.5.2 Storage Service
- [x] Implement `deleteCard(id: string): Promise<void>` in `services/storage.service.ts`
- [x] Remove card from storage

### 1.5.3 Main Screen
- [x] Refresh card list after deleting a card

**Review Checkpoint**: Can delete a card, and it is removed from the list.

---

## Feature 2: Card UI Design & Display

**Goal**: Cards look like actual credit cards with proper styling and display all information.

### 2.1 Card Styling
- [x] Update `CardItem.tsx` with card-like UI
- [x] Apply standard credit card dimensions (85.60 × 53.98 mm ratio)
- [x] Add dark theme styling
- [x] Add gradient background (default)
- [x] Add shadows and borders
- [x] Make it visually appealing

### 2.2 Card Information Display
- [x] Display card number (masked: **** **** **** 1234)
- [x] Display cardholder name prominently
- [x] Display expiry date (MM/YY format)
- [x] Display CVV (always visible for now)
- [x] Display card type (Credit/Debit)
- [x] Display bank name
- [x] Use proper typography (monospace for card number)

### 2.3 Formatters
- [x] Create `utils/formatters.ts`
- [x] Implement `formatCardNumber()` - Format as XXXX XXXX XXXX XXXX
- [x] Implement `maskCardNumber()` - Mask with last 4 digits visible
- [x] Implement `formatExpiryDate()` - Format as MM/YY
- [x] Apply formatting in CardItem component

### 2.4 Card Number Input Formatting
- [ ] Update AddCardForm to format card number as user types
- [ ] Auto-format to XXXX XXXX XXXX XXXX format
- [ ] Limit to 16 digits

**Review Checkpoint**: ✅ Cards look like actual credit cards with all information displayed properly.

---

## Feature 3: Copy Functionality & Usage Tracking

**Goal**: Users can copy card number, and usage is tracked for sorting.

### 3.1 Clipboard Utilities
- [x] Create `utils/clipboard.ts`
- [x] Implement `copyToClipboard()` using expo-clipboard
- [x] Implement `showCopyFeedback()` with toast + haptic
- [x] Copy card number without spaces (1234567890123456)

### 3.2 Tap Card to Copy
- [x] Implement tap handler on CardItem to copy card number
- [x] Copy card number on tap
- [x] Show toast notification
- [x] Add haptic feedback

### 3.3 Usage Tracking Service
- [x] Create `services/usage.service.ts`
- [x] Implement `incrementUsage(id: string)`
- [x] Update `usageCount` and `lastUsedAt` timestamp
- [x] Integrate with storage service

### 3.4 Usage-Based Sorting
- [x] Update `services/cards.service.ts`
- [x] Implement sorting logic (by usageCount descending)
- [x] When usage counts equal, sort by lastUsedAt (most recent first)
- [x] Apply sorting in CardList component
- [x] Refresh list after copying

### 3.5 Toast Component
- [x] Create `components/ui/Toast.tsx`
- [x] Implement toast notification
- [x] Add success variant
- [x] Add auto-dismiss functionality
- [x] Add dark theme styling

**Review Checkpoint**: Can copy card number, see feedback, and cards are sorted by usage.

---

## Feature 4: Search & Filter

**Goal**: Users can search/filter cards by bank name.

### 4.1 Search Bar Component
- [x] Create `components/ui/SearchBar.tsx`
- [x] Implement search input
- [x] Add search icon
- [x] Add clear button
- [x] Add debouncing for search
- [x] Add dark theme styling

### 4.2 Filter Logic
- [x] Update `services/cards.service.ts`
- [x] Implement `filterCardsByBank(cards: Card[], bankName: string)`
- [x] Filter cards by bank name (case-insensitive)
- [x] Maintain sorting order (pinned first, then by usage)

### 4.3 Integrate Search
- [x] Add SearchBar to main screen
- [x] Connect search input to filter logic
- [x] Update CardList to show filtered results
- [x] Clear search to show all cards
- [x] Maintain pinned cards at top when filtering

**Review Checkpoint**: ✅ Can search cards by bank name, and filtered results maintain sorting order.

---

## Feature 5: Card Pinning

**Goal**: Users can pin cards to keep them at the top.

### 5.1 Pin Toggle Functionality
- [ ] Add pin/unpin toggle to the long-press context menu on CardItem.
- [ ] Add visual indicator (pin icon) for pinned cards
- [ ] Implement `togglePin(id: string)` in storage service
- [ ] Update card's `isPinned` property

### 5.2 Pinned Cards Sorting
- [ ] Update sorting logic in cards service
- [ ] Pinned cards always appear at top
- [ ] Pinned cards excluded from usage-based sorting
- [ ] Unpinned cards sorted by usage (as before)
- [ ] Maintain pin status across app restarts

### 5.3 UI Updates
- [ ] Style pin button appropriately
- [ ] Show pinned indicator clearly
- [ ] Add visual separation between pinned and unpinned cards (optional)

**Review Checkpoint**: Can pin/unpin cards, and pinned cards stay at the top regardless of usage.

---

## Feature 6: Polish & Animations

**Goal**: App feels polished with smooth animations and refined UI.

### 6.1 Animations
- [ ] Add card reveal animation (smooth transition)
- [ ] Add card list animations (fade in, slide)
- [ ] Add modal animations (slide up, fade)
- [ ] Add button press animations
- [ ] Add copy feedback animations
- [ ] Ensure animations are moderate (fast but modern)

### 6.2 UI Polish
- [ ] Refine card design (spacing, shadows, borders)
- [ ] Refine color schemes
- [ ] Refine typography
- [ ] Refine spacing and padding throughout
- [ ] Ensure consistent dark theme
- [ ] Improve button styles
- [ ] Improve input styles

### 6.3 User Experience
- [ ] Add loading states (when loading cards)
- [ ] Add error states (storage errors, etc.)
- [ ] Improve error messages
- [ ] Add success feedback for card addition
- [ ] Improve user guidance
- [ ] Add haptic feedback for important actions

### 6.4 Accessibility
- [ ] Respect system font size settings
- [ ] Ensure sufficient color contrast
- [ ] Ensure touch targets are minimum 44x44 points
- [ ] Add accessibility labels (basic)

**Review Checkpoint**: App feels polished with smooth animations and refined UI/UX.

---

## Feature 7: Input Components & Form Improvements

**Goal**: Reusable input components and improved form experience.

### 7.1 Generic UI Components
- [ ] Create `components/ui/Button.tsx` (reusable button)
- [ ] Create `components/ui/Input.tsx` (reusable input)
- [ ] Create `components/ui/Modal.tsx` (reusable modal)
- [ ] Add dark theme styling to all components
- [ ] Make components accessible

### 7.2 Form Improvements
- [ ] Update AddCardForm to use new Input component
- [ ] Improve form validation
- [ ] Add better error handling
- [ ] Improve form layout
- [ ] Add form field labels
- [ ] Improve form submission flow

### 7.3 Card Number Input
- [ ] Improve card number input formatting
- [ ] Add input masking
- [ ] Handle backspace properly
- [ ] Limit input to 16 digits

### 7.4 Expiry Date Input
- [ ] Improve expiry date input
- [ ] Add input masking (MM/YY)
- [ ] Validate expiry date format
- [ ] Check if expired
- [ ] Show error if expired

**Review Checkpoint**: Forms use reusable components and have improved validation and UX.

---

## Feature 8: Final Testing & Bug Fixes

**Goal**: App is thoroughly tested and all bugs are fixed.

### 8.1 Functional Testing
- [ ] Test add card flow
- [ ] Test card display
- [ ] Test card copy functionality
- [ ] Test usage tracking
- [ ] Test card sorting
- [ ] Test card pinning
- [ ] Test search/filter

### 8.2 Edge Cases
- [ ] Test with no cards
- [ ] Test with many cards (50+)
- [ ] Test with expired cards
- [ ] Test with invalid data
- [ ] Test storage errors
- [ ] Test app restart (data persistence)

### 8.3 Platform Testing
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical devices (if possible)
- [ ] Test different screen sizes
- [ ] Test dark mode
- [ ] Test system font sizes

### 8.4 Bug Fixes
- [ ] Fix any discovered bugs
- [ ] Fix performance issues
- [ ] Fix UI/UX issues
- [ ] Fix storage issues
- [ ] Fix validation issues

### 8.5 Code Quality
- [ ] Review code for best practices
- [ ] Remove unused code
- [ ] Add comments where needed
- [ ] Ensure TypeScript types are correct
- [ ] Ensure error handling is proper
- [ ] Ensure security best practices

**Review Checkpoint**: App is thoroughly tested, and all bugs are fixed.

---

## Feature 9: Documentation & Finalization

**Goal**: Code is documented, and app is ready for release.

### 9.1 Code Documentation
- [ ] Document complex functions
- [ ] Document component props
- [ ] Document service methods
- [ ] Add JSDoc comments
- [ ] Update README.md with setup instructions
- [ ] Add code comments where needed

### 9.2 User Documentation
- [ ] Document app features
- [ ] Document how to use the app
- [ ] Add help text in app (if needed)

### 9.3 Final Checks
- [ ] Verify all requirements are met
- [ ] Verify all acceptance criteria are met
- [ ] Verify dark theme is consistent
- [ ] Verify animations are smooth
- [ ] Verify performance is good
- [ ] Verify security is proper
- [ ] Verify accessibility (system font size)

### 9.4 App Store Preparation
- [ ] Prepare app icons
- [ ] Prepare screenshots
- [ ] Write app description
- [ ] Prepare privacy policy (if needed)

**Review Checkpoint**: App is fully documented and ready for release.

---

## Review Strategy

### After Each Feature
- Review the feature independently
- Test the feature in isolation
- Provide feedback
- Approve before proceeding to next feature

### Feature Dependencies
- **Feature 1** must be completed first (foundation)
- **Feature 2** depends on Feature 1
- **Feature 3** depends on Feature 2
- **Feature 4** (Search & Filter) depends on Feature 3
- **Feature 5** (Card Pinning) depends on Feature 3
- **Feature 6** (Polish & Animations) should be done after core features
- **Feature 7** (Input Components) can be done early or integrated with other features
- **Feature 8** (Testing) is done after all features
- **Feature 9** (Documentation) is final step

### Recommended Order
1. Feature 1: Basic Setup & Add Card (MVP)
2. Feature 2: Card UI Design & Display
3. Feature 3: Copy Functionality & Usage Tracking
4. Feature 4: Search & Filter
5. Feature 5: Card Pinning
6. Feature 7: Input Components & Form Improvements (can be done earlier)
7. Feature 6: Polish & Animations
8. Feature 8: Final Testing & Bug Fixes
9. Feature 9: Documentation & Finalization

---

## Notes

- Each feature is **independent** and can be reviewed as a complete app feature
- After each feature, the app should be **functional** and **testable**
- Course corrections can be made after any feature
- Features build on each other, so order matters
- Some features can be done in parallel
- Testing should be done after each feature
- Keep the app in a working state at all times

---

## Quick Reference

### MVP Features (Must Have)
- Feature 1: Basic Setup & Add Card
- Feature 2: Card UI Design & Display
- Feature 3: Copy Functionality & Usage Tracking
- Feature 5: Card Pinning

### Enhanced Features (Should Have)
- Feature 4: Search & Filter

### Polish Features (Nice to Have)
- Feature 6: Polish & Animations
- Feature 7: Input Components & Form Improvements
- Feature 8: Final Testing & Bug Fixes
- Feature 9: Documentation & Finalization

---

**Status**: ✅ Feature 4 complete — proceed to Feature 5 (Card Pinning)
