
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { AddAttendanceDialog } from "@/components/attendance/AddAttendanceDialog";

const Attendance = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_attendance')
        .select('*')
        .eq('date', format(date, 'yyyy-MM-dd'));
      if (error) throw error;
      return data;
    },
  });

  if (loadingMembers || loadingAttendance) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Daily Attendance</h1>
          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={() => setShowAddDialog(true)}>
              Add Attendance
            </Button>
          </div>
        </div>

        <AttendanceTable 
          members={members || []}
          attendance={attendance || []}
          selectedDate={date}
        />

        <AddAttendanceDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          members={members || []}
          selectedDate={date}
        />
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
