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
import { useQuery } from "@tanstack/react-query";
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
import { useState } from "react";
import { differenceInDays, parseISO } from "date-fns";

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type NOCRecord = Database['public']['Tables']['noc_records']['Row'];

interface PlayerMetrics {
  leaveDays: number;
  absentDays: number;
  nocDays: number;
  totalLeaveCount: number;
  totalAbsentCount: number;
  totalNOCCount: number;
  currentMonthLeaves: number;
  currentMonthAbsents: number;
}

const PlayerManagement = () => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

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

  const calculatePlayerMetrics = (playerId: string): PlayerMetrics => {
    const playerNOCs = nocRecords?.filter(record => record.user_id === playerId) || [];
    
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

    return {
      leaveDays: calculateDaysForType(playerNOCs, 'leave'),
      absentDays: calculateDaysForType(playerNOCs, 'absent'),
      nocDays: calculateDaysForType(playerNOCs, 'noc'),
      totalLeaveCount: playerNOCs.filter(noc => noc.type === 'leave').length,
      totalAbsentCount: playerNOCs.filter(noc => noc.type === 'absent').length,
      totalNOCCount: playerNOCs.filter(noc => noc.type === 'noc').length,
      currentMonthLeaves: currentMonthRecords.filter(record => record.type === 'leave').length,
      currentMonthAbsents: currentMonthRecords.filter(record => record.type === 'absent').length,
    };
  };

  const getStatusColor = (metrics: PlayerMetrics) => {
    if (metrics.absentDays > 7 || metrics.currentMonthAbsents >= 2) {
      return "bg-red-100 text-red-700";
    }
    if (metrics.leaveDays > 30) {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-green-100 text-green-700";
  };

  const getStatusText = (metrics: PlayerMetrics) => {
    if (metrics.absentDays > 7) {
      return "High Absence";
    }
    if (metrics.leaveDays > 30) {
      return "Extended Leave";
    }
    if (metrics.currentMonthAbsents >= 2) {
      return "Multiple Absences";
    }
    return "Active";
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlayerId) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', selectedPlayerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Player has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete player",
        variant: "destructive",
      });
    }

    setShowDeleteDialog(false);
    setSelectedPlayerId(null);
  };

  if (loadingMembers || loadingNOCs) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Player Management</h1>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IGN</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Discord ID</TableHead>
                <TableHead>Leave Days (Count)</TableHead>
                <TableHead>Absent Days (Count)</TableHead>
                <TableHead>NOC Days (Count)</TableHead>
                <TableHead>Total Records</TableHead>
                <TableHead>This Month</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers?.map((player) => {
                const metrics = calculatePlayerMetrics(player.id);
                return (
                  <TableRow key={player.id}>
                    <TableCell>{player.ign}</TableCell>
                    <TableCell>{player.phone}</TableCell>
                    <TableCell>{player.discord_id}</TableCell>
                    <TableCell>
                      {metrics.leaveDays} ({metrics.totalLeaveCount})
                    </TableCell>
                    <TableCell>
                      {metrics.absentDays} ({metrics.totalAbsentCount})
                    </TableCell>
                    <TableCell>
                      {metrics.nocDays} ({metrics.totalNOCCount})
                    </TableCell>
                    <TableCell>
                      {metrics.totalLeaveCount + metrics.totalAbsentCount + metrics.totalNOCCount}
                    </TableCell>
                    <TableCell>
                      L: {metrics.currentMonthLeaves} A: {metrics.currentMonthAbsents}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          metrics
                        )}`}
                      >
                        {getStatusText(metrics)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                        >
                          <Pencil className="h-4 w-4" style={{ color: "#DC2626" }} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setSelectedPlayerId(player.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash className="h-4 w-4" style={{ color: "#DC2626" }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the player's data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default PlayerManagement;