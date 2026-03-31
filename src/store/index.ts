import { configureStore } from '@reduxjs/toolkit';

import { bookingSlice } from './slices/bookingSlice';

export const store = configureStore({
  reducer: {
    booking: bookingSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
