import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  children: ReactNode;
  onPress: () => void;
};

export function PrimaryButton({ children, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginVertical: 6,
    alignItems: 'center',
  },
  pressed: { opacity: 0.85 },
  label: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
