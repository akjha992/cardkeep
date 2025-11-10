# CardVault - Feature-Based Development TODO List

This document organizes development by **independent features** that can be reviewed and tested as complete app features. Each feature builds on previous ones and can be reviewed independently.

---

## Feature 1: Basic Setup & Add Card (MVP)

**Goal**: Users can add a card and see it in a list. Basic functionality only.

### 1.1 Project Setup
- [ ] Install dependencies (`expo-secure-store`, `expo-clipboard`, `uuid`)
- [ ] Update `app.json` (app name: "CardVault")
- [ ] Create directory structure (`services/`, `types/`, `utils/`, `components/`)
- [ ] Update theme for dark mode in `constants/theme.ts`

### 1.2 Type Definitions
- [ ] Create `types/card.types.ts` with `Card` interface (all fields)
- [ ] Create `types/bank.types.ts` with `Bank` interface

### 1.3 Storage Service
- [ ] Create `services/storage.service.ts`
- [ ] Implement `saveCard(card: Card): Promise<void>`
- [ ] Implement `getCards(): Promise<Card[]>()`
- [ ] Use `expo-secure-store` for sensitive data
- [ ] Handle storage errors

### 1.4 Basic Add Card Form
- [ ] Create `components/cards/AddCardForm.tsx`
- [ ] Add card number input (basic, no formatting yet)
- [ ] Add CVV input
- [ ] Add expiry date input (MM/YY)
- [ ] Add bank name input (text input for now)
- [ ] Add cardholder name input
- [ ] Add card type selector (Credit/Debit) - Required
- [ ] Add submit button
- [ ] Basic validation (CVV, expiry)
- [ ] Save card to storage on submit

### 1.5 Basic Card List
- [ ] Create `components/cards/CardList.tsx`
- [ ] Display cards in FlatList
- [ ] Create basic `CardItem.tsx` (simple card display)
- [ ] Show cardholder name, bank name, card type
- [ ] Load cards from storage on mount

### 1.6 Main Screen
- [ ] Update `app/(tabs)/index.tsx`
- [ ] Integrate CardList component
- [ ] Add "Add Card" button
- [ ] Create `app/add-card.tsx` modal
- [ ] Navigate to add card modal
- [ ] Refresh list after adding card

### 1.7 Navigation
- [ ] Update `app/_layout.tsx` for modal presentation
- [ ] Configure navigation stack

**Review Checkpoint**: Can add a card and see it in a list. Basic functionality works.

---

## Feature 2: Card UI Design & Display

**Goal**: Cards look like actual credit cards with proper styling and display all information.

### 2.1 Card Styling
- [ ] Update `CardItem.tsx` with card-like UI
- [ ] Apply standard credit card dimensions (85.60 × 53.98 mm ratio)
- [ ] Add dark theme styling
- [ ] Add gradient background (default)
- [ ] Add shadows and borders
- [ ] Make it visually appealing

### 2.2 Card Information Display
- [ ] Display card number (masked: **** **** **** 1234)
- [ ] Display cardholder name prominently
- [ ] Display expiry date (MM/YY format)
- [ ] Display CVV (always visible for now)
- [ ] Display card type (Credit/Debit)
- [ ] Display bank name
- [ ] Use proper typography (monospace for card number)

### 2.3 Formatters
- [ ] Create `utils/formatters.ts`
- [ ] Implement `formatCardNumber()` - Format as XXXX XXXX XXXX XXXX
- [ ] Implement `maskCardNumber()` - Mask with last 4 digits visible
- [ ] Implement `formatExpiryDate()` - Format as MM/YY
- [ ] Apply formatting in CardItem component

### 2.4 Card Number Input Formatting
- [ ] Update AddCardForm to format card number as user types
- [ ] Auto-format to XXXX XXXX XXXX XXXX format
- [ ] Limit to 16 digits

**Review Checkpoint**: Cards look like actual credit cards with all information displayed properly.

---

## Feature 3: Copy Functionality & Usage Tracking

**Goal**: Users can copy card number, and usage is tracked for sorting.

### 3.1 Clipboard Utilities
- [ ] Create `utils/clipboard.ts`
- [ ] Implement `copyToClipboard()` using expo-clipboard
- [ ] Implement `showCopyFeedback()` with toast + haptic
- [ ] Copy card number without spaces (1234567890123456)

### 3.2 Copy Button on Card
- [ ] Add copy button to CardItem
- [ ] Copy card number on button press
- [ ] Show toast notification
- [ ] Add haptic feedback

