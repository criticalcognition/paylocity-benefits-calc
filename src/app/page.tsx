/**
 * @description Main page component for the benefits calculator application
 * 
 * Performance Notes:
 * - Using React.memo for child components
 * - Using Redux for state management
 * - Using proper code splitting
 * - Using proper error boundaries
 * 
 * Component Evolution Notes:
 * - Could add proper layout components
 * - Could add proper navigation
 * - Could add proper authentication
 * - Could add proper authorization
 * - Could add proper analytics
 * - Could add proper error tracking
 * - Could add proper logging
 */

'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import EmployeeList from '@/components/EmployeeList';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  return (
    <Provider store={store}>
      <main>
        <EmployeeList />
      </main>
    </Provider>
  );
} 