import { useAuth } from './auth-context'
import { useState, useCallback } from 'react'
import { supabase } from './supabase'

export { useAuth }

export interface Calculation {
  id?: string
  name: string
  description?: string
  data: any
  results?: any
}

export function useCalculations() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveCalculation = useCallback(
    async (calculation: Calculation) => {
      if (!user) {
        throw new Error('You must be logged in to save calculations')
      }

      setLoading(true)
      setError(null)

      try {
        // Enforce max 5 saved calculations per user by deleting oldest if needed
        const { data: existing, error: listError } = await supabase
          .from('calculations')
          .select('id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (listError) {
          throw new Error(listError.message || 'Failed to check existing calculations')
        }

        if (existing && existing.length >= 2) {
          // Keep only the newest 2 calculations for this user.
          const toRemoveCount = existing.length - 1
          const toRemove = existing.slice(0, toRemoveCount).map((r: any) => r.id)
          for (const id of toRemove) {
            const { error: delErr } = await supabase.from('calculations').delete().eq('id', id)
            if (delErr) console.warn('Failed to remove old calculation', delErr)
          }
        }

        const { data, error: dbError } = await supabase
          .from('calculations')
          .insert({
            user_id: user.id,
            name: calculation.name,
            description: calculation.description || null,
            data: calculation.data,
            results: calculation.results || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Failed to save calculation')
        }

        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const updateCalculation = useCallback(
    async (id: string, updates: Partial<Calculation>) => {
      if (!user) {
        throw new Error('You must be logged in to update calculations')
      }

      setLoading(true)
      setError(null)

      try {
        const { data, error: dbError } = await supabase
          .from('calculations')
          .update({
            name: updates.name,
            description: updates.description,
            data: updates.data,
            results: updates.results,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (dbError) {
          throw new Error(dbError.message || 'Failed to update calculation')
        }

        return data
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const deleteCalculation = useCallback(
    async (id: string) => {
      if (!user) {
        throw new Error('You must be logged in to delete calculations')
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/calculations/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to delete calculation')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const getCalculation = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/calculations/${id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch calculation')
      }

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    saveCalculation,
    updateCalculation,
    deleteCalculation,
    getCalculation,
    loading,
    error,
  }
}

