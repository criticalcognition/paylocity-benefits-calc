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
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import benefitsReducer from '@/store/benefitsSlice';
import Employee from '../Employee';
import { Employee as EmployeeType, BenefitsCalculation } from '@/types/benefits';

// Create a mock store with proper state shape
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
        totalBenefits: null,
        employeeBenefits: {},
        ...initialState,
      },
    },
  });
};

// Create test data with complete benefits calculation
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
  paycheckAfterDeductions: 1942.31,
  paycheckBeforeDeductions: 2000,
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

    // Check if benefits cost is displayed (using exact text from HTML)
    expect(screen.getByText('Yearly Cost: $1,500.00')).toBeInTheDocument();
    expect(screen.getByText('Per Paycheck: $57.69')).toBeInTheDocument();

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

    // Click edit button (using the first one in the header)
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]); // First Edit button is for employee

    // Check if modal is opened by looking for the modal title
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles add dependent button click', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Employee employee={mockEmployee} benefits={mockBenefits} />
      </Provider>
    );

    // Click add dependent button (using the one in the card body)
    const addButton = screen.getByRole('button', { name: /add dependent/i });
    fireEvent.click(addButton);

    // Check if modal is opened by looking for the modal title
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles delete employee confirmation', () => {
    const store = createMockStore();
    const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <Provider store={store}>
        <Employee employee={mockEmployee} benefits={mockBenefits} />
      </Provider>
    );

    // Click delete button (using the one in the header)
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]); // First Delete button is for employee

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

    // Click delete button (using the one in the dependent list)
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[1]); // Second Delete button is for dependent

    // Check if confirmation was requested
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this dependent?');

    confirmSpy.mockRestore();
  });
}); 