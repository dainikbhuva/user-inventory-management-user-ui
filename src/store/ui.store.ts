import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
  timestamp: Date
}

export type ToastInput = Omit<Toast, 'id' | 'timestamp'>

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  locale: 'en' | 'hi'
  loading: boolean
  toasts: Toast[]

  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  setLocale: (locale: 'en' | 'hi') => void
  setLoading: (loading: boolean) => void
  addToast: (toast: ToastInput) => string
  removeToast: (id: string) => void
  clearToasts: () => void
}

let lastToastKey = ''
let lastToastAt = 0
const TOAST_DEDUPE_MS = 3000

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      locale: 'en',
      loading: false,
      toasts: [],

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      setLoading: (loading) => set({ loading }),

      addToast: (toast) => {
        const key = `${toast.type}:${toast.message}`
        const now = Date.now()
        if (key === lastToastKey && now - lastToastAt < TOAST_DEDUPE_MS) {
          return ''
        }
        lastToastKey = key
        lastToastAt = now

        const id = crypto.randomUUID()
        const newToast: Toast = {
          ...toast,
          id,
          timestamp: new Date(),
        }

        set((s) => ({
          toasts: [...s.toasts, newToast].slice(-5),
        }))

        return id
      },

      removeToast: (id) => set((s) => ({
        toasts: s.toasts.filter((toast) => toast.id !== id),
      })),

      clearToasts: () => set({ toasts: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        locale: state.locale,
      }),
    }
  )
)
