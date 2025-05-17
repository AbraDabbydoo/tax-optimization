"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PaymentPage() {
  const [paymentComplete, setPaymentComplete] = useState(false)

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      setPaymentComplete(true)
    }, 1500)
  }

  const handleNextStep = () => {
    // In a real app, you would validate and save the form data
    window.location.href = "/calculator/step-3"
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tax Optimization Analysis</h1>
        <p className="text-muted-foreground">Complete your payment to continue with your tax optimization analysis.</p>
      </div>

      {/* No progress indicator on payment page as requested */}

      {!paymentComplete ? (
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>Complete your payment to continue with your tax optimization analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Automated Tax Calculation</h3>
                  <p className="text-sm text-muted-foreground">Personalized tax optimization analysis</p>
                </div>
                <div className="text-lg font-bold">$99.00</div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-4 font-medium">Payment Method</h3>
              <Tabs defaultValue="card">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card">Credit Card</TabsTrigger>
                  <TabsTrigger value="paypal">PayPal</TabsTrigger>
                </TabsList>
                <TabsContent value="card" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expMonth">Expiry Month</Label>
                      <Select>
                        <SelectTrigger id="expMonth">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, "0")}>
                              {(i + 1).toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expYear">Expiry Year</Label>
                      <Select>
                        <SelectTrigger id="expYear">
                          <SelectValue placeholder="YY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => (
                            <SelectItem key={i} value={(new Date().getFullYear() + i).toString().slice(-2)}>
                              {(new Date().getFullYear() + i).toString().slice(-2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="paypal" className="pt-4">
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <p className="text-center text-muted-foreground">
                      Click the button below to complete payment with PayPal.
                    </p>
                    <Button className="w-full max-w-xs">Continue to PayPal</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/calculator/step-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
            <Button onClick={handlePayment}>Complete Payment</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Payment Complete!</CardTitle>
            <CardDescription>
              Your payment has been processed successfully. Click continue to proceed with your analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Thank you for your purchase. Now let's collect some additional information to complete your tax
              optimization analysis.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleNextStep}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
