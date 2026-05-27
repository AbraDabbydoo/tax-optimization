/**
 * Example: Integrating Save Calculation into the Tax Calculator
 * 
 * This shows how to use useCalculations() hook to save tax results
 * to the user's account. Copy this pattern into your calculator page.
 */

'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useCalculations } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SaveCalculationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  calculationData: any
  results: any
}

export function SaveCalculationDialog({
  open,
  onOpenChange,
  calculationData,
  results,
}: SaveCalculationDialogProps) {
  const { user } = useAuth()
  const { saveCalculation, loading, error } = useCalculations()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSave = async () => {
    if (!name.trim()) return

    try {
      const saved = await saveCalculation({
        name,
        description: description || undefined,
        data: calculationData,
        results,
      })

      try {
        localStorage.setItem('taxCalculator_savedCalculationId', saved.id)
        localStorage.setItem('taxCalculator_name', name)
        if (description) {
          localStorage.setItem('taxCalculator_description', description)
        }
      } catch (err) {
        console.warn('Unable to persist calculation metadata to localStorage:', err)
      }

      // Success - close dialog and reset
      onOpenChange(false)
      setName('')
      setDescription('')

      // Optional: Show success toast
      console.log('Calculation saved successfully!')
    } catch (err) {
      console.error('Failed to save:', err)
    }
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You must be signed in to save calculations. Please sign in or create an account.
            </DialogDescription>
          </DialogHeader>
          <Button asChild>
            <a href="/auth/login">Sign In</a>
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Calculation</DialogTitle>
          <DialogDescription>
            Save this tax calculation to your account so you can access it later
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="calc-name">Calculation Name *</Label>
            <Input
              id="calc-name"
              placeholder="e.g., California 2025 Analysis"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calc-desc">Description (Optional)</Label>
            <Input
              id="calc-desc"
              placeholder="Add notes about this calculation"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !name.trim()}>
              {loading ? 'Saving...' : 'Save Calculation'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Usage in your calculator component:
 * 
 * import { SaveCalculationDialog } from '@/components/save-calculation-dialog'
 * 
 * export function CalculatorPage() {
 *   const [saveDialogOpen, setSaveDialogOpen] = useState(false)
 *   const [results, setResults] = useState(null)
 *   
 *   return (
 *     <>
 *       <Button onClick={() => setSaveDialogOpen(true)}>
 *         Save Calculation
 *       </Button>
 *       
 *       <SaveCalculationDialog
 *         open={saveDialogOpen}
 *         onOpenChange={setSaveDialogOpen}
 *         calculationData={yourInputData}
 *         results={results}
 *       />
 *     </>
 *   )
 * }
 */
