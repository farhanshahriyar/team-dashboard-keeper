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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  status: 'Active' | 'Inactive' | 'Suspend' | 'Banned';
}

interface EditableFields {
  leaveDays: number;
  absentDays: number;
  nocDays: number;
  totalRecords: number;
  currentMonth: { leaves: number; absents: number };
  status: string;
}

const PlayerManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [editableFields, setEditableFields] = useState<EditableFields | null>(null);

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

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to team_members changes
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
          // Invalidate and refetch team members data
          queryClient.invalidateQueries({ queryKey: ['team-members'] });
          toast({
            title: "Data Updated",
            description: "Team member information has been updated.",
          });
        }
      )
      .subscribe();

    // Subscribe to noc_records changes
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
          // Invalidate and refetch NOC records data
          queryClient.invalidateQueries({ queryKey: ['noc-records'] });
          toast({
            title: "Data Updated",
            description: "NOC records have been updated.",
          });
        }
      )
      .subscribe();

    // Cleanup subscriptions
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
    const currentMonthAbsents = currentMonthRecords.filter(record => record.type === 'absent').length;

    let status: PlayerMetrics['status'] = 'Active';
    if (absentDays > 7 || currentMonthAbsents >= 2) {
      status = 'Suspend';
    } else if (leaveDays > 30) {
      status = 'Inactive';
    }

    return {
      leaveDays,
      absentDays,
      nocDays: calculateDaysForType(playerNOCs, 'noc'),
      totalLeaveCount: playerNOCs.filter(noc => noc.type === 'leave').length,
      totalAbsentCount: playerNOCs.filter(noc => noc.type === 'absent').length,
      totalNOCCount: playerNOCs.filter(noc => noc.type === 'noc').length,
      currentMonthLeaves: currentMonthRecords.filter(record => record.type === 'leave').length,
      currentMonthAbsents,
      status
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

  const handleEditClick = (playerId: string, metrics: PlayerMetrics) => {
    setSelectedPlayerId(playerId);
    setEditableFields({
      leaveDays: metrics.leaveDays,
      absentDays: metrics.absentDays,
      nocDays: metrics.nocDays,
      totalRecords: metrics.totalLeaveCount + metrics.totalAbsentCount + metrics.totalNOCCount,
      currentMonth: {
        leaves: metrics.currentMonthLeaves,
        absents: metrics.currentMonthAbsents,
      },
      status: getStatusText(metrics),
    });
    setShowEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!selectedPlayerId || !editableFields) return;

    try {
      // Update the relevant records in the database
      const { error } = await supabase
        .from('team_members')
        .update({
          // Add the fields you want to update
        })
        .eq('id', selectedPlayerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Player data has been updated",
      });
      setShowEditDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update player data",
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
                <TableHead className="whitespace-nowrap">Leave Days (Count)</TableHead>
                <TableHead className="whitespace-nowrap">Absent Days (Count)</TableHead>
                <TableHead className="whitespace-nowrap">NOC Days (Count)</TableHead>
                <TableHead className="whitespace-nowrap">Total Records</TableHead>
                <TableHead className="whitespace-nowrap">This Month</TableHead>
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
                          onClick={() => handleEditClick(player.id, metrics)}
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
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
            <DialogTitle>Edit Player Data</DialogTitle>
          </DialogHeader>
          {editableFields && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leaveDays" className="text-right">
                  Leave Days
                </Label>
                <Input
                  id="leaveDays"
                  type="number"
                  value={editableFields.leaveDays}
                  onChange={(e) =>
                    setEditableFields({
                      ...editableFields,
                      leaveDays: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editableFields.status}
                  onValueChange={(value) =>
                    setEditableFields({ ...editableFields, status: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspend">Suspend</SelectItem>
                    <SelectItem value="Banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditSave}>
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
    </DashboardLayout>
  );
};

export default PlayerManagement;
