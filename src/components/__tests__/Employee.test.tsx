/**
 * @description Tests for the Employee component
 * This file contains tests for the Employee component
 * 
 * Testing Notes:
 * - Using Jest for testing
 * - Using React Testing Library for component testing
 * - Using proper test isolation
 * - Using proper test data
 * - Using proper test assertions
 * 
 * Test Evolution Notes:
 * - Could add more test cases
 * - Could add more edge cases
 * - Could add more error cases
 * - Could add more integration tests
 * - Could add more performance tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import benefitsReducer from '@/store/benefitsSlice';
import Employee from '../Employee';
import { Employee as EmployeeType, BenefitsCalculation } from '@/types/benefits';

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      benefits: benefitsReducer,
    },
    preloadedState: {
      benefits: {
        employees: [],
        loading: false,
        error: null,
        selectedEmployeeId: null,
        ...initialState,
      },
    },
  });
};

// Create test data
const mockEmployee: EmployeeType = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  type: 'employee',
  dependents: [
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Doe',
      type: 'dependent',
      employeeId: '1',
    },
  ],
};

const mockBenefits: BenefitsCalculation = {
  employeeCost: 1000,
  dependentCost: 500,
  discount: 0,
  totalCost: 1500,
  perPaycheck: 57.69,
  perYear: 1500,
};

describe('Employee', () => {
  it('renders employee information correctly', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Employee employee={mockEmployee} benefits={mockBenefits} />
      </Provider>
    );

    // Check if employee name is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Check if benefits cost is displayed
    expect(screen.getByText(/Benefits Cost: \$1,500.00\/year/)).toBeInTheDocument();
    expect(screen.getByText(/\(\$57.69\/paycheck\)/)).toBeInTheDocument();

    // Check if dependent is displayed
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows discount badge for names starting with A', () => {
    const store = createMockStore();
    const employeeWithDiscount = {
      ...mockEmployee,
      firstName: 'Alice',
      dependents: [
        {
          ...mockEmployee.dependents[0],
          firstName: 'Adam',
        },
      ],
    };

    render(
      <Provider store={store}>
        <Employee employee={employeeWithDiscount} benefits={mockBenefits} />
      </Provider>
    );

    // Check if discount badges are displayed
    const discountBadges = screen.getAllByText('10% Discount');
    expect(discountBadges).toHaveLength(2); // One for employee, one for dependent
  });

  it('handles edit employee button click', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Employee employee={mockEmployee} benefits={mockBenefits} />
      </Provider>
    );

    // Click edit button
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Check if modal is opened
    expect(screen.getByText('Edit Employee')).toBeInTheDocument();
  });

  it('handles add dependent button click', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Employee employee={mockEmployee} benefits={mockBenefits} />
      </Provider>
    );

    // Click add dependent button
    const addButton = screen.getByText('Add Dependent');
    fireEvent.click(addButton);

    // Check if modal is opened
    expect(screen.getByText('Add Dependent')).toBeInTheDocument();
  });

  it('handles delete employee confirmation', () => {
    const store = createMockStore();
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <Provider store={store}>
        <Employee employee={mockEmployee} benefits={mockBenefits} />
      </Provider>
    );

    // Click delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Check if confirmation was requested
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this employee?');

    confirmSpy.mockRestore();
  });

  it('handles delete dependent confirmation', () => {
    const store = createMockStore();
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <Provider store={store}>
        <Employee employee={mockEmployee} benefits={mockBenefits} />
      </Provider>
    );

    // Click delete dependent button
    const deleteButton = screen.getAllByText('Delete')[1]; // Second delete button is for dependent
    fireEvent.click(deleteButton);

    // Check if confirmation was requested
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this dependent?');

    confirmSpy.mockRestore();
  });
}); 