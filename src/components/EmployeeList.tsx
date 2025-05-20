/**
 * @description
 * Displays the list of employees and their benefits.
 * All data is managed via Redux and API thunks.
 * 
 * Key features:
 * - Fetches employees, total benefits, and per-employee benefits on mount.
 * - Uses Redux state for all data.
 * - Handles loading and error states.
 * - Triggers modals for adding employees.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import {
  fetchEmployees,
  fetchTotalBenefits,
  fetchEmployeeBenefits,
  setError,
  setLoading,
} from '@/store/benefitsSlice';
import Employee from './Employee';
import EmployeeForm from './EmployeeForm';

const EmployeeList: React.FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, loading, error, totalBenefits, employeeBenefits } = useSelector(
    (state: RootState) => state.benefits
  );
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  // Fetch all data on mount
  useEffect(() => {
    const loadData = async () => {
      dispatch(setLoading(true));
      try {
        await dispatch(fetchEmployees()).unwrap();
        await dispatch(fetchTotalBenefits()).unwrap();
      } catch (err: any) {
        dispatch(setError(err.message || 'Failed to load data'));
      } finally {
        dispatch(setLoading(false));
      }
    };
    loadData();
  }, [dispatch]);

  // Fetch per-employee benefits when employees change
  useEffect(() => {
    if (employees.length > 0) {
      dispatch(fetchEmployeeBenefits(employees));
    }
  }, [dispatch, employees]);

  // Format currency
  const formatCurrency = useCallback(
    (amount: number) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount),
    []
  );

  return (
    <Container className="py-4">
      {error && (
        <Alert variant="danger" className="mb-4">{error}</Alert>
      )}

      {/* Total Benefits Summary */}
      <Card className="mb-4">
        <Card.Header>
          <h4 className="mb-0">Total Benefits Summary</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Total Cost per Year</h6>
              <p className="h4">
                {totalBenefits ? formatCurrency(totalBenefits.perYear) : '$0.00'}
              </p>
            </Col>
            <Col md={6}>
              <h6>Total Cost per Paycheck</h6>
              <p className="h4">
                {totalBenefits ? formatCurrency(totalBenefits.perPaycheck) : '$0.00'}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Employee List Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Employees</h2>
        <Button variant="primary" onClick={() => setShowEmployeeForm(true)}>
          Add Employee
        </Button>
      </div>

      {/* Employee List */}
      {employees.length === 0 ? (
        <Alert variant="info">
          No employees added yet. Click &quot;Add Employee&quot; to get started.
        </Alert>
      ) : (
        employees.map(employee => (
          <Employee
            key={employee.id}
            employee={employee}
            benefits={
              employeeBenefits[employee.id] || {
                employeeCost: 0,
                dependentCost: 0,
                discount: 0,
                totalCost: 0,
                perPaycheck: 0,
                perYear: 0,
                paycheckAfterDeductions: 2000,
                paycheckBeforeDeductions: 2000,
              }
            }
          />
        ))
      )}

      {/* Add Employee Modal */}
      <EmployeeForm show={showEmployeeForm} onHide={() => setShowEmployeeForm(false)} />
    </Container>
  );
});

EmployeeList.displayName = 'EmployeeList';

export default EmployeeList; 