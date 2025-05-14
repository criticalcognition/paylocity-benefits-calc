/**
 * @description Component for displaying employee details and their dependents
 * 
 * Performance Notes:
 * - Using React.memo to prevent unnecessary re-renders
 * - Using useCallback for event handlers
 * - Using useMemo for derived calculations
 * - List rendering is optimized with proper keys
 * 
 * Component Evolution Notes:
 * - Could be split into smaller components (EmployeeHeader, DependentList, etc.)
 * - Could add loading states and error boundaries
 * - Could add animations for better UX
 * - Could add more sophisticated filtering and sorting
 * - Could add pagination for large lists of dependents
 * - Could add drag-and-drop for reordering dependents
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { deleteEmployee, deleteDependent } from '@/store/benefitsSlice';
import { Employee as EmployeeType, Dependent, BenefitsCalculation } from '@/types/benefits';
import EmployeeForm from './EmployeeForm';
import DependentForm from './DependentForm';

interface EmployeeProps {
  employee: EmployeeType;
  benefits: BenefitsCalculation;
}

const Employee: React.FC<EmployeeProps> = React.memo(({ employee, benefits }) => {
  const dispatch = useDispatch();
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showDependentForm, setShowDependentForm] = useState(false);
  const [editingDependent, setEditingDependent] = useState<Dependent | undefined>();

  const handleDeleteEmployee = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      dispatch(deleteEmployee(employee.id));
    }
  }, [dispatch, employee.id]);

  const handleDeleteDependent = useCallback((dependentId: string) => {
    if (window.confirm('Are you sure you want to delete this dependent?')) {
      dispatch(deleteDependent({ employeeId: employee.id, dependentId }));
    }
  }, [dispatch, employee.id]);

  const handleEditDependent = useCallback((dependent: Dependent) => {
    setEditingDependent(dependent);
    setShowDependentForm(true);
  }, []);

  const handleAddDependent = useCallback(() => {
    setEditingDependent(undefined);
    setShowDependentForm(true);
  }, []);

  const handleCloseDependentForm = useCallback(() => {
    setShowDependentForm(false);
    setEditingDependent(undefined);
  }, []);

  // Calculate if employee gets a discount
  const hasDiscount = useMemo(() => 
    employee.firstName.startsWith('A'),
    [employee.firstName]
  );

  // Format currency
  const formatCurrency = useCallback((amount: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount),
    []
  );

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">
            {employee.firstName} {employee.lastName}
            {hasDiscount && (
              <Badge bg="success" className="ms-2">
                10% Discount
              </Badge>
            )}
          </h5>
          <small className="text-muted">
            Benefits Cost: {formatCurrency(benefits.totalCost)}/year
            {' '}({formatCurrency(benefits.perPaycheck)}/paycheck)
          </small>
        </div>
        <div>
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={() => setShowEmployeeForm(true)}
          >
            Edit
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleDeleteEmployee}
          >
            Delete
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Dependents</h6>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddDependent}
          >
            Add Dependent
          </Button>
        </div>
        <ListGroup>
          {employee.dependents.map(dependent => {
            const hasDependentDiscount = dependent.firstName.startsWith('A');
            return (
              <ListGroup.Item
                key={dependent.id}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  {dependent.firstName} {dependent.lastName}
                  {hasDependentDiscount && (
                    <Badge bg="success" className="ms-2">
                      10% Discount
                    </Badge>
                  )}
                </div>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditDependent(dependent)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteDependent(dependent.id)}
                  >
                    Delete
                  </Button>
                </div>
              </ListGroup.Item>
            );
          })}
          {employee.dependents.length === 0 && (
            <ListGroup.Item className="text-muted">
              No dependents added
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card.Body>

      {/* Modals */}
      <EmployeeForm
        show={showEmployeeForm}
        onHide={() => setShowEmployeeForm(false)}
        employee={employee}
      />
      <DependentForm
        show={showDependentForm}
        onHide={handleCloseDependentForm}
        employeeId={employee.id}
        dependent={editingDependent}
      />
    </Card>
  );
});

Employee.displayName = 'Employee';

export default Employee; 