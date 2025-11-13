import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import CardItem from './CardItem';
import { Card } from '@/types/card.types';
import { Alert } from 'react-native';

// Mock the copyToClipboard utility
jest.mock('@/utils/clipboard', () => ({
  copyToClipboard: jest.fn(),
}));

// Mock the Alert.alert method
jest.spyOn(Alert, 'alert');

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
  const onDeleteMock = jest.fn();
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
    onDeleteMock.mockClear();
    onCopyMock.mockClear();
    onEditMock.mockClear();
    (Alert.alert as jest.Mock).mockClear();
  });

  it('renders card details correctly', () => {
    const { getByText } = render(
      <CardItem
        card={mockCard}
        onDelete={onDeleteMock}
        onCopy={onCopyMock}
        onTogglePin={() => {}}
        onEdit={onEditMock}
      />
    );

    expect(getByText('TEST BANK')).toBeTruthy();
    expect(getByText('**** **** **** 3456')).toBeTruthy(); // Assuming maskCardNumber shows last 4 digits
    expect(getByText('JOHN DOE')).toBeTruthy();
    expect(getByText('12/25')).toBeTruthy();
    expect(getByText('123')).toBeTruthy();
    expect(getByText('Credit')).toBeTruthy();
    expect(getByText('Next bill in 14 days')).toBeTruthy();
  });

  it('calls onCopy when pressed', async () => {
    const { getByText } = render(
      <CardItem
        card={mockCard}
        onDelete={onDeleteMock}
        onCopy={onCopyMock}
        onTogglePin={() => {}}
        onEdit={onEditMock}
      />
    );

    await act(async () => {
      fireEvent.press(getByText('**** **** **** 3456'));
    });

    expect(onCopyMock).toHaveBeenCalledWith('1');
  });

  it('shows context menu on long press', async () => {
    const { getByText } = render(
      <CardItem
        card={mockCard}
        onDelete={onDeleteMock}
        onCopy={onCopyMock}
        onTogglePin={() => {}}
        onEdit={onEditMock}
      />
    );

    await act(async () => {
      fireEvent(getByText('**** **** **** 3456'), 'longPress');
    });

    expect(getByText('Delete')).toBeTruthy();
    expect(getByText('Pin')).toBeTruthy();
  });

  it('calls onDelete when delete is confirmed', async () => {
    const { getByText } = render(
      <CardItem
        card={mockCard}
        onDelete={onDeleteMock}
        onCopy={onCopyMock}
        onTogglePin={() => {}}
        onEdit={onEditMock}
      />
    );

    // Open the menu
    await act(async () => {
      fireEvent(getByText('**** **** **** 3456'), 'longPress');
    });

    // Press the delete button
    await act(async () => {
      fireEvent.press(getByText('Delete'));
    });

    // Check that Alert.alert was called
    expect(Alert.alert).toHaveBeenCalled();

    // Simulate pressing the 'Delete' button in the alert
    // @ts-ignore
    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const deleteButton = alertArgs[2].find((b: any) => b.text === 'Delete');
    
    await act(async () => {
      deleteButton.onPress();
    });

    expect(onDeleteMock).toHaveBeenCalledWith('1');
  });

  it('does not call onDelete when delete is cancelled', async () => {
    const { getByText } = render(
      <CardItem
        card={mockCard}
        onDelete={onDeleteMock}
        onCopy={onCopyMock}
        onTogglePin={() => {}}
        onEdit={onEditMock}
      />
    );

    // Open the menu
    await act(async () => {
      fireEvent(getByText('**** **** **** 3456'), 'longPress');
    });

    // Press the delete button
    await act(async () => {
      fireEvent.press(getByText('Delete'));
    });

    // Simulate pressing the 'Cancel' button in the alert
    // @ts-ignore
    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const cancelButton = alertArgs[2].find((b: any) => b.text === 'Cancel');

    await act(async () => {
      cancelButton.onPress();
    });

    expect(onDeleteMock).not.toHaveBeenCalled();
  });

  it('calls onEdit when edit is pressed', async () => {
    const { getByText } = render(
      <CardItem
        card={mockCard}
        onDelete={onDeleteMock}
        onCopy={onCopyMock}
        onTogglePin={() => {}}
        onEdit={onEditMock}
      />
    );

    await act(async () => {
      fireEvent(getByText('**** **** **** 3456'), 'longPress');
    });

    await act(async () => {
      fireEvent.press(getByText('Edit'));
    });

    expect(onEditMock).toHaveBeenCalledWith(mockCard);
  });
});
