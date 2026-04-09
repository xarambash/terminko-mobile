import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './AppText';
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
        { backgroundColor: 'white', borderColor: theme.colors.text },
        pressed && styles.pressed,
      ]}
    >
      <AppText style={[styles.label, { color: theme.colors.text }]}>{children}</AppText>
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
    boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.4)',
  },
  pressed: { opacity: 0.85 },
  label: { fontSize: 16, fontWeight: '600' },
});
