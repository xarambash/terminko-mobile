import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, Image } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenScroll } from '../components/ScreenScroll';
import type { RootStackParamList } from '../navigation/types';
import { Text } from 'react-native';
import ScissorsIcon from '../../assets/Scissors-Thin--Streamline-Phosphor-Thin.png';
import { FONT_FAMILY_TITLE } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  const { t } = useTranslation();

  return (
    <ScreenScroll contentContainerStyle={styles.centered}>
      <View style={styles.buttonColumn}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { fontFamily: FONT_FAMILY_TITLE }]}>Ana salon</Text>
          {/* <Image source={ScissorsIcon} style={styles.icon} /> */}
        </View>
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
    justifyContent: 'flex-end',
  },
  buttonColumn: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  icon: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 55,
    textAlign: 'center',
    fontFamily: FONT_FAMILY_TITLE,
  },
});
