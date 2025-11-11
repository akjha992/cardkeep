# CardVault - Development Prompt

## Project Overview
Build CardVault, an offline mobile application for securely storing and managing credit/debit card information. The app uses React Native with Expo, TypeScript, and follows a modular architecture.

## Core Requirements

### 1. App Functionality
- **Add Cards**: Users can add multiple credit/debit cards with the following fields:
  - Card Number (16 digits, formatted as XXXX XXXX XXXX XXXX)
  - CVV (3-4 digits)
  - Expiry Date (MM/YY format)
  - Bank Name (selected from dropdown: HDFC, SBI, ICICI, AXIS or custom entry)
  - Cardholder Name
  - Card Type (Credit or Debit) - Required
  - Color (User-selectable) - Optional
- **View Cards**: Display all cards in a vertical scrollable list with card-like UI
- **Delete Cards**: Users can delete cards they no longer need.
- **Copy Details**: Tap card to copy card number to clipboard (V1 only - CVV and expiry in future)
- **Usage Tracking**: Track how many times card number is copied (only card number copy counts)
- **Smart Sorting**: Automatically sort cards by usage frequency (most used on top, then most recently used)
- **Pin Cards**: Allow users to pin cards to fixed positions at top (excluded from frequency sorting)
- **Search/Filter**: Search cards by bank name

### 2. UI/UX Requirements
- **Dark Theme**: Modern dark theme throughout the app
- **Card Design**: Cards should visually resemble physical credit/debit cards (standard credit card dimensions)
- **Card Colors**: User-selectable colors (with generic gradient option)
- **Card Number Display**: Masked by default showing last 4 digits (**** **** **** 1234)
- **Card Number Reveal**: Configurable (tap to toggle default, long press option)
- **CVV Display**: Configurable (always visible or tap to reveal)
- **Modern Design**: Sleek, modern UI with moderate animations (fast but modern looking)
- **Onboarding**: Onboarding screen for first-time users
- **Empty State**: Empty state when no cards (after onboarding)
- **Responsive**: Works on iOS and Android
- **Accessibility**: Respect system font size settings

### 3. Technical Requirements
- **Offline Only**: No cloud storage, all data stored locally on device
- **Secure Storage**: Use `expo-secure-store` for sensitive data
- **TypeScript**: Full TypeScript support with proper types
- **Modular Architecture**: Organize code into clear modules
- **File-based Routing**: Use Expo Router for navigation

## Project Structure

```
cardkeep/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx            # Main cards list screen
│   │   └── _layout.tsx          # Tab layout (if needed)
│   ├── add-card.tsx             # Add card modal
│   ├── onboarding.tsx           # Onboarding screen (first time)
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable UI components
│   ├── cards/
│   │   ├── CardItem.tsx         # Individual card component
│   │   ├── CardList.tsx         # Cards list container
│   │   ├── AddCardForm.tsx      # Add card form component
│   │   ├── BankSelector.tsx     # Bank dropdown selector
│   │   └── ColorSelector.tsx    # Color picker component
│   ├── ui/                      # Generic UI components
│   │   ├── Button.tsx           # Custom button component
│   │   ├── Input.tsx            # Custom input component
│   │   ├── Modal.tsx            # Modal component
│   │   ├── SearchBar.tsx        # Search bar component
│   │   └── Toast.tsx            # Toast notification component
│   └── ...
├── services/                     # Business logic & data services
│   ├── storage.service.ts       # Local storage operations (expo-secure-store)
│   ├── cards.service.ts         # Card CRUD operations
│   └── usage.service.ts         # Usage tracking logic
├── types/                        # TypeScript type definitions
│   ├── card.types.ts            # Card-related types (includes cardType, color)
│   └── storage.types.ts         # Storage-related types
├── constants/                    # App constants
│   ├── banks.ts                 # Bank list (HDFC, SBI, ICICI, AXIS) and logo mappings
│   └── theme.ts                 # Theme colors (dark theme)
├── utils/                        # Utility functions
│   ├── formatters.ts            # Card number formatting, etc.
│   ├── validators.ts            # CVV and expiry validation (no Luhn for now)
│   └── clipboard.ts             # Clipboard utilities
```

## Implementation Details

### 1. Data Models

```typescript
// types/card.types.ts
export interface Card {
  id: string;                    // Unique identifier (UUID)
  cardNumber: string;            // Full card number (stored securely)
  cvv: string;                   // CVV (stored securely)
  expiryDate: string;            // MM/YY format
  bankName: string;              // Bank name
  cardholderName: string;        // Cardholder name
  cardType: 'Credit' | 'Debit';  // Card type (required)
  usageCount: number;            // Number of times card number is copied
  isPinned: boolean;             // Whether card is pinned
  createdAt: number;             // Creation timestamp (Unix timestamp)
  lastUsedAt: number;            // Last usage timestamp (Unix timestamp)
  color?: string;                // User-selected color (optional)
}

// types/bank.types.ts
export interface Bank {
  id: string;
  name: string;
  logo: any;                     // Image source (placeholder for now)
  color?: string;                // Optional brand color
}
```

