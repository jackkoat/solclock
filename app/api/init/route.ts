import { NextResponse } from 'next/server';
import { mockDataGenerator } from '@/lib/mockDataGenerator';
import { getRealDataService } from '@/lib/realDataService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const useRealData = body.useRealData === true || body.useRealData === 'true';
    
    if (useRealData) {
      console.log('Initializing with REAL Solana blockchain data...');
      
      // Check if Solscan API key is configured
      const apiKey = process.env.SOLSCAN_API_KEY;
      if (!apiKey) {
        return NextResponse.json({
          success: false,
          error: 'Solscan API key not configured. Please set SOLSCAN_API_KEY environment variable.',
          hint: 'Using mock data fallback. Call POST /api/init without useRealData parameter to generate mock data.'
        }, { status: 500 });
      }
      
      const realDataService = getRealDataService();
      await realDataService.refreshAllData();
      
      // Get API usage stats
      const stats = realDataService.getAPIStats();
      
      return NextResponse.json({
        success: true,
        message: 'Real Solana blockchain data loaded successfully',
        dataSource: 'solscan-api',
        stats: {
          cacheSize: stats.solscan.cache.size,
          rateLimit: stats.solscan.rateLimit
        }
      });
    } else {
      console.log('Initializing with MOCK data...');
      await mockDataGenerator.generateAll();
      
      return NextResponse.json({
        success: true,
        message: 'Mock data generated successfully',
        dataSource: 'mock',
        hint: 'To use real Solana blockchain data, call POST /api/init with {"useRealData": true}'
      });
    }
  } catch (error) {
    console.error('Error initializing data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
