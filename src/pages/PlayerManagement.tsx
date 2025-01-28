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
  totalLeaves: number;
  totalAbsent: number;
  totalNOCs: number;
  pendingNOCs: number;
  approvedNOCs: number;
  recentLeaveDate?: string;
  recentAbsentDate?: string;
  totalLeaveDays: number;
  totalAbsentDays: number;
  totalNOCDays: number;
  currentMonthLeaves: number;
  currentMonthAbsents: number;
  longestLeave: number;
}

const PlayerManagement = () => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Fetch team members
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

  // Fetch NOC records with real-time updates
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

  // Calculate metrics for each player with detailed statistics
  const calculatePlayerMetrics = (playerId: string): PlayerMetrics => {
    const playerNOCs = nocRecords?.filter(record => record.user_id === playerId) || [];
    
    const leaves = playerNOCs.filter(noc => noc.type === 'leave');
    const absents = playerNOCs.filter(noc => noc.type === 'absent');
    const nocs = playerNOCs.filter(noc => noc.type === 'noc');

    const recentLeave = leaves[0];
    const recentAbsent = absents[0];

    // Calculate total days for each type
    const calculateTotalDays = (records: NOCRecord[]) => {
      return records.reduce((total, record) => {
        const startDate = parseISO(record.start_date);
        const endDate = parseISO(record.end_date);
        const days = differenceInDays(endDate, startDate) + 1; // +1 to include both start and end dates
        return total + days;
      }, 0);
    };

    // Calculate current month records
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentMonthLeaves = leaves.filter(leave => {
      const leaveDate = parseISO(leave.start_date);
      return leaveDate.getMonth() === currentMonth && leaveDate.getFullYear() === currentYear;
    });

    const currentMonthAbsents = absents.filter(absent => {
      const absentDate = parseISO(absent.start_date);
      return absentDate.getMonth() === currentMonth && absentDate.getFullYear() === currentYear;
    });

    // Calculate longest leave duration
    const longestLeave = leaves.reduce((max, leave) => {
      const duration = differenceInDays(parseISO(leave.end_date), parseISO(leave.start_date)) + 1;
      return Math.max(max, duration);
    }, 0);
    
    return {
      totalLeaves: leaves.length,
      totalAbsent: absents.length,
      totalNOCs: nocs.length,
      pendingNOCs: playerNOCs.filter(noc => noc.status === 'pending').length,
      approvedNOCs: playerNOCs.filter(noc => noc.status === 'approved').length,
      recentLeaveDate: recentLeave?.start_date,
      recentAbsentDate: recentAbsent?.start_date,
      totalLeaveDays: calculateTotalDays(leaves),
      totalAbsentDays: calculateTotalDays(absents),
      totalNOCDays: calculateTotalDays(nocs),
      currentMonthLeaves: currentMonthLeaves.length,
      currentMonthAbsents: currentMonthAbsents.length,
      longestLeave,
    };
  };

  const getStatusColor = (metrics: PlayerMetrics) => {
    if (metrics.totalNOCs >= 4 || metrics.totalLeaveDays > 30) {
      return "bg-red-100 text-red-700";
    }
    if (metrics.totalAbsent >= 3 || metrics.currentMonthAbsents >= 2) {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-green-100 text-green-700";
  };

  const getStatusText = (metrics: PlayerMetrics) => {
    if (metrics.totalNOCs >= 4) {
      return "NOC Limit Reached";
    }
    if (metrics.totalLeaveDays > 30) {
      return "Excessive Leave";
    }
    if (metrics.totalAbsent >= 3) {
      return "High Absence";
    }
    if (metrics.currentMonthAbsents >= 2) {
      return "Recent Absences";
    }
    return "Active";
  };

  const handleNOCRequest = async (playerId: string) => {
    const metrics = calculatePlayerMetrics(playerId);
    if (metrics.totalNOCs >= 4) {
      toast({
        title: "NOC Request Failed",
        description: "Player has reached the maximum limit of 4 NOCs per year",
        variant: "destructive",
      });
    } else {
      toast({
        title: "NOC Request",
        description: "Please use the NOC page to submit a new request",
      });
    }
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
          <div className="flex gap-4">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> View Reports
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IGN</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Discord ID</TableHead>
                <TableHead>Total Leaves (Days)</TableHead>
                <TableHead>Recent Leave</TableHead>
                <TableHead>Total Absent (Days)</TableHead>
                <TableHead>This Month</TableHead>
                <TableHead>NOCs (Days)</TableHead>
                <TableHead>Longest Leave</TableHead>
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
                    <TableCell>{metrics.totalLeaves} ({metrics.totalLeaveDays})</TableCell>
                    <TableCell>{metrics.recentLeaveDate || 'N/A'}</TableCell>
                    <TableCell>{metrics.totalAbsent} ({metrics.totalAbsentDays})</TableCell>
                    <TableCell>
                      L: {metrics.currentMonthLeaves} A: {metrics.currentMonthAbsents}
                    </TableCell>
                    <TableCell>{metrics.totalNOCs} ({metrics.totalNOCDays})</TableCell>
                    <TableCell>{metrics.longestLeave} days</TableCell>
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
                          onClick={() => handleNOCRequest(player.id)}
                        >
                          <FileText className="h-4 w-4" style={{ color: "#DC2626" }} />
                        </Button>
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