export interface PlayerMetrics {
  leaveDays: number;
  absentDays: number;
  nocDays: number;
  totalLeaveCount: number;
  totalAbsentCount: number;
  totalNOCCount: number;
  currentMonthLeaves: number;
  currentMonthAbsents: number;
  status: string;
}

export interface PlayerStats {
  leaveDays: number;
  absentDays: number;
  nocDays: number;
  currentMonthLeaves: number;
  currentMonthAbsents: number;
}