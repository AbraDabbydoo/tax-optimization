"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, CreditCard, Shield, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PaymentPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [nextInputRoute, setNextInputRoute] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const wasCanceled = searchParams.get('canceled') === 'true'
  const sessionId = searchParams.get('session_id')
  const success = searchParams.get('success') === 'true'
  const dashboardHref = user ? "/dashboard" : "/auth/login?next=/dashboard"

  useEffect(() => {
    const storedPaid = localStorage.getItem('taxCalculator_paid') === 'true'
    if (storedPaid) {
      setPaid(true)
      setSuccessMessage('Payment already confirmed. You can continue to your report.')
      return
    }

    const verifyPayment = async () => {
      setPaymentLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/verify-payment?session_id=${encodeURIComponent(sessionId ?? '')}`)
        const data = await response.json()

        if (response.ok && data.paid) {
          setPaid(true)
          localStorage.setItem('taxCalculator_paid', 'true')
          setSuccessMessage('Payment confirmed. Thank you!')
          return
        }

        if (response.ok) {
          setError('Payment could not be verified. Please try again.')
          return
        }

        throw new Error(data.error || 'Unable to verify payment status')
      } catch (err) {
        console.error('Payment verification error:', err)
        setError('Unable to verify payment. Please try again.')
      } finally {
        setPaymentLoading(false)
      }
    }

    const fetchServerStatus = async () => {
      setPaymentLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/payment-status')
        if (!response.ok) {
          return
        }

        const data = await response.json()
        if (data.paid) {
          setPaid(true)
          localStorage.setItem('taxCalculator_paid', 'true')
          setSuccessMessage('Payment confirmed on your account. You can continue to your report.')
        }
      } catch (err) {
        console.error('Payment status check failed:', err)
      } finally {
        setPaymentLoading(false)
      }
    }

    if (success && sessionId) {
      verifyPayment()
    } else {
      fetchServerStatus()
    }
  }, [success, sessionId])

  useEffect(() => {
    const parseSaved = (key: string) => {
      try {
        return JSON.parse(localStorage.getItem(key) || "{}")
      } catch {
        return {}
      }
    }

    const isVisited = (key: string) => localStorage.getItem(key) === "true"

    const hasNumericValue = (value: unknown) => {
      if (typeof value !== "string") return false
      return value.trim().length > 0
    }

    const isAssetsComplete = () => {
      const assetsInfo = parseSaved("taxCalculator_assetsInfo")
      if (!assetsInfo || typeof assetsInfo !== "object") return false
      if (assetsInfo.housingStatus?.trim()) return true
      if (hasNumericValue(assetsInfo.homeValue)) return true
      if (hasNumericValue(assetsInfo.propertyTax)) return true
      if (hasNumericValue(assetsInfo.currentRent)) return true
      if (hasNumericValue(assetsInfo.vehicleValue)) return true
      if (Array.isArray(assetsInfo.vehicleInputs)) {
        return assetsInfo.vehicleInputs.some(
          (input: any) => typeof input?.value === "string" && input.value.trim().length > 0
        )
      }
      return false
    }

    const isExpensesComplete = () => {
      const expensesInfo = parseSaved("taxCalculator_expensesInfo")
      if (!expensesInfo || typeof expensesInfo !== "object") return false
      return [
        "groceries",
        "preparedFood",
        "utilities",
        "services",
        "digitalGoods",
        "medicine",
        "streamingSubscriptions",
      ].some((field) => hasNumericValue((expensesInfo as any)[field]))
    }

    const isCreditsComplete = () => {
      const creditsInfo = parseSaved("taxCalculator_creditsDeductions")
      if (!creditsInfo || typeof creditsInfo !== "object") return false
      if (creditsInfo.hasEducationCredits === "yes") {
        return (
          !!creditsInfo.educationCreditType?.trim() ||
          hasNumericValue(creditsInfo.educationExpenses)
        )
      }
      return isVisited("taxCalculator_creditsDeductionsVisited")
    }

    const determineNextRoute = () => {
      if (!isVisited("taxCalculator_assetsInfoVisited") || !isAssetsComplete()) {
        return "/calculator/step-3"
      }
      if (!isVisited("taxCalculator_expensesInfoVisited") || !isExpensesComplete()) {
        return "/calculator/step-4"
      }
      if (!isVisited("taxCalculator_creditsDeductionsVisited") || !isCreditsComplete()) {
        return "/calculator/step-5"
      }
      return "/calculator/results"
    }

    setNextInputRoute(determineNextRoute())
  }, [])

  const handleStripeCheckout = async () => {
    if (paid) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <Link href={dashboardHref} className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Go to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tax Optimization Analysis</h1>
        <p className="text-muted-foreground">Complete your payment to receive your personalized tax optimization report.</p>
      </div>

      {wasCanceled && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Payment was canceled. You can try again when you're ready.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">Tax Optimization Report</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Personalized analysis comparing tax burdens across all 50 states
                  </p>
                </div>
                <div className="text-lg font-bold">$99</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <h4 className="font-medium">What's included:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Complete state-by-state tax comparison
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Income, property, and sales tax analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Retirement income tax breakdown
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Downloadable PDF report
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Personalized recommendations
                </li>
              </ul>
            </div>

            <Separator />

            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span className="text-xl">$99.00</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Secure Payment
            </CardTitle>
            <CardDescription>
              You'll be redirected to Stripe's secure checkout page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {successMessage && paid && nextInputRoute !== null && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {nextInputRoute === "/calculator/results"
                    ? successMessage
                    : "Payment confirmed. Continue to the next input screen before viewing your report."
                  }
                </p>
                <div className="mt-4 flex gap-2">
                  {nextInputRoute !== "/calculator/results" ? (
                    <Link
                      href={nextInputRoute}
                      className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Continue to {nextInputRoute === "/calculator/step-3" ? "Assets" : nextInputRoute === "/calculator/step-4" ? "Expenses" : "Credits & Deductions"}
                    </Link>
                  ) : (
                    <Link
                      href="/calculator/results"
                      className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View Your Report
                    </Link>
                  )}
                  <Link href={dashboardHref} className="inline-flex w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    {user ? "Go to Dashboard" : "Sign in to Dashboard"}
                  </Link>
                </div>
              </div>
            )}

            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Secure checkout powered by Stripe</p>
                  <p className="text-sm text-muted-foreground">
                    Your payment info is encrypted and secure
                  </p>
                </div>
              </div>
            </div>

            {!paid ? (
              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleStripeCheckout}
                disabled={isLoading || paymentLoading}
              >
                {isLoading || paymentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redirecting to checkout...
                  </>
                ) : (
                  <>
                    Pay $99.00
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            ) : (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
                You have already completed payment. Use the buttons above to continue.
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground">
              By completing this purchase, you agree to our Terms of Service.
              <br />
              30-day money-back guarantee if you're not satisfied.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex justify-start">
        <Button variant="outline" asChild>
          <Link href="/calculator/step-5">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Previous Step
          </Link>
        </Button>
      </div>
    </div>
  )
}
