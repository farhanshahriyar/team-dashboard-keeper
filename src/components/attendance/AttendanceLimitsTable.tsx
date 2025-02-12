
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type DailyAttendance = Database['public']['Tables']['daily_attendance']['Row'];

interface AttendanceLimitsTableProps {
  members: TeamMember[];
  attendance: DailyAttendance[];
  currentMonth: Date;
}

export function AttendanceLimitsTable({ members, attendance, currentMonth }: AttendanceLimitsTableProps) {
  const getMemberAttendance = (memberId: string) => {
    const memberAttendance = attendance.filter(a => 
      a.team_member_id === memberId &&
      new Date(a.date) >= startOfMonth(currentMonth) &&
      new Date(a.date) <= endOfMonth(currentMonth)
    );

    const leaveDays = memberAttendance.filter(a => a.status === 'leave').length;
    const absentDays = memberAttendance.filter(a => a.status === 'absent').length;
    const nocDays = memberAttendance.filter(a => a.status === 'noc').length;
    
    return {
      leaveDays,
      absentDays,
      nocDays,
    };
  };

  const getStatusColor = (days: number) => {
    if (days > 7) return "bg-red-500/20 text-red-500 border-red-500/30";
    if (days >= 5) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    return "bg-green-500/20 text-green-500 border-green-500/30";
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  return (
    <div className="rounded-md border border-white/10">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10">
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="text-white text-right">Present Days</TableHead>
            <TableHead className="text-white text-right">Leave Days</TableHead>
            <TableHead className="text-white text-right">Absent Days</TableHead>
            <TableHead className="text-white text-right">NOC Days</TableHead>
            <TableHead className="text-white text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const { leaveDays, absentDays, nocDays } = getMemberAttendance(member.id);
            const totalDays = getDaysInMonth(currentMonth);
            const presentDays = totalDays - leaveDays - absentDays - nocDays;
            
            return (
              <TableRow key={member.id} className="border-white/10">
                <TableCell className="font-medium text-white">
                  {member.real_name}
                </TableCell>
                <TableCell className="text-right text-white">
                  {presentDays}
                </TableCell>
                <TableCell className="text-right text-white">
                  {leaveDays}
                </TableCell>
                <TableCell className="text-right text-white">
                  {absentDays}
                </TableCell>
                <TableCell className="text-right text-white">
                  {nocDays}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Badge className={getStatusColor(leaveDays)}>
                      {leaveDays > 7 ? (
                        <AlertCircle className="h-4 w-4 mr-1" />
                      ) : null}
                      {leaveDays > 7 ? 'Exceeded' : 'Normal'}
                    </Badge>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
