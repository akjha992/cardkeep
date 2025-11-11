# CardVault - Development TODO List

This document breaks down the development work into small, manageable tasks that can be reviewed and course-corrected independently.

## Phase 1: Project Setup & Dependencies

### 1.1 Install Dependencies
- [ ] Install `expo-secure-store` package
- [ ] Install `expo-clipboard` package
- [ ] Install `uuid` package for generating card IDs
- [ ] Verify all dependencies are compatible with Expo SDK 54
- [ ] Update `package.json` with new dependencies

### 1.2 Update App Configuration
- [ ] Update `app.json` - Change app name to "CardVault"
- [ ] Update `app.json` - Change bundle identifiers if needed
- [ ] Update theme colors in `constants/theme.ts` for dark theme
- [ ] Verify dark theme is properly configured

### 1.3 Create Directory Structure
- [ ] Create `services/` directory
- [ ] Create `types/` directory
- [ ] Create `utils/` directory
- [ ] Create `components/cards/` directory
- [ ] Create `components/ui/` directory
- [ ] Create `assets/images/banks/` directory
- [ ] Add placeholder logo image in `assets/images/banks/placeholder.png`

---

## Phase 2: Type Definitions

### 2.1 Card Types
- [ ] Create `types/card.types.ts`
- [ ] Define `Card` interface with all required fields:
  - [ ] id: string
  - [ ] cardNumber: string
  - [ ] cvv: string
  - [ ] expiryDate: string
  - [ ] bankName: string
  - [ ] cardholderName: string
  - [ ] cardType: 'Credit' | 'Debit'
  - [ ] usageCount: number
  - [ ] isPinned: boolean
  - [ ] createdAt: number
  - [ ] lastUsedAt: number
  - [ ] color?: string (optional)

### 2.2 Bank Types
- [ ] Create `types/bank.types.ts`
- [ ] Define `Bank` interface:
  - [ ] id: string
  - [ ] name: string
  - [ ] logo: any
  - [ ] color?: string (optional)

### 2.3 Storage Types
- [ ] Create `types/storage.types.ts` (if needed)
- [ ] Define any storage-related types

---

## Phase 3: Constants & Configuration

### 3.1 Bank Constants
- [ ] Create `constants/banks.ts`
- [ ] Define bank list with HDFC, SBI, ICICI, AXIS
- [ ] Set up placeholder logos for each bank
- [ ] Export `BANKS` array
- [ ] Add function to get bank by name/id
- [ ] Add function to get bank logo (with placeholder fallback)

### 3.2 Theme Constants
- [ ] Update `constants/theme.ts` with dark theme colors
- [ ] Define card color options/palette
- [ ] Define gradient options for cards
- [ ] Export color constants

### 3.3 Card Colors
- [ ] Define available card colors (user-selectable)
- [ ] Define gradient options
- [ ] Create color picker options

---

## Phase 4: Utility Functions

### 4.1 Formatters
- [ ] Create `utils/formatters.ts`
- [ ] Implement `formatCardNumber(number: string): string` - Format as XXXX XXXX XXXX XXXX
- [ ] Implement `maskCardNumber(number: string, showLast: number = 4): string` - Mask with last 4 visible
- [ ] Implement `formatExpiryDate(date: string): string` - Format as MM/YY
- [ ] Implement `removeSpacesFromCardNumber(number: string): string` - For copying
- [ ] Add unit tests for formatters (optional)

### 4.2 Validators
- [ ] Create `utils/validators.ts`
- [ ] Implement `validateCardNumber(number: string): boolean` - Return true for now (no validation)
- [ ] Implement `validateCVV(cvv: string): boolean` - 3-4 digits, numeric only
- [ ] Implement `validateExpiryDate(date: string): boolean` - MM/YY format validation
- [ ] Implement `isExpired(date: string): boolean` - Check if expiry date has passed
- [ ] Add unit tests for validators (optional)

### 4.3 Clipboard Utilities
- [ ] Create `utils/clipboard.ts`
- [ ] Implement `copyToClipboard(text: string): Promise<void>` - Copy to clipboard
- [ ] Implement `showCopyFeedback(): void` - Show toast + haptic feedback
- [ ] Integrate with expo-clipboard and expo-haptics

