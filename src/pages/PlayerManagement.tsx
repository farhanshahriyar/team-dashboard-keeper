import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { differenceInDays, parseISO, format } from "date-fns";

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type NOCRecord = Database['public']['Tables']['noc_records']['Row'];

interface PlayerMetrics {
  email: string;
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

const PlayerManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Fetch team members with their NOC records
  const { data: teamMembers, isLoading: loadingMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) throw error;
      return data as TeamMember[];
    },
  });

  // Fetch NOC records
  const { data: nocRecords, isLoading: loadingNOCs } = useQuery({
    queryKey: ['noc-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noc_records')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as NOCRecord[];
    },
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const teamMembersChannel = supabase
      .channel('team_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['team-members'] });
          toast({
            title: "Data Updated",
            description: "Team member information has been updated.",
          });
        }
      )
      .subscribe();

    const nocRecordsChannel = supabase
      .channel('noc_records_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'noc_records'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['noc-records'] });
          toast({
            title: "Data Updated",
            description: "NOC records have been updated.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamMembersChannel);
      supabase.removeChannel(nocRecordsChannel);
    };
  }, [queryClient, toast]);

  const calculatePlayerMetrics = (email: string): PlayerMetrics => {
    const member = teamMembers?.find(m => m.email === email);
    const playerNOCs = nocRecords?.filter(record => record.email === email) || [];
    
    const calculateDaysForType = (records: NOCRecord[], type: string) => {
      return records
        .filter(record => record.type === type)
        .reduce((total, record) => {
          const startDate = parseISO(record.start_date);
          const endDate = parseISO(record.end_date);
          const days = differenceInDays(endDate, startDate) + 1;
          return total + days;
        }, 0);
    };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentMonthRecords = playerNOCs.filter(record => {
      const recordDate = parseISO(record.start_date);
      return recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear;
    });

    const leaveDays = calculateDaysForType(playerNOCs, 'leave');
    const absentDays = calculateDaysForType(playerNOCs, 'absent');
    const nocDays = calculateDaysForType(playerNOCs, 'noc');
    const currentMonthLeaves = currentMonthRecords.filter(record => record.type === 'leave').length;
    const currentMonthAbsents = currentMonthRecords.filter(record => record.type === 'absent').length;

    return {
      email,
      leaveDays,
      absentDays,
      nocDays,
      totalLeaveCount: playerNOCs.filter(noc => noc.type === 'leave').length,
      totalAbsentCount: playerNOCs.filter(noc => noc.type === 'absent').length,
      totalNOCCount: playerNOCs.filter(noc => noc.type === 'noc').length,
      currentMonthLeaves,
      currentMonthAbsents,
      status: member?.status || 'Active'
    };
  };

  if (loadingMembers || loadingNOCs) {
    return <div className="flex items-center justify-center min-h-screen font-inter">Loading...</div>;
  }

  // Get unique emails from team members
  const uniqueEmails = Array.from(new Set(teamMembers?.map(member => member.email) || []));

  return (
    <DashboardLayout>
      <div className="space-y-8 font-inter">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Player Management</h1>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Email</TableHead>
                <TableHead className="whitespace-nowrap">Leave Days</TableHead>
                <TableHead className="whitespace-nowrap">Absent Days</TableHead>
                <TableHead className="whitespace-nowrap">NOC Days</TableHead>
                <TableHead className="whitespace-nowrap">Current Month</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniqueEmails.map((email) => {
                const metrics = calculatePlayerMetrics(email);
                return (
                  <TableRow key={email} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{email}</TableCell>
                    <TableCell>{metrics.leaveDays}</TableCell>
                    <TableCell>{metrics.absentDays}</TableCell>
                    <TableCell>{metrics.nocDays}</TableCell>
                    <TableCell>
                      L: {metrics.currentMonthLeaves} A: {metrics.currentMonthAbsents}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loadingMembers && uniqueEmails.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No team members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PlayerManagement;