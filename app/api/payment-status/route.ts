import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('Payment status fetch error:', userError)
      return NextResponse.json({ paid: false }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ paid: false }, { status: 401 })
    }

    const paid = user.user_metadata?.tax_optimization_paid === 'true'
    const paymentAt = user.user_metadata?.tax_optimization_paid_at ?? null

    return NextResponse.json({ paid, paymentAt })
  } catch (error) {
    console.error('Error fetching payment status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    )
  }
}