---

## Phase 5: Storage Service

### 5.1 Storage Service Implementation
- [ ] Create `services/storage.service.ts`
- [ ] Implement `saveCard(card: Card): Promise<void>` - Save card to secure store
- [ ] Implement `getCards(): Promise<Card[]>` - Get all cards
- [ ] Implement `updateCard(id: string, updates: Partial<Card>): Promise<void>` - Update card
- [ ] Implement `deleteCard(id: string): Promise<void>` - Delete card
- [ ] Implement `incrementUsage(id: string): Promise<void>` - Increment usage count
- [ ] Implement `togglePin(id: string): Promise<void>` - Toggle pin status
- [ ] Handle storage errors appropriately
- [ ] Use expo-secure-store for sensitive data (cardNumber, CVV)
- [ ] Use AsyncStorage for non-sensitive data (metadata)

### 5.2 Cards Service
- [ ] Create `services/cards.service.ts`
- [ ] Implement card CRUD operations
- [ ] Implement card sorting logic (pinned first, then by usage, then by lastUsed)
- [ ] Implement card filtering by bank name
- [ ] Export service functions

### 5.3 Usage Service
- [ ] Create `services/usage.service.ts`
- [ ] Implement usage tracking logic
- [ ] Implement increment usage on card number copy
- [ ] Update lastUsedAt timestamp
- [ ] Export service functions

---

## Phase 6: UI Components - Generic

### 6.1 Button Component
- [ ] Create `components/ui/Button.tsx`
- [ ] Implement button with dark theme styling
- [ ] Add variants (primary, secondary, etc.)
- [ ] Add loading state
- [ ] Add disabled state
- [ ] Make it accessible

### 6.2 Input Component
- [ ] Create `components/ui/Input.tsx`
- [ ] Implement input with dark theme styling
- [ ] Add error state styling
- [ ] Add label support
- [ ] Add placeholder support
- [ ] Make it accessible

### 6.3 Modal Component
- [ ] Create `components/ui/Modal.tsx`
- [ ] Implement modal overlay
- [ ] Add close functionality
- [ ] Add dark theme styling
- [ ] Make it accessible
- [ ] Add animation support

### 6.4 Search Bar Component
- [ ] Create `components/ui/SearchBar.tsx`
- [ ] Implement search input
- [ ] Add search icon
- [ ] Add clear button
- [ ] Add dark theme styling
- [ ] Add debouncing for search

### 6.5 Toast Component
- [ ] Create `components/ui/Toast.tsx`
- [ ] Implement toast notification
- [ ] Add success/error/info variants
- [ ] Add auto-dismiss functionality
- [ ] Add dark theme styling
- [ ] Integrate with haptic feedback

---

## Phase 7: UI Components - Card Specific

### 7.1 Bank Selector Component
- [ ] Create `components/cards/BankSelector.tsx`
- [ ] Implement dropdown/picker for bank selection
- [ ] Display bank list (HDFC, SBI, ICICI, AXIS)
- [ ] Add custom bank entry option
- [ ] Display bank logos (placeholder for now)
- [ ] Add dark theme styling
- [ ] Handle bank selection

### 7.2 Color Selector Component
- [ ] Create `components/cards/ColorSelector.tsx`
- [ ] Implement color picker
- [ ] Display available colors
- [ ] Add gradient option
- [ ] Allow user to select color
- [ ] Add dark theme styling
- [ ] Preview selected color on card

### 7.3 Card Item Component
- [ ] Create `components/cards/CardItem.tsx`
- [ ] Implement card-like UI with standard credit card dimensions
- [ ] Display bank logo in top-right corner
- [ ] Display masked card number (last 4 digits visible)
- [ ] Implement tap to copy card number
- [ ] Display cardholder name
- [ ] Display expiry date
- [ ] Display card type (Credit/Debit)
- [ ] Display CVV (configurable: always visible or tap to reveal)
- [ ] Add pin/unpin toggle button
- [ ] Apply user-selected color or gradient
- [ ] Add dark theme styling
- [ ] Add moderate animations
- [ ] Make it responsive

