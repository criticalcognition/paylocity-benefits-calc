/**
 * @description Benefits service for handling API calls
 * This service abstracts all API calls related to benefits management
 * 
 * API Layer Notes:
 * - In a real application, this would be replaced with RTK Query
 * - We'd implement proper error handling and retry logic
 * - We'd add request/response interceptors
 * - We'd implement proper caching strategies
 * - We'd add proper authentication/authorization
 * - We'd implement proper validation
 * - We'd add proper logging and monitoring
 */

import { Employee, Dependent, BenefitsCalculation, ApiResponse, CreateEmployeeRequest, CreateDependentRequest, BENEFITS_CONSTANTS } from '@/types/benefits';

// Mock data store (in a real app, this would be a database)
let employees: Employee[] = [];

// Helper function to calculate benefits
const calculateBenefits = (employee: Employee): BenefitsCalculation => {
  const employeeCost = BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST;
  const dependentCost = employee.dependents.length * BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST;
  
  // Calculate discounts
  const employeeDiscount = employee.firstName.startsWith(BENEFITS_CONSTANTS.DISCOUNT_NAME_STARTS_WITH) 
    ? employeeCost * BENEFITS_CONSTANTS.DISCOUNT_PERCENTAGE 
    : 0;
    
  const dependentDiscount = employee.dependents.reduce((total, dependent) => {
    return total + (dependent.firstName.startsWith(BENEFITS_CONSTANTS.DISCOUNT_NAME_STARTS_WITH)
      ? BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST * BENEFITS_CONSTANTS.DISCOUNT_PERCENTAGE
      : 0);
  }, 0);
  
  const totalDiscount = employeeDiscount + dependentDiscount;
  const totalCost = employeeCost + dependentCost - totalDiscount;
  
  return {
    employeeCost,
    dependentCost,
    discount: totalDiscount,
    totalCost,
    perPaycheck: totalCost / BENEFITS_CONSTANTS.PAYCHECKS_PER_YEAR,
    perYear: totalCost,
  };
};

// API endpoints
export const benefitsService = {
  // Employee endpoints
  getEmployees: async (): Promise<ApiResponse<Employee[]>> => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { data: employees, status: 'success' };
    } catch (error) {
      return { 
        data: [], 
        error: 'Failed to fetch employees', 
        status: 'error' 
      };
    }
  },

  createEmployee: async (request: CreateEmployeeRequest): Promise<ApiResponse<Employee>> => {
    try {
      const newEmployee: Employee = {
        id: crypto.randomUUID(),
        type: 'employee',
        dependents: [],
        ...request,
      };
      employees.push(newEmployee);
      return { data: newEmployee, status: 'success' };
    } catch (error) {
      return { 
        data: null as unknown as Employee, 
        error: 'Failed to create employee', 
        status: 'error' 
      };
    }
  },

  updateEmployee: async (employee: Employee): Promise<ApiResponse<Employee>> => {
    try {
      const index = employees.findIndex(emp => emp.id === employee.id);
      if (index === -1) {
        throw new Error('Employee not found');
      }
      employees[index] = employee;
      return { data: employee, status: 'success' };
    } catch (error) {
      return { 
        data: null as unknown as Employee, 
        error: 'Failed to update employee', 
        status: 'error' 
      };
    }
  },

  deleteEmployee: async (id: string): Promise<ApiResponse<void>> => {
    try {
      employees = employees.filter(emp => emp.id !== id);
      return { data: undefined, status: 'success' };
    } catch (error) {
      return { 
        data: undefined, 
        error: 'Failed to delete employee', 
        status: 'error' 
      };
    }
  },

  // Dependent endpoints
  createDependent: async (request: CreateDependentRequest): Promise<ApiResponse<Dependent>> => {
    try {
      const employee = employees.find(emp => emp.id === request.employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const newDependent: Dependent = {
        id: crypto.randomUUID(),
        type: 'dependent',
        ...request,
      };
      
      employee.dependents.push(newDependent);
      return { data: newDependent, status: 'success' };
    } catch (error) {
      return { 
        data: null as unknown as Dependent, 
        error: 'Failed to create dependent', 
        status: 'error' 
      };
    }
  },

  updateDependent: async (dependent: Dependent): Promise<ApiResponse<Dependent>> => {
    try {
      const employee = employees.find(emp => emp.id === dependent.employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const index = employee.dependents.findIndex(dep => dep.id === dependent.id);
      if (index === -1) {
        throw new Error('Dependent not found');
      }

      employee.dependents[index] = dependent;
      return { data: dependent, status: 'success' };
    } catch (error) {
      return { 
        data: null as unknown as Dependent, 
        error: 'Failed to update dependent', 
        status: 'error' 
      };
    }
  },

  deleteDependent: async (employeeId: string, dependentId: string): Promise<ApiResponse<void>> => {
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      employee.dependents = employee.dependents.filter(dep => dep.id !== dependentId);
      return { data: undefined, status: 'success' };
    } catch (error) {
      return { 
        data: undefined, 
        error: 'Failed to delete dependent', 
        status: 'error' 
      };
    }
  },

  // Benefits calculation endpoint
  calculateBenefits: async (employeeId: string): Promise<ApiResponse<BenefitsCalculation>> => {
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const calculation = calculateBenefits(employee);
      return { data: calculation, status: 'success' };
    } catch (error) {
      return { 
        data: null as unknown as BenefitsCalculation, 
        error: 'Failed to calculate benefits', 
        status: 'error' 
      };
    }
  },

  // Calculate total benefits for all employees
  calculateTotalBenefits: async (): Promise<ApiResponse<BenefitsCalculation>> => {
    try {
      const totalCalculation = employees.reduce((total, employee) => {
        const employeeCalc = calculateBenefits(employee);
        return {
          employeeCost: total.employeeCost + employeeCalc.employeeCost,
          dependentCost: total.dependentCost + employeeCalc.dependentCost,
          discount: total.discount + employeeCalc.discount,
          totalCost: total.totalCost + employeeCalc.totalCost,
          perPaycheck: total.perPaycheck + employeeCalc.perPaycheck,
          perYear: total.perYear + employeeCalc.perYear,
        };
      }, {
        employeeCost: 0,
        dependentCost: 0,
        discount: 0,
        totalCost: 0,
        perPaycheck: 0,
        perYear: 0,
      });

      return { data: totalCalculation, status: 'success' };
    } catch (error) {
      return { 
        data: null as unknown as BenefitsCalculation, 
        error: 'Failed to calculate total benefits', 
        status: 'error' 
      };
    }
  },
}; 