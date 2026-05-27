import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === 'paid';

    if (paid) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (user && !userError) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            tax_optimization_paid: 'true',
            tax_optimization_paid_at: new Date().toISOString(),
          },
        });

        if (updateError) {
          console.warn('Failed to persist payment state to user metadata:', updateError.message);
        }
      }

      return NextResponse.json({
        paid: true,
        customerEmail: session.customer_details?.email,
        amountPaid: session.amount_total ? session.amount_total / 100 : 0,
      });
    }

    return NextResponse.json({ paid: false });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
