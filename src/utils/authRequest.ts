/** Auth endpoints that may legitimately return 401 (invalid credentials). */
export const isPublicAuthRequest = (url: string): boolean =>
  /\/auth\/(login|signup|register|forgot-password|reset-password|verify-otp)/i.test(url)
