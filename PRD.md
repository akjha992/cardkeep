# CardVault - Product Requirements Document (PRD)

## 1. Overview

### 1.1 Product Name
**CardVault**

### 1.2 Product Description
CardVault is an offline mobile application designed to securely store and manage credit/debit card information. The app provides users with a digital wallet to keep track of all their payment cards in one place, with an intuitive card-like UI that mimics physical credit cards.

### 1.3 Target Audience
- Users who want to securely store multiple credit/debit card details
- People who frequently switch between different payment cards
- Users who prefer offline solutions for sensitive financial data

### 1.4 Core Value Proposition
- **Secure Offline Storage**: All data stored locally on the device
- **Easy Access**: Quick access to card details with copy functionality
- **Smart Organization**: Automatic sorting based on usage frequency
- **Beautiful UI**: Modern, card-like interface with dark theme

---

## 2. Features & Requirements

### 2.1 Core Features

#### 2.1.1 Card Management
- **Add New Card**: Users can add multiple credit/debit cards
- **View Cards**: Display all cards in a scrollable list
- **Edit Card**: Modify existing card details (future consideration)
- **Delete Card**: Remove cards from the vault (future consideration)

#### 2.1.2 Card Information Fields
Each card must store:
- **Card Number** (16 digits, formatted as XXXX XXXX XXXX XXXX)
- **CVV** (3-4 digits)
- **Expiry Date** (MM/YY format)
- **Bank Name** (selected from predefined dropdown or custom entry)
- **Cardholder Name** (user's name on the card)
- **Card Type** (Credit or Debit) - Required field
- **Color** (User-selectable color for card design) - Optional

#### 2.1.3 Card Display UI
- Cards should visually resemble physical credit/debit cards
- Display card number (masked by default, showing last 4 digits: **** **** **** 1234)
- Card number reveal: Configurable in settings (tap to toggle default, long press option)
- CVV display: Configurable (always visible or tap to reveal)
- Show expiry date, cardholder name, card type
- Display bank logo based on selected bank (top-right corner)
- User-selectable card colors (with generic gradient option)
- Card design should be modern and aesthetically pleasing
- Dark theme with card-specific styling
- Standard credit card dimensions (85.60 × 53.98 mm ratio)
- Moderate animations (fast but modern looking)

#### 2.1.4 Bank Selection & Logos
- Dropdown/picker for bank selection
- Initial predefined banks: HDFC, SBI, ICICI, AXIS (Indian banks)
- Support for custom bank entry (free text)
- Bank logo automatically displayed on card based on selection
- Placeholder logos for now (directory structure ready for future logo assets)
- Logo assets stored locally in the app (`assets/images/banks/`)
- Bank logo positioned in top-right corner of card

#### 2.1.5 Usage Tracking & Sorting
- Track usage frequency (number of times card number is copied)
- Only card number copy counts as usage (CVV and expiry copy do not count)
- Automatically sort cards by usage frequency (most used on top)
- When usage counts are equal, sort by most recently used first
- Pinned cards (fixed position) are excluded from frequency-based sorting
- Pinned cards remain at the top (separate section) regardless of usage
- Search/filter cards by bank name

#### 2.1.6 Copy Functionality
- Copy card number to clipboard (V1 only - CVV and expiry copy in future)
- Card number copied without spaces (1234567890123456 format for compatibility)
- Copy action is tracked for usage frequency calculation (only card number copy)
- User receives feedback when data is copied (toast notification + haptic feedback)
- Copy all card details (future consideration)

#### 2.1.7 Card Pinning
- Users can pin/fix a card's position
- Pinned cards always appear at the top (separate section)
- Toggle pin status on/off
- Visual indicator for pinned cards (e.g., pin icon)
- Pinned cards maintain position regardless of usage frequency

### 2.2 Data Storage

#### 2.2.1 Storage Mechanism
- **Local Storage Only**: No cloud synchronization, no network transfer
- Use `expo-secure-store` for data persistence (encrypted, keychain/keystore)
- Data encrypted at rest (handled by secure storage APIs)
- All data stored on device only
- Sensitive data (card numbers, CVV) stored securely using device keychain/keystore

#### 2.2.2 Data Structure
```typescript
interface Card {
  id: string; // Unique identifier (UUID)
  cardNumber: string; // Full card number (stored securely)
  cvv: string; // CVV (stored securely)
  expiryDate: string; // MM/YY format
  bankName: string; // Bank name
  cardholderName: string; // Cardholder name
  cardType: 'Credit' | 'Debit'; // Card type (required)
  usageCount: number; // Number of times card number is copied
  isPinned: boolean; // Whether card is pinned
  createdAt: number; // Creation timestamp (Unix timestamp)
  lastUsedAt: number; // Last usage timestamp (Unix timestamp)
  color?: string; // User-selected color for card design (optional)
}
```

### 2.3 Authentication (Future Consideration)
- **Initial Version**: No app-level authentication
- Rely on device-level security (PIN, fingerprint, face ID)
- Future versions may include app-level PIN/password

### 2.4 UI/UX Requirements

#### 2.4.1 Theme
- **Dark theme** as primary theme
- Modern, sleek design
- Card-like UI elements
- Smooth animations and transitions

#### 2.4.2 Navigation
- Main screen: List of all cards (vertical list, one card per row)
- Add card modal overlay (quick add, non-intrusive)
- Onboarding screen (first time users)
- Empty state (when no cards after onboarding)
- Search/filter functionality (by bank name)
- Settings screen (for future: card reveal method, CVV display preferences)

#### 2.4.3 Visual Design
- Card UI should mimic physical credit cards
- User-selectable card colors (with generic gradient option)
- Bank logos displayed in top-right corner
- Clear typography for card numbers (monospace font, larger size)
- Intuitive icons for actions (copy, pin, etc.)
- Respect system font size settings
- Modern, fast UI with moderate animations

---

## 3. Technical Requirements

### 3.1 Platform
- **iOS**: Native iOS support
- **Android**: Native Android support
- Built with React Native and Expo

### 3.2 Dependencies Required
- `expo-secure-store` for local storage (encrypted, keychain/keystore)
- `expo-clipboard` for copy functionality
- `expo-haptics` for haptic feedback (already included)
- `react-native-reanimated` for animations (already included)
- `uuid` for generating unique card IDs
- Image assets for bank logos (placeholder logos for now)

### 3.3 Code Structure
- **Modular Architecture**: Organize code into modules
- **Separation of Concerns**: 
  - Services layer for data operations
  - Components layer for UI
  - Types/interfaces for data models
  - Utilities for helpers
- **TypeScript**: Full TypeScript support
- **Clean Code**: Follow best practices and maintainability

### 3.4 File Structure
```
cardkeep/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx       # Main cards list screen
│   │   └── _layout.tsx     # Tab layout
│   ├── add-card.tsx        # Add card modal
│   ├── onboarding.tsx      # Onboarding screen (first time)
│   └── _layout.tsx         # Root layout
├── components/             # Reusable UI components
│   ├── cards/              # Card-related components
│   │   ├── CardItem.tsx    # Individual card component
│   │   ├── CardList.tsx    # Cards list component
│   │   ├── AddCardForm.tsx # Add card form
│   │   ├── BankSelector.tsx # Bank dropdown selector
│   │   └── ColorSelector.tsx # Color picker component
│   └── ui/                 # Generic UI components
│       ├── SearchBar.tsx   # Search bar component
│       └── Toast.tsx       # Toast notification component
├── services/               # Business logic & data services
│   ├── storage.service.ts  # Local storage operations (expo-secure-store)
│   ├── cards.service.ts    # Card CRUD operations
│   └── usage.service.ts    # Usage tracking
├── types/                  # TypeScript type definitions
│   ├── card.types.ts       # Card-related types (includes cardType, color)
│   └── bank.types.ts       # Bank-related types
├── constants/              # App constants
│   ├── banks.ts            # Bank list (HDFC, SBI, ICICI, AXIS) and logos
│   └── theme.ts            # Theme colors (dark theme)
└── utils/                  # Utility functions
    ├── formatters.ts       # Card number formatting, etc.
    └── validators.ts       # CVV and expiry validation
```

---

## 4. User Stories

### 4.1 Card Management
1. **As a user**, I want to add a new card so that I can store its details in the app
2. **As a user**, I want to see all my cards in a list so that I can easily find the card I need
3. **As a user**, I want to view card details in a card-like UI so that it feels familiar

### 4.2 Usage & Organization
4. **As a user**, I want my most frequently used cards at the top so that I can access them quickly
5. **As a user**, I want to pin important cards so that they stay in a fixed position
6. **As a user**, I want to copy card details so that I can use them for online transactions

### 4.3 Bank Selection
7. **As a user**, I want to select my bank from a dropdown so that the correct logo appears on my card
8. **As a user**, I want to see my bank's logo on the card so that it looks authentic

---

## 5. Acceptance Criteria

### 5.1 Add Card Feature
- [ ] User can open "Add Card" modal overlay
- [ ] All required fields (card number, CVV, expiry, bank, name, card type) are present
- [ ] Bank selection shows dropdown with predefined banks (HDFC, SBI, ICICI, AXIS)
- [ ] Custom bank entry is supported (free text)
- [ ] Card type selection (Credit/Debit) is required
- [ ] User can select card color (optional)
- [ ] Card number input is formatted as user types (XXXX XXXX XXXX XXXX)
- [ ] Card number validation: No validation for now (user responsibility)
- [ ] CVV is validated (3-4 digits, numeric only)
- [ ] Expiry date is validated (MM/YY format) and ensures not expired
- [ ] Error handling: Both inline errors and toast notifications
- [ ] Card is saved to local storage (expo-secure-store)
- [ ] New card appears in the card list

### 5.2 Card Display
- [ ] Cards are displayed in a vertical scrollable list (one card per row)
- [ ] Each card looks like a physical credit card (standard credit card dimensions)
- [ ] Bank logo is displayed in top-right corner (placeholder logos for now)
- [ ] Card number is masked by default showing last 4 digits (**** **** **** 1234)
- [ ] Card number can be revealed (tap to toggle by default, configurable)
- [ ] CVV display is configurable (always visible or tap to reveal)
- [ ] Card shows expiry date, cardholder name, card type
- [ ] User-selected card colors are applied
- [ ] Dark theme is applied consistently
- [ ] Moderate animations (fast but modern looking)
- [ ] Search/filter by bank name is available

### 5.3 Usage Tracking
- [ ] Copying card number increments usage count (only card number copy counts)
- [ ] Cards are sorted by usage frequency (most used first)
- [ ] When usage counts are equal, sort by most recently used first
- [ ] Pinned cards are excluded from frequency sorting
- [ ] Pinned cards remain at the top (separate section)

### 5.4 Card Pinning
- [ ] User can pin/unpin a card
- [ ] Pinned cards have visual indicator
- [ ] Pinned cards maintain position regardless of usage

### 5.5 Copy Functionality
- [ ] User can copy card number to clipboard (V1 only)
- [ ] Card number is copied without spaces (1234567890123456 format)
- [ ] Copy action is tracked for usage frequency (only card number copy)
- [ ] User receives feedback when data is copied (toast notification + haptic feedback)
- [ ] CVV and expiry copy functionality (future consideration)

---

## 6. Non-Functional Requirements

### 6.1 Performance
- App should load quickly (< 2 seconds)
- Smooth scrolling in card list
- Instant response to user actions

### 6.2 Security
- Data stored securely on device
- No data transmitted to external servers
- Card numbers should be masked by default

### 6.3 Usability
- Intuitive UI/UX
- Clear visual feedback for actions
- Easy to add and manage cards
- Onboarding for first-time users
- Empty state when no cards
- Search/filter functionality
- Respect system font size settings

### 6.4 Maintainability
- Modular code structure
- Well-documented code
- TypeScript for type safety
- Easy to extend with new features

---

## 7. Future Considerations (Out of Scope for V1)

### 7.1 Features
- Edit card details
- Delete cards
- Card categories (beyond Credit/Debit type)
- Export/import cards
- App-level authentication (PIN/password)
- Biometric authentication
- Card expiration reminders
- Transaction history
- Multiple cardholders
- Card notes/remarks
- Copy CVV and expiry date to clipboard
- Card number validation (Luhn algorithm)
- Settings screen (card reveal method, CVV display preferences)
- Screen reader support (basic accessibility)

### 7.2 Technical
- Cloud synchronization
- Multi-device support
- Backup/restore functionality
- Data encryption beyond device security
- Analytics (privacy-preserving)

---

## 8. Success Metrics

### 8.1 User Engagement
- Number of cards added per user
- Frequency of app usage
- Cards copied per session

### 8.2 Performance
- App load time
- Time to add a new card
- Time to copy card details

### 8.3 Quality
- Number of crashes
- User satisfaction ratings
- Feature adoption rate

---

## 9. Risks & Mitigations

### 9.1 Security Risks
- **Risk**: Sensitive card data stored on device
- **Mitigation**: Use secure storage APIs, rely on device-level security, educate users

### 9.2 Data Loss
- **Risk**: Data loss if device is lost/damaged
- **Mitigation**: Future backup/export features (out of scope for V1)

### 9.3 User Experience
- **Risk**: Complex UI for managing multiple cards
- **Mitigation**: Intuitive design, user testing, iterative improvements

---

## 10. Timeline & Milestones

### Phase 1: Core Setup
- Project setup and structure
- Theme configuration (dark theme)
- Basic navigation

### Phase 2: Data Layer
- Storage service implementation
- Card data models
- Bank constants and logos

### Phase 3: UI Components
- Card component design
- Card list component
- Add card form

### Phase 4: Core Features
- Add card functionality
- Display cards
- Copy functionality
- Usage tracking

### Phase 5: Advanced Features
- Card pinning
- Usage-based sorting
- Bank logo integration

### Phase 6: Polish
- Animations
- UI/UX refinements
- Testing
- Bug fixes

---

## 11. Decisions Made ✅

All questions have been answered. See `QUESTIONS.md` for detailed decisions. Key decisions:

### Card Display & Security
- Card number masking: Last 4 digits visible (**** **** **** 1234)
- Card number reveal: Configurable (tap toggle default, long press option)
- CVV display: Configurable (always visible or tap to reveal)

### Banks & Logos
- Initial banks: HDFC, SBI, ICICI, AXIS (Indian banks)
- Placeholder logos for now, directory structure ready for future assets
- Logo position: Top-right corner

### Card Design
- User-selectable colors (with generic gradient option)
- Standard credit card dimensions
- Moderate animations (fast but modern)

### Usage & Sorting
- Only card number copy counts as usage
- Sort by usage frequency, then most recently used
- Pinned cards always at top

### Copy & Validation
- Only card number copy for V1 (without spaces)
- No card number validation for now
- Expiry validation: Format and ensure not expired
- CVV validation: Length (3-4 digits) and numeric

### Storage & Data
- expo-secure-store (local only, no network transfer)
- Card type (Credit/Debit) required in model
- Search/filter by bank name

