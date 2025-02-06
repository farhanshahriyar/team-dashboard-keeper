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
  status: string;
}

const PlayerManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [editingStats, setEditingStats] = useState({
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

    const leaveDays = calculateDaysForType(playerNOCs, 'leave');
    const absentDays = calculateDaysForType(playerNOCs, 'absent');
    const nocDays = calculateDaysForType(playerNOCs, 'noc');
    const currentMonthLeaves = currentMonthRecords.filter(record => record.type === 'leave').length;
    const currentMonthAbsents = currentMonthRecords.filter(record => record.type === 'absent').length;

    const member = teamMembers?.find(m => m.id === playerId);
    const status = member?.status || 'Active';

    return {
      leaveDays,
      absentDays,
      nocDays,
      totalLeaveCount: playerNOCs.filter(noc => noc.type === 'leave').length,
      totalAbsentCount: playerNOCs.filter(noc => noc.type === 'absent').length,
      totalNOCCount: playerNOCs.filter(noc => noc.type === 'noc').length,
      currentMonthLeaves,
      currentMonthAbsents,
      status
    };
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return "bg-green-100 text-green-700";
      case 'inactive':
        return "bg-yellow-100 text-yellow-700";
      case 'suspended':
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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

  if (loadingMembers || loadingNOCs) {
    return <div className="flex items-center justify-center min-h-screen font-inter">Loading...</div>;
  }

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
                <TableHead className="whitespace-nowrap">IGN</TableHead>
                <TableHead className="whitespace-nowrap">Mobile</TableHead>
                <TableHead className="whitespace-nowrap">Discord ID</TableHead>
                <TableHead className="whitespace-nowrap">Leave Days</TableHead>
                <TableHead className="whitespace-nowrap">Absent Days</TableHead>
                <TableHead className="whitespace-nowrap">NOC Days</TableHead>
                <TableHead className="whitespace-nowrap">Current Month</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers?.map((player) => {
                const metrics = calculatePlayerMetrics(player.id);
                return (
                  <TableRow key={player.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{player.ign}</TableCell>
                    <TableCell>{player.phone}</TableCell>
                    <TableCell>{player.discord_id}</TableCell>
                    <TableCell>{metrics.leaveDays}</TableCell>
                    <TableCell>{metrics.absentDays}</TableCell>
                    <TableCell>{metrics.nocDays}</TableCell>
                    <TableCell>
                      L: {metrics.currentMonthLeaves} A: {metrics.currentMonthAbsents}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          metrics.status
                        )}`}
                      >
                        {metrics.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditClick(player.id, metrics.status)}
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleStatsEdit(player.id, metrics)}
                        >
                          <FileText className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setSelectedPlayerId(player.id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash className="h-4 w-4 text-red-600" />
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Player Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleStatusUpdate}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Player Statistics</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leaveDays" className="text-right">
                Leave Days
              </Label>
              <Input
                id="leaveDays"
                type="number"
                value={editingStats.leaveDays}
                onChange={(e) => setEditingStats(prev => ({
                  ...prev,
                  leaveDays: parseInt(e.target.value) || 0
                }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="absentDays" className="text-right">
                Absent Days
              </Label>
              <Input
                id="absentDays"
                type="number"
                value={editingStats.absentDays}
                onChange={(e) => setEditingStats(prev => ({
                  ...prev,
                  absentDays: parseInt(e.target.value) || 0
                }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nocDays" className="text-right">
                NOC Days
              </Label>
              <Input
                id="nocDays"
                type="number"
                value={editingStats.nocDays}
                onChange={(e) => setEditingStats(prev => ({
                  ...prev,
                  nocDays: parseInt(e.target.value) || 0
                }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentMonthLeaves" className="text-right">
                Current Month Leaves
              </Label>
              <Input
                id="currentMonthLeaves"
                type="number"
                value={editingStats.currentMonthLeaves}
                onChange={(e) => setEditingStats(prev => ({
                  ...prev,
                  currentMonthLeaves: parseInt(e.target.value) || 0
                }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentMonthAbsents" className="text-right">
                Current Month Absents
              </Label>
              <Input
                id="currentMonthAbsents"
                type="number"
                value={editingStats.currentMonthAbsents}
                onChange={(e) => setEditingStats(prev => ({
                  ...prev,
                  currentMonthAbsents: parseInt(e.target.value) || 0
                }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleStatsUpdate}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PlayerManagement;
