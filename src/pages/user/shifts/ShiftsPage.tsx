import { Navigate } from 'react-router-dom';

/** Legacy route — shifts are managed under Attendance settings. */
export const ShiftsPage = () => <Navigate to="/settings/attendance" replace />;
