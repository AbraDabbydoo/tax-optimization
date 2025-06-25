import Link from "next/link"
import { ArrowRight, BarChart3, Calendar, CheckCircle2, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
          <div className="mr-4 flex items-center">
            <Link href="/" className="text-xl font-bold hover:text-blue-600 transition-colors">
              WhereTax
            </Link>
          </div>
          <nav className="flex flex-1 items-center justify-end space-x-4">
            <Link href="/services" className="text-sm font-medium">
              Services
            </Link>
            <Link href="/about" className="text-sm font-medium">
              About
            </Link>
            <Button asChild>
              <a href="#choose-your-path">Get Started</a>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-8 md:py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center">
              <div className="space-y-6 max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Where You Live Drives Your Taxes
                </h1>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-xl/relaxed">
                  Discover the best state to live or retire in to optimize your tax situation. Our data-driven approach
                  helps you make informed decisions about where to call home.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center pt-2">
                  <Button asChild size="lg">
                    <a href="#choose-your-path">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg">
                    <a href="#why-choose-us">Learn More</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="choose-your-path" className="w-full py-12 md:py-16 lg:py-20 bg-white scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">How It Works</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Choose Your Path</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We offer two ways to optimize your tax situation based on your location. Select the option that works
                  best for you.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-8 lg:grid-cols-2">
              <Card className="flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl">Automated Tax Calculation</CardTitle>
                  <CardDescription>Data-driven analysis for optimal tax locations</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <BarChart3 className="h-16 w-16 text-blue-600" />
                  <div className="text-4xl font-bold">$99</div>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Complete our detailed financial questionnaire</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Receive personalized tax analysis</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Dashboard with top 5 states for your situation</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                      <span>All 50 states taken into consideration</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/calculator">Start My Tax Analysis</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow border-blue-200">
                <CardHeader>
                  <CardTitle className="text-2xl">CPA Consultation</CardTitle>
                  <CardDescription>Personalized advice from a tax professional</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <Calendar className="h-16 w-16 text-blue-600" />
                  <div className="text-4xl font-bold">$300</div>
                  <ul className="space-y-2 text-left">
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                      <span>1-hour consultation with a CPA</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Tailored advice for your specific situation</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Strategic tax planning recommendations</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Follow-up summary report</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/consultation">Book a Call</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
        <section id="why-choose-us" className="w-full py-12 md:py-16 lg:py-20 bg-gray-50 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose Us</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our comprehensive approach to tax optimization helps you make informed decisions about where to live
                  or retire.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-8 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Data-Driven Analysis</h3>
                <p className="text-gray-500">
                  Our calculations consider income tax, property tax, sales tax, and other factors to provide a
                  comprehensive view.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Expert Guidance</h3>
                <p className="text-gray-500">
                  Our CPAs specialize in multi-state taxation and can provide personalized advice for your unique
                  situation.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Maximize Savings</h3>
                <p className="text-gray-500">
                  Clients who relocate based on our recommendations save an average of $12,000 annually in taxes.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Optimize Your Taxes?</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Take the first step toward a more tax-efficient lifestyle by choosing the service that's right for
                  you.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <a href="#choose-your-path">Get Started</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold hover:text-blue-600 transition-colors">
              WhereTax
            </Link>
          </div>
          <p className="text-center text-sm text-gray-500 md:text-left">
            © 2025 WhereTax. All rights reserved. Tax information provided is general in nature and should not be
            considered professional advice.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
