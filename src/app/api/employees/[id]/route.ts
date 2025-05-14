/**
 * @description API route for specific employee management
 * This route handles all employee-specific API requests
 * 
 * API Layer Notes:
 * - In a real application, we'd use proper database connections
 * - We'd implement proper authentication/authorization
 * - We'd add request validation
 * - We'd implement proper error handling
 * - We'd add rate limiting
 * - We'd add proper logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeById, updateEmployee, deleteEmployee, calculateBenefits } from '../../_data/employeeStore';
import { Employee } from '@/types/benefits';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await getEmployeeById(params.id);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found', status: 'error' }, { status: 404 });
    }
    const benefits = calculateBenefits(employee);
    return NextResponse.json({ data: benefits, status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employee benefits', status: 'error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateEmployee({ ...body, id: params.id });
    if (!updated) {
      return NextResponse.json({ error: 'Employee not found', status: 'error' }, { status: 404 });
    }
    return NextResponse.json({ data: updated, status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update employee', status: 'error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteEmployee(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Employee not found', status: 'error' }, { status: 404 });
    }
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete employee', status: 'error' }, { status: 500 });
  }
} 