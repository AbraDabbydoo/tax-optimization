'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useCalculations } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Save, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AutoSaveProps {
  calculationData: any
  results: any
  calculationName?: string
  calculationDescription?: string
  enabled?: boolean
  autoSaveInterval?: number // in milliseconds, default 30000 (30s)
}

export function AutoSave({
  calculationData,
  results,
  calculationName,
  calculationDescription,
  enabled = true,
  autoSaveInterval = 30000
}: AutoSaveProps) {
  const { user, loading: authLoading } = useAuth()
  const { saveCalculation, updateCalculation, loading, error } = useCalculations()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    try {
      const storedDraftId = localStorage.getItem('taxCalculator_savedCalculationId')
      if (storedDraftId) {
        setDraftId(storedDraftId)
      }
    } catch (err) {
      console.warn('Unable to read draft id from localStorage:', err)
    }
  }, [])

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!user || authLoading || !enabled || !calculationData) return

    // Only save if there's meaningful data (at least one field filled)
    const hasData = Object.values(calculationData).some(value =>
      value !== '' && value !== null && value !== undefined
    )
    if (!hasData) return

    try {
      setIsSaving(true)

      if (!calculationName?.trim()) {
      return
    }

    const saveData = {
        name: calculationName.trim(),
        description: calculationDescription || 'In-progress calculation',
        data: calculationData,
        results: results || null,
      }

      let saved
      if (draftId) {
        // Update existing draft or in-progress calculation
        saved = await updateCalculation(draftId, saveData)
      } else {
        // Create new draft with the user-supplied name
        saved = await saveCalculation(saveData)
        setDraftId(saved.id)
        try {
          localStorage.setItem('taxCalculator_savedCalculationId', saved.id)
        } catch (err) {
          console.warn('Unable to persist draft id to localStorage:', err)
        }
      }

      setLastSaved(new Date())
    } catch (err) {
      console.error('Auto-save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }, [user, enabled, calculationData, results, draftId, saveCalculation, updateCalculation])

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled || !user) return

    const interval = setInterval(autoSave, autoSaveInterval)
    return () => clearInterval(interval)
  }, [autoSave, enabled, user, autoSaveInterval])

  // Save when data changes (debounced)
  useEffect(() => {
    if (!enabled || !user || authLoading || !calculationData) return

    // Only save if there's meaningful data (at least one field filled)
    const hasData = Object.values(calculationData).some(value =>
      value !== '' && value !== null && value !== undefined
    )
    if (!hasData) return

    const timeoutId = setTimeout(() => {
      autoSave()
    }, 2000) // Save 2 seconds after last change

    return () => clearTimeout(timeoutId)
  }, [calculationData, autoSave, enabled, user, authLoading])

  if (!user || authLoading || !enabled) return null

  return (
    <Alert className="mb-4">
      <Clock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isSaving ? (
            'Saving draft...'
          ) : lastSaved ? (
            `Last saved: ${lastSaved.toLocaleTimeString()}`
          ) : (
            'Auto-save enabled - your work is being saved automatically'
          )}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={autoSave}
          disabled={isSaving || loading}
          className="ml-4"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Now'}
        </Button>
      </AlertDescription>
    </Alert>
  )
}

// AutoSave component - automatically saves calculation drafts
// Usage: <AutoSave calculationData={data} results={results} enabled={true} />
