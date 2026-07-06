import axiosClient from './api/axiosClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { ApiResponse } from '../shared/types/api.types';
import type {
  AttendanceSettings,
  AttendanceSummary,
  AttendanceTeamAccess,
  AttendanceListQuery,
  DailyAttendanceSheet,
  MarkAttendancePayload,
  MyTodayAttendance,
  PortalAttendanceRecord,
} from '../shared/types/attendance.types';

export const attendanceService = {
  async getMyRecords(from?: string, to?: string): Promise<PortalAttendanceRecord[]> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    const response = await axiosClient.get<ApiResponse<{ items: PortalAttendanceRecord[] }>>(
      `${API_ENDPOINTS.ATTENDANCE.MY_RECORDS}${query ? `?${query}` : ''}`
    );
    return response.data.data!.items;
  },

  async getTeamAccess(): Promise<AttendanceTeamAccess> {
    const response = await axiosClient.get<ApiResponse<AttendanceTeamAccess>>(
      API_ENDPOINTS.ATTENDANCE.TEAM_ACCESS
    );
    return response.data.data!;
  },

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

  async getRecords(filters: AttendanceListQuery = {}): Promise<PortalAttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.userId) params.set('userId', filters.userId);
    if (filters.status) params.set('status', filters.status);
    const query = params.toString();
    const response = await axiosClient.get<ApiResponse<{ items: PortalAttendanceRecord[] }>>(
      `${API_ENDPOINTS.ATTENDANCE.LIST}${query ? `?${query}` : ''}`
    );
    return response.data.data!.items;
  },

  async getSummary(date?: string): Promise<AttendanceSummary> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const response = await axiosClient.get<ApiResponse<AttendanceSummary>>(
      `${API_ENDPOINTS.ATTENDANCE.SUMMARY}${query}`
    );
    return response.data.data!;
  },

  async deleteRecord(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.ATTENDANCE.BY_ID(id));
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