### 7.4 Card List Component
- [ ] Create `components/cards/CardList.tsx`
- [ ] Implement FlatList for card list
- [ ] Display cards in vertical list
- [ ] Separate pinned cards at top
- [ ] Sort cards by usage (pinned first, then by usage, then by lastUsed)
- [ ] Add empty state
- [ ] Add loading state
- [ ] Add pull to refresh (optional)
- [ ] Integrate search/filter functionality
- [ ] Add dark theme styling

### 7.5 Add Card Form Component
- [ ] Create `components/cards/AddCardForm.tsx`
- [ ] Implement card number input (formatted as user types)
- [ ] Implement CVV input (numeric, 3-4 digits)
- [ ] Implement expiry date input (MM/YY format)
- [ ] Implement bank selector
- [ ] Implement card type selector (Credit/Debit) - Required
- [ ] Implement color selector (optional)
- [ ] Implement cardholder name input
- [ ] Add validation (CVV, expiry)
- [ ] Add inline error messages
- [ ] Add toast notifications for errors
- [ ] Add submit button
- [ ] Handle form submission
- [ ] Add dark theme styling
- [ ] Make it accessible

---

## Phase 8: Screens

### 8.1 Onboarding Screen
- [ ] Create `app/onboarding.tsx`
- [ ] Design onboarding UI
- [ ] Add welcome message
- [ ] Add feature highlights
- [ ] Add "Get Started" button
- [ ] Store onboarding completion status
- [ ] Navigate to main screen after onboarding
- [ ] Add dark theme styling

### 8.2 Main Cards List Screen
- [ ] Update `app/(tabs)/index.tsx`
- [ ] Integrate CardList component
- [ ] Add floating action button to add card
- [ ] Add search bar
- [ ] Implement search/filter by bank name
- [ ] Handle empty state (show onboarding or empty state)
- [ ] Load cards from storage on mount
- [ ] Handle card sorting
- [ ] Handle card pinning
- [ ] Handle card copy functionality
- [ ] Update usage tracking on copy
- [ ] Add dark theme styling
- [ ] Add navigation to add card modal

### 8.3 Add Card Modal Screen
- [ ] Create `app/add-card.tsx`
- [ ] Implement modal presentation
- [ ] Integrate AddCardForm component
- [ ] Handle form submission
- [ ] Save card to storage
- [ ] Navigate back after saving
- [ ] Refresh card list after saving
- [ ] Add dark theme styling
- [ ] Handle modal dismissal

---

## Phase 9: Navigation & Routing

### 9.1 Update Root Layout
- [ ] Update `app/_layout.tsx`
- [ ] Configure dark theme
- [ ] Add navigation stack
- [ ] Configure modal presentation for add card
- [ ] Handle onboarding navigation
- [ ] Add status bar styling

### 9.2 Update Tab Layout (if needed)
- [ ] Update `app/(tabs)/_layout.tsx` if tabs are needed
- [ ] Configure tab navigation
- [ ] Add tab icons
- [ ] Add dark theme styling

---

## Phase 10: Integration & Data Flow

### 10.1 Connect Storage to Components
- [ ] Connect storage service to cards service
- [ ] Connect cards service to CardList component
- [ ] Connect usage service to CardItem component
- [ ] Test data flow end-to-end

### 10.2 Implement Card Operations
- [ ] Test add card functionality
- [ ] Test card display
- [ ] Test card sorting
- [ ] Test card pinning
- [ ] Test card copy functionality
- [ ] Test usage tracking
- [ ] Test search/filter functionality

### 10.3 Handle Edge Cases
- [ ] Handle empty card list
- [ ] Handle storage errors
- [ ] Handle invalid data
- [ ] Handle network errors (if any)
- [ ] Handle expired cards
- [ ] Handle duplicate cards (if needed)

---

## Phase 11: Polish & Animations

### 11.1 Animations
- [ ] Add card reveal animation
- [ ] Add card list animations
- [ ] Add modal animations
- [ ] Add button press animations
- [ ] Add copy feedback animations
- [ ] Ensure animations are moderate (fast but modern)

