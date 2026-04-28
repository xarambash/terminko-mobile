/**
 * Shared app constants (validation, booking layout, graph geometry, …).
 * Add new domains in labeled sections to keep this file navigable.
 */

import { landingBrand } from '../theme/theme';

// --- Validation ---
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// --- Booking overview graph (`BookingOverviewGraphic`) ---
/** Horizontal stroke aligned with `landingBrand.accentLine` (hLine, node core). */
export const BOOKING_GRAPH_ACCENT = landingBrand.accentLine;

/** Timeline uses full scroll inner width (same as form fields; `BookingStepLayout` paddingHorizontal 20). */
export const BOOKING_TIMELINE_RAIL_INSET_H = 0;

/** Gap under provider block before the timeline shell. */
export const BOOKING_AVATAR_TREE_GAP = 40;

/** Timeline node outer diameter (px); hLine spans from first node left to last node right. */
export const BOOKING_TIMELINE_NODE_OUTER = 16;

export const BOOKING_TIMELINE_NODE_OUTER_R = BOOKING_TIMELINE_NODE_OUTER / 2;

/** Shorten the booking overview horizontal line by this many px on each end. */
export const BOOKING_HLINE_END_INSET = 5;
