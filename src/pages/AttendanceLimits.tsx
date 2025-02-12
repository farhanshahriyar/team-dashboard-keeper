
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

  const { data: limits, isLoading: loadingLimits } = useQuery({
    queryKey: ['attendance-limits', format(date, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_limits')
        .select('*')
        .gte('month', format(date, 'yyyy-MM-01'))
        .lt('month', format(new Date(date.getFullYear(), date.getMonth() + 1, 1), 'yyyy-MM-dd'));
      
      if (error) throw error;
      
      // Check for exceeded limits and show notifications
      data.forEach(limit => {
        if (limit.exceeds_limit) {
          const memberName = members?.find(m => m.id === limit.team_member_id)?.real_name;
          toast({
            title: "Leave Limit Exceeded",
            description: `${memberName} has exceeded the monthly leave limit.`,
            variant: "destructive",
          });
        }
      });
      
      return data;
    },
    enabled: !!members,
  });

  if (loadingMembers || loadingLimits) {
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
          limits={limits || []}
          currentMonth={date}
        />
      </div>
    </DashboardLayout>
  );
};

export default AttendanceLimits;
