
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { format } from "date-fns";
import { EditAttendanceDialog } from "./EditAttendanceDialog";
import type { Database } from "@/integrations/supabase/types";

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type Attendance = Database['public']['Tables']['daily_attendance']['Row'];

interface AttendanceTableProps {
  members: TeamMember[];
  attendance: Attendance[];
  selectedDate: Date;
}

export function AttendanceTable({ members, attendance, selectedDate }: AttendanceTableProps) {
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const getAttendanceStatus = (memberId: string) => {
    const record = attendance.find(a => a.team_member_id === memberId);
    return record?.status || '-';
  };

  const getAttendanceRecord = (memberId: string) => {
    return attendance.find(a => a.team_member_id === memberId);
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

  const handleEditClick = (member: TeamMember) => {
    const record = getAttendanceRecord(member.id);
    if (record) {
      setEditingMember(member);
      setEditingAttendance(record);
      setShowEditDialog(true);
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
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const attendanceRecord = getAttendanceRecord(member.id);
            return (
              <TableRow key={member.id}>
                <TableCell>{member.real_name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.game_role}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(getAttendanceStatus(member.id))}`}>
                    {getAttendanceStatus(member.id)}
                  </span>
                </TableCell>
                <TableCell>
                  {attendanceRecord && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(member)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {editingMember && editingAttendance && (
        <EditAttendanceDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          member={editingMember}
          attendance={editingAttendance}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}
