import { useState, useCallback } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useAsync<T>(fn: (...args: unknown[]) => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: false, error: null })

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState({ data: null, loading: true, error: null })
      try {
        const data = await fn(...args)
        setState({ data, loading: false, error: null })
        return data
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error'
        setState({ data: null, loading: false, error })
        throw err
      }
    },
    [fn],
  )

  return { ...state, execute }
}
