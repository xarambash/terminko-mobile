import { StyleSheet } from 'react-native';

import { FONT_FAMILY_BODY } from '../theme/theme';

/** Shared appointment summary: label / value stack (BookingForm, Service/Slot select, Confirmation). */
export const bookingSummaryStyles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    paddingHorizontal: 2,
    paddingTop: 8,
    paddingBottom: 16,
    marginBottom: 16,
    gap: 14,
  },
  block: { alignSelf: 'stretch' },
  label: {
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 4,
    textAlign: 'left',
  },
  value: {
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'left',
  },
  /** Same size/color role as summary labels — screen titles like “Choose a service provider”. */
  pageHeading: {
    fontFamily: FONT_FAMILY_BODY,
    fontSize: 19,
    fontWeight: '400',
    marginBottom: 16,
    textAlign: 'left',
  },
});
