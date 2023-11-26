import { configureStore } from '@reduxjs/toolkit';
import outputReducer from '../features/output/outputSlice';

export const store = configureStore({
  reducer: {
    output: outputReducer,
  },
});
