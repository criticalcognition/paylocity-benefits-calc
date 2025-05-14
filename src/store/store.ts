/**
 * @description Redux store configuration
 * This file sets up the Redux store with our benefits slice
 * 
 * Performance Notes:
 * - Using configureStore from @reduxjs/toolkit for better performance
 * - Redux DevTools are enabled in development
 * - Middleware is configured for optimal performance
 */

import { configureStore } from '@reduxjs/toolkit';
import benefitsReducer from './benefitsSlice';

export const store = configureStore({
  reducer: {
    benefits: benefitsReducer,
  },
  // In a real application, we'd add middleware for:
  // - API calls (RTK Query)
  // - Logging
  // - Analytics
  // - Error tracking
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['benefits/setSelectedEmployee'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['benefits.selectedEmployeeId'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 