'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LogOut, Plus, Trash2, Download } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Calculation {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
  results: any
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmNewCalcOpen, setConfirmNewCalcOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchCalculations()
    }
  }, [user])

  const fetchCalculations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setCalculations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calculations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this calculation?')) return

    try {
      const { error } = await supabase.from('calculations').delete().eq('id', id)
      if (error) throw error
      setCalculations(calculations.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete calculation')
    }
  }

  const handleNewCalculation = () => {
    if (calculations.length >= 2) {
      setConfirmNewCalcOpen(true)
      return
    }

    router.push('/calculator')
  }

  const handleConfirmNewCalculation = async () => {
    try {
      const oldestCalculations = [...calculations]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      const toRemove = oldestCalculations.slice(0, Math.max(0, oldestCalculations.length - 1))

      for (const calc of toRemove) {
        const { error } = await supabase.from('calculations').delete().eq('id', calc.id)
        if (error) {
          throw error
        }
      }

      setCalculations((current) => current.filter((calc) => !toRemove.some((removed) => removed.id === calc.id)))
      setConfirmNewCalcOpen(false)
      router.push('/calculator')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove oldest calculation')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (err) {
      setError('Failed to sign out')
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-blue-600 transition-colors">
            WhereTax
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Your Tax Calculations</h1>
              <p className="text-gray-600 mt-2">View and manage your saved tax scenarios</p>
            </div>
            <Button
              onClick={handleNewCalculation}
              title="Two saved calculations max. Starting a new one removes the oldest saved scenario."
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Calculation
            </Button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            </div>
          ) : calculations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 mb-4">No calculations yet</p>
                <Button asChild>
                  <Link href="/calculator">Start a Calculation</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
              {calculations.length >= 2 && (
                <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
                  You can keep up to 2 calculations in your account. Starting a new one will replace the oldest saved scenario.
                </div>
              )}
              <div className="grid gap-4">
                {calculations.map((calc) => {
                  const isComplete = Boolean(
                    calc.results &&
                    (Array.isArray(calc.results) ? calc.results.length > 0 : true)
                  )
                  return (
                    <Card key={calc.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{calc.name}</CardTitle>
                              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${isComplete ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                {isComplete ? 'Complete' : 'Draft'}
                              </span>
                            </div>
                            {calc.description && (
                              <CardDescription>{calc.description}</CardDescription>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Created {formatDistanceToNow(new Date(calc.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/calculator/results?loadId=${calc.id}`}>Continue</Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Download PDF (coming soon)"
                              disabled
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(calc.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {calc.results && (
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {calc.results.effectiveTaxRate && (
                              <div>
                                <p className="text-gray-600">Effective Tax Rate</p>
                                <p className="text-lg font-semibold">
                                  {(calc.results.effectiveTaxRate * 100).toFixed(2)}%
                                </p>
                              </div>
                            )}
                            {calc.results.totalTax && (
                              <div>
                                <p className="text-gray-600">Total Tax</p>
                                <p className="text-lg font-semibold">
                                  ${calc.results.totalTax.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>

              </div>

              <AlertDialog open={confirmNewCalcOpen} onOpenChange={setConfirmNewCalcOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Start a new calculation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You already have 2 saved calculations. Starting a new one will remove the oldest saved scenario and keep only your two most recent calculations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmNewCalculation}>Confirm and Start New</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
