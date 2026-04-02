import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';

type Props = {
  children: ReactNode;
  onPress: () => void;
};

export function PrimaryButton({ children, onPress }: Props) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: theme.colors.primary },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: theme.colors.onPrimary }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginVertical: 6,
    alignItems: 'center',
  },
  pressed: { opacity: 0.85 },
  label: { fontSize: 16, fontWeight: '600' },
});
