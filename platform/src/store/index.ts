import { configureStore } from '@reduxjs/toolkit';
import strategyReducer from './slices/strategySlice';
import optimizationReducer from './slices/optimizationSlice';
import scenarioReducer from './slices/scenarioSlice';

export const store = configureStore({
  reducer: {
    strategy: strategyReducer,
    optimization: optimizationReducer,
    scenario: scenarioReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['optimization/updateProgress'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
