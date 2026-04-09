import type { TextInputProps } from 'react-native';
import { TextInput } from 'react-native';

import { FONT_FAMILY_BODY } from '../theme/theme';

/** Same body font as {@link AppText}; use instead of raw `TextInput` for consistent typography. */
export function AppTextInput({ style, ...props }: TextInputProps) {
  return <TextInput style={[{ fontFamily: FONT_FAMILY_BODY }, style]} {...props} />;
}