### 2. Storage Service

```typescript
// services/storage.service.ts
// Use expo-secure-store for storing card data
// Implement methods:
// - saveCard(card: Card): Promise<void>
// - getCards(): Promise<Card[]>
// - updateCard(id: string, updates: Partial<Card>): Promise<void>
// - deleteCard(id: string): Promise<void>
// - incrementUsage(id: string): Promise<void>
// - togglePin(id: string): Promise<void>
```

### 3. Card Component

```typescript
// components/cards/CardItem.tsx
// Features:
// - Card-like UI with user-selectable colors (or gradient)
// - Bank logo display in top-right corner (placeholder logos)
// - Masked card number (show last 4 digits by default: **** **** **** 1234)
// - Tap to copy card number
// - CVV display (configurable: always visible or tap to reveal)
// - Pin/unpin toggle
// - Card type display (Credit/Debit)
// - Dark theme styling
// - Standard credit card dimensions
// - Moderate animations
```

### 4. Add Card Form

```typescript
// components/cards/AddCardForm.tsx
// Features:
// - Card number input (formatted as user types: XXXX XXXX XXXX XXXX)
// - CVV input (numeric, 3-4 digits validation)
// - Expiry date input (MM/YY format, validate not expired)
// - Bank selector (dropdown/picker: HDFC, SBI, ICICI, AXIS or custom)
// - Card type selector (Credit/Debit) - Required
// - Color selector (user-selectable, optional)
// - Cardholder name input
// - Validation: No card number validation for now, CVV (length + numeric), Expiry (format + not expired)
// - Error handling: Both inline errors and toast notifications
// - Submit button
// - Modal overlay presentation
```

### 5. Main Screen

```typescript
// app/(tabs)/index.tsx
// Features:
// - Display list of cards (FlatList for performance, vertical list)
// - Onboarding screen (first time users)
// - Empty state when no cards (after onboarding)
// - Floating action button to add card
// - Card sorting (pinned cards at top, then by usage frequency, then most recently used)
// - Search/filter by bank name
// - Pull to refresh (optional)
```

### 6. Bank Constants

```typescript
// constants/banks.ts
// Predefined list of banks with logos
// Initial banks: HDFC, SBI, ICICI, AXIS (Indian banks)
// Placeholder logos for now, directory structure ready for future assets
export const BANKS: Bank[] = [
  { id: 'hdfc', name: 'HDFC', logo: require('@/assets/images/banks/placeholder.png') },
  { id: 'sbi', name: 'SBI', logo: require('@/assets/images/banks/placeholder.png') },
  { id: 'icici', name: 'ICICI', logo: require('@/assets/images/banks/placeholder.png') },
  { id: 'axis', name: 'AXIS', logo: require('@/assets/images/banks/placeholder.png') },
];
// Support for custom bank entry (free text)
```

### 7. Utilities

```typescript
// utils/formatters.ts
// - formatCardNumber(number: string): string (XXXX XXXX XXXX XXXX)
// - maskCardNumber(number: string, showLast: number = 4): string (**** **** **** 1234)
// - formatExpiryDate(date: string): string (MM/YY)
// - removeSpacesFromCardNumber(number: string): string (for copying: 1234567890123456)

// utils/validators.ts
// - validateCardNumber(number: string): boolean (No validation for now - return true)
// - validateCVV(cvv: string): boolean (3-4 digits, numeric only)
// - validateExpiryDate(date: string): boolean (MM/YY format)
// - isExpired(date: string): boolean (check if expiry date has passed)

// utils/clipboard.ts
// - copyToClipboard(text: string): Promise<void> (copy card number without spaces)
// - showCopyFeedback(): void (toast notification + haptic feedback)
```

### 8. Theme

```typescript
// constants/theme.ts
// Update to dark theme colors
// Card-specific colors (gradients, etc.)
// Bank-specific colors (optional)
```

## Key Features to Implement

### 1. Card Number Formatting
- Format as user types: "1234 5678 9012 3456"
- No validation for now (user responsibility)
- Mask by default, show last 4 digits: **** **** **** 1234
- Copy without spaces: 1234567890123456

### 2. Usage Tracking
- Increment usage count when card number is copied (only card number copy counts)
- Track last used timestamp
- Sort cards by usage count (descending)
- When usage counts are equal, sort by most recently used first
- Pinned cards excluded from sorting (always at top)

### 3. Card Pinning
- Toggle pin status
- Visual indicator (pin icon)
- Pinned cards stay at top (separate section)
- Persist pin status in storage

