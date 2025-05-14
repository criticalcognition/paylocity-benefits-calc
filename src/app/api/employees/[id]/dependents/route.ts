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
import { addDependent, updateDependent, deleteDependent } from '../../../_data/employeeStore';
import { CreateDependentRequest, Dependent } from '@/types/benefits';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const dependent = await addDependent({ ...body, employeeId: params.id });
    if (!dependent) {
      return NextResponse.json({ error: 'Employee not found', status: 'error' }, { status: 404 });
    }
    return NextResponse.json({ data: dependent, status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add dependent', status: 'error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateDependent({ ...body, employeeId: params.id });
    if (!updated) {
      return NextResponse.json({ error: 'Employee or dependent not found', status: 'error' }, { status: 404 });
    }
    return NextResponse.json({ data: updated, status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update dependent', status: 'error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { dependentId } = body;
    if (!dependentId) {
      return NextResponse.json({ error: 'Dependent ID is required', status: 'error' }, { status: 400 });
    }
    const success = await deleteDependent(params.id, dependentId);
    if (!success) {
      return NextResponse.json({ error: 'Employee or dependent not found', status: 'error' }, { status: 404 });
    }
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete dependent', status: 'error' }, { status: 500 });
  }
} 