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
import { benefitsService } from '@/services/benefitsService';
import { CreateEmployeeRequest } from '@/types/benefits';

export async function GET() {
  try {
    const response = await benefitsService.getEmployees();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEmployeeRequest = await request.json();
    const response = await benefitsService.createEmployee(body);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
} 