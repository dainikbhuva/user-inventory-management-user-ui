import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type {
  AttendanceSettings,
  DailyAttendanceSheet,
  MarkAttendancePayload,
  MyTodayAttendance,
  PortalAttendanceRecord,
} from '../shared/types/attendance.types';

export const attendanceService = {
  async getMyToday(): Promise<MyTodayAttendance> {
    const response = await axiosClient.get<ApiResponse<MyTodayAttendance>>(API_ENDPOINTS.ATTENDANCE.MY_TODAY);
    return response.data.data!;
  },

  async checkIn(): Promise<PortalAttendanceRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: PortalAttendanceRecord }>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_IN
    );
    return response.data.data!.item;
  },

  async checkOut(): Promise<PortalAttendanceRecord> {
    const response = await axiosClient.post<ApiResponse<{ item: PortalAttendanceRecord }>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_OUT
    );
    return response.data.data!.item;
  },

  async getDailySheet(date: string): Promise<DailyAttendanceSheet> {
    const response = await axiosClient.get<ApiResponse<DailyAttendanceSheet>>(
      `${API_ENDPOINTS.ATTENDANCE.DAILY_SHEET}?date=${encodeURIComponent(date)}`
    );
    return response.data.data!;
  },

  async markStatus(payload: MarkAttendancePayload): Promise<void> {
    await axiosClient.put(API_ENDPOINTS.ATTENDANCE.MARK, payload);
  },

  async getSettings(): Promise<AttendanceSettings> {
    const response = await axiosClient.get<ApiResponse<{ settings: AttendanceSettings }>>(
      API_ENDPOINTS.ATTENDANCE.SETTINGS
    );
    return response.data.data!.settings;
  },

  async updateSettings(payload: AttendanceSettings): Promise<AttendanceSettings> {
    const response = await axiosClient.put<ApiResponse<{ settings: AttendanceSettings }>>(
      API_ENDPOINTS.ATTENDANCE.SETTINGS,
      payload
    );
    return response.data.data!.settings;
  },

  async updateMyShift(shiftId: string): Promise<MyTodayAttendance> {
    const response = await axiosClient.put<ApiResponse<MyTodayAttendance>>(
      API_ENDPOINTS.ATTENDANCE.MY_SHIFT,
      { shiftId }
    );
    return response.data.data!;
  },
};
