/**
 * @description Modal form component for creating and editing employees
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
 */

import React, { useState, useCallback } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { addEmployee, updateEmployee } from '@/store/benefitsSlice';
import { Employee, CreateEmployeeRequest } from '@/types/benefits';

interface EmployeeFormProps {
  show: boolean;
  onHide: () => void;
  employee?: Employee;
}

const EmployeeForm: React.FC<EmployeeFormProps> = React.memo(({ show, onHide, employee }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
  });
  const [errors, setErrors] = useState<Partial<CreateEmployeeRequest>>({});

  const validateForm = useCallback(() => {
    const newErrors: Partial<CreateEmployeeRequest> = {};
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
      if (employee) {
        dispatch(updateEmployee({ ...employee, ...formData }));
      } else {
        dispatch(addEmployee(formData));
      }
      onHide();
    } catch (error) {
      console.error('Failed to save employee:', error);
      // In a real app, we'd show an error notification
    }
  }, [dispatch, employee, formData, onHide, validateForm]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof CreateEmployeeRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{employee ? 'Edit Employee' : 'Add Employee'}</Modal.Title>
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
            {employee ? 'Save Changes' : 'Add Employee'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
});

EmployeeForm.displayName = 'EmployeeForm';

export default EmployeeForm; 