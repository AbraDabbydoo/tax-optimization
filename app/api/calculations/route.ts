import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/calculations
 * Save a tax calculation for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      data: calculationData,
      results,
    } = body

    if (!name || !calculationData) {
      return NextResponse.json(
        { error: 'Missing required fields: name, data' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('calculations')
      .insert({
        user_id: user.id,
        name,
        description,
        data: calculationData,
        results,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving calculation:', error)
      return NextResponse.json(
        { error: 'Failed to save calculation' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Error in POST /api/calculations:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/calculations
 * Get all calculations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching calculations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch calculations' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Error in GET /api/calculations:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
