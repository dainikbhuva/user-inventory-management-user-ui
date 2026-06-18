const API_VERSION =
  (import.meta.env.VITE_API_VERSION as string | undefined)?.trim() || 'v1'

const normalizeApiBaseUrl = (raw: string): string => {
  const base = raw.replace(/\/$/, '')
  if (base.endsWith(`/${API_VERSION}`)) return base
  if (base.endsWith('/api')) return `${base}/${API_VERSION}`
  return base
}

const configured = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()

export const API_BASE_URL = normalizeApiBaseUrl(
  configured || `http://localhost:3000/api/${API_VERSION}`,
)

export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 10000)
