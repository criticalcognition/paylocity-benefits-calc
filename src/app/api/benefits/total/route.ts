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

import { NextRequest, NextResponse } from 'next/server';
import { benefitsService } from '@/services/benefitsService';

export async function GET() {
  try {
    const response = await benefitsService.calculateTotalBenefits();
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate total benefits' },
      { status: 500 }
    );
  }
} 