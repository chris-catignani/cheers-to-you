import { configureStore } from '@reduxjs/toolkit';
import eventReducer from '../features/event/eventSlice';
import outputReducer from '../features/output/outputSlice';

export const store = configureStore({
  reducer: {
    event: eventReducer,
    output: outputReducer,
  },
});
