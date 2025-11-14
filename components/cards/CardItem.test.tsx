import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import CardItem from './CardItem';
import { Card } from '@/types/card.types';

jest.mock('@/utils/clipboard', () => ({
  copyToClipboard: jest.fn(),
}));

const mockCard: Card = {
  id: '1',
  cardNumber: '1234567890123456',
  cardholderName: 'John Doe',
  expiryDate: '12/25',
  cvv: '123',
  bankName: 'Test Bank',
  cardType: 'Credit',
  isPinned: false,
  usageCount: 0,
  billGenerationDay: 15,
};

describe('CardItem', () => {
  const onCopyMock = jest.fn();
  const onEditMock = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-07-01T00:00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    onCopyMock.mockClear();
    onEditMock.mockClear();
  });

  it('renders card details correctly', () => {
    const { getByText } = render(<CardItem card={mockCard} onCopy={onCopyMock} onEdit={onEditMock} />);

    expect(getByText('TEST BANK')).toBeTruthy();
    expect(getByText('**** **** **** 3456')).toBeTruthy();
    expect(getByText('JOHN DOE')).toBeTruthy();
    expect(getByText('12/25')).toBeTruthy();
    expect(getByText('123')).toBeTruthy();
    expect(getByText('Credit')).toBeTruthy();
    expect(getByText('Next bill in 14 days')).toBeTruthy();
  });

  it('copies card number on tap', async () => {
    const { getByText } = render(<CardItem card={mockCard} onCopy={onCopyMock} onEdit={onEditMock} />);

    await act(async () => {
      fireEvent.press(getByText('**** **** **** 3456'));
    });

    expect(onCopyMock).toHaveBeenCalledWith('1');
  });

  it('opens edit on long press', async () => {
    const { getByText } = render(<CardItem card={mockCard} onCopy={onCopyMock} onEdit={onEditMock} />);

    await act(async () => {
      fireEvent(getByText('**** **** **** 3456'), 'longPress');
    });

    expect(onEditMock).toHaveBeenCalledWith(mockCard);
  });
});