### 4. Copy Functionality
- Tap card to copy card number only (V1 - CVV and expiry in future)
- Copy without spaces (1234567890123456 format for compatibility)
- Show feedback (toast notification + haptic feedback)
- Track usage on copy (only card number copy)

### 5. Bank Selection
- Dropdown/picker with bank list (HDFC, SBI, ICICI, AXIS)
- Support custom bank entry (free text)
- Display bank logo on card (top-right corner, placeholder logos for now)
- Handle unknown/custom banks (placeholder logo)

### 6. Card Colors
- User-selectable colors for card design
- Generic gradient option available
- Store color preference in card model

### 7. Search/Filter
- Search cards by bank name
- Filter cards dynamically as user types
- Maintain sorting order (pinned first, then by usage)

## Design Guidelines

### Card Design
- Credit card dimensions (85.60 × 53.98 mm ratio)
- User-selectable colors or gradient background (dark theme compatible)
- Bank logo in top-right corner (placeholder logos)
- Card number prominently displayed (masked: **** **** **** 1234)
- Expiry, name, and card type visible
- CVV display configurable (always visible or tap to reveal)
- Subtle shadows and borders
- Moderate animations on interactions (fast but modern)

### Color Scheme
- Primary dark background: #0A0A0A or #121212
- Card background: Dark gradients (e.g., #1A1A1A to #2A2A2A)
- Text: Light colors (#FFFFFF, #E0E0E0)
- Accent: Brand color or theme color
- Bank logos: Full color or white versions

### Typography
- Card number: Monospace font, larger size
- Cardholder name: Regular font, medium size
- Expiry: Regular font, smaller size
- Labels: Regular font, smaller size
- Respect system font size settings

## Dependencies to Add

```json
{
  "dependencies": {
    "expo-secure-store": "~14.0.0",
    "expo-clipboard": "~7.0.0",
    "expo-haptics": "~15.0.7",  // Already included
    "uuid": "^9.0.0"             // For generating card IDs
  }
}
```

## Testing Considerations

### Unit Tests
- Card number formatting
- CVV validation (length + numeric)
- Expiry validation (format + not expired)
- Usage tracking logic (only card number copy)
- Sorting algorithm (usage frequency, then most recently used)

### Integration Tests
- Storage operations
- Card CRUD operations
- Copy functionality
- Pin/unpin functionality

### Manual Testing
- Add multiple cards
- Copy card details
- Pin/unpin cards
- Verify sorting behavior
- Test on iOS and Android
- Test with many cards (50+)

## Security Considerations

1. **Secure Storage**: Use `expo-secure-store` for sensitive data (card numbers, CVV)
2. **Data Masking**: Always mask sensitive data in UI
3. **No Logging**: Never log sensitive data
4. **Clipboard**: Clear clipboard after reasonable time (future consideration)
5. **Device Security**: Rely on device-level security (PIN, fingerprint)

## Performance Optimization

1. **Virtualized List**: Use FlatList for card list (vertical list)
2. **Image Caching**: Cache bank logos after first load
3. **Lazy Loading**: Load cards on demand
4. **Debouncing**: Debounce search/filter inputs (by bank name)
5. **Memoization**: Memoize expensive computations (sorting, filtering)

## Accessibility

1. **Screen Readers**: Not needed for V1 (basic support for future)
2. **Dynamic Fonts**: Respect system font size settings
3. **Color Contrast**: Ensure sufficient contrast
4. **Touch Targets**: Minimum 44x44 points
5. **Keyboard Navigation**: Support keyboard navigation (web)

## Future Enhancements (Out of Scope)

- Edit card details
- Card categories (beyond Credit/Debit type)
- Export/import cards
- App-level authentication
- Biometric authentication
- Card expiration reminders
- Transaction history
- Copy CVV and expiry date to clipboard
- Card number validation (Luhn algorithm)
- Settings screen (card reveal method, CVV display preferences)
- Screen reader support (basic accessibility)

## Development Steps

1. **Setup**: Install dependencies, update theme
2. **Types**: Define TypeScript types and interfaces
3. **Constants**: Create bank list and constants
4. **Utilities**: Implement formatters and validators
5. **Storage**: Implement storage service
6. **Services**: Implement card and usage services
7. **Components**: Build card components
8. **Screens**: Create main screen and add card screen
9. **Integration**: Connect all pieces
10. **Polish**: Add animations, refine UI
11. **Testing**: Test on iOS and Android
12. **Bug Fixes**: Fix any issues

## Notes

- Follow existing code structure and patterns
- Use TypeScript strictly
- Maintain modular architecture
- Document complex logic
- Follow React Native best practices
- Ensure dark theme consistency
- Optimize for performance
- Prioritize security

## Decisions Made ✅

All questions have been answered. See `QUESTIONS.md` and `PROJECT_SUMMARY.md` for detailed decisions. Key decisions:

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

---

**✅ Ready to start development - All questions answered, decisions made.**
