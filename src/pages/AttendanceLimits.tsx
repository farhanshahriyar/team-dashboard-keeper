
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AttendanceLimitsTable } from "@/components/attendance/AttendanceLimitsTable";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";

const AttendanceLimits = () => {
  const [date, setDate] = useState<Date>(new Date());
  const { toast } = useToast();

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

  const { data: attendance, isLoading: loadingAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['daily-attendance', format(date, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_attendance')
        .select('*')
        .gte('date', format(startOfMonth(date), 'yyyy-MM-dd'))
        .lte('date', format(endOfMonth(date), 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data;
    },
    enabled: !!members,
  });

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_attendance',
          filter: `date=gte.${format(startOfMonth(date), 'yyyy-MM-dd')}&date=lte.${format(endOfMonth(date), 'yyyy-MM-dd')}`,
        },
        () => {
          refetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date, refetchAttendance]);

  if (loadingMembers || loadingAttendance) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeader 
          title="Attendance Limits" 
          description="Track and manage monthly attendance limits for team members."
        />
        
        <div className="flex justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-background/50 border-white/10 text-white">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, 'MMMM yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <AttendanceLimitsTable 
          members={members || []}
          attendance={attendance || []}
          currentMonth={date}
        />
      </div>
    </DashboardLayout>
  );
};

export default AttendanceLimits;
