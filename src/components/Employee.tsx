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
import { Card, Button, ListGroup, Badge, Form, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  deleteEmployeeAsync,
  deleteDependentAsync,
  updateDependentAsync,
} from '@/store/benefitsSlice';
import { Employee as EmployeeType, Dependent, BenefitsCalculation } from '@/types/benefits';
import EmployeeForm from './EmployeeForm';
import DependentForm from './DependentForm';

interface EmployeeProps {
  employee: EmployeeType;
  benefits: BenefitsCalculation;
  showInlineDependentEdit: boolean;
  setShowInlineDependentEdit: (show: boolean) => void;
  editingDependent: Dependent | null;
  setEditingDependent: (dependent: Dependent | null) => void;
}

const Employee: React.FC<EmployeeProps> = React.memo(({ 
  employee, 
  benefits, 
  showInlineDependentEdit, 
  setShowInlineDependentEdit,
  editingDependent,
  setEditingDependent 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showDependentForm, setShowDependentForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingEditDependent, setPendingEditDependent] = useState<Dependent | null>(null);
  const [dependentInlineFirstName, setDependentInlineFirstName] = useState('');
  const [dependentInlineLastName, setDependentInlineLastName] = useState('');

  const handleDeleteEmployee = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      dispatch(deleteEmployeeAsync(employee.id));
    }
  }, [dispatch, employee.id]);

  const handleDeleteDependent = useCallback(
    (dependentId: string) => {
      if (window.confirm('Are you sure you want to delete this dependent?')) {
        dispatch(deleteDependentAsync({ employeeId: employee.id, dependentId }));
      }
    },
    [dispatch, employee.id]
  );

  const handleEditDependent = useCallback((dependent: Dependent) => {
    setEditingDependent(dependent);
    setShowDependentForm(true);
  }, [setEditingDependent]);

  const handleAddDependent = useCallback(() => {
    setEditingDependent(null);
    setShowDependentForm(true);
  }, [setEditingDependent]);

  const handleCloseDependentForm = useCallback(() => {
    setShowDependentForm(false);
    setEditingDependent(null);
  }, [setEditingDependent]);

  const handleEditInlineDependent = useCallback((dependent: Dependent) => {
    if (showInlineDependentEdit && editingDependent?.id !== dependent.id) {
      setPendingEditDependent(dependent);
      setShowConfirmModal(true);
    } else {
      setEditingDependent(dependent);
      setDependentInlineFirstName(dependent.firstName);
      setDependentInlineLastName(dependent.lastName);
      setShowInlineDependentEdit(true);
    }
  }, [showInlineDependentEdit, editingDependent, setEditingDependent, setShowInlineDependentEdit]);

  const handleConfirmEdit = useCallback(() => {
    if (pendingEditDependent) {
      setEditingDependent(pendingEditDependent);
      setDependentInlineFirstName(pendingEditDependent.firstName);
      setDependentInlineLastName(pendingEditDependent.lastName);
      setShowInlineDependentEdit(true);
    }
    setShowConfirmModal(false);
    setPendingEditDependent(null);
  }, [pendingEditDependent, setEditingDependent, setShowInlineDependentEdit]);

  const handleCancelEdit = useCallback(() => {
    setShowConfirmModal(false);
    setPendingEditDependent(null);
  }, []);

  const handleInlineDependentSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingDependent) {
      dispatch(updateDependentAsync({ ...editingDependent, firstName: dependentInlineFirstName, lastName: dependentInlineLastName }));
    }
    setShowInlineDependentEdit(false);
  }, [dispatch, editingDependent, dependentInlineFirstName, dependentInlineLastName]);

  // Calculate if employee gets a discount
  const hasDiscount = useMemo(
    () => employee.firstName.toLowerCase().startsWith('a'),
    [employee.firstName]
  );

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
    <>
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
            <div className="text-muted">
              <div>Yearly Cost: {formatCurrency(benefits.perYear)}</div>
              <div>Per Paycheck: {formatCurrency(benefits.perPaycheck)}</div>
            </div>
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
              const hasDependentDiscount = dependent.firstName.toLowerCase().startsWith('a');
              return (
                <ListGroup.Item
                  key={dependent.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  {!showInlineDependentEdit || editingDependent?.id !== dependent.id ? (
                    <>
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
                          onClick={() => handleEditInlineDependent(dependent)}
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
                    </>
                  ) : (
                    <Form onSubmit={handleInlineDependentSubmit} className="w-100">
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Control
                          type="text"
                          value={dependentInlineFirstName}
                          onChange={e => setDependentInlineFirstName(e.target.value)}
                          placeholder="First Name"
                          size="sm"
                          required
                        />
                        <Form.Control
                          type="text"
                          value={dependentInlineLastName}
                          onChange={e => setDependentInlineLastName(e.target.value)}
                          placeholder="Last Name"
                          size="sm"
                          required
                        />
                        <Button type="submit" variant="primary" size="sm">
                          Save
                        </Button>
                        <Button 
                          type="button" 
                          variant="secondary" 
                          size="sm"
                          onClick={() => setShowInlineDependentEdit(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  )}
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
      </Card>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={handleCancelEdit} centered>
        <Modal.Header closeButton>
          <Modal.Title>Unsaved Changes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You have unsaved changes. If you continue, you will lose your changes. Do you want to edit a different dependent?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelEdit}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmEdit}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

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
        dependent={editingDependent || undefined}
      />
    </>
  );
});

Employee.displayName = 'Employee';

export default Employee; 