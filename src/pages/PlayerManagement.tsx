import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { PlayerTable } from "@/components/player-management/PlayerTable";
import { EditStatusDialog } from "@/components/player-management/EditStatusDialog";
import { EditStatsDialog } from "@/components/player-management/EditStatsDialog";
import { DeleteConfirmDialog } from "@/components/player-management/DeleteConfirmDialog";
import type { PlayerMetrics, PlayerStats } from "@/components/player-management/types";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from 'xlsx';

type TeamMember = Database['public']['Tables']['team_members']['Row'];
type NOCRecord = Database['public']['Tables']['noc_records']['Row'];

const PlayerManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingStats, setEditingStats] = useState<PlayerStats>({
    leaveDays: 0,
    absentDays: 0,
    nocDays: 0,
    currentMonthLeaves: 0,
    currentMonthAbsents: 0
  });

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

    const member = teamMembers?.find(m => m.id === playerId);
    const status = member?.status || 'Active';

    return {
      leaveDays: calculateDaysForType(playerNOCs, 'leave'),
      absentDays: calculateDaysForType(playerNOCs, 'absent'),
      nocDays: calculateDaysForType(playerNOCs, 'noc'),
      totalLeaveCount: playerNOCs.filter(noc => noc.type === 'leave').length,
      totalAbsentCount: playerNOCs.filter(noc => noc.type === 'absent').length,
      totalNOCCount: playerNOCs.filter(noc => noc.type === 'noc').length,
      currentMonthLeaves: currentMonthRecords.filter(record => record.type === 'leave').length,
      currentMonthAbsents: currentMonthRecords.filter(record => record.type === 'absent').length,
      status
    };
  };

  const handleEditClick = (playerId: string, currentStatus: string) => {
    setSelectedPlayerId(playerId);
    setSelectedStatus(currentStatus);
    setShowEditDialog(true);
  };

  const handleStatsEdit = (playerId: string, currentStats: PlayerMetrics) => {
    setSelectedPlayerId(playerId);
    setEditingStats({
      leaveDays: currentStats.leaveDays,
      absentDays: currentStats.absentDays,
      nocDays: currentStats.nocDays,
      currentMonthLeaves: currentStats.currentMonthLeaves,
      currentMonthAbsents: currentStats.currentMonthAbsents
    });
    setShowStatsDialog(true);
  };

  const handleDeleteClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setShowDeleteDialog(true);
  };

  const handleStatsUpdate = async () => {
    if (!selectedPlayerId) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          leave_days: editingStats.leaveDays,
          absent_days: editingStats.absentDays,
          noc_days: editingStats.nocDays,
          current_month_leaves: editingStats.currentMonthLeaves,
          current_month_absents: editingStats.currentMonthAbsents
        })
        .eq('id', selectedPlayerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Player statistics have been updated",
      });
      setShowStatsDialog(false);
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update player statistics",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedPlayerId) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          status: selectedStatus
        })
        .eq('id', selectedPlayerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Player status has been updated",
      });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update player status",
        variant: "destructive",
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
      setShowDeleteDialog(false);
      setSelectedPlayerId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete player",
        variant: "destructive",
      });
    }
  };

  const handleExportToExcel = () => {
    if (!teamMembers) return;

    try {
      const formattedData = teamMembers.map(member => ({
        Name: member.real_name,
        Email: member.email,
        IGN: member.ign,
        Role: member.game_role,
        Status: member.status,
        "Leave Days": member.leave_days,
        "Absent Days": member.absent_days,
        "NOC Days": member.noc_days,
        "Current Month Leaves": member.current_month_leaves,
        "Current Month Absents": member.current_month_absents
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Players");
      XLSX.writeFile(wb, "player_data.xlsx");

      toast({
        title: "Success",
        description: "Player data has been exported to Excel",
      });
    } catch (error) {
      console.error('Error exporting to excel:', error);
      toast({
        title: "Error",
        description: "Failed to export data to Excel",
        variant: "destructive",
      });
    }
  };

  // Filter players based on search query
  const filteredPlayers = teamMembers?.filter(player => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      player.ign.toLowerCase().includes(searchTerm) ||
      player.real_name.toLowerCase().includes(searchTerm) ||
      player.email.toLowerCase().includes(searchTerm) ||
      player.discord_id.toLowerCase().includes(searchTerm)
    );
  });

  if (loadingMembers || loadingNOCs) {
    return <div className="flex items-center justify-center min-h-screen font-inter">Loading...</div>;
  }

  const playerMetrics = teamMembers?.reduce((acc, player) => {
    acc[player.id] = calculatePlayerMetrics(player.id);
    return acc;
  }, {} as { [key: string]: PlayerMetrics });

  return (
    <DashboardLayout>
      <div className="space-y-8 font-inter">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Player Management</h1>
            <Button 
              onClick={handleExportToExcel}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Export to Excel
            </Button>
          </div>
          <div className="w-full max-w-md">
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <PlayerTable
          players={filteredPlayers || []}
          metrics={playerMetrics || {}}
          onEditStatus={handleEditClick}
          onEditStats={handleStatsEdit}
          onDelete={handleDeleteClick}
        />

        <EditStatusDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onSave={handleStatusUpdate}
        />

        <EditStatsDialog
          open={showStatsDialog}
          onOpenChange={setShowStatsDialog}
          stats={editingStats}
          onStatsChange={setEditingStats}
          onSave={handleStatsUpdate}
        />

        <DeleteConfirmDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </DashboardLayout>
  );
};

export default PlayerManagement;
