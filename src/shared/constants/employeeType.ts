export const EMPLOYEE_TYPES = [
  'full_time',
  'part_time',
  'contract',
  'intern',
  'consultant',
] as const;

export type EmployeeType = (typeof EMPLOYEE_TYPES)[number];

export const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  intern: 'Intern',
  consultant: 'Consultant',
};

export const getEmployeeTypeLabel = (type?: EmployeeType) =>
  type ? EMPLOYEE_TYPE_LABELS[type] : '—';
