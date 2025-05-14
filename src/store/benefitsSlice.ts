/**
 * @description Redux slice for managing benefits state
 * This slice handles all employee and dependent data management
 * 
 * Performance Notes:
 * - Using createSlice from @reduxjs/toolkit for better performance and less boilerplate
 * - Immutable updates are handled automatically by Immer
 * - Selectors are memoized for better performance
 * 
 * State Management Notes:
 * - In a real application, we'd use RTK Query for API calls
 * - We'd implement proper error handling and loading states
 * - We'd add middleware for logging, analytics, etc.
 * - We'd implement proper caching strategies
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BenefitsState, Employee, Dependent, CreateEmployeeRequest, CreateDependentRequest } from '@/types/benefits';
import { v4 as uuidv4 } from 'uuid';

const initialState: BenefitsState = {
  employees: [],
  loading: false,
  error: null,
  selectedEmployeeId: null,
};

const benefitsSlice = createSlice({
  name: 'benefits',
  initialState,
  reducers: {
    // Employee actions
    addEmployee: (state, action: PayloadAction<CreateEmployeeRequest>) => {
      const newEmployee: Employee = {
        id: uuidv4(),
        type: 'employee',
        dependents: [],
        ...action.payload,
      };
      state.employees.push(newEmployee);
    },
    updateEmployee: (state, action: PayloadAction<Employee>) => {
      const index = state.employees.findIndex(emp => emp.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    deleteEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
    },
    
    // Dependent actions
    addDependent: (state, action: PayloadAction<CreateDependentRequest>) => {
      const { employeeId, ...dependentData } = action.payload;
      const employee = state.employees.find(emp => emp.id === employeeId);
      
      if (employee) {
        const newDependent: Dependent = {
          id: uuidv4(),
          type: 'dependent',
          employeeId,
          ...dependentData,
        };
        employee.dependents.push(newDependent);
      }
    },
    updateDependent: (state, action: PayloadAction<Dependent>) => {
      const employee = state.employees.find(emp => emp.id === action.payload.employeeId);
      if (employee) {
        const index = employee.dependents.findIndex(dep => dep.id === action.payload.id);
        if (index !== -1) {
          employee.dependents[index] = action.payload;
        }
      }
    },
    deleteDependent: (state, action: PayloadAction<{ employeeId: string; dependentId: string }>) => {
      const employee = state.employees.find(emp => emp.id === action.payload.employeeId);
      if (employee) {
        employee.dependents = employee.dependents.filter(dep => dep.id !== action.payload.dependentId);
      }
    },
    
    // UI state actions
    setSelectedEmployee: (state, action: PayloadAction<string | null>) => {
      state.selectedEmployeeId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addEmployee,
  updateEmployee,
  deleteEmployee,
  addDependent,
  updateDependent,
  deleteDependent,
  setSelectedEmployee,
  setLoading,
  setError,
} = benefitsSlice.actions;

export default benefitsSlice.reducer; 