### 3.3 Usage Tracking Service
- [ ] Create `services/usage.service.ts`
- [ ] Implement `incrementUsage(id: string)`
- [ ] Update `usageCount` and `lastUsedAt` timestamp
- [ ] Integrate with storage service

### 3.4 Usage-Based Sorting
- [ ] Update `services/cards.service.ts`
- [ ] Implement sorting logic (by usageCount descending)
- [ ] When usage counts equal, sort by lastUsedAt (most recent first)
- [ ] Apply sorting in CardList component
- [ ] Refresh list after copying

### 3.5 Toast Component
- [ ] Create `components/ui/Toast.tsx`
- [ ] Implement toast notification
- [ ] Add success variant
- [ ] Add auto-dismiss functionality
- [ ] Add dark theme styling

**Review Checkpoint**: Can copy card number, see feedback, and cards are sorted by usage.

---

## Feature 4: Card Pinning

**Goal**: Users can pin cards to keep them at the top.

### 4.1 Pin Toggle Functionality
- [ ] Add pin/unpin toggle button to CardItem
- [ ] Add visual indicator (pin icon) for pinned cards
- [ ] Implement `togglePin(id: string)` in storage service
- [ ] Update card's `isPinned` property

### 4.2 Pinned Cards Sorting
- [ ] Update sorting logic in cards service
- [ ] Pinned cards always appear at top
- [ ] Pinned cards excluded from usage-based sorting
- [ ] Unpinned cards sorted by usage (as before)
- [ ] Maintain pin status across app restarts

### 4.3 UI Updates
- [ ] Style pin button appropriately
- [ ] Show pinned indicator clearly
- [ ] Add visual separation between pinned and unpinned cards (optional)

**Review Checkpoint**: Can pin/unpin cards, and pinned cards stay at the top regardless of usage.

---

## Feature 5: Bank Selection & Logos

**Goal**: Users can select from predefined banks, and bank logos appear on cards.

### 5.1 Bank Constants
- [ ] Create `constants/banks.ts`
- [ ] Define bank list (HDFC, SBI, ICICI, AXIS)
- [ ] Set up placeholder logos for each bank
- [ ] Create `assets/images/banks/placeholder.png`
- [ ] Add helper functions to get bank by name/id

### 5.2 Bank Selector Component
- [ ] Create `components/cards/BankSelector.tsx`
- [ ] Implement dropdown/picker for bank selection
- [ ] Display bank list with names
- [ ] Display placeholder logos (if possible)
- [ ] Allow custom bank entry (free text option)
- [ ] Add dark theme styling

### 5.3 Bank Logo on Card
- [ ] Update CardItem to display bank logo
- [ ] Position logo in top-right corner
- [ ] Use placeholder logo for now
- [ ] Handle custom banks (show placeholder)

### 5.4 Update Add Card Form
- [ ] Replace bank name text input with BankSelector
- [ ] Integrate bank selection in form
- [ ] Store bank name in card data

**Review Checkpoint**: Can select bank from dropdown, and bank logo appears on card.

---

## Feature 6: Card Colors

**Goal**: Users can select custom colors for their cards.

### 6.1 Card Color Constants
- [ ] Define available card colors in `constants/theme.ts`
- [ ] Define gradient options
- [ ] Create color palette for selection

### 6.2 Color Selector Component
- [ ] Create `components/cards/ColorSelector.tsx`
- [ ] Display available colors
- [ ] Add gradient option
- [ ] Allow user to select color
- [ ] Preview selected color
- [ ] Add dark theme styling

### 6.3 Apply Colors to Cards
- [ ] Update CardItem to use selected color
- [ ] Apply gradient if gradient option selected
- [ ] Store color preference in card data
- [ ] Default to gradient if no color selected

### 6.4 Update Add Card Form
- [ ] Add ColorSelector to form
- [ ] Make color selection optional
- [ ] Save color preference with card

**Review Checkpoint**: Can select card colors, and colors are applied to cards.

---

## Feature 7: Search & Filter

**Goal**: Users can search/filter cards by bank name.

### 7.1 Search Bar Component
- [ ] Create `components/ui/SearchBar.tsx`
- [ ] Implement search input
- [ ] Add search icon
- [ ] Add clear button
- [ ] Add debouncing for search
- [ ] Add dark theme styling

### 7.2 Filter Logic
- [ ] Update `services/cards.service.ts`
- [ ] Implement `filterCardsByBank(cards: Card[], bankName: string)`
- [ ] Filter cards by bank name (case-insensitive)
- [ ] Maintain sorting order (pinned first, then by usage)

