import { IconButton } from 'react-native-paper';

type Props = {
  onPress: () => void;
  label: string;
};

export function BackButton({ onPress, label }: Props) {
  return (
    <IconButton
      icon="arrow-left"
      mode="contained-tonal"
      onPress={onPress}
      accessibilityLabel={label}
    />
  );
}
