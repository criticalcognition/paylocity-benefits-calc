/**
 * @description API route for employee management
 * This route handles all employee-related API requests
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
import { getAllEmployees, addEmployee } from '../_data/employeeStore';
import { CreateEmployeeRequest } from '@/types/benefits';

export async function GET() {
  try {
    const employees = await getAllEmployees();
    return NextResponse.json({ data: employees, status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employees', status: 'error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const employee = await addEmployee(body);
    return NextResponse.json({ data: employee, status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add employee', status: 'error' }, { status: 500 });
  }
} 