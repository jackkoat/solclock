import { NextResponse } from 'next/server';
import { mockDataGenerator } from '@/lib/mockDataGenerator';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await mockDataGenerator.generateAll();
    
    return NextResponse.json({
      success: true,
      message: 'Mock data generated successfully'
    });
  } catch (error) {
    console.error('Error generating mock data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate mock data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
