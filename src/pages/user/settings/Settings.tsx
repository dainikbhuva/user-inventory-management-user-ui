import { Navigate } from 'react-router-dom';
import { SettingsLayout } from './SettingsLayout';
import { SettingsGeneralPage } from './SettingsGeneralPage';
import { SettingsAttendancePage } from './SettingsAttendancePage';
import { DepartmentsSettingsPanel } from '../departments/DepartmentsPage';
import { DesignationsSettingsPanel } from '../designations/DesignationsPage';
import { LeaveTypesPage } from '../leave-types/LeaveTypesPage';
import { HolidaysPage } from '../holidays/HolidaysPage';
import { AnnouncementsSettingsPanel } from '../announcements/AnnouncementsPage';
import { SettingsBillingPage } from './SettingsBillingPage';

export { SettingsLayout };

export const SettingsIndexRedirect = () => <Navigate to="/settings/general" replace />;

export const SettingsRoutes = {
  Layout: SettingsLayout,
  General: SettingsGeneralPage,
  Attendance: SettingsAttendancePage,
  Departments: DepartmentsSettingsPanel,
  Designations: DesignationsSettingsPanel,
  LeaveTypes: () => <LeaveTypesPage embedded />,
  Holidays: () => <HolidaysPage embedded />,
  Announcements: AnnouncementsSettingsPanel,
  Billing: SettingsBillingPage,
  Shifts: SettingsAttendancePage,
};
