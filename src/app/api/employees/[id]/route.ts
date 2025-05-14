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
import { benefitsService } from '@/services/benefitsService';
import { Employee } from '@/types/benefits';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await benefitsService.calculateBenefits(params.id);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch employee benefits' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Employee = await request.json();
    if (body.id !== params.id) {
      return NextResponse.json(
        { error: 'Employee ID mismatch' },
        { status: 400 }
      );
    }
    const response = await benefitsService.updateEmployee(body);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await benefitsService.deleteEmployee(params.id);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
} 