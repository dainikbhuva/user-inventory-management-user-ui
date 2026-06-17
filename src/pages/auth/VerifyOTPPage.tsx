import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, MailCheck } from 'lucide-react';
import { useAuth } from '../../shared/auth/useAuth';
import { AuthFlowLayout } from '../../components/auth/AuthFlowLayout';

const OTP_LENGTH = 6;

export const VerifyOTPPage = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();

  const state = location.state as { email?: string; debugOtp?: string } | null;
  const email = state?.email ?? '';

  useEffect(() => {
    if (!email) return;
    inputRefs.current[0]?.focus();
  }, [email]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = window.setTimeout(() => setResendTimer((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendTimer]);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const focusNext = (index: number) => {
    if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const focusPrev = (index: number) => {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit) focusNext(index);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else {
        focusPrev(index);
      }
    } else if (e.key === 'ArrowLeft') {
      focusPrev(index);
    } else if (e.key === 'ArrowRight') {
      focusNext(index);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...otp];
    pasted.split('').forEach((char, index) => {
      next[index] = char;
    });
    setOtp(next);
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const resetToken = await verifyOTP(email, code);
      navigate('/reset-password', { state: { email, resetToken }, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setInfo('');
    try {
      const result = await resendOTP(email);
      setResendTimer(30);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      const debugHint = result.debugOtp ? ` Code: ${result.debugOtp}` : '';
      setInfo(`A new verification code has been sent.${debugHint}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code.');
    }
  };

  const filled = otp.every((digit) => digit !== '');

  return (
    <AuthFlowLayout
      step={2}
      icon={<MailCheck className="h-5 w-5 text-primary" />}
      title="Verify your email"
      description={
        <>
          Enter the 6-digit code sent to{' '}
          <span className="font-semibold text-body">{email}</span>
        </>
      }
      footer={
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="flex w-full items-center justify-center gap-2 text-sm font-medium text-muted transition hover:text-body"
        >
          <ArrowLeft className="h-4 w-4" />
          Use a different email
        </button>
      }
    >
      {state?.debugOtp ? (
        <div className="mb-5 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Development mode: your verification code is <strong>{state.debugOtp}</strong>
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 flex items-center gap-2.5 rounded-sm border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      {info ? (
        <div className="mb-5 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {info}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-3 block text-sm font-medium text-body">Verification code</label>
          <div className="flex gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={`h-12 w-full rounded-sm border text-center text-lg font-bold transition focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 ${
                  digit ? 'border-primary/40 bg-primary-soft text-primary' : 'border-base bg-surface text-body'
                }`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !filled}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
          ) : null}
          {isLoading ? 'Verifying...' : 'Verify and continue'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Didn&apos;t receive the code?{' '}
        {resendTimer > 0 ? (
          <span>Resend in {resendTimer}s</span>
        ) : (
          <button
            type="button"
            onClick={() => void handleResend()}
            className="font-semibold text-primary hover:opacity-80"
          >
            Resend code
          </button>
        )}
      </p>
    </AuthFlowLayout>
  );
};
