import { Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface TableExportButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const TableExportButton = ({ onClick, disabled }: TableExportButtonProps) => (
  <Button
    type="button"
    variant="outline"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    aria-label="Export to CSV"
    title="Export to CSV"
  >
    <Download className="h-4 w-4" />
  </Button>
);
