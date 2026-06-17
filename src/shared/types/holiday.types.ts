import type { HolidayType } from '../constants/holidayType';

export interface PortalHolidayRecord {
  id: string;
  name: string;
  date: string;
  holidayType: HolidayType;
  holidayTypeLabel: string;
  isRecurring: boolean;
  description?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface HolidayFormData {
  name: string;
  date: string;
  holidayType: HolidayType;
  isRecurring: boolean;
  description: string;
  status: 'active' | 'inactive';
}
