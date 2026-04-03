import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <ScreenScroll contentContainerStyle={styles.centered}>
      <View style={styles.buttonColumn}>
        <PrimaryButton onPress={() => navigation.navigate('ResourceSelect')}>
          {t('landing.book')}
        </PrimaryButton>
        <PrimaryButton onPress={() => navigation.navigate('CancelAppointment')}>
          {t('landing.cancel')}
        </PrimaryButton>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  buttonColumn: {
    width: '100%',
  },
});
