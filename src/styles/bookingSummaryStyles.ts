import { StyleSheet } from 'react-native';

/** Shared appointment summary: label / value stack (BookingForm, Service/Slot select, Confirmation). */
export const bookingSummaryStyles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    marginBottom: 16,
    gap: 14,
  },
  block: { alignSelf: 'stretch' },
  label: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
    textAlign: 'left',
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'left',
  },
  /** Same size/color role as summary labels — screen titles like “Choose a service provider”. */
  pageHeading: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 16,
    textAlign: 'left',
  },
});
