
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
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type AttendanceLimit = Database['public']['Tables']['attendance_limits']['Row'];

interface AttendanceLimitsTableProps {
  members: TeamMember[];
  limits: AttendanceLimit[];
  currentMonth: Date;
}

export function AttendanceLimitsTable({ members, limits, currentMonth }: AttendanceLimitsTableProps) {
  const getMemberLimits = (memberId: string) => {
    return limits.find(limit => 
      limit.team_member_id === memberId && 
      format(new Date(limit.month), 'yyyy-MM') === format(currentMonth, 'yyyy-MM')
    );
  };

  const getStatusColor = (days: number) => {
    if (days > 7) return "bg-red-500/20 text-red-500 border-red-500/30";
    if (days >= 5) return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
    return "bg-green-500/20 text-green-500 border-green-500/30";
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
            const limits = getMemberLimits(member.id);
            const leaveDays = limits?.leave_days || 0;
            const workingDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
            const presentDays = workingDays - (limits?.leave_days || 0) - (limits?.absent_days || 0) - (limits?.noc_days || 0);
            
            return (
              <TableRow key={member.id} className="border-white/10">
                <TableCell className="font-medium text-white">
                  {member.real_name}
                </TableCell>
                <TableCell className="text-right text-white">
                  {presentDays}
                </TableCell>
                <TableCell className="text-right text-white">
                  {limits?.leave_days || 0}
                </TableCell>
                <TableCell className="text-right text-white">
                  {limits?.absent_days || 0}
                </TableCell>
                <TableCell className="text-right text-white">
                  {limits?.noc_days || 0}
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
