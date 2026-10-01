import type { TextInputProps } from 'react-native-paper';

export type FormInputProps = Omit<TextInputProps, 'mode' | 'theme'> & {
  errorText?: string;
};
