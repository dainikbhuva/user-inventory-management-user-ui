import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  { id: 1, label: 'Email' },
  { id: 2, label: 'Verify' },
  { id: 3, label: 'Reset' },
] as const;

interface AuthFlowLayoutProps {
  step: 1 | 2 | 3;
  icon: ReactNode;
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthFlowLayout = ({
  step,
  icon,
  title,
  description,
  children,
  footer,
}: AuthFlowLayoutProps) => (
  <div className="theme-scrollbar flex min-h-screen max-h-screen items-center justify-center overflow-y-auto bg-surface p-6">
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link to="/login" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary">
            <span className="text-sm font-bold text-primary-foreground">U</span>
          </div>
          <span className="font-semibold tracking-tight text-body">UserPortal</span>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2">
          {STEPS.map((item, index) => (
            <div key={item.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step >= item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-base bg-surface-2 text-muted'
                }`}
              >
                {item.id}
              </div>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  step >= item.id ? 'text-body' : 'text-muted'
                }`}
              >
                {item.label}
              </span>
              {index < STEPS.length - 1 ? (
                <div
                  className={`mx-1 h-px flex-1 ${step > item.id ? 'bg-primary' : 'bg-base'}`}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-base bg-surface shadow-sm">
        <div className="border-b border-base bg-surface-2/40 px-6 py-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-primary/20 bg-primary-soft">
            {icon}
          </div>
          <h1 className="text-2xl font-bold text-body">{title}</h1>
          <div className="mt-2 text-sm leading-relaxed text-muted">{description}</div>
        </div>

        <div className="px-6 py-6">{children}</div>

        {footer ? <div className="border-t border-base px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  </div>
);
