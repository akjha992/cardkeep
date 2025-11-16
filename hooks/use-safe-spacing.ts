import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_BOTTOM_PADDING = 16;

export function useSafeSpacing(minBottomPadding: number = DEFAULT_BOTTOM_PADDING) {
  const insets = useSafeAreaInsets();

  return useMemo(
    () => ({
      top: insets.top,
      right: insets.right,
      bottom: insets.bottom,
      left: insets.left,
      bottomSpacing: Math.max(insets.bottom, minBottomPadding),
    }),
    [insets, minBottomPadding]
  );
}
