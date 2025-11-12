import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'demo-user';

    const { data, error } = await supabase
      .from('watchlist')
      .select('id, user_id, token_address, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch watchlist'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        watchlist: data || []
      }
    });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch watchlist'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, token_address } = body;

    if (!user_id || !token_address) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('watchlist')
      .insert({ user_id, token_address })
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to add to watchlist'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add to watchlist'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('user_id');

    if (!id || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters'
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to remove from watchlist'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from watchlist'
    });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove from watchlist'
    }, { status: 500 });
  }
}
