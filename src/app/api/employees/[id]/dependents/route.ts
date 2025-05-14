/**
 * @description API route for dependent management
 * This route handles all dependent-related API requests for a specific employee
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
import { CreateDependentRequest, Dependent } from '@/types/benefits';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: CreateDependentRequest = await request.json();
    const response = await benefitsService.createDependent({
      ...body,
      employeeId: params.id,
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create dependent' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: Dependent = await request.json();
    if (body.employeeId !== params.id) {
      return NextResponse.json(
        { error: 'Employee ID mismatch' },
        { status: 400 }
      );
    }
    const response = await benefitsService.updateDependent(body);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update dependent' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { dependentId } = await request.json();
    const response = await benefitsService.deleteDependent(params.id, dependentId);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete dependent' },
      { status: 500 }
    );
  }
} 