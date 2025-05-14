/**
 * @description API route for total benefits calculation
 * This route handles the calculation of total benefits for all employees
 * 
 * API Layer Notes:
 * - In a real application, we'd use proper database connections
 * - We'd implement proper authentication/authorization
 * - We'd add request validation
 * - We'd implement proper error handling
 * - We'd add rate limiting
 * - We'd add proper logging
 * - We'd implement caching for performance
 */

import { NextResponse } from 'next/server';
import { calculateTotalBenefits } from '../../_data/employeeStore';

export async function GET() {
  try {
    const total = await calculateTotalBenefits();
    return NextResponse.json({ data: total, status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate total benefits', status: 'error' }, { status: 500 });
  }
} 