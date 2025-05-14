/**
 * @description Core types for the benefits calculator application
 * These types define the shape of our data and are used throughout the application
 */

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  type: 'employee' | 'dependent';
  // In a real application, we'd have more fields like:
  // dateOfBirth: Date;
  // relationship: 'spouse' | 'child';
  // ssn: string;
  // etc.
}

export interface Employee extends Person {
  type: 'employee';
  dependents: Dependent[];
  // In a real application, we'd have more fields like:
  // employeeId: string;
  // department: string;
  // hireDate: Date;
  // etc.
}

export interface Dependent extends Person {
  type: 'dependent';
  employeeId: string;
}

export interface BenefitsCalculation {
  employeeCost: number;
  dependentCost: number;
  discount: number;
  totalCost: number;
  perPaycheck: number;
  perYear: number;
  paycheckAfterDeductions: number;
  paycheckBeforeDeductions: number;
}

// Constants for benefits calculation
export const BENEFITS_CONSTANTS = {
  EMPLOYEE_YEARLY_COST: 1000,
  DEPENDENT_YEARLY_COST: 500,
  DISCOUNT_PERCENTAGE: 0.10,
  PAYCHECKS_PER_YEAR: 26,
  PAYCHECK_AMOUNT: 2000,
  DISCOUNT_NAME_STARTS_WITH: 'A'
} as const;

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: 'success' | 'error';
}

// API Request types
export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
}

export interface CreateDependentRequest {
  firstName: string;
  lastName: string;
  employeeId: string;
}

// Redux State types
export interface BenefitsState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  selectedEmployeeId: string | null;
} 