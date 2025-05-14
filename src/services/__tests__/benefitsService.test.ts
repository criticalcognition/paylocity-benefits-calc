/**
 * @description Tests for the benefits service
 * This file contains tests for the benefits calculation logic
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

import { benefitsService } from '../benefitsService';
import { BENEFITS_CONSTANTS } from '@/types/benefits';

describe('benefitsService', () => {
  beforeEach(() => {
    // Reset the mock data store before each test
    jest.clearAllMocks();
  });

  describe('calculateBenefits', () => {
    it('should calculate benefits correctly for an employee with no dependents', async () => {
      // Create a test employee
      const employee = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        type: 'employee' as const,
        dependents: [],
      };

      // Calculate benefits
      const response = await benefitsService.calculateBenefits(employee.id);

      // Assert the response
      expect(response.status).toBe('success');
      expect(response.data).toEqual({
        employeeCost: BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST,
        dependentCost: 0,
        discount: 0,
        totalCost: BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST,
        perPaycheck: BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST / BENEFITS_CONSTANTS.PAYCHECKS_PER_YEAR,
        perYear: BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST,
      });
    });

    it('should calculate benefits correctly for an employee with dependents', async () => {
      // Create a test employee with dependents
      const employee = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        type: 'employee' as const,
        dependents: [
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Doe',
            type: 'dependent' as const,
            employeeId: '1',
          },
          {
            id: '3',
            firstName: 'Jim',
            lastName: 'Doe',
            type: 'dependent' as const,
            employeeId: '1',
          },
        ],
      };

      // Calculate benefits
      const response = await benefitsService.calculateBenefits(employee.id);

      // Assert the response
      expect(response.status).toBe('success');
      expect(response.data).toEqual({
        employeeCost: BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST,
        dependentCost: BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST * 2,
        discount: 0,
        totalCost: BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST + (BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST * 2),
        perPaycheck: (BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST + (BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST * 2)) / BENEFITS_CONSTANTS.PAYCHECKS_PER_YEAR,
        perYear: BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST + (BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST * 2),
      });
    });

    it('should apply discount for names starting with A', async () => {
      // Create a test employee with a dependent that gets a discount
      const employee = {
        id: '1',
        firstName: 'Alice',
        lastName: 'Smith',
        type: 'employee' as const,
        dependents: [
          {
            id: '2',
            firstName: 'Adam',
            lastName: 'Smith',
            type: 'dependent' as const,
            employeeId: '1',
          },
        ],
      };

      // Calculate benefits
      const response = await benefitsService.calculateBenefits(employee.id);

      // Calculate expected values
      const employeeDiscount = BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST * BENEFITS_CONSTANTS.DISCOUNT_PERCENTAGE;
      const dependentDiscount = BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST * BENEFITS_CONSTANTS.DISCOUNT_PERCENTAGE;
      const totalDiscount = employeeDiscount + dependentDiscount;
      const totalCost = BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST + BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST - totalDiscount;

      // Assert the response
      expect(response.status).toBe('success');
      expect(response.data).toEqual({
        employeeCost: BENEFITS_CONSTANTS.EMPLOYEE_YEARLY_COST,
        dependentCost: BENEFITS_CONSTANTS.DEPENDENT_YEARLY_COST,
        discount: totalDiscount,
        totalCost,
        perPaycheck: totalCost / BENEFITS_CONSTANTS.PAYCHECKS_PER_YEAR,
        perYear: totalCost,
      });
    });
  });
}); 