### 7.3 Integrate Search
- [ ] Add SearchBar to main screen
- [ ] Connect search input to filter logic
- [ ] Update CardList to show filtered results
- [ ] Clear search to show all cards
- [ ] Maintain pinned cards at top when filtering

**Review Checkpoint**: Can search cards by bank name, and filtered results maintain sorting order.

---

## Feature 8: Card Number Reveal & CVV Display Options

**Goal**: Users can reveal card number and configure CVV display.

### 8.1 Card Number Reveal
- [ ] Update CardItem to support tap to reveal
- [ ] Implement toggle to show/hide full card number
- [ ] Default: masked (last 4 digits visible)
- [ ] Tap card to reveal full number
- [ ] Add smooth animation for reveal

### 8.2 CVV Display Options
- [ ] Update CardItem to support CVV display modes
- [ ] Option 1: Always visible (default for now)
- [ ] Option 2: Tap to reveal (for future settings)
- [ ] Add tap handler for CVV reveal

### 8.3 Validation Updates
- [ ] Create `utils/validators.ts`
- [ ] Implement `validateCVV()` - 3-4 digits, numeric
- [ ] Implement `validateExpiryDate()` - MM/YY format
- [ ] Implement `isExpired()` - Check if expired
- [ ] Add validation to AddCardForm
- [ ] Show inline error messages
- [ ] Show toast for validation errors

**Review Checkpoint**: Can reveal card number by tapping, and CVV display is configurable.

---

## Feature 9: Onboarding & Empty States

**Goal**: First-time users see onboarding, and empty states are handled properly.

### 9.1 Onboarding Screen
- [ ] Create `app/onboarding.tsx`
- [ ] Design onboarding UI
- [ ] Add welcome message
- [ ] Add feature highlights
- [ ] Add "Get Started" button
- [ ] Store onboarding completion in storage
- [ ] Navigate to main screen after onboarding

### 9.2 Empty State
- [ ] Create empty state component
- [ ] Show empty state when no cards
- [ ] Add "Add Your First Card" button
- [ ] Add helpful message
- [ ] Style appropriately for dark theme

### 9.3 Navigation Logic
- [ ] Check if onboarding completed on app start
- [ ] Show onboarding if first time
- [ ] Show empty state if no cards (after onboarding)
- [ ] Show card list if cards exist

**Review Checkpoint**: First-time users see onboarding, and empty states are handled properly.

---

## Feature 10: Polish & Animations

**Goal**: App feels polished with smooth animations and refined UI.

### 10.1 Animations
- [ ] Add card reveal animation (smooth transition)
- [ ] Add card list animations (fade in, slide)
- [ ] Add modal animations (slide up, fade)
- [ ] Add button press animations
- [ ] Add copy feedback animations
- [ ] Ensure animations are moderate (fast but modern)

### 10.2 UI Polish
- [ ] Refine card design (spacing, shadows, borders)
- [ ] Refine color schemes
- [ ] Refine typography
- [ ] Refine spacing and padding throughout
- [ ] Ensure consistent dark theme
- [ ] Improve button styles
- [ ] Improve input styles

### 10.3 User Experience
- [ ] Add loading states (when loading cards)
- [ ] Add error states (storage errors, etc.)
- [ ] Improve error messages
- [ ] Add success feedback for card addition
- [ ] Improve user guidance
- [ ] Add haptic feedback for important actions

### 10.4 Accessibility
- [ ] Respect system font size settings
- [ ] Ensure sufficient color contrast
- [ ] Ensure touch targets are minimum 44x44 points
- [ ] Add accessibility labels (basic)

**Review Checkpoint**: App feels polished with smooth animations and refined UI/UX.

---

## Feature 11: Input Components & Form Improvements

**Goal**: Reusable input components and improved form experience.

### 11.1 Generic UI Components
- [ ] Create `components/ui/Button.tsx` (reusable button)
- [ ] Create `components/ui/Input.tsx` (reusable input)
- [ ] Create `components/ui/Modal.tsx` (reusable modal)
- [ ] Add dark theme styling to all components
- [ ] Make components accessible

### 11.2 Form Improvements
- [ ] Update AddCardForm to use new Input component
- [ ] Improve form validation
- [ ] Add better error handling
- [ ] Improve form layout
- [ ] Add form field labels
- [ ] Improve form submission flow

### 11.3 Card Number Input
- [ ] Improve card number input formatting
- [ ] Add input masking
- [ ] Handle backspace properly
- [ ] Limit input to 16 digits

### 11.4 Expiry Date Input
- [ ] Improve expiry date input
- [ ] Add input masking (MM/YY)
- [ ] Validate expiry date format
- [ ] Check if expired
- [ ] Show error if expired

