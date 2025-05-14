/**
 * @description
 * Modal form for adding or editing an employee.
 * Uses Redux thunks for all mutations.
 * 
 * Key features:
 * - Handles both add and edit modes.
 * - Validates input and shows errors.
 * - Closes modal on success.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  addEmployeeAsync,
  updateEmployeeAsync,
  fetchEmployees,
  fetchTotalBenefits,
} from '@/store/benefitsSlice';
import { Employee } from '@/types/benefits';

interface EmployeeFormProps {
  show: boolean;
  onHide: () => void;
  employee?: Employee;
}

const EmployeeForm: React.FC<EmployeeFormProps> = React.memo(({ show, onHide, employee }) => {
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState(employee?.firstName || '');
  const [lastName, setLastName] = useState(employee?.lastName || '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFirstName(employee?.firstName || '');
    setLastName(employee?.lastName || '');
    setError(null);
  }, [employee, show]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!firstName.trim() || !lastName.trim()) {
        setError('First and last name are required.');
        return;
      }

      setSubmitting(true);
      try {
        if (employee) {
          await dispatch(
            updateEmployeeAsync({ ...employee, firstName: firstName.trim(), lastName: lastName.trim() })
          ).unwrap();
        } else {
          await dispatch(
            addEmployeeAsync({ firstName: firstName.trim(), lastName: lastName.trim() })
          ).unwrap();
        }
        await dispatch(fetchEmployees());
        await dispatch(fetchTotalBenefits());
        onHide();
      } catch (err: any) {
        setError(err.message || 'Failed to save employee');
      } finally {
        setSubmitting(false);
      }
    },
    [dispatch, employee, firstName, lastName, onHide]
  );

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{employee ? 'Edit Employee' : 'Add Employee'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="employeeFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              autoFocus
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="employeeLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {employee ? 'Save Changes' : 'Add Employee'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
});

EmployeeForm.displayName = 'EmployeeForm';

export default EmployeeForm; 