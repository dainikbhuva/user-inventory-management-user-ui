import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../auth/useAuth'
import {
  subscriptionService,
  type PortalSubscriptionSummary,
} from '../../services/subscription.service'

interface SubscriptionContextValue {
  subscription: PortalSubscriptionSummary | null
  isLoading: boolean
  refresh: () => Promise<void>
  clear: () => void
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined)

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState<PortalSubscriptionSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clear = useCallback(() => {
    setSubscription(null)
    setIsLoading(false)
  }, [])

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      clear()
      return
    }
    try {
      setIsLoading(true)
      const response = await subscriptionService.getCurrent()
      setSubscription(response.data ?? null)
    } catch {
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }, [clear, isAuthenticated])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(
    () => ({ subscription, isLoading, refresh, clear }),
    [subscription, isLoading, refresh, clear]
  )

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext)
  if (!ctx) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return ctx
}
