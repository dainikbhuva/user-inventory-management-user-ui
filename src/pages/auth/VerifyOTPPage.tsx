import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowLeft, MailCheck } from 'lucide-react';

const OTP_LENGTH = 6;

export const VerifyOTPPage = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email: string = (location.state as { email?: string })?.email ?? '';

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const focusNext = (index: number) => {
    if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };
  const focusPrev = (index: number) => {
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const digit = value.slice(-1); // take last char
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
    } else if (e.key === 'ArrowLeft') focusPrev(index);
    else if (e.key === 'ArrowRight') focusNext(index);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...otp];
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setOtp(next);
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) { setError('Please enter all 6 digits.'); return; }
    setError('');
    setIsLoading(true);
    try {
      // TODO: verify OTP via your API
      await new Promise((res) => setTimeout(res, 1200));
      navigate('/reset-password', { state: { email, otp: code } });
    } catch {
      setError('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    // TODO: resend OTP API call
  };

  const filled = otp.every((d) => d !== '');

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">U</span>
          </div>
          <span className="text-body font-semibold tracking-tight">UserPortal</span>
        </div>

        {/* Icon */}
        <div className="w-12 h-12 bg-primary-soft border border-primary-soft rounded-sm flex items-center justify-center mb-6">
          <MailCheck className="w-5 h-5 text-primary" />
        </div>

        <h2 className="text-2xl font-bold text-body mb-1">Check your email</h2>
        <p className="text-muted text-sm mb-2 leading-relaxed">
          We sent a 6-digit verification code to
        </p>
        {email && (
          <p className="text-body text-sm font-semibold mb-7">{email}</p>
        )}

        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-sm px-4 py-3 mb-5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* OTP input boxes */}
          <div>
            <label className="block text-sm font-medium text-body mb-3">Verification code</label>
            <div className="flex gap-2" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isLoading}
                  className={`w-full h-13 text-center text-lg font-bold border rounded-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50 ${
                    digit ? 'bg-primary-soft border-primary-soft text-primary' : 'bg-surface border-base text-body'
                  }`}
                  style={{ aspectRatio: '1' }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !filled}
            className="w-full h-11 bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold text-sm rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />}
            {isLoading ? 'Verifying...' : 'Verify code'}
          </button>
        </form>

        {/* Resend */}
<p className="text-center text-sm text-muted mt-5">
            Didn't receive the code?{' '}
            {resendTimer > 0 ? (
              <span className="text-muted">Resend in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary hover:text-primary font-semibold cursor-pointer"
            >
              Resend
            </button>
          )}
        </p>

        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="w-full mt-4 h-11 bg-surface border border-base hover:bg-surface-2 rounded-sm text-body text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
};