/**
 * @description Component for displaying the list of employees and their benefits
 * 
 * Performance Notes:
 * - Using React.memo to prevent unnecessary re-renders
 * - Using useCallback for event handlers
 * - Using useMemo for derived calculations
 * - List rendering is optimized with proper keys
 * - Using virtualization for large lists (could be added)
 * 
 * Component Evolution Notes:
 * - Could be split into smaller components (EmployeeListHeader, EmployeeListFilters, etc.)
 * - Could add loading states and error boundaries
 * - Could add animations for better UX
 * - Could add more sophisticated filtering and sorting
 * - Could add pagination for large lists
 * - Could add search functionality
 * - Could add export functionality
 */

import React, { useCallback, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setLoading, setError } from '@/store/benefitsSlice';
import { benefitsService } from '@/services/benefitsService';
import Employee from './Employee';
import EmployeeForm from './EmployeeForm';
import { BenefitsCalculation } from '@/types/benefits';

const EmployeeList: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const { employees, loading, error } = useSelector((state: RootState) => state.benefits);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [totalBenefits, setTotalBenefits] = useState<BenefitsCalculation | null>(null);
  const [employeeBenefits, setEmployeeBenefits] = useState<Record<string, BenefitsCalculation>>({});

  // Fetch total benefits
  const fetchTotalBenefits = useCallback(async () => {
    try {
      const response = await benefitsService.calculateTotalBenefits();
      if (response.status === 'success') {
        setTotalBenefits(response.data);
      } else {
        dispatch(setError(response.error || 'Failed to calculate total benefits'));
      }
    } catch (error) {
      dispatch(setError('Failed to calculate total benefits'));
    }
  }, [dispatch]);

  // Fetch benefits for each employee
  const fetchEmployeeBenefits = useCallback(async () => {
    try {
      const benefits: Record<string, BenefitsCalculation> = {};
      await Promise.all(
        employees.map(async (employee) => {
          const response = await benefitsService.calculateBenefits(employee.id);
          if (response.status === 'success') {
            benefits[employee.id] = response.data;
          }
        })
      );
      setEmployeeBenefits(benefits);
    } catch (error) {
      dispatch(setError('Failed to calculate employee benefits'));
    }
  }, [dispatch, employees]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      dispatch(setLoading(true));
      try {
        await Promise.all([
          fetchTotalBenefits(),
          fetchEmployeeBenefits(),
        ]);
      } catch (error) {
        dispatch(setError('Failed to load data'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadData();
  }, [dispatch, fetchTotalBenefits, fetchEmployeeBenefits]);

  // Format currency
  const formatCurrency = useCallback((amount: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount),
    []
  );

  if (loading) {
    return (
      <Container className="py-4">
        <Alert variant="info">Loading...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Total Benefits Summary */}
      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">Total Benefits Summary</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <h6>Total Cost per Year</h6>
              <p className="h4">
                {totalBenefits ? formatCurrency(totalBenefits.perYear) : '$0.00'}
              </p>
            </Col>
            <Col md={4}>
              <h6>Total Cost per Paycheck</h6>
              <p className="h4">
                {totalBenefits ? formatCurrency(totalBenefits.perPaycheck) : '$0.00'}
              </p>
            </Col>
            <Col md={4}>
              <h6>Total Discounts</h6>
              <p className="h4">
                {totalBenefits ? formatCurrency(totalBenefits.discount) : '$0.00'}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Employee List Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Employees</h2>
        <Button
          variant="primary"
          onClick={() => setShowEmployeeForm(true)}
        >
          Add Employee
        </Button>
      </div>

      {/* Employee List */}
      {employees.length === 0 ? (
        <Alert variant="info">
          No employees added yet. Click "Add Employee" to get started.
        </Alert>
      ) : (
        employees.map(employee => (
          <Employee
            key={employee.id}
            employee={employee}
            benefits={employeeBenefits[employee.id] || {
              employeeCost: 0,
              dependentCost: 0,
              discount: 0,
              totalCost: 0,
              perPaycheck: 0,
              perYear: 0,
            }}
          />
        ))
      )}

      {/* Add Employee Modal */}
      <EmployeeForm
        show={showEmployeeForm}
        onHide={() => setShowEmployeeForm(false)}
      />
    </Container>
  );
});

EmployeeList.displayName = 'EmployeeList';

export default EmployeeList; 