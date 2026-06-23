import { Eye } from 'lucide-react';
import { Button } from '../ui/Button';

interface DocumentPreviewButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export const DocumentPreviewButton = ({
  onClick,
  disabled = false,
  label = 'Preview',
}: DocumentPreviewButtonProps) => (
  <Button type="button" variant="secondary" onClick={onClick} disabled={disabled}>
    <Eye className="mr-2 inline h-4 w-4" />
    {label}
  </Button>
);
