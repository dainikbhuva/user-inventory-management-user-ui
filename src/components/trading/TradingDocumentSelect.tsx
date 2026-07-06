import { Select } from '../ui/Select';

export interface TradingDocumentOption {
  id: string;
  label: string;
}

interface TradingDocumentSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: TradingDocumentOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
}

export const TradingDocumentSelect = ({
  value,
  onChange,
  options,
  placeholder = 'None',
  error,
  disabled,
}: TradingDocumentSelectProps) => (
  <Select value={value} onChange={(e) => onChange(e.target.value)} error={error} disabled={disabled}>
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.id} value={option.id}>
        {option.label}
      </option>
    ))}
  </Select>
);
