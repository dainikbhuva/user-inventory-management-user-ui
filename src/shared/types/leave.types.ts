export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveApprovalStage = 'manager' | 'hr' | 'completed';

export interface PortalLeaveTypeRecord {
  id: string;
  name: string;
  code: string;
  description?: string;
  annualAllocation: number;
  maxDaysPerYear: number;
  status: 'active' | 'inactive';
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PortalLeaveBalanceRecord {
  leaveType: { id: string; name: string; code: string };
  allocated: number;
  used: number;
  remaining: number;
}

export interface PortalLeaveUserRef {
  id: string;
  name: string;
  employeeCode: string;
}

export interface PortalLeaveRequestRecord {
  id: string;
  user: PortalLeaveUserRef;
  approver?: PortalLeaveUserRef;
  leaveType: { id: string; name: string; code: string };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveRequestStatus;
  approvalStage: LeaveApprovalStage;
  approvalStageLabel?: string;
  reviewedBy?: PortalLeaveUserRef;
  reviewedAt?: string;
  reviewNote?: string;
  permissions: {
    canEdit: boolean;
    canCancel: boolean;
    canReview: boolean;
    canDelete: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PortalLeaveListMeta {
  isApprover: boolean;
  pendingApprovalCount: number;
  viewAllTeamRequests?: boolean;
}

export interface CreateLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateLeaveRequestPayload {
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

export interface ReviewLeaveRequestPayload {
  status: 'approved' | 'rejected';
  reviewNote?: string;
}
