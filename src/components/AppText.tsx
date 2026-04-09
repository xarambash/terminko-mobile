import type { TextProps } from 'react-native';
import { Text } from 'react-native';

import { FONT_FAMILY_BODY } from '../theme/theme';

/** App-wide body font; `FONT_FAMILY_BODY` is defined once in `theme.ts`. */
export function AppText({ style, ...props }: TextProps) {
  return <Text style={[{ fontFamily: FONT_FAMILY_BODY }, style]} {...props} />;
}
