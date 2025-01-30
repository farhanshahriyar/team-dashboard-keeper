import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { useEffect } from "react"; // Added this import
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
import { differenceInDays, parseISO } from "date-fns";

type NOCRecord = Database['public']['Tables']['noc_records']['Row'];

const Noc = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch NOC records
  const { data: nocRecords, isLoading } = useQuery({
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

  // Calculate summary statistics for each player
  const calculatePlayerStats = () => {
    const stats = new Map();
    
    nocRecords?.forEach(record => {
      if (!stats.has(record.player_name)) {
        stats.set(record.player_name, {
          leaveDays: 0,
          absentDays: 0,
          nocDays: 0
        });
      }
      
      const playerStats = stats.get(record.player_name);
      const days = differenceInDays(parseISO(record.end_date), parseISO(record.start_date)) + 1;
      
      switch (record.type.toLowerCase()) {
        case 'leave':
          playerStats.leaveDays += days;
          break;
        case 'absent':
          playerStats.absentDays += days;
          break;
        case 'noc':
          playerStats.nocDays += days;
          break;
      }
    });
    
    return stats;
  };

  const playerStats = calculatePlayerStats();

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
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
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return "bg-green-100 text-green-700";
      case 'under review':
        return "bg-blue-100 text-blue-700";
      case 'rejected':
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'leave':
        return "bg-blue-100 text-blue-700";
      case 'noc':
        return "bg-red-100 text-red-700";
      case 'absent':
        return "bg-pink-100 text-pink-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">NOC Management</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add NOC Record
          </Button>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from(playerStats.entries()).map(([playerName, stats]) => (
            <div key={playerName} className="p-4 border rounded-lg space-y-2">
              <h3 className="font-semibold">{playerName}</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Leave Days</p>
                  <p className="font-medium text-red-600">{stats.leaveDays}</p>
                </div>
                <div>
                  <p className="text-gray-600">Absent Days</p>
                  <p className="font-medium text-red-600">{stats.absentDays}</p>
                </div>
                <div>
                  <p className="text-gray-600">NOC Days</p>
                  <p className="font-medium text-blue-600">{stats.nocDays}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NOC Records Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nocRecords?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.player_name}</TableCell>
                  <TableCell>{record.email}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(record.type)}`}>
                      {record.type}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(record.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(record.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.reason}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(record.status || '')}`}>
                      {record.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Noc;