**Review Checkpoint**: Forms use reusable components and have improved validation and UX.

---

## Feature 12: Final Testing & Bug Fixes

**Goal**: App is thoroughly tested and all bugs are fixed.

### 12.1 Functional Testing
- [ ] Test add card flow
- [ ] Test card display
- [ ] Test card copy functionality
- [ ] Test usage tracking
- [ ] Test card sorting
- [ ] Test card pinning
- [ ] Test bank selection
- [ ] Test color selection
- [ ] Test search/filter
- [ ] Test card number reveal
- [ ] Test onboarding
- [ ] Test empty states

### 12.2 Edge Cases
- [ ] Test with no cards
- [ ] Test with many cards (50+)
- [ ] Test with duplicate banks
- [ ] Test with expired cards
- [ ] Test with invalid data
- [ ] Test storage errors
- [ ] Test app restart (data persistence)

### 12.3 Platform Testing
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical devices (if possible)
- [ ] Test different screen sizes
- [ ] Test dark mode
- [ ] Test system font sizes

### 12.4 Bug Fixes
- [ ] Fix any discovered bugs
- [ ] Fix performance issues
- [ ] Fix UI/UX issues
- [ ] Fix storage issues
- [ ] Fix validation issues

### 12.5 Code Quality
- [ ] Review code for best practices
- [ ] Remove unused code
- [ ] Add comments where needed
- [ ] Ensure TypeScript types are correct
- [ ] Ensure error handling is proper
- [ ] Ensure security best practices

**Review Checkpoint**: App is thoroughly tested, and all bugs are fixed.

---

## Feature 13: Documentation & Finalization

**Goal**: Code is documented, and app is ready for release.

### 13.1 Code Documentation
- [ ] Document complex functions
- [ ] Document component props
- [ ] Document service methods
- [ ] Add JSDoc comments
- [ ] Update README.md with setup instructions
- [ ] Add code comments where needed

### 13.2 User Documentation
- [ ] Document app features
- [ ] Document how to use the app
- [ ] Add help text in app (if needed)

### 13.3 Final Checks
- [ ] Verify all requirements are met
- [ ] Verify all acceptance criteria are met
- [ ] Verify dark theme is consistent
- [ ] Verify animations are smooth
- [ ] Verify performance is good
- [ ] Verify security is proper
- [ ] Verify accessibility (system font size)

### 13.4 App Store Preparation
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
- **Feature 4** depends on Feature 3
- **Feature 5** can be done after Feature 1 or 2
- **Feature 6** can be done after Feature 2
- **Feature 7** depends on Feature 5
- **Feature 8** depends on Feature 2
- **Feature 9** can be done anytime after Feature 1
- **Feature 10** should be done after core features
- **Feature 11** can be done early or integrated with other features
- **Feature 12** is done after all features
- **Feature 13** is final step

### Recommended Order
1. Feature 1: Basic Setup & Add Card (MVP)
2. Feature 2: Card UI Design & Display
3. Feature 3: Copy Functionality & Usage Tracking
4. Feature 4: Card Pinning
5. Feature 5: Bank Selection & Logos
6. Feature 6: Card Colors
7. Feature 7: Search & Filter
8. Feature 8: Card Number Reveal & CVV Display
9. Feature 9: Onboarding & Empty States
10. Feature 11: Input Components & Form Improvements (can be done earlier)
11. Feature 10: Polish & Animations
12. Feature 12: Final Testing & Bug Fixes
13. Feature 13: Documentation & Finalization

---

## Notes

- Each feature is **independent** and can be reviewed as a complete app feature
- After each feature, the app should be **functional** and **testable**
- Course corrections can be made after any feature
- Features build on each other, so order matters
- Some features can be done in parallel (e.g., Feature 5 and 6)
- Testing should be done after each feature
- Keep the app in a working state at all times

---

## Quick Reference

### MVP Features (Must Have)
- Feature 1: Basic Setup & Add Card
- Feature 2: Card UI Design & Display
- Feature 3: Copy Functionality & Usage Tracking
- Feature 4: Card Pinning

### Enhanced Features (Should Have)
- Feature 5: Bank Selection & Logos
- Feature 6: Card Colors
- Feature 7: Search & Filter
- Feature 8: Card Number Reveal & CVV Display

### Polish Features (Nice to Have)
- Feature 9: Onboarding & Empty States
- Feature 10: Polish & Animations
- Feature 11: Input Components & Form Improvements
- Feature 12: Final Testing & Bug Fixes
- Feature 13: Documentation & Finalization

---

**Status**: 📋 Ready for Development - Start with Feature 1 (MVP)

