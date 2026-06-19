import { ShieldOff } from 'lucide-react';
import { permissionDeniedForModule } from '../../shared/utils/permissionMessages';

interface AccessDeniedPanelProps {
  moduleLabel?: string;
  message?: string;
  compact?: boolean;
}

export const AccessDeniedPanel = ({
  moduleLabel,
  message,
  compact = false,
}: AccessDeniedPanelProps) => {
  const text =
    message ?? (moduleLabel ? permissionDeniedForModule(moduleLabel) : undefined) ??
    'You do not have permission to view this page. Contact your company admin if you need access.';

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-sm border border-base bg-surface text-center ${
        compact ? 'h-48 px-4' : 'px-6 py-12'
      }`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-sm bg-red-500/10">
        <ShieldOff className="h-6 w-6 text-red-500" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-body">Access not allowed</p>
      <p className="mt-2 max-w-md text-sm text-muted">{text}</p>
    </div>
  );
};
