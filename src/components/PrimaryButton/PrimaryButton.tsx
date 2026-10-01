import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import type { PrimaryButtonProps } from './types';

export function PrimaryButton({
  mode = 'contained',
  style,
  contentStyle,
  ...rest
}: PrimaryButtonProps) {
  return (
    <Button
      mode={mode}
      style={[styles.button, style]}
      contentStyle={[styles.content, contentStyle]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 32,
  },
  content: {
    paddingVertical: 6,
  },
});
