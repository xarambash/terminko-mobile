import { StyleSheet, View } from 'react-native';
import { TextInput, Text, useTheme } from 'react-native-paper';

import type { FormInputProps } from './types';

export function FormInput({ errorText, style, ...props }: FormInputProps) {
  const theme = useTheme();

  return (
    <View>
      <TextInput
        mode="outlined"
        dense
        style={[styles.input, style]}
        outlineStyle={styles.outline}
        {...props}
      />
      {errorText ? (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{errorText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
  },
  outline: {
    borderRadius: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
    marginLeft: 4,
  },
});
