
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type Attendance = Database['public']['Tables']['daily_attendance']['Row'];

interface AttendanceTableProps {
  members: TeamMember[];
  attendance: Attendance[];
  selectedDate: Date;
}

export function AttendanceTable({ members, attendance, selectedDate }: AttendanceTableProps) {
  const getAttendanceStatus = (memberId: string) => {
    const record = attendance.find(a => a.team_member_id === memberId);
    return record?.status || '-';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return "bg-green-100 text-green-700";
      case 'absent':
        return "bg-red-100 text-red-700";
      case 'leave':
        return "bg-blue-100 text-blue-700";
      case 'noc':
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status ({format(selectedDate, 'PP')})</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.real_name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.game_role}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(getAttendanceStatus(member.id))}`}>
                  {getAttendanceStatus(member.id)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
