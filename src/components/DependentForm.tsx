/**
 * @description Modal form component for creating and editing dependents
 * 
 * Performance Notes:
 * - Using React.memo to prevent unnecessary re-renders
 * - Form state is managed locally to prevent unnecessary Redux updates
 * - Input validation is done on change to provide immediate feedback
 * 
 * Component Evolution Notes:
 * - Could be split into smaller components for better maintainability
 * - Could add form validation library (e.g., Formik, React Hook Form)
 * - Could add more sophisticated error handling
 * - Could add loading states
 * - Could add success/error notifications
 * - Could add relationship type selection
 */

import React, { useState, useCallback } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { addDependent, updateDependent } from '@/store/benefitsSlice';
import { Dependent, CreateDependentRequest } from '@/types/benefits';

interface DependentFormProps {
  show: boolean;
  onHide: () => void;
  employeeId: string;
  dependent?: Dependent;
}

const DependentForm: React.FC<DependentFormProps> = React.memo(({ 
  show, 
  onHide, 
  employeeId,
  dependent 
}) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<CreateDependentRequest>({
    firstName: dependent?.firstName || '',
    lastName: dependent?.lastName || '',
    employeeId: employeeId,
  });
  const [errors, setErrors] = useState<Partial<CreateDependentRequest>>({});

  const validateForm = useCallback(() => {
    const newErrors: Partial<CreateDependentRequest> = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (dependent) {
        dispatch(updateDependent({ ...dependent, ...formData }));
      } else {
        dispatch(addDependent(formData));
      }
      onHide();
    } catch (error) {
      console.error('Failed to save dependent:', error);
      // In a real app, we'd show an error notification
    }
  }, [dispatch, dependent, formData, onHide, validateForm]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof CreateDependentRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{dependent ? 'Edit Dependent' : 'Add Dependent'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              isInvalid={!!errors.firstName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.firstName}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              isInvalid={!!errors.lastName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.lastName}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {dependent ? 'Save Changes' : 'Add Dependent'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
});

DependentForm.displayName = 'DependentForm';

export default DependentForm; 