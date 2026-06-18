declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void
      on: (event: string, handler: (response: unknown) => void) => void
    }
  }
}

export const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

interface OpenRazorpayCheckoutInput {
  keyId: string
  orderId: string
  amount: number
  currency: string
  name?: string
  description?: string
  prefill?: { name?: string; email?: string }
}

export const openRazorpayCheckout = (
  input: OpenRazorpayCheckoutInput
): Promise<{
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}> =>
  new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay failed to load'))
      return
    }

    const rzp = new window.Razorpay({
      key: input.keyId,
      amount: input.amount,
      currency: input.currency,
      name: input.name ?? 'UserPortal',
      description: input.description ?? 'Subscription payment',
      order_id: input.orderId,
      prefill: input.prefill,
      theme: { color: '#2563eb' },
      handler: (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    })

    rzp.open()
  })