### 11.2 UI Polish
- [ ] Refine card design
- [ ] Refine color schemes
- [ ] Refine typography
- [ ] Refine spacing and padding
- [ ] Refine shadows and borders
- [ ] Ensure consistent dark theme

### 11.3 User Experience
- [ ] Add loading states
- [ ] Add error states
- [ ] Add success feedback
- [ ] Improve error messages
- [ ] Improve user guidance
- [ ] Add tooltips/hints (if needed)

---

## Phase 12: Testing & Quality Assurance

### 12.1 Manual Testing
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test add card flow
- [ ] Test card display
- [ ] Test card sorting
- [ ] Test card pinning
- [ ] Test card copy functionality
- [ ] Test usage tracking
- [ ] Test search/filter
- [ ] Test with multiple cards (10+)
- [ ] Test with many cards (50+)
- [ ] Test edge cases
- [ ] Test error scenarios

### 12.2 Bug Fixes
- [ ] Fix any discovered bugs
- [ ] Fix performance issues
- [ ] Fix UI/UX issues
- [ ] Fix accessibility issues
- [ ] Fix storage issues

### 12.3 Code Quality
- [ ] Review code for best practices
- [ ] Remove unused code
- [ ] Add comments where needed
- [ ] Ensure TypeScript types are correct
- [ ] Ensure error handling is proper
- [ ] Ensure security best practices

---

## Phase 13: Documentation & Finalization

### 13.1 Code Documentation
- [ ] Document complex functions
- [ ] Document component props
- [ ] Document service methods
- [ ] Update README.md with setup instructions
- [ ] Add code comments where needed

### 13.2 User Documentation
- [ ] Document app features
- [ ] Document how to use the app
- [ ] Add help text in the app (if needed)

### 13.3 Final Checks
- [ ] Verify all requirements are met
- [ ] Verify all acceptance criteria are met
- [ ] Verify dark theme is consistent
- [ ] Verify animations are smooth
- [ ] Verify performance is good
- [ ] Verify security is proper
- [ ] Verify accessibility (system font size)

---

## Review Checkpoints

### Checkpoint 1: After Phase 1-3 (Setup & Types)
- Review project setup
- Review type definitions
- Review constants
- Approve before proceeding

### Checkpoint 2: After Phase 4-5 (Utilities & Storage)
- Review utility functions
- Review storage service
- Test storage operations
- Approve before proceeding

### Checkpoint 3: After Phase 6-7 (UI Components)
- Review generic UI components
- Review card-specific components
- Test component functionality
- Approve before proceeding

### Checkpoint 4: After Phase 8-9 (Screens & Navigation)
- Review screens
- Review navigation
- Test user flows
- Approve before proceeding

### Checkpoint 5: After Phase 10 (Integration)
- Review data flow
- Test end-to-end functionality
- Approve before proceeding

### Checkpoint 6: After Phase 11 (Polish)
- Review animations
- Review UI polish
- Approve before proceeding

### Checkpoint 7: After Phase 12 (Testing)
- Review test results
- Review bug fixes
- Approve before proceeding

### Checkpoint 8: Final Review
- Final code review
- Final UI/UX review
- Final testing
- Approve for release

---

## Notes

- Each task should be small enough to be completed and reviewed independently
- After each phase, pause for review before proceeding
- Course corrections can be made at any checkpoint
- Prioritize functionality over polish initially
- Test on both iOS and Android throughout development
- Follow React Native and Expo best practices
- Maintain TypeScript type safety throughout
- Keep dark theme consistent
- Ensure security best practices are followed

---

## Priority Order

1. **High Priority** (Core Functionality):
   - Phase 1-3: Setup & Types
   - Phase 4-5: Utilities & Storage
   - Phase 7: Card Components (CardItem, AddCardForm)
   - Phase 8: Screens (Main screen, Add card modal)

2. **Medium Priority** (Enhanced Functionality):
   - Phase 6: Generic UI Components
   - Phase 9: Navigation
   - Phase 10: Integration
   - Phase 7: Other Card Components (BankSelector, ColorSelector)

3. **Low Priority** (Polish & Quality):
   - Phase 11: Animations & Polish
   - Phase 12: Testing
   - Phase 13: Documentation

---

**Status**: 📋 Ready for Development - Start with Phase 1

