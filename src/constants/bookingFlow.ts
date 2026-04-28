/** Four segments: provider → service → time → your details. */
export const BOOKING_FLOW_STEPS = 4 as const;

/** `activeIndex` for `BookingProgressBar` (0..BOOKING_FLOW_STEPS - 1). */
export const bookingStepIndex = {
  resource: 0,
  service: 1,
  slot: 2,
  form: 3,
  /** Completed — all segments active (same as form index). */
  confirmation: 3,
} as const;
