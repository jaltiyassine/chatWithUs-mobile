import { configureStore } from '@reduxjs/toolkit';
import generalReducer from './reducer';

const store = configureStore({
  reducer: {
    general: generalReducer,
  },
});

export default store;
