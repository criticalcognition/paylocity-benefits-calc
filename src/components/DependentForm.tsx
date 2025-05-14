/**
 * @description
 * Modal form for adding or editing a dependent.
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
  addDependentAsync,
  updateDependentAsync,
  fetchEmployees,
  fetchTotalBenefits,
} from '@/store/benefitsSlice';
import { Dependent } from '@/types/benefits';

interface DependentFormProps {
  show: boolean;
  onHide: () => void;
  employeeId: string;
  dependent?: Dependent;
}

const DependentForm: React.FC<DependentFormProps> = React.memo(
  ({ show, onHide, employeeId, dependent }) => {
    const dispatch = useDispatch();
    const [firstName, setFirstName] = useState(dependent?.firstName || '');
    const [lastName, setLastName] = useState(dependent?.lastName || '');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      setFirstName(dependent?.firstName || '');
      setLastName(dependent?.lastName || '');
      setError(null);
    }, [dependent, show]);

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
          if (dependent) {
            await dispatch(
              updateDependentAsync({
                ...dependent,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                employeeId,
              })
            ).unwrap();
          } else {
            await dispatch(
              addDependentAsync({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                employeeId,
              })
            ).unwrap();
          }
          await dispatch(fetchEmployees());
          await dispatch(fetchTotalBenefits());
          onHide();
        } catch (err: any) {
          setError(err.message || 'Failed to save dependent');
        } finally {
          setSubmitting(false);
        }
      },
      [dispatch, dependent, firstName, lastName, employeeId, onHide]
    );

    return (
      <Modal show={show} onHide={onHide} centered>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{dependent ? 'Edit Dependent' : 'Add Dependent'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3" controlId="dependentFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                autoFocus
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="dependentLastName">
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
              {dependent ? 'Save Changes' : 'Add Dependent'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
);

DependentForm.displayName = 'DependentForm';

export default DependentForm; 